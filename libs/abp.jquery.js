﻿(function ($) {

    if (!$) {
        return;
    }

    /* JQUERY ENHANCEMENTS ***************************************************/

    // abp.ajax -> uses $.ajax ------------------------------------------------
    /**
     * abp.ajax
     */
    abp.ajax = function (userOptions) {
        userOptions = userOptions || {};

        var options = $.extend(true, {}, abp.ajax.defaultOpts, userOptions);
        var oldBeforeSendOption = options.beforeSend;
        options.beforeSend = function (xhr) {
            if (oldBeforeSendOption) {
                oldBeforeSendOption(xhr);
            }

            xhr.setRequestHeader("Pragma", "no-cache");
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Expires", "Sat, 01 Jan 2000 00:00:00 GMT");
        };

        options.success = undefined;
        options.error = undefined;

        if (options.showLoading === true && $.messager) {
            if (options.loadingMsg == '') {
                $.messager.progress();
            } else {
                $.messager.progress({
                    title: '加载中...',
                    text: options.loadingMsg
                });
            }
        }

        return $.Deferred(function ($dfd) {
            $.ajax(options)
                .done(function (data, textStatus, jqXhr) {
                    if (data.__abp) {
                        abp.ajax.handleResponse(data, userOptions, $dfd, jqXhr);
                    } else {
                        $dfd.resolve(data);
                        userOptions.success && userOptions.success(data);
                    }
                }).fail(function (jqXhr) {
                    if (jqXhr.responseJSON && jqXhr.responseJSON.__abp) {
                        abp.ajax.handleResponse(jqXhr.responseJSON, userOptions, $dfd, jqXhr);
                        return;
                    } else {
                        if (jqXhr.responseText.indexOf('__abp') == -1) {
                            var msg ="<span class='label label-default'>错误号：</span><span>" +jqXhr.status +"(" +jqXhr.statusText +"</span>)；<hr /><pre lang='js'>" +abp.ajax.getFormattedParameters(jqXhr.responseText)+"</pre>";
                            abp.message.showErrorPage(msg);
                        } else {
                            var json = $.parseJSON(jqXhr.responseText);
                            if (json && json.__abp) {
                                abp.ajax.handleResponse(json, userOptions, $dfd, jqXhr);
                                return;
                            }
                        }
                    }
                    abp.ajax.handleNonAbpErrorResponse(jqXhr, userOptions, $dfd);
                }).always(function () {
                    if (options.showLoading === true&&$.messager) {
                        $.messager.progress('close');
                    }
                });
        });
    };

    $.extend(abp.ajax, {
        defaultOpts: {
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            showMsg: false,
            loadingMsg: '',
            showLoading: true
        },
        defaultError: {
            message: '发生了一个错误！',
            details: '服务器未发送的错误详细信息.'
        },

        defaultError401: {
            message: '你没有被认证！',
            details: '为了执行这个操作，您应该被认证（登录）。'
        },

        defaultError403: {
            message: '你没有被授权！',
            details: '您不允许执行此操作.'
        },

        defaultError404: {
            message: '资源未找到!',
            details: '服务器上找不到请求的资源。.'
        },
        logError: function (error) {
            abp.log.error(error);
        },
        showError: function (error) {
            if (!$.array.isNullOrEmpty(error.validationErrors)) {
                var errorMsg = "";
                $.each(error.validationErrors, function (i, v) {
                    errorMsg += v.message + ";";
                });
                return abp.message.error(errorMsg, error.message);
            }

            if (error.details) {
                return abp.message.error(error.details, error.message);
            } else {
                return abp.message.error(error.message || abp.ajax.defaultError.message);
            }
        },

        handleTargetUrl: function (targetUrl) {
            if (!targetUrl) {
                location.href = abp.appPath;
            } else {
                location.href = targetUrl;
            }
        },

        handleNonAbpErrorResponse: function (jqXHR, userOptions, $dfd) {
         
            if (userOptions.abpHandleError !== false) {
                switch (jqXHR.status) {
                    case 401:
                        abp.ajax.handleUnAuthorizedRequest(
                            abp.ajax.showError(abp.ajax.defaultError401),
                            abp.appPath
                        );
                        break;
                    case 403:
                        abp.ajax.showError(abp.ajax.defaultError403);
                        break;
                    case 404:
                        abp.ajax.showError(abp.ajax.defaultError404);
                        break;
                    default:
                        abp.ajax.showError(abp.ajax.defaultError);
                        break;
                }
            }

            $dfd.reject.apply(this, arguments);
            userOptions.error && userOptions.error.apply(this, arguments);
        },

        handleUnAuthorizedRequest: function (messagePromise, targetUrl) {
            if (messagePromise) {
                messagePromise.done(function () {
                    abp.ajax.handleTargetUrl(targetUrl);
                });
            } else {
                abp.ajax.handleTargetUrl(targetUrl);
            }
        },
        getFormattedParameters: function (parameters) {
            try {
                var json = JSON.parse(parameters);
                return JSON.stringify(json, null, 4);
            } catch (e) {
                return parameters;
            }
        },
        handleResponse: function (data, userOptions, $dfd, jqXHR) {
            if (data) {
                if (data.success === true) {
                    //然后弹出成功操作的提示
                    if (userOptions.showMsg) {
                        var msgToShow = "";
                        if (data.result == null || typeof (data.result) == "number") {
                            msgToShow = "操作成功!";
                        }
                        abp.message.success(msgToShow, '提示');
                    }

                    if (data.targetUrl) {
                        abp.ajax.handleTargetUrl(data.targetUrl);
                    }

                    $dfd && $dfd.resolve(data.result, data, jqXHR);
                    userOptions.success && userOptions.success(data.result, data, jqXHR);

                } else if (data.success === false) {
                    var messagePromise = null;
                    /*   if (com.config.isDebug === true) {
                           //如果配置文件开发模式为isDbug,就不显示错误，采用了jeasyui.extensions.js文件中错误提示！
                           var msg = (XMLHttpRequest && !$.string.isNullOrWhiteSpace(jqXHR.responseText)
                               ?
                               "<span class='label label-default'>错误号：</span><span>" +
                               jqXHR.status +
                               "(" +
                               jqXHR.statusText +
                               "</span>)；<hr /><pre lang='js'>" +
                               abp.ajax.getFormattedParameters(jqXHR.responseText)
                               : "</pre>");
                           abp.message.error(msg);
                       } else {*/
                    if (data.error) {
                        if (userOptions.abpHandleError !== false) {
                            messagePromise = abp.ajax.showError(data.error);
                        }
                    } else {
                        data.error = abp.ajax.defaultError;
                    }
                    abp.ajax.logError(data.error);


                    $dfd && $dfd.reject(data.error, jqXHR);
                    userOptions.error && userOptions.error(data.error, jqXHR);

                    if (jqXHR.status === 401 && userOptions.abpHandleError !== false) {
                        abp.ajax.handleUnAuthorizedRequest(messagePromise, data.targetUrl);
                    }
                } else { //not wrapped result
                    $dfd && $dfd.resolve(data, null, jqXHR);
                    userOptions.success && userOptions.success(data, null, jqXHR);
                }
            } else { //no data sent to back
                $dfd && $dfd.resolve(jqXHR);
                userOptions.success && userOptions.success(jqXHR);
            }
        },

        blockUI: function (options) {
            if (options.blockUI) {
                if (options.blockUI === true) { //block whole page
                    abp.ui.setBusy();
                } else { //block an element
                    abp.ui.setBusy(options.blockUI);
                }
            }
        },

        unblockUI: function (options) {
            if (options.blockUI) {
                if (options.blockUI === true) { //unblock whole page
                    abp.ui.clearBusy();
                } else { //unblock an element
                    abp.ui.clearBusy(options.blockUI);
                }
            }
        },

        ajaxSendHandler: function (event, request, settings) {
            var token = abp.security.antiForgery.getToken();
            if (!token) {
                return;
            }

            if (!settings.headers || settings.headers[abp.security.antiForgery.tokenHeaderName] === undefined) {
                request.setRequestHeader(abp.security.antiForgery.tokenHeaderName, token);
            }
        }
    });

    $(document).ajaxSend(function (event, request, settings) {
        return abp.ajax.ajaxSendHandler(event, request, settings);
    });

    /* JQUERY PLUGIN ENHANCEMENTS ********************************************/

    /* jQuery Form Plugin 
     * http://www.malsup.com/jquery/form/
     */

    // abpAjaxForm -> uses ajaxForm ------------------------------------------

    if ($.fn.ajaxForm) {
        $.fn.abpAjaxForm = function (userOptions) {
            userOptions = userOptions || {};

            var options = $.extend({}, $.fn.abpAjaxForm.defaults, userOptions);

            options.beforeSubmit = function () {
                abp.ajax.blockUI(options);
                userOptions.beforeSubmit && userOptions.beforeSubmit.apply(this, arguments);
            };

            options.success = function (data) {
                abp.ajax.handleResponse(data, userOptions);
            };

            //TODO: Error?

            options.complete = function () {
                abp.ajax.unblockUI(options);
                userOptions.complete && userOptions.complete.apply(this, arguments);
            };

            return this.ajaxForm(options);
        };

        $.fn.abpAjaxForm.defaults = {
            method: 'POST'
        };
    }

    abp.event.on('abp.dynamicScriptsInitialized', function () {
        abp.ajax.defaultError.message = "异常";
        abp.ajax.defaultError.details = "异常或错误数据会出现此提示";
        abp.ajax.defaultError401.message = "错误401";
        abp.ajax.defaultError401.details = "无对应访问权限";
        abp.ajax.defaultError403.message = "错误403";
        abp.ajax.defaultError403.details = "无对应访问权限";
        abp.ajax.defaultError404.message = "错误404";
        abp.ajax.defaultError404.details = "未找到相应页面或者方法";
    });

})(jQuery);
