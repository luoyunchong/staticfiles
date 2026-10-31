**English** | [简体中文](README.md)

## Libraries and developer notes

### Create a tag and push it to the server

1. Create a tag for version 0.0.6:

```
git tag 0.0.6
```

2. Push the 0.0.6 tag to the Git server:

```
git push origin 0.0.6
```

3. Push all local tags to the Git server at once:

```
git push origin --tags
```

### Generate documentation

- [JSDoc documentation](http://www.css88.com/doc/jsdoc/)
- [Official documentation](http://usejsdoc.org/)

1. Install JSDoc:

```
npm install -g jsdoc
```

2. Install Docstrap:

```
npm i ink-docstrap
```

3. Generate the project's API documentation:

```
jsdoc -c .\configs\jsdoc.conf.json
```

### Generate docsify documentation

- [Related blog post](https://segmentfault.com/a/1190000007656679?_ea=1416350)
- [Generate JavaScript API documentation using JSDoc and Docstrap](https://lzw.me/a/jsdoc-docstrap-api.html)
- [docsify documentation](https://docsify.js.org/#/zh-cn/quickstart)

### Developer documentation

- [Additional notes](https://luoyunchong.github.io/staticfiles/docsify/#/)
- [API documentation](https://luoyunchong.github.io/staticfiles/)

- [English project guides](./docs/docsify/README.en.md)
