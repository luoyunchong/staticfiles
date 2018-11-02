var abp = abp || {};
var abpLayer;
(function ($) {
    if (!top.layer || !$) {
        return;
    }
    abpLayer = top.layer;
    abp.libs = abp.libs || {};
    abp.libs.layuiAlert = {
        config: {
            'default': {
                icon: '0'
            },
            info: {
                icon: '0',
                shade: 0
            },
            success: {
                icon: '6',
                shade: 0
            },
            warn: {
                icon: '5',
                shade: 0
            },
            error: {
                icon: '2',
                shade: 0
            },
            confirm: {
                icon: '3',
                title: '您确认执行该操作吗?',
                shade: 0.3,
                btnclass: ['btn btn-primary', 'btn btn-danger'],
                buttons: ['取消', '确认']
            }
        }
    };

    var showMessage = function (type, message, title) {
        if (!title) {
            title = "提示";
            message = message;
        }

        var opts = $.extend(
            {},
            abp.libs.layuiAlert.config['default'],
            abp.libs.layuiAlert.config[type],
            {
                title: title
            }
        );

        return $.Deferred(function ($dfd) {
            abpLayer.alert(message, opts);
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
    
    abp.message.confirm = function (message, titleOrCallback, yesCallback, cancelCallback) {
        var userOpts = {};
        var yes;
        var cancel;

        if ($.isFunction(titleOrCallback)) {
            yes = titleOrCallback;
            cancel = cancelCallback;
        } else if (titleOrCallback) {
            userOpts.title = titleOrCallback;
            yes = yesCallback;
            cancel = cancelCallback;
        } else {
            yes = yesCallback;
            cancel = cancelCallback;
        };

        var opts = $.extend(
            {},
            abp.libs.layuiAlert.config['default'],
            abp.libs.layuiAlert.config.confirm,
            userOpts
        );

        return $.Deferred(function ($dfd) {
            abpLayer.confirm(message, opts, yes, cancel);
        });
    };

    abp.imagePreviewDialog = function (imgSrc) {
        var img = new Image();
        img.src = imgSrc;      
        img.onload = function () {

            var width = img.width, height = img.height;
            var w = window;
            if (top != window) {
                w = top;
            }
            var windowHeight = $(w).height();
            var windowWidth = $(w).width();
            if (height > windowHeight) {
                height = windowHeight;
            }
            if (width > windowWidth) {
                width = windowWidth;
            }

            w.layer.open({
                type: 1,
                anim: 1,
                title: false,
                shadeClose: true,
                area: [width + 'px', height + 'px'], //宽高
                content: '<div style=""><img src="' + imgSrc + '" style="width:100%;height:90%;" onerror="webuploader.show404(this);"/></div>'
            });
        };
        img.onerror = function () {
            layer.msg('图片已不存在！');
        };
    };


    abp.event.on('abp.dynamicScriptsInitialized', function () {
        abp.libs.layuiAlert.config.confirm.title = '您确认执行该操作吗?';
        abp.libs.layuiAlert.config.confirm.buttons = ['取消', '确认'];
    });

})(jQuery);