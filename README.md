## libs、开发者日志[]

### 生成新的tag 并推送到服务器上

1. 生成一个0.0.6版本的标签

```git tag 0.0.6```

2. 将0.0.6标签提交到git服务器

```git push origin 0.0.6```

3. 将本地所有标签一次性提交到git服务器

```git push origin -–tags```


> 文档生成
* jsdoc
~~~
npm install -g jsdoc
~~~
