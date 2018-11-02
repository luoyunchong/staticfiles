﻿(function($){
$.parser.plugins.push("checkbox");
	function init(target){
		var button = $(
				'<span class="checkbox">' +
				'<span class="checkbox-inner">' +
				'<span class="checkbox-checked"></span>' +
				'<span class="checkbox-unchecked"></span>' +
				'<input class="checkbox-value" type="checkbox">' +
				'</span>' +
				'</span>').insertAfter(target);
		var t = $(target);
		t.addClass('checkbox-f').hide();
		var name = t.attr('name');
		if (name){
			t.removeAttr('name').attr('checkboxName', name);
			button.find('.checkbox-value').attr('name', name);
		}
		return button;
    }

    function setReadonly(target, mode) {
        var state = $.data(target, 'checkbox');
        var opts = state.options;
        opts.readonly = mode == undefined ? true : mode;
        state.checkbox.removeClass('checkbox-readonly').addClass(opts.readonly ? 'checkbox-readonly' : '');
    }

	function createButton(target){
		var state = $.data(target, 'checkbox');
		var opts = state.options;
		var button = state.checkbox;
		var inner = button.find('.checkbox-inner');

		if(opts.label){
			inner.append('<span class="checkbox-label">'+opts.label+'</span>');
		}

		button.find('.checkbox-value')._propAttr('checked', opts.checked);
		button.removeClass('checkbox-disabled').addClass(opts.disabled ? 'checkbox-disabled' : '');
		button.removeClass('checkbox-reversed').addClass(opts.reversed ? 'checkbox-reversed' : '');
		
		checkButton(target, opts.checked);
		setReadonly(target, opts.readonly);
		$(target).checkbox('setValue', opts.value);
	}
	
	function checkButton(target, checked, animate){
		var state = $.data(target, 'checkbox');
		var opts = state.options;
		opts.checked = checked;
		var inner = state.checkbox.find('.checkbox-inner');
		var _checkbox = inner.find('.checkbox-checked');
		var _unchecked = inner.find('.checkbox-unchecked');

		

		var input = inner.find('.checkbox-value');
		var ck = input.is(':checked');
		$(target).add(input)._propAttr('checked', opts.checked);
		if (opts.checked){
			_checkbox.css("display","block");
			_unchecked.css("display","none");
		}else{
			_checkbox.css("display","none");
			_unchecked.css("display","block");
		}
		if (ck != opts.checked){
			opts.onChange.call(target, opts.checked);
		}
	}
	
	function setDisabled(target, disabled){
		var state = $.data(target, 'checkbox');
		var opts = state.options;
		var button = state.checkbox;
		var input = button.find('.checkbox-value');
		if (disabled){
			opts.disabled = true;
			$(target).add(input).attr('disabled', 'disabled');
			button.addClass('checkbox-disabled');
		} else {
			opts.disabled = false;
			$(target).add(input).removeAttr('disabled');
			button.removeClass('checkbox-disabled');
		}
	}
	
	function bindEvents(target){
		var state = $.data(target, 'checkbox');
		var opts = state.options;
		state.checkbox.unbind('.checkbox').bind('click.checkbox', function(){
			if (!opts.disabled && !opts.readonly){
				checkButton(target, opts.checked ? false : true, true);
			}
		});
	}
	$.fn.checkbox = function(options, param){
		if (typeof options == 'string'){
			return $.fn.checkbox.methods[options](this, param);
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'checkbox');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'checkbox', {
					options: $.extend({}, $.fn.checkbox.defaults, $.fn.checkbox.parseOptions(this), options),
					checkbox: init(this)
				});
			}
			state.options.originalChecked = state.options.checked;
			createButton(this);
			bindEvents(this);
		});
	};
	$.fn.checkbox.methods = {
		options: function(jq){
			var state = jq.data('checkbox');
			return $.extend(state.options, {
				value: state.checkbox.find('.checkbox-value').val()
			});
		},
		enable: function(jq){
			return jq.each(function(){
				setDisabled(this, false);
			});
		},
		disable: function(jq){
			return jq.each(function(){
				setDisabled(this, true);
			});
		},
		readonly: function(jq, mode){
			return jq.each(function(){
				setReadonly(this, mode);
			});
		},
		isCheck: function(jq){
			var r=false;
			jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if(opts.checked){
					r=true;
					return;
				}
			});
			return r;
		},
		check: function(jq){
			return jq.each(function(){
				checkButton(this, true);
			});
		},
		uncheck: function(jq){
			return jq.each(function(){
				checkButton(this, false);
			});
		},
		reset: function(jq){
			return jq.each(function(){
				var opts = $(this).checkbox('options');
				checkButton(this, opts.originalChecked);
			});
		},
		setValue: function(jq, value){
			return jq.each(function(){
				$(this).val(value);
				$.data(this, 'checkbox').checkbox.find('.checkbox-value').val(value);
			});
		},
		getValue: function(jq){
			var obj = jq.data('checkbox');
			var opts = obj.options;
			return opts.checked?obj.checkbox.find('.checkbox-value').val():"";
		},
		getText: function(jq){
			var obj = jq.data('checkbox');
			var opts = obj.options;
			return opts.checked?obj.checkbox.find('.checkbox-label').html():"";
		},
		getValues: function(jq){
			var v=[];
			jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if(opts.checked){
					v.push(obj.checkbox.find('.checkbox-value').val()); 
				}
			});
			return v.join(",");
		},
		getTexts:function(jq){
			var v=[];
			jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if(opts.checked){
					v.push(obj.checkbox.find('.checkbox-label').html()); 
				}
			});
			return v.join(",");
		},
		getCount: function(jq){
			var count=0;
			jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if(opts.checked){
					count++;
				}
			});
			return count;
		},
		checkAll:function(jq){
			return jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if (!opts.disabled && !opts.readonly){
					checkButton(this, true);
				}
			});
		},
		uncheckAll:function(jq){
			return jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if (!opts.disabled && !opts.readonly){
					checkButton(this, false);
				}
			});
		},
		reCheck:function(jq){
			return jq.each(function(){
				var obj = $(this).data('checkbox');
				var opts = obj.options;
				if (!opts.disabled && !opts.readonly){
					opts.checked?checkButton(this, false):checkButton(this, true);
				}
			});
		}


	};
	
	$.fn.checkbox.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.parser.parseOptions(target, []), {
			label: (t.attr('label') ? t.attr('label') : undefined),
			value: (t.val() || undefined),
			checked: (t.attr('checked') ? true : false),
			disabled: (t.attr('disabled') ? true : false),
			readonly: (t.attr('readonly') ? true : false)
		});
	};
	$.fn.checkbox.defaults = {
		checked: false,
		disabled: false,
		readonly: false,
		label:"",
		value:'1',
		onChange: function(checked){}
	};

})(jQuery);

