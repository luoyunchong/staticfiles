
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
=======