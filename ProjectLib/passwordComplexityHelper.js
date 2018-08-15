var app = app || {};
(function () {
    app.PasswordComplexityHelper = function () {

        var setPasswordComplexityRules = function ($elementStr, setting) {
            //非法字符,安全的密码字符（包含字母数字，大于6位），最小长度（后台至少设计为大于等于6位）
            var validType = [
                'unNormal', 'password',
                $.string.format('length[{0},{1}]', setting.MinLength, setting.MaxLength)
            ];

            //条件为真时，则增加验证条件(包含小写字母，包含数字，包含标点，包含大写字母）
            setting.UseLowerCaseLetters && $.array.push(validType, 'useLowerCaseLetters');
            setting.UseNumbers && $.array.push(validType, 'useNumbers');
            setting.UsePunctuations && $.array.push(validType, 'usePunctuations');
            setting.UseUpperCaseLetters && $.array.push(validType, 'useUpperCaseLetters');


            var passwordOpts = {
                required: true,
                validType: validType,
                prompt: '请输入密码'
            };


            $($elementStr).passwordbox(passwordOpts);
            $.array.push(passwordOpts.validType, $.string.format("checkpwd['{0}']", $elementStr));
            passwordOpts.prompt = "请输入重复密码";
            $($.string.format('{0}Repeat', $elementStr)).passwordbox(passwordOpts);
        };

        return {
            setPasswordComplexityRules: setPasswordComplexityRules
        };
    };
})();