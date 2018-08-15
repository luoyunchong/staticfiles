
(function () {

    if ($.fn.datagrid) {
        function loadAbp(data) {
            var result;
            if (data.__abp === true) {
                result = data.result;
            } else {
                result = data;
            }
            return result;
        }
        $.extend($.fn.combotree.defaults,
            {
                lines: true,
                animate: true,
                loadFilter: function (data, parent) {
                    return loadAbp(data);
                }
            });

        $.extend($.fn.datagrid.defaults,
            {
                fit: true,
                fitColumns: true,
                rownumbers: true,
                singleSelect: true,
                idField: 'Id',
                sortName: 'Id',
                sortOrder: 'desc',
                pagination: true,
                pageSize: 15,
                pageList: [15, 30, 45, 60],
                onBeforeLoad: function () {
                    $('#searchForm').keydown(function (e) {
                        if (e.which === 13) {
                            e.preventDefault();
                            com.filter('#searchForm', '#dgGrid');
                        }
                    });
                },
                onLoadError: function (a, b, c) {
                    if (arguments[0].status == 403) {
                        abp.message.warn("您无权访问此方法", '系统提示');
                    }
                }
            });

        $.extend($.fn.combo.defaults,
            {
                editable: false
            });

        $.extend($.fn.combobox.defaults,
            {
                valueField: 'id',
                textField: 'text',
                editable: false,
                loadFilter: function (data, parent) {
                    return loadAbp(data);
                }
            });
        $.extend($.fn.tree.defaults,
            {
                loadFilter: function (data, parent) {
                    return loadAbp(data);
                }
            });
        $.extend($.fn.treegrid.defaults,
            {
                animate: true,
                fit: true,
                fitColumns: true,
                rownumbers: true,
                idField: 'Id',
                treeField: 'DisplayName'
            });

        $.extend($.fn.switchbutton.defaults,
            {
                width: 46,
                height: 22,
                onText: "是",
                offText: "否",
                isBool: true
            });


        /*JQuery EasyUI 扩展*/
        $.extend($.fn.validatebox.defaults.rules, {
            //扩展下拉验证==请选择==,使用方法, validType="comboxValidate['From','请选择状态']"
            //当下菜单选定的值为请选择时，会显示一个提示信息：请选择状态
            //author:luozQ
            comboxValidate: {
                validator: function (value, param, missingMessage) {
                    //var data = $('#' + param).combobox('getText');
                    //debugger;
                    if (value != '' && value != null && value != "==请选择==") {
                        return true;
                    }
                    return false;
                },
                message: "{0}"
            },
            //param是参数名
            //selector是该参数的选择器,重写remote时根据选择器取到参数值
            //validType="remote['<%=path%>/group/validCode','code',{'param':'id"','selector':'#id'},'编码不唯一']"
            remote: {
                validator: function (value, param) {
                    if (!value) {
                        return true;
                    }
                    var data = {};
                    data[param[1]] = value;
                    // param[2] 就是配置的{param:'id',selector:'id'}
                    if (param[2]) {
                        data[param[2].param] = $(param[2].selector).val();
                    }
                    var res = $.ajax({
                        url: param[0],
                        dataType: "json",
                        data: data,
                        async: false,
                        cache: false,
                        type: "post"
                    }).responseText;
                    return res === "true";
                },
                message: "{3}"
            }
        });
    }
})();


/**
 * 序列化表单字段。
 */
$.fn.formSerialize = function () {
    var $form = $(this);
    var postdata = {};
    $form.find('input,select,textarea').each(function (r) {
        var $this = $(this);
        var id = $this.attr('id');
        if (id == undefined || id.indexOf("_easyui_textbox_input") !== -1) {
            return;
        }
        switch (true) {
            case $this.is("[class*=easyui-switchbutton]"):

                var opts = $this.switchbutton('options');
                var isChecked = $this.switchbutton('options').checked;
                //根据switchbutton扩展的属性，isBool为ture时，说明本控件后台存储ture,false，
                //菜单管理下的是否启用，采用1, 0; 增加isBool: false
                if (opts.isBool) {
                    postdata[id] = isChecked;
                } else {
                    postdata[id] = isChecked ? 1 : 0;
                }
                break;
            case $this.is("[class*=combotree-f]"):
                if ($this.combotree('options').multiple == true) {
                    postdata[id] = $this.combotree('getValues');
                } else {
                    postdata[id] = $this.combotree('getValue');
                }
                break;
            case $this.is("[class*=easyui-checkbox]"):
                postdata[id] = $this.checkbox('isCheck');
                break;
            case $this.is("[class*=combobox-f]"):
                postdata[id] = $this.combobox('getValues').toString();
                break;
            case $this.is("[class*=easyui-comboicons]"):
                postdata[id] = $this.comboicons('getValue');
                break;
            case $this.is("[class*=easyui-datebox]"):
                postdata[id] = $this.datebox('getValue');
                break;
            default:
                postdata[id] = $this.val();
                break;
        }
    });
    return postdata;
};
