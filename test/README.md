#	HTML重构稿局部模板更新工具

![banner](./banner.jpg)

##	工具介绍

css 有 import 语句可以引入外部的 css 文件，重构的同学很容易基于它实现公用样式的复用，但是 HTML 就没有这么幸运了，唯一能利用的似乎只有 iframe 标签，但是它因为它不受页面样式控制，几乎不可用来嵌入公用模板。要是HTML也能支持 include 语句那是多么幸福的事情啊！于是便有了这个小工具的诞生，使用它可以让重构页面支持类似 include 语句，方便批量更新公用模板，如头部与底部。

##	快速入门

###	include 语句

编写页面的时候，在需要动态更新的地方使用特殊注释包裹即可，例如：

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
###	批量更新模板

双击打开 includeHTML.bat，它会替换 include 注释包裹的 HTML 为'./public/header.html'的内容。

>	Tips: 你可以将 includeHTML.bat 放置在页面 SVN 目录

##	运行演示例子

下载程序包后，test 目录有一些演示的页面，其中 test/public 目录中放了一些公用模板，你可以尝试修改这些模板，双击 includeHTML.bat 后所有调用公用模板页面将会更新。


##	常见问题

1.	如何支持非 utf-8 编码的模板？答：使用右键直接修改程序源码配置即可。
2.	如何指定单个文件处理，而不是处理整个目录？答：拖拽 HTML 文件到程序图标上松开即可。
3.	如在 Mac 上运行？答：安装 nodejs，然后使用 nodejs 运行 includeHTML.js 即可。
4.	已经有了很多服务端的模板技术，为何不采用？答：在腾讯，网页重构属于设计流程的一部分，重构稿件需要给设计师与产品经理体验，最后才交给开发，这时候最好使用静态页面。

>	特别感谢 css 女神 feihuangfu 为本工具代言！