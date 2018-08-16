﻿/**
 * 上传控件实现
 * @example 该js还是依赖于以下js
    <link href="~/bower_components/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
    <script src="~/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="~/bower_components/layer/dist/layer.js"></script>
    <script src="~/Scripts/libs/abp.js"></script>
    <script src="~/Scripts/libs/abp.layui-alert.js"></script>
 */
var webuploader = webuploader || {};
var abp = abp || {};
/**
 * abp.webuploader.js 是扩展上传文件，有一定的上传样式效果，依赖于jquery,layer,abp.js,abp.layui-alert.js,font-awesomen.css
        还改了webuploader.js  3949行，解决了fileNumLimit上传文件数量无效的问题 和webuploader.min.js对应的js文件
        本文件会自动引用applicationPath目录下的webuploader.min.js和webuploader.css文件
*/
(function ($, window) {
    var applicationPath = window.applicationPath === "" ? "" : window.applicationPath || "/bower_components/webuploader/dist";
    var serviceUrl="http://localhost:61816"
    function initWebUpload(item, options) {

        if (!WebUploader.Uploader.support()) {
            var error = "上传控件不支持您的浏览器！请尝试升级flash版本或者使用Chrome引擎的浏览器。<a target='_blank' href='http://se.360.cn'>下载页面</a>";
            if (window.console) {
                window.console.log(error);
            }
            $(item).text(error);
            return;
        }
        //创建默认参数
        var defaults = {
            auto: true,
            hiddenInputId: "uploadifyHiddenInputId", // input hidden id
            onAllComplete: function (event) { }, // 当所有file都上传后执行的回调函数
            onComplete: function (event) { }, // 每上传一个file的回调函数
            innerOptions: {},
            fileNumLimit: 20, //验证文件总数量, 超出则不允许加入队列
            fileSizeLimit: 100 * 1024 * 1024, //验证文件总大小是否超出限制, 超出则不允许加入队列。
            fileSingleSizeLimit: 8 * 1024 * 1024, //验证单个文件大小是否超出限制, 超出则不允许加入队列
            PostbackHold: false,
            uploadType: 'file'//file、img
        };

        var opts = $.extend(defaults, options);
        if (opts.uploadType === 'img') {
            opts.accept = {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            };
        }
        var hdFileData = $("#" + opts.hiddenInputId);
        var target = $(item); //容器
        var pickerid = webuploader.GUID();
        var uploaderStrdiv = '<div class="webuploader">';
        target.data('uploadType', opts.uploadType);
        var text = opts.uploadType === 'img' ? "选择图片" : "选择文件";
        if (opts.auto) {
            uploaderStrdiv =
                '<div class="btns">' +
                '<div id="' +
                pickerid +
                '">' + text + '</div>' +
                '</div>' +
                '<div  class="uploader-list"></div>';
        } else {
            uploaderStrdiv =
                '<div class="btns">' +
                '<div id="' +
                pickerid +
                '">' + text + '</div>' +
                '<button class="webuploadbtn" type="button">开始上传</button>' +
                '</div>' +
                '<div class="uploader-list"></div>';
        }
        uploaderStrdiv += '<div style="display:none" class="UploadhiddenInput" ></div>';
        target.append(uploaderStrdiv);

        var $list = target.find('.uploader-list'),
            $btn = target.find('.webuploadbtn'), //手动上传按钮备用
            state = 'pending',
            $hiddenInput = target.find('.UploadhiddenInput'),
            uploader;
        var jsonData = {
            fileList: []
        };

        var webuploaderoptions = $.extend({
            // swf文件路径
            swf: applicationPath + '/Uploader.swf',
            // 文件接收服务端。
            server:serviceUrl+ '/File/UploadFile',
            deleteServer:serviceUrl+ '/File/Delete',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#' + pickerid,
            //不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
            resize: false,
            fileNumLimit: opts.fileNumLimit,
            fileSizeLimit: opts.fileSizeLimit,
            fileSingleSizeLimit: opts.fileSingleSizeLimit,
            accept: opts.accept
        }, opts.innerOptions);

        uploader = WebUploader.create(webuploaderoptions);

        //回发时还原hiddenfiled的保持数据
        var fileDataStr = hdFileData.val();
        if (fileDataStr && opts.PostbackHold) {
            jsonData = JSON.parse(fileDataStr);
            $.each(jsonData.fileList,
                function (index, fileData) {
                    var newid = webuploader.GUID();
                    fileData.queueId = newid;
                    $list.append('<div id="' +
                        newid +
                        '" class="item">' +
                        '<div class="info">' +
                        fileData.name +
                        '</div>' +
                        '<div class="state">已上传</div>' +
                        '<div class="del"></div>' +
                        '</div>');
                });
            hdFileData.val(JSON.stringify(jsonData));
        }

        uploader.on('fileQueued',
            function (file) {

                var subName = file.name;

                //主要解决名字太长，上传文件名会超出换行，导致样式问题，让字数在20个字符以内即可
                if (subName.lastIndexOf('.') > 20) {
                    subName = subName.substring(0, 20);
                } else {
                    subName = subName.substring(0, subName.lastIndexOf('.'));
                }
                subName += '.' + file.ext;

                var fileId = $(item)[0].id + file.id;
                var fileUpload = "";
                if (opts.uploadType === 'file') {
                    fileUpload = '<div id="' + fileId + '" class="item">\
                                         <div class="nui-ico nui-ico-file32 nui-ico-file32-'+ file.ext.toLowerCase() + '"></div>\
                                            <div class="webuploadinfo"> <span title="' + file.name + '">' + subName + '</span>\
                                                <div class="webupload-button"><a><span class="webupload-delete" data-id="' + fileId + '">删除</span></a></div>\
                                            </div>\
                                            <div class="webuploadstate"><span class="webupload-text">等待上传</span>\
                                                 <div id="progress-'+ fileId + '" class="progressbar-animation"></div>\
                                             </div>\
                                     </div>';
                } else {
                    /*/Content/images/default-profile-picture.png*/
                    fileUpload = '<div  id="' + fileId + '" class="webupload-list-img">\
                            <img src = "" >\
                            <div class="webupload-list-img-cover">\
                            <i class="fa fa-eye img-show" title="预览"  data-id="' + fileId + '"></i>\
                            <i class="fa fa-remove img-delete" title="删除" data-id="' + fileId + '"></i>\
                            <div class="img-upload-state" style="display:none;" >' +
                        '<span class="file-name" data-filename="' + file.name + '"></span>' +
                        '<span class="file-token" data-filetoken=""></span>' +
                        '</div>\
                            </div>\
                          </div>';
                }
                $list.append(fileUpload);

                //自动上传
                if (opts.auto) {
                    uploader.upload();
                }
            });

        /**
        * 验证文件格式以及文件大小
        */
        uploader.on("error",
            function (type) {
                var limit = 0;
                if (type === "Q_TYPE_DENIED") {
                    abp.message.warn("不支持您上传的文件格式!");
                } else if (type === "F_EXCEED_SIZE") {
                    limit = opts.fileSingleSizeLimit / 1024 / 1024;
                    abp.message.warn("单个文件大小不能超过" + limit + "MB");
                } else if (type === "Q_EXCEED_SIZE_LIMIT") {
                    limit = opts.fileSingleSizeLimit / 1024 / 1024;
                    abp.message.warn("添加的文件总大小超出" + limit + "MB");
                } else if (type === "Q_EXCEED_NUM_LIMIT") {
                    abp.message.warn("添加的文件数量超出范围");
                } else if (type === "F_DUPLICATE") {
                    abp.message.warn("该文件已存在,请勿重复添加!");
                } else {
                    abp.message.warn("未知类型错误:" + type);
                }
            });

        /*当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列。*/
        uploader.on("beforeFileQueued",
            function (file) {
                if (opts.fileNumLimit == undefined) {
                    return true;
                }
                var length;
                if (opts.uploadType === 'file') {
                    //当有文件限制，在编辑时验证文件数量
                    length = target.find('.item').length;
                } else {
                    length = target.find('.webupload-list-img').length;
                }
                if (length >= opts.fileNumLimit) {
                    abp.message.warn('添加的文件数量超出范围!');
                    return false;
                }
                return true;
            });

        uploader.on('uploadProgress',
            function (file, percentage) { //进度条事件
                var fileId = $(item)[0].id + file.id;
                var uploadflieElement = target.find('#' + fileId);
                if (opts.uploadType === 'file') {
                    uploadflieElement.find('div.webuploadstate .webupload-text')
                        .html('正在上传' + Math.round(percentage * 100) + '%');
                    var $progressElement = uploadflieElement.find('div.webuploadstate #progress-' + fileId);
                    var value = Math.round(percentage * 100);
                    if ($progressElement.hasClass('progressbar')) {
                        $progressElement.progressbar('setValue', value);
                    } else {
                        $progressElement.progressbar({
                            value: value,
                            text: '',
                            height: 6
                        });
                    }
                } else {

                }
            });

        uploader.on('uploadSuccess',
            function (file, response) { //上传成功事件
                //后台保存文件属性信息services 重构，后台上传文件的时候，就把数据存到后台
                //var backendService = abp.services.app.abpFile;
                var $fileId = $(item)[0].id + file.id;
                if (opts.uploadType === 'file') {
                    if (response.success === false) {
                        abp.message.error(response.error.message);
                        target.find('#' + $fileId).find('div.webuploadstate .webupload-text').html(response.error.message);
                    } else {
                        var limit = webuploader.bytesToSize(file.size);
                        target.find('#' + $fileId).find('div.webuploadstate .webupload-text').html(limit + ' 上传成功');

                        var downUrl = serviceUrl+'/File/Download?fileToken=' + response.result + '&newName=' + file.name;

                        target.find('#' + $fileId).find('div.webuploadinfo .webupload-button a')
                            .after('<a href="' +downUrl +'" target="_blank"><span  class="webupload-download">下载</span></a>');

                        $hiddenInput.append('<input type="text" id="hiddenInput' +$fileId +'" class="hiddenInput" value="' +response.result +'" />');
                    }
                } else {
                    if (response.success === false) {
                        target.find('#' + $fileId);
                        abp.message.error(response.error.message);
                    } else {
                        window.setTimeout(function () {
                            target.find('#' + $fileId + ' img')
                                .attr('src',serviceUrl+ '/File/Download?fileToken=' + response.result);

                            target.find('#' +
                                $fileId +
                                ' .webupload-list-img-cover .img-upload-state span.file-token')
                                .data('filetoken', response.result);
                        },
                            500);
                    }
                }

                //var basefile = {
                //    FileName: file.name,
                //    FileSize: file.source.size,
                //    FileType: file.source.type,
                //    FileToken: response.result
                //}
                //backendService.createOrUpdate(basefile, { showLoading: false });

                opts.uploadSuccess && opts.uploadSuccess(file, response.result);
            });

        uploader.on('uploadError',
            function (file) {
                target.find('#' + $(item)[0].id + file.id).find('div.webuploadstate .webupload-text').html('上传出错');
            });

        uploader.on('uploadComplete',
            function (file) { //全部完成事件
                var fileId = $(item)[0].id + file.id;
                target.find('#' + fileId).find('#progress-' + fileId).fadeOut();
            });

        uploader.on('all',
            function (type) {
                if (type === 'startUpload') {
                    state = 'uploading';
                } else if (type === 'stopUpload') {
                    state = 'paused';
                } else if (type === 'uploadFinished') {
                    state = 'done';
                }

                if (state === 'uploading') {
                    $btn.text('暂停上传');
                } else {
                    uploader.option('formData',
                        {
                            __RequestVerificationToken: $('form input[name=__RequestVerificationToken]').val()
                        });
                    $btn.text('开始上传');
                }
            });

        var deleteFile = function (fileToken) {
            if (!webuploader.isNullOrEmpty(fileToken)) {
                $.post(webuploaderoptions.deleteServer,
                    { fileToken: fileToken },
                    function (data) {
                        //console.info("删除成功:" + data);
                    });
            }
        }
        //删除时执行的方法
        uploader.on('fileDequeued',
            function (file) {
                var fileToken;
                var fileId = $(item)[0].id + file.id;
                if (target.data('uploadType') === 'file') {
                    fileToken = target.find("#hiddenInput" + fileId).val();
                    $("#hiddenInput" + fileId).remove();

                    target.find("#" + fileId).fadeOut(500,
                        function () {
                            $(this).remove();
                        });
                } else {
                    fileToken = target.find(fileId + ' .webupload-list-img-cover .img-upload-state span.file-token')
                        .data('filetoken');

                    target.find("#" + fileId).hide(500,
                        function () {
                            $(this).remove();
                        });
                }
                deleteFile(fileToken);

            });

        uploader.on('uploadBeforeSend',function(object,data,headers){
            $.extend(headers,{
                "Authorization":"Bearer MRuljso5KutlmWxh2GmOr3-CQewO0nvmo-66M3Y19l8IxopmF6AAjiNa8ck6zj2GTIT_A4xoCQeDSwhJc-CdmHlOGP6kSAxas9OusvCFekXPu3Wj7Moxd0huNkrC8ZGszpw6G8GXilnmlHAEkDTKjuR5m54XY2KBNr9WoFYcExTUmfzgXSIhy71g15F37Rvxs_kwv5qCAM3dzFziXFOrZr3sjY29FhFTWIBvZeEbOAc9OxAEb-NwskHuzFvJQWGgSKVd5UNsL3Pe-Jje1NnCk_aBoE9YilJthVsb7N7J2IR4a1XkHNjzLyaSsigc68BiC832STlojeOwZWekdJ70bnV1wKwbhgswqjsNAfGLIxPPPm-gskcBUu9drrASsDAn7-NMkjeNc1skIad2EwIwbJVElVp7gpAQf6PDYxqg12IS0fvof33XsAzPX7YXeEx7cX2hoeid8L3P-f3H-4p0W9Dg-SpFq5uVD03td6nu4Js"
            });
        });
        //多文件点击上传的方法
        $btn.on('click',
            function () {
                if (state === 'uploading') {
                    uploader.stop();
                } else {
                    uploader.upload();
                }
            });

        //删除
        if (opts.uploadType === 'file') {
            $list.on("click",
                ".webupload-delete",
                function () {
                    var $ele = $(this);
                    var id = $ele.attr("data-id");

                    var fileId = id.replace($(item)[0].id, "");
                    var file = uploader.getFile(fileId);
                    if (file == undefined) {
                        //前台直接删除
                        $('#' + id).fadeOut(500,
                            function () {
                                $(this).remove();
                            });
                        var list = fileId.split('_');
                        var fileToken = $("#hiddenInput" + list[list.length - 1]).val();
                        if (list.length >= 1) {
                            $("#hiddenInput" + list[list.length - 1]).remove();
                        }
                    } else {
                        uploader.removeFile(file);
                    }
                });
        } else {
            $list.on("click",
                ".img-delete",
                function () {
                    var $ele = $(this);
                    var id = $ele.attr("data-id");
                    var fileId = id.replace($(item)[0].id, "");
                    var file = uploader.getFile(fileId);
                    if (file == undefined) {
                        //前台直接删除
                        var filetoken = $ele.next().find('.file-token').data('filetoken');
                        $('#' + id).hide(500,
                            function () {
                                $(this).remove();
                            });
                        deleteFile(filetoken);
                    } else {
                        uploader.removeFile(file);
                    }
                });

            $list.on("click",
                ".img-show",
                function () {
                    var $ele = $(this);
                    webuploader.imagePreviewDialog($ele);

                    //var $uploadlist = $(id).parent();
                    //var dataArray = [];
                    //var guid = webuploader.GUID();

                    //$.each($($uploadlist).find('.webupload-list-img'), function (i, v) {
                    //    var imgSrc = $(v).find('img').attr('src');
                    //    var title = $(v).find('.webupload-list-img-cover .img-upload-state .file-name').attr('title');
                    //    var obj = {
                    //        "alt": title,
                    //        "pid": guid,
                    //        "src": imgSrc
                    //    };
                    //    dataArray.push(obj);
                    //});

                    //var json = {
                    //    "title": '上传图片',
                    //    "id": guid,
                    //    "start": 0,
                    //    "data": dataArray
                    //};
                    //layer.photos({
                    //    photos: json, anim: 5
                    //});

                });
        }
    }

    $.extend(webuploader, {
        /**
         * webuploader的图片预览效果
         * @param {} $ele 当前点击的图片elem
         */
        imagePreviewDialog: function ($ele) {
            var id = '#' + $ele.attr("data-id");
            //var imgTitle = $(id).find('.webupload-list-img-cover .img-upload-state .file-name').attr('title');
            var imgSrc = $(id).find('img').attr('src');
            //var html = '<img src="' + imgSrc + '" style="width:100%;height:90%;" onerror="webuploader.show404(this);"/>';
            abp.imagePreviewDialog(imgSrc);
        },
        /**
         * 动态加载webuploader控件
         * @param {any} callback
         */
        getWebUpload:function(callback) {
            if (typeof WebUploader == 'undefined') {
                var casspath = applicationPath + "/webuploader.css";
                $("<link>").attr({ rel: "stylesheet", type: "text/css", href: casspath }).appendTo("head");
                var jspath = applicationPath + "/webuploader.min.js";
                $.getScript(jspath).done(function () {
                    callback && callback();
                }).fail(function () {
                    abp.message.warn("请检查webuploader的路径是否正确!");
                });
            } else {
                callback && callback();
            }
        },
        /**
         *  上传文件模板 
         * @param {boolean} isCheck  是否是查看界面 true/false
         * @returns {} 参数为空时，默认不是查看界面，有删除按钮。参数为true时，无删除按钮
         */
        template: function (isCheck) {
            //如果是查看，没有删除按钮
            var template = '<div id="BinduploadflieWU_FILE_{0}" class="item">' +
                '<div class="nui-ico nui-ico-file32 nui-ico-file32-{1}"></div>' +
                '<div class="webuploadinfo">' +
                '<span title="{2}">{3}</span>' +
                '<div class="webupload-button">';
            if (!isCheck) {
                template += '<a><span class="webupload-delete" data-id="BinduploadflieWU_FILE_{0}">删除</span></a>';
            }
            template += '<a href="'+serviceUrl+'/File/Download?fileToken={4}&newName={2}" target="_blank"><span class="webupload-download">下载</span></a>' +
                '</div>' +
                '<div class="webuploadstate"><span class="weebupload-text">{5}</span></div>' +
                '</div></div>';
            return template;
        },
        /**
         * 图片上传模板
         * @param {} isCheck 是否是查看界面 true/false
         * @returns {} 参数为空时，默认不是查看界面，有删除功能。参数为true时，无删除功能
         */
        templateImg: function (isCheck) {
            var template = '<div id="BinduploadflieWU_FILE_{0}" class="webupload-list-img">' +
                '<img src="'+serviceUrl+'/File/Download?fileToken={1}">' +
                '<div class="webupload-list-img-cover">' +
                '<i class="fa fa-eye img-show" title="预览" data-id="BinduploadflieWU_FILE_{0}"></i>';
            if (!isCheck) {
                template += '<i class="fa fa-remove img-delete" title="删除" data-id="BinduploadflieWU_FILE_{0}"></i>';
            }
            template += '<div class="img-upload-state" style="display:none;"><span class="file-name" data-filename="{2}"></span><span class="file-token" data-filetoken="{1}"></span></div>' +
                '</div>' +
                '</div>';
            return template;

        },
        /**
         * 当图片没有时，会显示404图片
         * @param {} img 
         * @returns {} 
         */
        show404: function (img) {
            img.src = applicationPath + "/images/404.png";
            img.onerror = null;
        },
        /**
         *  编辑时，加载上传控件
         * @param {Object<>} options
         *  参数  | 默认值 | 说明
         * {
         *  elem '#upload-file'  上传控件id
         *  rows  []
         *  isCheck false 是否为查看   true/false
         *  uploadeFile  'file' 上传类型：'file' / 'img'
         * }参数:   
         */
        loadFile: function (options) {
            var defaults = {
                elem: '#upload-files',
                rows: [],
                isCheck: false, //是否为查看
                uploadType: 'file' //绑定文件类型 file  或 img
            };
            options = $.extend(defaults, options);

            var rows = webuploader.getFiles(options.elem);

            if (rows && rows.length === 0) {
                rows = options.rows;
            }
            if (rows && rows.length > 0) {

                webuploader.getWebUpload(function () {
                    //未找到webuploader的控件加载成功后的回调事件，采用setTimeout()延迟执行
                    setTimeout(function () {
                        var html = '';
                        var $hiddenInput = $(options.elem).find('.UploadhiddenInput');
                        var uploadType = $(options.elem).data('uploadType');
                        if (options.isCheck === true) {
                            html += '<div class="uploader-list">';
                            uploadType = options.uploadType;
                        }
                        $.each(rows, function (i, v) {
                            var subName = v.FileName;
                            if (subName.lastIndexOf('.') > 20) {
                                subName = subName.substring(0, 20);
                            } else {
                                subName = subName.substring(0, subName.lastIndexOf('.'));
                            }
                            var d = v.FileName;
                            var ext = d.substr(d.lastIndexOf('.') + 1, d.length);
                            subName += '.' + ext;

                            var limit = webuploader.bytesToSize(v.FileSize);
                            if (uploadType === 'file') {
                                //参数（id,文件后缀，文件名，截取后的文件名，fileToken,上传状态（文件大小+上传成功）)
                                html += webuploader.format(webuploader.template(options.isCheck), v.Id, ext, v.FileName, subName, v.FileToken, limit + "上传成功");
                                $hiddenInput.append('<input type="text" id="hiddenInput' + v.Id + '" class="hiddenInput" value="' + v.FileToken + '" />');
                            } else {
                                html += webuploader.format(webuploader.templateImg(options.isCheck), v.Id, v.FileToken, v.FileName);
                            }
                        });

                        if (options.isCheck === true) {
                            html += '</div>';
                            $(options.elem).append(html);
                            $(options.elem).find('.img-show').on('click',
                                function () {
                                    var $ele = $(this);
                                    webuploader.showImgageModal($ele);
                                });

                        } else {
                            $(options.elem + ' div.uploader-list').append(html);
                        }
                    }, 400);
                });
            }
        },
        //<ul style="display:none;" id="abpfiles" >
        //@foreach(var item in Model.AbpFileOutput)
        //{
        //    <li data-filetoken="@item.FileToken" data-id="@item.Id" data-filesize="@item.FileSize">@item.FileName</li>
        //}
        //</ul>
        //上面的格式，会得到当前已上传的文件数组
        getFiles: function (elemId) {
            var abpfiles = [];
            $.each($(elemId + ' ul li'), function (i, v) {
                abpfiles.push({
                    Id: $(v).attr('data-id'),
                    FileToken: $(v).attr('data-filetoken'),
                    FileSize: $(v).attr('data-filesize'),
                    FileName: $(v).text()
                });
            });
            return abpfiles;
        },
        /**
           * 格式化字符串
           * @param {string} "{0}-{1}","a","b"
           * @returns a-b
           * @example  用法:
             webuploader.format("{0}-{1}","a","b");
           */
        format: function () {
            for (var i = 1; i < arguments.length; i++) {
                var exp = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                arguments[0] = arguments[0].replace(exp, arguments[i]);
            }
            return arguments[0];
        },
        /**
           * 判断变量是否为null或空
           * @example 用法:
           * webuploader.isNullOrEmpty(null)
           */
        isNullOrEmpty: function (str) { return str === undefined || str === null || str === ""; },
        /**
         * 生成一个guid数据 
         */
        GUID: function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        /**
         * 1024MB转换成1GB
         * @param {number} bytes 
         * @returns {} 返回最小不可转换的单位的空间大小
         */
        bytesToSize: function (bytes) {
            if (bytes === undefined || bytes === null || bytes === "") return "";
            if (bytes == 0) return '0B';
            var k = 1024;
            var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i];
        }
    });

    /**
     * 扩展方法：得到当前控件已经上传成功的文件地址，多文件，中间以*分割
     */
    $.fn.GetFilesAddress = function () {
        var filesAddress = [];
        if ($(this).data('uploadType') === 'file') {
            $(this).find(".UploadhiddenInput .hiddenInput").each(function () {
                filesAddress.push($(this).val());
            });
        } else {
            $(this).find('.uploader-list .webupload-list-img .webupload-list-img-cover .img-upload-state span.file-token').each(function () {
                filesAddress.push($(this).data('filetoken'));
            });
        }
        return filesAddress.join('*');
    }
    /**
     * 扩展方法：初始化上传文件
     * @param {Object<>} 参数为webuploader插件的所有参数
     * @param 新增参数:uploadType:'file'或'img' 上传类型：file为文件;img为图片，有上传预览效果
     */
    $.fn.powerWebUpload = function (options) {
        var ele = this;
        webuploader.getWebUpload(function () {
            initWebUpload(ele, options);
            options.callback && options.callback();
        });
    }
})(jQuery, window);