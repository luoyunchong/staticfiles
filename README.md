## libs、开发者日志


### 2018-9-14修改内容

1、formSerialize 新增radiobox表单数据获取，新增上传控件表单直接获取，无需再调用 GetFilesAddress方法

###  2018-9-20
 1. 生成新的tag 并推送到服务器上

* 生成一个0.0.6版本的标签

    git tag 0.0.6

* 将0.0.6标签提交到git服务器
     git push origin 0.0.6

* 将本地所有标签一次性提交到git服务器

    git push origin -–tags

### 2018-9-24
1. 修改com.edit回调参数，新增一个node参数


### 2018-9-28
1.  新增接口com.prompt
后台应新增代码 
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

4. 新增 this.deleteallrows()方法 用于编辑行中删除多行数据