(function($){
    $.parser.plugins.push("radiobox");
	function init(target){
		var button = $(
				'<span class="radiobox">' +
				'<span class="radiobox-inner">' +
				'<span class="radiobox-checked"></span>' +
				'<span class="radiobox-unchecked"></span>' +
				'<input class="radiobox-value" type="radio">' +
				'</span>' +
				'</span>').insertAfter(target);
		var t = $(target);
		t.addClass('radiobox-f').hide();
		var name = t.attr('name');
		if (name){
			t.removeAttr('name').attr('radioboxName', name);
			button.find('.radiobox-value').attr('name', name);
		}
		return button;
	}
	function createButton(target){
		var state = $.data(target, 'radiobox');
		var opts = state.options;
		var button = state.radiobox;
		var inner = button.find('.radiobox-inner');

		if(opts.label){
			inner.append('<span class="radiobox-label">'+opts.label+'</span>');
		}

		button.find('.radiobox-value')._propAttr('checked', opts.checked);
		button.removeClass('radiobox-disabled').addClass(opts.disabled ? 'radiobox-disabled' : '');
		button.removeClass('radiobox-reversed').addClass(opts.reversed ? 'radiobox-reversed' : '');
		
		checkButton(target, opts.checked);
		setReadonly(target, opts.readonly);
		$(target).radiobox('setValue', opts.value);
	}
	
	function checkButton(target, checked, animate){
		var state = $.data(target, 'radiobox');
		var opts = state.options;
		opts.checked = checked;
		var inner = state.radiobox.find('.radiobox-inner');
		var _checkbox = inner.find('.radiobox-checked');
		var _unchecked = inner.find('.radiobox-unchecked');
		var obj=$('input.radiobox-value[name="'+opts.name+'"]');

		var input = inner.find('.radiobox-value');
		var ck = input.is(':checked');
		if (ck){
			//默认状态
			_checkbox.css("display","block");
			_unchecked.css("display","none");
		}
		if(opts.checked){
			//点击后的执状态
			var s=false;
			obj.each(function(){
				var disabled=$(this).parent('.radiobox-inner').parent('.radiobox.radiobox-disabled').find('.radiobox-value').is(':checked');
				var readonly=$(this).parent('.radiobox-inner').parent('.radiobox.radiobox-readonly').find('.radiobox-value').is(':checked');
				if(disabled||readonly){
					s=true;
					return;
				}
			});
			if(!s){
				obj.parent('.radiobox-inner').find('.radiobox-checked').css("display","none");
				obj.parent('.radiobox-inner').find('.radiobox-unchecked').css("display","block");
				obj.removeAttr('checked');

				$(target).add(input)._propAttr('checked',checked);
				_checkbox.css("display","block");
				_unchecked.css("display","none");
			}

		}



	}
	
	function setDisabled(target, disabled){
		var state = $.data(target, 'radiobox');
		var opts = state.options;
		var button = state.radiobox;
		var input = button.find('.radiobox-value');
		if (disabled){
			opts.disabled = true;
			$(target).add(input).attr('disabled', 'disabled');
			button.addClass('radiobox-disabled');
		} else {
			opts.disabled = false;
			$(target).add(input).removeAttr('disabled');
			button.removeClass('radiobox-disabled');
		}
	}
	
	function setReadonly(target, mode){
		var state = $.data(target, 'radiobox');
		var opts = state.options;
		opts.readonly = mode==undefined ? true : mode;
		state.radiobox.removeClass('radiobox-readonly').addClass(opts.readonly ? 'radiobox-readonly' : '');
	}
	
	function bindEvents(target){
		var state = $.data(target, 'radiobox');
		var opts = state.options;
		state.radiobox.unbind('.radiobox').bind('click.radiobox', function(){
			if (!opts.disabled && !opts.readonly){
				checkButton(target, true, true);
			}
		});
	}
	$.fn.radiobox = function(options, param){
		if (typeof options == 'string'){
			return $.fn.radiobox.methods[options](this, param);
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'radiobox');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'radiobox', {
					options: $.extend({}, $.fn.radiobox.defaults, $.fn.radiobox.parseOptions(this), options),
					radiobox: init(this)
				});
			}
			state.options.originalChecked = state.options.checked;
			createButton(this);
			bindEvents(this);
		});
	};
	$.fn.radiobox.methods = {
		options: function(jq){
			var state = jq.data('radiobox');
			return $.extend(state.options, {
				value: state.radiobox.find('.radiobox-value').val()
			});
		},
		enable: function(jq){
			return jq.each(function(){
				setDisabled(this, false);
			});
		},
		disable: function(jq){
			return jq.each(function(){
				setDisabled(this, true);
			});
		},
		readonly: function(jq, mode){
			return jq.each(function(){
				setReadonly(this, mode);
			});
		},
		checked: function(jq, value){
			return jq.each(function(){
				var obj = $(this).data('radiobox');
				var opts = obj.options;
				if (opts.value==value && !opts.disabled && !opts.readonly){
					checkButton(this, true);
				}
			});
		},
		reset: function(jq){
			return jq.each(function(){
				var opts = $(this).radiobox('options');
				checkButton(this, opts.originalChecked);
			});
		},
		setValue: function(jq, value){
			return jq.each(function(){
				$(this).val(value);
				$.data(this, 'radiobox').radiobox.find('.radiobox-value').val(value);
			});
		},
		getValue: function(jq){
			var obj = jq.data('radiobox');
			var opts = obj.options;
			return opts.checked?obj.radiobox.find('.radiobox-value').val():"";
		},
		getText: function(jq){
			var obj = jq.data('radiobox');
			var opts = obj.options;
			return opts.checked?obj.radiobox.find(".radiobox-label").html():"";
		},
		getValues: function(jq){
			var obj = jq.data('radiobox');
			var opts = obj.options;
			return $('input.radiobox-value[name="'+opts.name+'"]:checked').val();
		},
		getTexts: function(jq){
			var obj = jq.data('radiobox');
			var opts = obj.options;
			var obj=$('input.radiobox-value[name="'+opts.name+'"]:checked');
			return obj.parent('.radiobox-inner').find(".radiobox-label").html();
		}
	};
	
	$.fn.radiobox.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.parser.parseOptions(target, []), {
			name: (t.attr('name') ? t.attr('name') : undefined),
			label: (t.attr('label') ? t.attr('label') : undefined),
			value: (t.val() || undefined),
			checked: (t.attr('checked') ? true : false),
			disabled: (t.attr('disabled') ? true : false),
			readonly: (t.attr('readonly') ? true : false)
		});
	};
	$.fn.radiobox.defaults = {
		name:"",
		checked: false,
		disabled: false,
		readonly: false,
		label:"",
		value:'',
		onChange: function(checked){}
	};

})(jQuery);


