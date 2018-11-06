# 开发者日志

### 2018-9-14修改内容
1、formSerialize 新增radiobox表单数据获取，新增上传控件表单直接获取，无需再调用 GetFilesAddress方法
### 2018-9-24
1. 修改com.edit回调参数，新增一个node参数

### 2018-9-28
1.  新增接口com.prompt

2. 新增 this.deleteallrows()方法 用于编辑行中删除多行数据

### 2018-9-29
 
1. webuploader 新增秒传功能，来实现文件的去重操作，后台上传后的目录调整，调整成登录名/年/月/文件名

### 2018-9-30

1. 解决webuploader秒传bug，多个控件加载时，md5验证多次问题

### 2018-10-12

1. 解决IE下地址中有中文问题encodeURIComponent编码一下，即可解决
