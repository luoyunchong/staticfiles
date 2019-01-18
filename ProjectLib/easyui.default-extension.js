
(function () {
    
    if ($.fn.datagrid) {
     
        $.extend($.fn.combotree.defaults,
            {
                lines: true,
                animate: true,
                loadFilter:com.loadAbp
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
                onOpen: function () {
                    $('#searchForm').keydown(function (e) {
                        if (e.which === 13) {
                            e.preventDefault();
                            com.filter('#searchForm', '#dgGrid');
                            return false;
                        }
                    });
                },
                onLoadError: function (a, b, c) {
                    if (arguments[0].status == 403) {
                        abp.message.warn("您无权访问此方法", '系统提示');
                    }
                    if (arguments[0].status == 500) {
                        if (arguments[0].responseJSON) {
                            var json = arguments[0].responseJSON.error;
                            abp.message.warn(json.message);
                        }
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
                loadFilter: com.loadAbp
            });
        $.extend($.fn.tree.defaults,
            {
                loadFilter: com.loadAbp
            });
        $.extend($.fn.treegrid.defaults,
            {
                animate: true,
                fit: true,
                fitColumns: true,
                rownumbers: true,
                idField: 'Id',
                treeField: 'DisplayName',
                onLoadError: function (a, b, c) {
                    if (arguments[0].status == 403) {
                        abp.message.warn("您无权访问此方法", '系统提示');
                    }
                },
                onOpen: function () {
                    $('#searchForm').keydown(function (e) {
                        if (e.which === 13) {
                            e.preventDefault();
                            com.filter('#searchForm', '#dgGrid');
                            return false;
                        }
                    });
                }
            });

        if($.fn.switchbutton!=undefined){
            $.extend($.fn.switchbutton.defaults,
                {
                    width: 46,
                    height: 22,
                    onText: "是",
                    offText: "否",
                    isBool: true
                });
        }


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
            //validType="remote['/group/validCode','code',{'param':'id"','selector':'#id'},'编码不唯一']"
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

        /**  
         * 1）扩展jquery easyui tree的节点检索方法。使用方法如下：  
         * $("#treeId").tree("search", searchText);    
         * 其中，treeId为easyui tree的根UL元素的ID，searchText为检索的文本。  
         * 如果searchText为空或""，将恢复展示所有节点为正常状态  
         */
        (function ($) {

            $.extend($.fn.tree.methods, {
                /**  
                 * 扩展easyui tree的搜索方法  
                 * @param tree easyui tree的根DOM节点(UL节点)的jQuery对象  
                 * @param searchText 检索的文本  
                 * @param this-context easyui tree的tree对象  
                 */
                search: function (jqTree, searchText) {
                    //easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法  
                    var tree = this;

                    //获取所有的树节点  
                    var nodeList = getAllNodes(jqTree, tree);

                    //如果没有搜索条件，则展示所有树节点  
                    searchText = $.trim(searchText);
                    if (searchText == "") {
                        for (var i = 0; i < nodeList.length; i++) {
                            $(".tree-node-targeted", nodeList[i].target).removeClass("tree-node-targeted");
                            $(nodeList[i].target).show();
                        }
                        //展开已选择的节点（如果之前选择了）  
                        var selectedNode = tree.getSelected(jqTree);
                        if (selectedNode) {
                            tree.expandTo(jqTree, selectedNode.target);
                        }
                        return;
                    }

                    //搜索匹配的节点并高亮显示  
                    var matchedNodeList = [];
                    if (nodeList && nodeList.length > 0) {
                        var node = null;
                        for (var i = 0; i < nodeList.length; i++) {
                            node = nodeList[i];
                            if (isMatch(searchText, node.text)) {
                                matchedNodeList.push(node);
                            } else if (node.sampleCode != undefined && node.sampleCode.indexOf(searchText) != -1) {
                                matchedNodeList.push(node);
                            }
                        }

                        //隐藏所有节点  
                        for (var i = 0; i < nodeList.length; i++) {
                            $(".tree-node-targeted", nodeList[i].target).removeClass("tree-node-targeted");
                            $(nodeList[i].target).hide();
                        }

                        //折叠所有节点  
                        tree.collapseAll(jqTree);

                        //展示所有匹配的节点以及父节点              
                        for (var i = 0; i < matchedNodeList.length; i++) {
                            showMatchedNode(jqTree, tree, matchedNodeList[i]);
                        }
                    }
                },

                /**  
                 * 展示节点的子节点（子节点有可能在搜索的过程中被隐藏了）  
                 * @param node easyui tree节点  
                 */
                showChildren: function (jqTree, node) {
                    //easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法  
                    var tree = this;

                    //展示子节点  
                    if (!tree.isLeaf(jqTree, node.target)) {
                        var children = tree.getChildren(jqTree, node.target);
                        if (children && children.length > 0) {
                            for (var i = 0; i < children.length; i++) {
                                if ($(children[i].target).is(":hidden")) {
                                    $(children[i].target).show();
                                }
                            }
                        }
                    }
                },

                /**  
                 * 将滚动条滚动到指定的节点位置，使该节点可见（如果有滚动条才滚动，没有滚动条就不滚动）  
                 * @param param {  
                 *    treeContainer: easyui tree的容器（即存在滚动条的树容器）。如果为null，则取easyui tree的根UL节点的父节点。  
                 *    targetNode:  将要滚动到的easyui tree节点。如果targetNode为空，则默认滚动到当前已选中的节点，如果没有选中的节点，则不滚动  
                 * }   
                 */
                scrollTo: function (jqTree, param) {
                    //easyui tree的tree对象。可以通过tree.methodName(jqTree)方式调用easyui tree的方法  
                    var tree = this;

                    //如果node为空，则获取当前选中的node  
                    var targetNode = param && param.targetNode ? param.targetNode : tree.getSelected(jqTree);

                    if (targetNode != null) {
                        //判断节点是否在可视区域                 
                        var root = tree.getRoot(jqTree);
                        var $targetNode = $(targetNode.target);
                        var container = param && param.treeContainer ? param.treeContainer : jqTree.parent();
                        var containerH = container.height();
                        var nodeOffsetHeight = $targetNode.offset().top - container.offset().top;
                        if (nodeOffsetHeight > (containerH - 30)) {
                            var scrollHeight = container.scrollTop() + nodeOffsetHeight - containerH + 30;
                            container.scrollTop(scrollHeight);
                        }
                    }
                }
            });




            /**  
             * 展示搜索匹配的节点  
             */
            function showMatchedNode(jqTree, tree, node) {
                //展示所有父节点  
                $(node.target).show();
                $(".tree-title", node.target).addClass("tree-node-targeted");
                var pNode = node;
                while ((pNode = tree.getParent(jqTree, pNode.target))) {
                    $(pNode.target).show();
                }
                //展开到该节点  
                tree.expandTo(jqTree, node.target);
                //如果是非叶子节点，需折叠该节点的所有子节点  
                if (!tree.isLeaf(jqTree, node.target)) {
                    tree.collapse(jqTree, node.target);
                }
            }

            /**  
             * 判断searchText是否与targetText匹配  
             * @param searchText 检索的文本  
             * @param targetText 目标文本  
             * @return true-检索的文本与目标文本匹配；否则为false.  
             */
            function isMatch(searchText, targetText) {
                return $.trim(targetText) != "" && targetText.indexOf(searchText) != -1;
            }

            /**  
             * 获取easyui tree的所有node节点  
             */
            function getAllNodes(jqTree, tree) {
                //var allNodeList = jqTree.data("allNodeList");
                //if (!allNodeList) {
                //    var roots = tree.getRoots(jqTree);
                //    allNodeList = getChildNodeList(jqTree, tree, roots);
                //    jqTree.data("allNodeList", allNodeList);
                //}
                //return allNodeList;

                var allNodeList = jqTree.tree("getChildren");
                return allNodeList;
            }

            /**  
             * 定义获取easyui tree的子节点的递归算法  
             */
            function getChildNodeList(jqTree, tree, nodes) {
                var childNodeList = [];
                if (nodes && nodes.length > 0) {
                    var node = null;
                    for (var i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        childNodeList.push(node);
                        if (!tree.isLeaf(jqTree, node.target)) {
                            var children = tree.getChildren(jqTree, node.target);
                            childNodeList = childNodeList.concat(getChildNodeList(jqTree, tree, children));
                        }
                    }
                }
                return childNodeList;
            }
        })(jQuery);
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
        if (id == undefined || id.indexOf("_easyui_textbox_input") !== -1 || $this.hasClass('hiddenInput')) {
            id = $this.attr('radioboxname');
            if (id == undefined) {
                return;
            }
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
            case $this.is("[class*=checkbox-f]"):
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
            case $this.is("[class*=radiobox-f]"):
            postdata[$this.attr('radioboxname')] = $('.' + $this.attr('radioboxname')).radiobox('getValues');
            break;
            default:
                postdata[id] = $this.val();
                break;
        }
    });

    $form.find('.webuploader-container').parent().parent().each(function (r) {
        var $this = $(this);
        var id = $this.attr('id');
        postdata[id] = $this.GetFilesAddress();
    });

    return postdata;
};
