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

### 2018-9-29
 
1. webuploader 新增秒传功能，来实现文件的去重操作，后台上传后的目录调整，调整成登录名/年/月/文件名

### 2018-10-9

1. 新增pdf显示，FileController新增方法
~~~
        public ActionResult PdfChartModal(string fileToken)
        {
            if (fileToken.IsNullOrEmpty())
            {
                throw new UserFriendlyException("文件token不能为空!");
            }
            ViewBag.FileToken = fileToken;
            return View();
        }
~~~

~~~
@{
    Layout = null;
    ViewBag.Title = "PdfChartModal";
}
<style>
    .pdfClass { border: 1px solid black; }
</style>
<script src="~/bower_components/weboffice/pdfjs/build/pdf.js"></script>
<script>
    (function() {
        PDFJS.cMapUrl = '/bower_components/weboffice/pdfjs/web/cmaps/';
        PDFJS.cMapPacked = true;
        var url = '/File/Download?fileToken=@ViewBag.FileToken';
        PDFJS.workerSrc = '/bower_components/weboffice/pdfjs/build/pdf.worker.js';
        var loadingTask = PDFJS.getDocument(url);
        $.messager.progress({
            title: '加载中...',
            text: '正在加载中，请稍等...'
        });
        loadingTask.promise.then(function (pdf) {

            console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function(page) {
                console.log('Page loaded');

                var scale = 1.5;
                var viewport = page.getViewport(scale);

                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById('the-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.then(function () {
                    console.log('Page rendered');
                    $.messager.progress('close');
                });
            });
        }, function (reason) {
            // PDF loading error
            console.error(reason);
            $.messager.progress('close');

        });
    })();
</script>
<div class="container-fluid text-center">
    <canvas id="the-canvas"></canvas>
</div>
~~~