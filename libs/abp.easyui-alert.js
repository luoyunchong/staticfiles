var abp = abp || {};
(function ($) {
    if (!$.messager.alert || !$) {
        return;
    }

    /* DEFAULTS *************************************************/

    abp.libs = abp.libs || {};
    abp.libs.easyuiAlert = {
        config: {
            'default': {

            },
            info: {
                icon: 'info'
            },
            success: {
                icon: 'success'
            },
            warn: {
                icon: 'warning'
            },
            error: {
                icon: 'error'
            },
            confirm: {
                title:'系统提示',
                icon: 'question',
                msg: '您确认执行该操作吗?',
                buttons: ['取消', '确认']
            }
        }
    };

    /* MESSAGE **************************************************/

    var showMessage = function (type, message, title) {
        if (!title) {
            title = '系统提示';
        }

        var opts = $.extend(
            {},
            abp.libs.easyuiAlert.config['default'],
            abp.libs.easyuiAlert.config[type],
            {
                title: title,
                msg: message
            }
        );
        return $.Deferred(function ($dfd) {
            $.messager.alert(opts.title, opts.msg, opts.icon);
        });
    };

    abp.message.info = function (message, title) {
        return showMessage('info', message, title);
    };

    abp.message.success = function (message, title) {
        return showMessage('success', message, title);
    };

    abp.message.warn = function (message, title) {
        return showMessage('warn', message, title);
    };

    abp.message.error = function (message, title) {
        return showMessage('error', message, title);
    };

    abp.message.show=function(message, title) {
        if (!title) {
            title = '系统提示';
        }
        // 消息将显示在顶部中间
        $.messager.show({
            title:title,
            msg:message,
            showType:'slide'
        });

    }

    abp.imagePreviewDialog = function (imgSrc) {
    
        var html = '<div><img src="' + imgSrc + '" style="width:100%;height:90%;" onerror="webuploader.show404(this);"/></div>';
        // 图片地址
        // 创建对象
        var img = new Image();
        // 改变图片的src
        img.src = imgSrc;
        // 判断是否有缓存
        if (img.complete) {

            top.com.dialog({
                width: img.width,
                height: img.height+80,
                html: html
            });
        } else {
            // 加载完成执行
            img.onload = function () {
                top.com.dialog({
                    title: '查看图片',
                    width: img.width,
                    height: img.height + 80,
                    html: html
                });
            };
        }
    };

    abp.message.confirm = function (message, titleOrCallback, callback) {
        var userOpts = {
            msg: message
        };

        if ($.isFunction(titleOrCallback)) {
            callback = titleOrCallback;
        } else if (titleOrCallback) {
            userOpts.title = titleOrCallback;
        };

        var opts = $.extend(
            {},
            abp.libs.easyuiAlert.config.confirm,
            userOpts
        );
        return $.Deferred(function ($dfd) {
            $.messager.confirm(opts.title, opts.msg, callback);
        });
    };;

})(jQuery);