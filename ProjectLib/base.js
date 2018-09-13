/**
* 模块名：基础脚本
* 程序名: 项目方法封装函数
**/

//属性
var com = com || {};

$.extend(com, {
    /**
      * @returns {boolean} 调试或发布状态
      */
    config: {
        isDebug: true
    },
    /**
     * 服务层api访问s根地址
     */
    baseUrl: '/api/services/app',
    json: {}
});

//扩展方法
$.extend(com, {
    /**
     * datagrid行内编辑封装
     * @param {element} grid $('#dgGrid')
     * @returns {Object<>} 当前对象实例 
     */
    EditGridViewModel: function (grid) {
        var self = this;
        this.begin = function (index, row) {
            if (index == undefined || typeof index === 'object') {
                row = grid.datagrid('getSelected');
                index = grid.datagrid('getRowIndex', row);
            }
            self.editIndex = self.ended() ? index : self.editIndex;
            grid.datagrid('selectRow', self.editIndex).datagrid('beginEdit', self.editIndex);
        };
        this.ended = function () {
            if (self.editIndex == undefined) return true;
            if (grid.datagrid('validateRow', self.editIndex)) {
                grid.datagrid('endEdit', self.editIndex);
                self.editIndex = undefined;
                return true;
            }
            grid.datagrid('selectRow', self.editIndex);
            return false;
        };
        this.addnew = function (rowData) {
            if (self.ended()) {
                if (Object.prototype.toString.call(rowData) != '[object Object]') rowData = {};
                rowData = $.extend({ _isnew: true }, rowData);
                grid.datagrid('appendRow', rowData);
                self.editIndex = grid.datagrid('getRows').length - 1;
                grid.datagrid('selectRow', self.editIndex);
                self.begin(self.editIndex, rowData);
            }
        };
        this.deleterow = function () {
            var selectRow = grid.datagrid('getSelected');
            if (selectRow) {
                var selectIndex = grid.datagrid('getRowIndex', selectRow);
                if (selectIndex == self.editIndex) {
                    grid.datagrid('cancelEdit', self.editIndex);
                    self.editIndex = undefined;
                }
                grid.datagrid('deleteRow', selectIndex);
            }
        };
        this.reject = function () {
            grid.datagrid('rejectChanges');
        };
        this.accept = function () {
            grid.datagrid('acceptChanges');
            var rows = grid.datagrid('getRows');
            for (var i in rows) delete rows[i]._isnew;
        };
        this.getChanges = function (include, ignore) {
            if (!include) include = [], ignore = true;
            var deleted = com.filterProperties(grid.datagrid('getChanges', "deleted"), include, ignore),
                updated = com.filterProperties(grid.datagrid('getChanges', "updated"), include, ignore),
                inserted = com.filterProperties(grid.datagrid('getChanges', "inserted"), include, ignore);

            var changes = { deleted: deleted, inserted: com.minusArray(inserted, deleted), updated: com.minusArray(updated, deleted) };
            changes._changed = (changes.deleted.length + changes.updated.length + changes.inserted.length) > 0;

            return changes;
        };
        this.isChangedAndValid = function () {
            return self.ended() && self.getChanges()._changed;
        };
        this.isValid = function () {
            return self.ended();
        }
    },
    /**
     * treegrid行内编辑封装、此方法请在treeGrid的onLoadSuccess方法中写，不然会出错，得不到options中的idField
     */
    EditTreeGridViewModel: function (grid) {
        var self = this, option = grid.treegrid('options'), idField = option.idField;
        this.begin = function (row) {
            row = row || grid.treegrid('getSelected');
            if (row) {
                self.editIndex = self.ended() ? row[idField] : self.editIndex;
                grid.treegrid('beginEdit', self.editIndex);
            }
        };
        this.ended = function () {
            if (self.editIndex == undefined) return true;
            if (grid.treegrid('validateRow', self.editIndex)) {
                grid.treegrid('endEdit', self.editIndex);
                self.editIndex = undefined;
                return true;
            }
            grid.treegrid('select', self.editIndex);
            return false;
        };
        this.addnew = function (rowData, parentId) {
            if (self.ended()) {
                if (Object.prototype.toString.call(rowData) != '[object Object]') rowData = {};
                rowData = $.extend({ _isnew: true }, rowData), parentId = parentId || '';
                if (!rowData[idField]) {
                    if (rowData.Id == null || rowData.Id == undefined) {//随机生成的id不是int型
                        rowData[idField] = com.uuid();
                    } else {
                        rowData[idField] = rowData.Id;
                    }
                }
                grid.treegrid('append', { parent: parentId, data: [rowData] });
                //grid.$element().data("datagrid").insertedRows.push(rowData);
                grid.treegrid('select', rowData[idField]);
                self.begin(rowData);
            }
        };
        this.deleterow = function () {
            var row = grid.treegrid('getSelected');
            if (row) {
                if (row[idField] == self.editIndex) {
                    grid.treegrid('cancelEdit', self.editIndex);
                    self.editIndex = undefined;
                }
                grid.treegrid('remove', row[idField]);
                grid.$element().data("datagrid").deletedRows.push(row);
            }
        };
        this.reject = function () {
            throw "未实现此方法！";
        };
        this.accept = function () {
            grid.treegrid('acceptChanges');
            var rows = grid.$element().datagrid('getRows');
            for (var i in rows) delete rows[i]._isnew;
        };
        this.getChanges = function (include, ignore) {
            if (!include) include = [], ignore = true;
            var deleted = com.filterProperties(grid.datagrid('getChanges', "deleted"), include, ignore),
                updated = com.filterProperties(grid.datagrid('getChanges', "updated"), include, ignore),
                inserted = com.filterProperties(grid.datagrid('getChanges', "inserted"), include, ignore);

            var changes = { deleted: deleted, inserted: com.minusArray(inserted, deleted), updated: com.minusArray(updated, deleted) };
            changes._changed = (changes.deleted.length + changes.updated.length + changes.inserted.length) > 0;

            return changes;
        };
        this.isChangedAndValid = function () {
            return self.ended() && self.getChanges()._changed;
        };
    },
    /** 
    * json格式转树状结构 
    * @param   {json}      json数据 
    * @param   {String}    id的字符串 
    * @param   {String}    父id的字符串 
    * @param   {String}    children的字符串 
    * @return  {Array}     数组 
    */
    toTreeData: function (a, idStr, pidStr, childrenStr) {
        var r = [], hash = {}, len = (a || []).length;
        for (var i = 0; i < len; i++) {
            hash[a[i][idStr]] = a[i];
        }
        for (var j = 0; j < len; j++) {
            var aVal = a[j], hashVP = hash[aVal[pidStr]];
            if (hashVP) {
                !hashVP[childrenStr] && (hashVP[childrenStr] = []);
                hashVP[childrenStr].push(aVal);
            } else {
                r.push(aVal);
            }
        }
        return r;
    },
    eachTreeRow: function (treeData, eachHandler) {
        for (var i in treeData) {
            if (eachHandler(treeData[i]) == false) break;
            if (treeData[i].children)
                com.eachTreeRow(treeData[i].children, eachHandler);
        }
    },
    isInChild: function (treeData, pid, id) {
        var isChild = false;
        com.eachTreeRow(treeData, function (curNode) {
            if (curNode.id == pid) {
                com.eachTreeRow([curNode], function (row) {
                    if (row.id == id) {
                        isChild = true;
                        return false;
                    }
                });
                return false;
            }
        });
        return isChild;
    },
    compareObject: function (v1, v2) {
        var countProps = function (obj) {
            var count = 0;
            for (k in obj) if (obj.hasOwnProperty(k)) count++;
            return count;
        };

        if (typeof (v1) !== typeof (v2)) {
            return false;
        }

        if (typeof (v1) === "function") {
            return v1.toString() === v2.toString();
        }

        if (v1 instanceof Object && v2 instanceof Object) {
            if (countProps(v1) !== countProps(v2)) {
                return false;
            }
            var r = true;
            for (k in v1) {
                r = com.compareObject(v1[k], v2[k]);
                if (!r) {
                    return false;
                }
            }
            return true;
        } else {
            return v1 === v2;
        }
    },
    minusArray: function (arr1, arr2) {
        var arr = [];
        for (var i in arr1) {
            var b = true;
            for (var j in arr2) {
                if (com.compareObject(arr1[i], arr2[j])) {
                    b = false;
                    break;
                }
            }
            if (b) {
                arr.push(arr1[i]);
            }
        }
        return arr;
    },
    filterProperties: function (obj, props, ignore) {
        var ret;
        if (obj instanceof Array || Object.prototype.toString.call(obj) === "[object Array]") {
            ret = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    ret.push(com.filterProperties(obj[k], props, ignore));
                }
            }
        }
        else if (typeof obj === 'object') {
            ret = {};
            if (ignore) {
                var map = {};
                for (var k in props) {
                    if (props.hasOwnProperty(k)) {
                        map[props[k]] = true;

                    }
                }
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        if (!map[i]) ret[i] = obj[i];
                    }
                }
            }
            else {
                for (var i in props) {
                    if (props.hasOwnProperty(i)) {
                        if (typeof props[i] == 'function') continue;
                        var arr = props[i].split(" as ");
                        ret[arr[1] || arr[0]] = obj[arr[0]];
                    }
                }
            }
        }
        else {
            ret = obj;
        }
        return ret;
    },
    copyProperty: function (obj, sourcePropertyName, newPropertyName, overWrite) {
        if (obj instanceof Array || Object.prototype.toString.call(obj) === "[object Array]") {
            for (var k in obj)
                com.copyProperty(obj[k], sourcePropertyName, newPropertyName);
        }
        else if (typeof obj === 'object') {
            if (sourcePropertyName instanceof Array || Object.prototype.toString.call(sourcePropertyName) === "[object Array]") {
                for (var i in sourcePropertyName) {
                    com.copyProperty(obj, sourcePropertyName[i], newPropertyName[i]);
                }
            }
            else if (typeof sourcePropertyName === 'string') {
                if ((obj[newPropertyName] && overWrite) || (!obj[newPropertyName]))
                    obj[newPropertyName] = obj[sourcePropertyName];
            }
        }
        return obj;
    },
    functionComment: function (fn) {
        return fn.toString().replace(/^.*\r?\n?.*\/\*|\*\/([.\r\n]*).+?$/gm, '');
    },
    /**
     * 生成随机guid值
     * @returns {} 
     */
    uuid: function () {
        var a = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
        var h = a, e = [], d = Math.random;
        var g;
        e[8] = e[13] = e[18] = e[23] = "-";
        e[14] = "4";
        for (var c = 0; c < 36; c++) {
            if (!e[c]) {
                g = 0 | d() * 16; e[c] = h[(c == 19) ? (g & 3) | 8 : g & 15];
            }
        }
        return e.join("").toLowerCase();
    }
});

