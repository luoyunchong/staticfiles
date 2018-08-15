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