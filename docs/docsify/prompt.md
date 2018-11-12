1. 后台应新增代码 
~~~
        /// <summary>
        ///  com.prompt(title,OnCallback)
        /// </summary>
        /// <returns></returns>
        public ActionResult PromptModal(string promptMessage)
        {
            ViewBag.PromptMessage = promptMessage;
            return View();
        }
~~~

2. Views/File/PromptModal代码 
~~~
@{
    Layout = null;
}
<div class="messager-body panel-body panel-body-noborder window-body" title="" id="" style="width: 280px; min-height: 47px; max-height: 9897px;">
    <form action="" method="post">
        <div class="messager-icon messager-question"></div>
        <div>@ViewBag.PromptMessage<input class="messager-input easyui-textbox" type="text" id="promptMessage" data-options="required:true" style="width: 200px;"></div>
        <div style="clear: both;"></div>
    </form>
</div>
~~~
3. 全局增加 css样式
~~~
.prompt-center .dialog-button { text-align: center; }
~~~