(function () {

    function newIframe(url) {
        var ifrStr = "<iframe src='" + url + "' frameborder=0 style='width:100%;height:99%;border:0' ></iframe>";
        return ifrStr;
    }

    //项目通用操作方法
    $.extend(com,
        {
            formatMsg: function (val, objMsg) {
                var text = "数据为空", labelClass = 'warning';
                $.each(objMsg,
                    function (i, v) {

                        if (objMsg.hasOwnProperty(i)) {
                            $.each(v['case'],
                                function (j, caseValue) {
                                    if (v['case'].hasOwnProperty(j)) {
                                        if (val == caseValue) {
                                            text = v.text;
                                            labelClass = i;
                                            return false;
                                        }
                                    }
                                });
                        }
                    });
                return $.string.format('<span class="label label-{0}">{1}</span>', labelClass, text);
            },
            formatYes: function (value) {
                var objMsg = {
                    "success": {
                        text: "是",
                        'case': [true, 'true', 1]
                    },
                    "danger": {
                        text: "否",
                        'case': [false, 'false', 0]
                    }
                };
                return com.formatMsg(value, objMsg);
            },
            formatEnable: function (value) {
                var objMsg = {
                    "success": {
                        text: "启用",
                        'case': [true, 'true', 1]
                    },
                    "danger": {
                        text: "禁用",
                        'case': [false, 'false', 0]
                    }
                };
                return com.formatMsg(value, objMsg);
            },
            dialog: function (options) {
                var query = $, fnClose = options.onClose;
                var uuid = 'dd' + com.uuid();
                var opts = $.extend({
                    modal: true,
                    id: uuid,
                    cache: true,
                    collapsible: true,
                    maximizable: true,
                    html: '',
                    url: '',
                    viewModel: query.noop,
                    onLoadError: function () {
                        abp.message.warn("发生了异常的错误，请尝试重新打开!");
                    }
                },
                    options);

                opts.onClose = function () {
                    if (query.isFunction(fnClose)) fnClose();
                    query(this).dialog('destroy');
                };

                if (query.isFunction(opts.html))
                    opts.html = com.functionComment(opts.html);
                else if (/^\#.*\-template$/.test(opts.html))
                    opts.html = $(opts.html).html();

                var win = query('<div></div>').appendTo('body').html(opts.html);
                if (opts.url)
                    query.ajax({ async: false, url: opts.url, success: function (d) { win.empty().html(d); } });
                var closeBtns = {
                    text: '关闭',
                    iconCls: 'icon-cancel',
                    handler: function () {
                        $('#' + uuid).dialog('close');
                    }
                };
                if (opts.buttons && opts.buttons.length > 0) {
                    opts.buttons.push(closeBtns);
                } else {
                    opts.buttons = [closeBtns];
                }
                var windowHeight = $(window).height();
                var windowWidth = $(window).width();
                if (opts.height > windowHeight) {
                    opts.height = windowHeight;
                }
                if (opts.width > windowWidth) {
                    opts.width = windowWidth;
                }

                win.dialog(opts);
                query.parser.onComplete = function () {
                    opts.viewModel(win);
                    query.parser.onComplete = query.noop;
                };
                query.parser.parse(win);
                return win;
            },
            /**
             * 将dialog的按钮置为禁用或者启用，防止多次提交
             */
            setBusy: function (dialogModal, isOn) {
                if (isOn) {
                    dialogModal.parent().find(".dialog-button").hide();
                } else {
                    dialogModal.parent().find(".dialog-button").show();
                }
            },
            filter: function (formElement, gridElemnt, paramsOrCallback) {
                var data = $(formElement).formSerialize();
                if (typeof (paramsOrCallback) == "object") {
                    if (!!paramsOrCallback) {
                        data = $.extend(data, paramsOrCallback);
                    }
                } else {
                    if ($.isFunction(paramsOrCallback)) {
                        var params = paramsOrCallback(data);
                        if (!!params) {
                            data = $.extend(data, params);
                        }
                    }
                }

                var grid = $(gridElemnt);
                if (grid.datagrid('options').treeField === undefined) {
                    grid.datagrid('unselectAll');
                    grid.datagrid('load', data);
                } else {
                    grid.treegrid('options').queryParams = data;
                    grid.treegrid('reload');
                }
            },
            refreshTab: function (title) {
                if (title == undefined || title == "") {
                    var currentTab = top.$('#centerTabs').tabs('getSelected');
                    var url = $($(currentTab.panel('options')).attr('content')).attr('src');
                    top.$('#centerTabs').tabs('update',
                        {
                            tab: currentTab,
                            options: {
                                href: url
                            }
                        });
                    currentTab.panel('refresh');
                    return;
                }
                var tab = top.$('#centerTabs').tabs('getTab', title);
                top.$('#centerTabs').tabs("update",
                    {
                        tab: tab,
                        options: tab.panel('options')
                    });
            },
            createTab: function (node) {
                var text = node.text;
                var url = node.attributes.url;
                if (top.$('#centerTabs').tabs("exists", text)) {
                    top.$('#centerTabs').tabs("select", text);
                } else {
                    //新增tab页时，加载进度条
                    $.messager.progress({
                        text: '页面加载中....',
                        interval: 100
                    });
                    window.setTimeout(function () {
                        $.messager.progress('close');
                    },
                        1000);
                    top.$('#centerTabs').tabs('add',
                        {
                            title: text,
                            content: newIframe(url),
                            closable: true,
                            iconCls: node.iconCls
                        });
                }
            },
            /**
             * 关闭当前的tabs
             */
            closeCurrentTab: function () {
                var tab = top.$('#centerTabs').tabs('getSelected'); //获取当前选中tabs  
                var index = top.$('#centerTabs').tabs('getTabIndex', tab); //获取当前选中tabs的index  
                top.$('#centerTabs').tabs('close', index); //关闭对应index的tabs  
            },
            /**
             * 编辑前统一提示信息,当Id为0时，说明未选中任何记录，其他时，将Id,作为回调函数的参数
             * @param {elementId} element '#dgGrid'
             * @param {} callback 回调函数 function(id){} id为当前选中的id
             * @returns {} 
             */
            edit: function (element, callback) {
                var id = com.getSelectId(element);
                if (!id) {
                    abp.message.warn('在操作之前，请先选中一条记录！');
                } else {
                    callback(id);
                }
            },
            deleted: function (backendService, element, message, deleteService) {
                var id = 0;
                if (!element) {
                    element = '#dgGrid';
                }
                var template = '<span style="font-weight:bold;">{0}</span>';
                if (!message) {
                    message = '您确认删除这条记录吗?';
                }
                if (!deleteService) {
                    deleteService = "delete";
                }
                var showMessage = $.string.format(template, message);
                id = com.getSelectId(element);
                if (!id) {
                    abp.message.warn('在操作之前，请先选中一条记录！');
                } else {
                    abp.message.confirm(showMessage,
                        '系统提示',
                        function (r) {
                            if (r) {
                                backendService[deleteService](id).done(function () {
                                    abp.message.success('删除成功');
                                    com.btnRefresh(element);
                                });
                            }
                        });
                }
            },
            getSelectId: function (element) {
                if (!element) {
                    element = '#dgGrid';
                }
                var id = 0;
                var $grid = $(element);
                var node = $grid.datagrid('getSelected');
                if (node != null) {
                    id = node.Id;
                }
                return id;
            },
            btnRefresh: function (element) {
                if (!element) {
                    element = '#dgGrid';
                }
                var $grid = $(element);
                if ($grid.datagrid('options').treeField === undefined) {
                    $grid.datagrid('reload').datagrid('clearSelections');
                } else {
                    $grid.treegrid('load').treegrid('unselectAll');
                }
            },
            setForm: function (id, callback, isLoad, url, pDialog) {
                if (id == undefined) {
                    id = 0;
                }
                if (isLoad == undefined) {
                    isLoad = true;
                }
                if (url == undefined) {
                    url = 'GetInfoForEdit?Id=' + id;
                } else {
                    url = url + '?Id=' + id;
                }
                var elemForm;
                if (pDialog == undefined) {
                    elemForm = $('#editForm');
                } else {
                    elemForm = pDialog.find('#editForm');
                }
                abp.ajax(
                    {
                        url: url,
                        success: function (data) {
                            if (isLoad === true) {
                                elemForm.form('load', data);
                            }
                            callback && callback(data);
                        },
                        showLoading: false
                    });
            },
            depJsTree: function (opts) {
                var depService = abp.services.app.organizationUnit;
                return depService.getComBoTreeJson(false,
                    {
                        showLoading: false
                    }).done(function (dataJson) {
                        opts.data = dataJson;
                        $('#depTree').tree(opts);
                    });
            },
            nofind: function (img) {
                img.src = "/Content/images/user.png";
                img.onerror = null; //如果错误图片也不存在就会死循环一直跳
            },
            loadSwithButton: function (pDialog, data) {
                var switchArray = pDialog.find('#editForm').find('input.easyui-switchbutton.switchbutton-f');
                $.each(switchArray,
                    function (i, v) {
                        var id = $(v).attr('id');
                        if (data && data.hasOwnProperty(id)) {
                            pDialog.find('#' + id)
                                .switchbutton((data[id] === true || data[id] === 1) ? 'check' : 'uncheck');
                        }
                    });
            },
            loadCityPicker: function (e, province, city, district) {
                if (province) {
                    e.citypicker({
                        province: province,
                        city: city || "",
                        district: district || ""
                    });
                } else {
                    e.citypicker();
                }
                $('.city-picker-span').css("width", "270px");
            },
            formatAddress: function (row, arrayData) {
                var result = '';
                if (arrayData && arrayData.length > 0) {
                    $.each(arrayData,
                        function (i, v) {
                            if (v != null && v != "") {
                                result += row[v] + "-";
                            }
                        });
                }
                result = result.substring(0, result.length - 1);
                return result;
            },
            loadCheckBox: function (element, data) {
                var checkboxArray = $(element).find('input.easyui-checkbox');
                $.each(checkboxArray,
                    function (i, v) {
                        var id = $(v).attr('id');
                        if (data && data.hasOwnProperty(id)) {
                            $(element).find('#' + id)
                                .checkbox((data[id] === true || data[id] === 1) ? 'check' : 'uncheck');
                        }
                    });
            },
            selectIcon: function (formId) {
                com.dialog({
                    id: "select-icon",
                    title: '选取图标',
                    href: '/Admin/SysMenu/Icon',
                    width: "1000",
                    height: "70%"
                });
            },
            /**
             * 默认不清空Id的数据
             * @param {} formElement form表单element
             * @param {} gridElement grid列表的element
             * @param {} paramsOrCallback 额外的参数或者回调函数
             * @returns {} 
             */
            clear: function (formElement, gridElement, paramsOrCallback) {
                com.clearById("Id", formElement, gridElement, paramsOrCallback);
            },
            /**
            * 清空Id以外的所有文本框的值
            * @param {} id  不清空字段
            * @param {} formElement 
            * @param {} gridElement 
            * @param {} paramsOrCallback 
            * @returns {} 
            */
            clearById: function (id, formElement, gridElement, paramsOrCallback) {

                var grid = $(gridElement);
                $(formElement).form('clear');

                com.json = {}; //清空数据

                if (grid.datagrid('options').treeField === undefined) {
                    grid.datagrid('unselectAll');

                    if (typeof (paramsOrCallback) == "object") {
                        if (!!paramsOrCallback) {
                            com.json = $.extend(com.json, paramsOrCallback);
                        }
                    } else {
                        if ($.isFunction(paramsOrCallback)) {
                            var params = paramsOrCallback(com.json);
                            if (!!params) {
                                com.json = $.extend(com.json, params);
                            }
                        }
                    }

                    grid.datagrid('load', com.json);

                } else {

                    grid.treegrid('options').queryParams = com.json;

                    grid.treegrid('reload');
                }

                $(formElement).find('.select-item').html("");
                $(formElement).find('.title').html("");
                $(formElement).find('.placeholder').show();
            },
            /**
                 * 控制按钮的授权
                 * @param {Array} toolbar  当前菜单对应的按钮权限 
                 * @returns {Array} 返回当前用户拥有的按钮权限 
                 * @example     var baseEnCode = "Admin.OrganizationUnit.";
                 var toolbar = [
                     { 'text': '刷新', iconCls: 'icon-reload', handler: function() { com.btnRefresh(dgTreeGridId); },EnCode:baseEnCode+'GetTreeGrid' }, 
                     { 'text': '新增', iconCls: 'icon-add', handler: gridUI.btnAdd, EnCode: baseEnCode + 'Add' },
                     { 'text': '编辑', iconCls: 'icon-edit', handler: gridUI.btnEdit, EnCode: baseEnCode + 'Edit'},
                     { 'text': '删除', iconCls: 'icon-remove', handler: gridUI.btnDelete, EnCode: baseEnCode + 'Delete' }
                 ];
                      toolbar = com.authorizeButton(toolbar);
                 */
            authorizeButton: function (toolbar) {
                var grantedPermissions = abp.auth.grantedPermissions;
                var newToolbar = [];
                if (grantedPermissions && toolbar && toolbar.length > 0) {
                    newToolbar = toolbar.filter(function (v) {
                        var hasPermssion = grantedPermissions[v.EnCode];
                        return v.EnCode == undefined || grantedPermissions[v.EnCode];
                    });
                }
                return newToolbar;
            },
            /**
               * 去除表单中所有按钮,并且将所有文本框置为禁用
               * @param {} dom jquery对象
               * @example   com.ignoreEle($('#editForm'));
               */
            ignoreEle: function (dom) {
                /**
               * 删除除关闭外的其他按钮
               */
                dom.find('.dialog-button,.datagrid-toolbar').find('a').each(function (r) {
                    if ($(this).text().trim() != '关闭') {
                        $(this).remove();
                    }
                });
                dom.find('button.btn').each(function (r) {
                    if ($(this).text().trim() != '关闭') {
                        $(this).remove();
                    }
                });
                
                dom.parent().parent().find('.dialog-button').find('a').each(function (r) {
                    if ($(this).text().trim() != '关闭') {
                        $(this).remove();
                    }
                });

                dom.find('input,select,textarea').not('input[type=hidden]').each(function (r) {
                    var $this = $(this);
                    var name = $this.attr('id');
                    try {
                        $this.combobox('disable');
                    } catch (e) {
                    }

                    switch (true) {
                        case $this.is("[class*=easyui-textbox]"):
                            $this.textbox('disable');
                            break;
                        case $this.is("[class*=easyui-switchbutton]"):
                            $this.switchbutton('disable');
                            break;
                        case $this.is("[class*=easyui-combobox]"):
                            $this.combo('disable');
                            break;

                        case $this.is("[class*=easyui-numberbox]"):
                            $this.numberbox('disable');
                            break;
                        default:
                            $this.css('border', 'none');
                            $this.attr('disabled', 'disabled');
                            $this.attr('readonly', 'readonly');
                            break;
                    }
                });
            },
            openPostWindow: function (url, formData) {

                var tempForm = document.createElement("form");
                tempForm.id = "tempForm1";
                tempForm.method = "post";
                tempForm.action = url;
                tempForm.target = "_blank"; //打开新页面
                $.each(formData,
                    function (i, v) {
                        var hideInput1 = document.createElement("input");
                        hideInput1.type = "hidden";
                        hideInput1.name = i; //后台要接受这个参数来取值
                        hideInput1.value = v; //后台实际取到的值
                        tempForm.appendChild(hideInput1);
                    });
                if (document.all) {
                    tempForm.attachEvent("onsubmit", function () { }); //IE
                } else {
                    var subObj = tempForm.addEventListener("submit", function () { }, false); //firefox
                }
                document.body.appendChild(tempForm);
                if (document.all) {
                    tempForm.fireEvent("onsubmit");
                } else {
                    tempForm.dispatchEvent(new Event("submit"));
                }
                tempForm.submit();
                document.body.removeChild(tempForm);
            },
            /**
             * 得到IE浏览器的版本号
             * @returns {string} 7/8/9/10/6/edge/11/-1  -1非ie浏览器 
             */
            IEVersion: function () {
                var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
                var isIe = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
                var isEdge = userAgent.indexOf("Edge") > -1 && !isIe; //判断是否IE的Edge浏览器  
                var isIe11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
                if (isIe) {
                    var reIe = new RegExp("MSIE (\\d+\\.\\d+);");
                    reIe.test(userAgent);
                    var fIeVersion = parseFloat(RegExp["$1"]);
                    if (fIeVersion == 7) {
                        return 7;
                    } else if (fIeVersion == 8) {
                        return 8;
                    } else if (fIeVersion == 9) {
                        return 9;
                    } else if (fIeVersion == 10) {
                        return 10;
                    } else {
                        return 6; //IE版本<=7
                    }
                } else if (isEdge) {
                    return 'edge'; //edge
                } else if (isIe11) {
                    return 11; //IE11  
                } else {
                    return -1; //不是ie浏览器
                }
            },
            formatCombobox: function (value, key) {
                var objSpan = {};
                $.each(com[key],
                    function (i, v) {
                        objSpan[v.id] = v.text;
                    });
                return objSpan[value];
            },
            formatDate: function (value, row) {
                if (value != null && value != "") {
                    return value.split(' ')[0];
                } else {
                    return "";
                }
            },
            /**
             * 限制自定义上传格式
             */
            accept: {
                excel: {
                    title: 'excel',
                    extensions: 'xls,xlsx,csv',
                    mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv'
                },
                txt: {
                    title: 'txt',
                    extensions: 'txt',
                    mimeTypes: 'text/plain'
                },
                spss: {
                    title: 'spss',
                    extensions: 'sav',
                    mimeTypes: '.sav'
                }
            },
            enumsToCombox: function (data) {
                var dataArray = [];
                $.each(data,
                    function (i, v) {
                        dataArray.push({
                            id: v.id,
                            text: v.text
                        });
                    });
                return dataArray;
            },
            guid: {
                empty: "00000000-0000-0000-0000-000000000000"
            },
            exportExcel: function (elemId, newName) {
                if (newName == undefined) {
                    newName = com.uuid();
                }
                $(elemId).table2excel({
                    name: newName,
                    exclude: '.noExl',
                    filename: newName,
                    exclude_img: true,
                    exclude_links: true,
                    exclude_inputs: true
                });
            },
            exportWord: function (tableId, newFileName) {
                var style = '<style>table{ width:100%;text-align:center;}\
                table, th, td\
                {\
                    border: 1px solid blue;\
                }\
                table\
                {\
                    border-collapse: collapse;\
                }\
                table, th, td\
                {\
                    border: 1px solid black;\
                }' +
                    '.layui-layer-content { padding: 30px; }\
                    .table > thead: first-child > tr: first-child > td { border-top: 1px solid #d0d0d0; border-bottom: 1px solid #d0d0d0; }\
                .table > tbody > tr > td, .table > thead > tr > td { padding: 12px; border-left: 1px solid #d0d0d0; border-top: 1px solid #d0d0d0; }\
                .table: last-child { border-left: none; border-right: 1px solid #d0d0d0; }\
                .table > tbody > tr.border-bottom > td { border-bottom: 1px solid #d0d0d0; }\
                .table > thead > tr { background-color: #d4ebf1; font-weight: bold; }\
                .table-head { padding-right: 17px; color: #000; }\
                .table-body { width: 100%; height: 394px;}\
                .table-head table, .table-body table { width: 100 %; }</style> ';
                var o = $(tableId)[0].outerHTML;
                var tempRows = "";
                $(o).find("tr").not('.noExl').each(function (i, p) {
                    tempRows += "<tr>";
                    $(p).find("td,th").not('.noExl').each(function (i, q) {
                        var rc = {
                            rows: $(this).attr("rowspan"),
                            cols: $(this).attr("colspan"),
                            flag: $(q).find('.noExl')
                        };

                        if (rc.flag.length > 0) {
                            tempRows += "<td> </td>"; // exclude it!!
                        } else {
                            if (rc.rows & rc.cols) {
                                tempRows += "<td>" + $(q).html() + "</td>";
                            } else {
                                tempRows += "<td";
                                if (rc.rows > 0) {
                                    tempRows += " rowspan=\'" + rc.rows + "\' ";
                                }
                                if (rc.cols > 0) {
                                    tempRows += " colspan=\'" + rc.cols + "\' ";
                                }
                                tempRows += "/>" + $(q).html() + "</td>";
                            }
                        }
                    });
                    tempRows += "</tr>";
                });

                com.openPostWindow('/File/ExportDoc',
                    {
                        tableHtml: style + "<table>" + tempRows+"</table>",
                        newFileName: newFileName
                    });
            },
            exportGrid: function (dgGridId, isAll) {
                var opts = $(dgGridId).datagrid('options');
                if (isAll == undefined) { isAll = true; }
                var eventData = $.fn.datagrid.extensions.parseContextMenuEventData($(dgGridId), opts, null);
                $.messager.progress();
                setTimeout(function () {
                    $.messager.progress('close');
                },
                    1000);
                $('#searchForm').form('submit', {
                    url: opts.exportUrl,
                    onSubmit: function (param) {
                        param.page = eventData.page;
                        param.rows = eventData.pageSize;
                        param.sort = eventData.sort;
                        param.order = eventData.order;
                        param.isAll = isAll;
                    },
                    success: function () {
                    }
                });
                //alert("导出" + (isAll ? "全部" : "当前页") + "数据");
            }
        });
})();