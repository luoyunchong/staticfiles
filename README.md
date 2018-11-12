## libs、开发者日志

### 生成新的tag 并推送到服务器上

1. 生成一个0.0.6版本的标签

```
git tag 0.0.6
```

2. 将0.0.6标签提交到git服务器

```
git push origin 0.0.6
```

3. 将本地所有标签一次性提交到git服务器

```
git push origin -–tags
```


### 文档生成
* jsdoc 文档地址：[http://www.css88.com/doc/jsdoc/](http://www.css88.com/doc/jsdoc/)
* 官方文档　[http://usejsdoc.org/](http://usejsdoc.org/)

1.  JSDoc安装
~~~
 npm install -g jsdoc
~~~

2.  安装 Docstrap
~~~
npm i ink-docstrap
~~~

3. 生成项目 API 文档：
~~~~
jsdoc -c .\configs\jsdoc.conf.json
~~~~


### docsify 文档生成

* 相关博客 [https://segmentfault.com/a/1190000007656679?_ea=1416350](https://segmentfault.com/a/1190000007656679?_ea=1416350)
* [使用 JSDoc 与 docstrap 生成 JavaScript 项目 API 文档](https://lzw.me/a/jsdoc-docstrap-api.html)
* 文档地址[https://docsify.js.org/#/zh-cn/quickstart](https://docsify.js.org/#/zh-cn/quickstart)

### 开发者文档
* 其他说明 [https://luoyunchong.github.io/staticfiles/docsify#/](https://luoyunchong.github.io/staticfiles/docsify#/)
* 文档API [https://luoyunchong.github.io/staticfiles/](https://luoyunchong.github.io/staticfiles/)