(function () {



    if ($.fn.switchbutton) {
        //$.fn.switchbutton.defaults.handleWidth=$.fn.switchbutton.defaults.height;
    }
    if ($.messager.defaults) {
        $.messager.defaults.style.border = 0;
    }


    if ($.fn.pagination) {
        $.fn.pagination.defaults.beforePageText = '第';
        $.fn.pagination.defaults.afterPageText = '共 {pages} 页';
        $.fn.pagination.defaults.displayMsg = '显示 {from} 到 {to},共 {total} 记录';
    }
    if ($.fn.datagrid) {
        $.fn.datagrid.defaults.loadMsg = '正在处理，请稍待...';
    }
    if ($.fn.treegrid && $.fn.datagrid) {
        $.fn.treegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
    }
    if ($.messager) {
        $.messager.defaults.ok = '确定';
        $.messager.defaults.cancel = '取消';
    }
    $.map(['validatebox', 'textbox', 'passwordbox', 'filebox', 'searchbox',
        'combo', 'combobox', 'combogrid', 'combotree',
        'datebox', 'datetimebox', 'numberbox',
        'spinner', 'numberspinner', 'timespinner', 'datetimespinner'], function (plugin) {
            if ($.fn[plugin]) {
                $.fn[plugin].defaults.missingMessage = '该输入项为必输项';
            }
        });
    if ($.fn.validatebox) {
        $.fn.validatebox.defaults.rules.email.message = '请输入有效的电子邮件地址';
        $.fn.validatebox.defaults.rules.url.message = '请输入有效的URL地址';
        $.fn.validatebox.defaults.rules.length.message = '输入内容长度必须介于{0}和{1}之间';
        $.fn.validatebox.defaults.rules.remote.message = '请修正该字段';
    }
    if ($.fn.calendar) {
        $.fn.calendar.defaults.weeks = ['日', '一', '二', '三', '四', '五', '六'];
        $.fn.calendar.defaults.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    }
    if ($.fn.datebox) {
        $.fn.datebox.defaults.currentText = '今天';
        $.fn.datebox.defaults.closeText = '关闭';
        $.fn.datebox.defaults.okText = '确定';
        $.fn.datebox.defaults.formatter = function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
        };
        $.fn.datebox.defaults.parser = function (s) {
            if (!s) return new Date();
            var ss = s.split('-');
            var y = parseInt(ss[0], 10);
            var m = parseInt(ss[1], 10);
            var d = parseInt(ss[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(y, m - 1, d);
            } else {
                return new Date();
            }
        };
    }
    if ($.fn.datetimebox && $.fn.datebox) {
        $.extend($.fn.datetimebox.defaults, {
            currentText: $.fn.datebox.defaults.currentText,
            closeText: $.fn.datebox.defaults.closeText,
            okText: $.fn.datebox.defaults.okText
        });
    }
    if ($.fn.datetimespinner) {
        $.fn.datetimespinner.defaults.selections = [[0, 4], [5, 7], [8, 10], [11, 13], [14, 16], [17, 19]]
    }

    $.extend($.fn.validatebox.defaults.tipOptions, {
        onShow: function () {
            $(this).tooltip("tip").css({
                color: "#fff",
                border: "1px solid transparent",
                backgroundColor: "#ff7e00"
            });

        }
    }); //重置validatebox下的tipOptions的样式
})(); 


