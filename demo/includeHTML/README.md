#	HTML 局部模板更新工具

##	工具介绍

includeHTML 是一个简单易用的 HTML 静态文件局部模板批量更新工具，它通过注释的方式给 HTML 添加类似服务端模板``include``标签的功能，可用来分离页面的头部与底部模板。

###	特性

1. 无需 js 支持不会破坏 SEO
2. 无需服务端环境运行
3. 页面可被反复更新
4. 语法与普通注释无异 
5. 绿色单文件，双击即可运行

本工具适用于 web 设计师或者 web 重构工程师。

##	include 语句

编写页面的时候，在需要动态更新的地方按固定格式写好注释即可，例如：

```
 <!--[include './public/header.html']-->
    <div id="header">
        <ul class="nav">
            <li><a href="./index.html">Home</a></li>
            <li><a href="./news.html">News</a></li>
            <li><a href="./about.html">about</a></li>
        </ul>
    </div>
 <!--[/include]-->
```

运行本工具后则会将内容替换为外部模板。
	
##	工具使用
	
将工具放在模板目录，双击 includeHTML.bat 即可。

如果将文件拖放到 includeHTML.bat 图标上打开，那么只会处理被拖拽的文件。