;(function($){
	$.insdep={
		ajax:function(c){
			var d={
				url:"",
				async:true,//true异步请求,false同步请求,注：同步请求将锁住浏览器，用户其它操作必须等待请求完成才可以执行
				cache:false,
				type:"POST",
				dataType:"html",
				beforeSend:function(){
					$.messager.progress();
				},
				complete:function(){
					$.messager.progress('close');
				}
			};
			var n=$.extend(true,d,c);

			n.async?$.ajax(n):$.when($.insdep.ajax_async(n)).done(n.success?n.success:function(data){
	            return data;
	        });
		},
		ajax_async:function(c){
			var defer = $.Deferred();
			var n=$.extend(true,c,{
				success: function(result){
					defer.resolve(result);
				}
			});
			$.ajax(n);
			return defer.promise();
		},
		error:function(result) {
			$('<div/>').window({
				id:"insdep-error-debug-window",
				cache:false,
			    width : 720,
			    height : 480,
			    modal : true,
				title:"错误",
				content:"<div style='padding:15px;overflow:hidden;height:auto;clear:both;'><b>Return Error</b><br/>"+result+"<br/></div>",
				border:false,
				collapsible:false,
				minimizable:false,
				maximizable:false,
				queryParams:"",
				onClose:function() {
					$(this).window('destroy');
				},
				buttons:[]
			});
		},
		window:function(c){
			var d={
               id:"temp-window",
               href:"",
               cache:false,
               method:"post",
               width : 680,
               height : 550,
               modal : true,
               title:"",
               border:false,
               collapsible:false,
               minimizable:false,
               maximizable:false,
               queryParams:"",
               onClose:function() {
                  $(this).window('destroy');
               },
               buttons:[]
			};
			var n=$.extend(true,d,c);
			$('<div/>').window(n);
		},
		tabs:function(c){
			var d={
               object:".theme-tabs-layout",
               href:"",
               title:"",    
			   content:"", 
			   closable:true, 
			};
			var n=$.extend(true,d,c);
			$(n.object).tabs('add',n);  

		},
		control:function(url,queryParams){
			$('#control').panel({    
				href:url,
				cache:false,
				method:"post",
				queryParams:queryParams?queryParams:{},    
				onLoad:function(){    
					//alert('loaded successfully');    
				},
				onBeforeLoad:function(){
					$(this).panel('clear');
				}
			}); 
		}
	};
})(jQuery);
