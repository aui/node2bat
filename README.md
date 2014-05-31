# node2bat

##	简介

node2bat 是一个可以将 NodeJS 脚本编译为 Windows 批处理脚本的工具。编译后的批处理不再依赖 NodeJS，双击可直接运行。你可以使用 NodeJS 的 API 来编写 Windows 批处理脚本发布给其他人使用，而不需要安装 NodeJS 的环境。借助 js 强大的语法支持，你的批处理将异常强大。

##	原理

windows 中自带了 javascript 引擎支持 jscript，所以 node2bat 便是使用 jscript 封装了一层 nodejs 的 api，然后巧妙地将 js 包含在 bat 文件中。

##	安装

先安装 NodeJS，然后执行：

	npm install node2bat -g
	
##	使用

	node2bat <file>
	
``<file>`` 为 node 脚本，只支持 utf-8 编码

##	运行示例

源码 demo 目录是一个演示例子，其中 includeHTML.js 是基于 NodeJS 编写的自动化脚本，它的用途是给页面制作人员批量更新局部模板的。

这个脚本里面用到了 NodeJS 的文件与路径处理，我们可以编译 includeHTML.js 为 bat 文件，这样用户拿到我们的 bat 文件就可以直接双击运行了，无需安装 NodeJS 与学习命令行。

切换到源码目录，运行：

	node2bat demo/includeHTML/includeHTML.js

运行完毕后会立刻生成独立的 includeHTML.bat，你也可以双击打开它试用一下。

##	JS API

node2bat 支持 NodeJS API 的核心 API，并且支持大多数 ECMA5 的 API，这些足可以满足绝大多数任务。

###	全局变量

*	[__filename](http://nodejs.org/api/globals.html#globals_filename)
*	[__dirname](http://nodejs.org/api/globals.html#globals_dirname)
*	[require(id)](http://nodejs.org/api/globals.html#globals_require)``（注意：仅支持 node2bat 内置的系统模块或外部 json 文件）``	
*	process
	*	[process.argv](http://nodejs.org/api/process.html#process_process_argv)
	*	[process.env](http://nodejs.org/api/process.html#process_process_env)
	*	[process.exit([code])](http://nodejs.org/api/process.html#process_process_env)
	*	[process.cwd()](http://nodejs.org/api/process.html#process_process_cwd)
	*	[process.stdout.write(message)](http://nodejs.org/api/process.html#process_process_stdout)
	*	[process.stderr.write(message)](http://nodejs.org/api/process.html#process_process_stderr)
*	console
	*	[console.log([data], [...])](http://nodejs.org/api/console.html#console_console_log_data)
	*	[console.info([data], [...])](http://nodejs.org/api/console.html#console_console_info_data)
	*	[console.error([data], [...])](http://nodejs.org/api/console.html#console_console_error_data)
	*	[console.warn([data], [...])](http://nodejs.org/api/console.html#console_console_warn_data)
	*	[console.dir(obj)](http://nodejs.org/api/console.html#console_console_dir_obj)
	*	[console.time(label)](http://nodejs.org/api/console.html#console_console_time_label)
	*	[console.timeEnd(label)](http://nodejs.org/api/console.html#console_console_timeend_label)
	*	[console.assert(expression, [message])](http://nodejs.org/api/console.html#console_console_assert_expression_message)

###	内置模块

*   File System
    *   [fs.renameSync(oldPath, newPath)](http://nodejs.org/api/fs.html#fs_fs_renamesync_oldpath_newpath)
    *   [fs.statSync(path)](http://nodejs.org/api/fs.html#fs_fs_statsync_path)``只支 isFile()、isDirectory()、size、atime、mtime、ctime``
    *   [fs.unlinkSync(path)](http://nodejs.org/api/fs.html#fs_fs_unlinksync_path)
    *   [fs.rmdirSync(path)](http://nodejs.org/api/fs.html#fs_fs_rmdirsync_path)
    *   [fs.mkdirSync(path, [mode])](http://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_mode)
    *   [fs.readFileSync(filename, [options])](http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_options)
    *   [fs.writeFileSync(filename, data, [options])](http://nodejs.org/api/fs.html#fs_fs_writefilesync_filename_data_options)
    *   [fs.existsSync(path)](http://nodejs.org/api/fs.html#fs_fs_existssync_path)
*   Path
    *   [path.normalize(p)](http://nodejs.org/api/path.html#path_path_normalize_p)
    *   [path.join([path1], [path2], [...])](http://nodejs.org/api/path.html#path_path_join_path1_path2)
    *   [path.resolve([from ...], to)](http://nodejs.org/api/path.html#path_path_resolve_from_to)
    *   [path.relative(from, to)](http://nodejs.org/api/path.html#path_path_relative_from_to)
    *   [path.dirname(p)](http://nodejs.org/api/path.html#path_path_dirname_p)
    *   [path.basename(p, [ext])](http://nodejs.org/api/path.html#path_path_basename_p_ext)
    *   [path.extname(p)](http://nodejs.org/api/path.html#path_path_extname_p)
    *   [path.sep](http://nodejs.org/api/path.html#path_path_sep)
    *   [path.delimiter](http://nodejs.org/api/path.html#path_path_delimiter)
    
##	拖拽支持

如果拖拽文件到 bat 图标上运行，使用``process.argv.slice(2)`` 可以获取这些文件的列表。
    
##	测试用例

	node2bat test/test.js
	start test/test.bat
    
##	更新日志

v0.0.3

*	修复``fs.writeFileSync()``写入``utf-8``文件会插入 bom 的问题
*	修复``this``指向为``global``对象的问题
*	``require()``方法支持载入 json 文件
*	``fs.statSync()``支持``size``、``atime``、``mtime``、``ctime``
*	``require(id)``支持读取外部 json 文件
*	完善``console``模块
*	完善``process.env``模块，完全与 NodeJS 保持一致
*	鉴于使用场景为批处理，所以取消异步方法的支持
*	提供测试用例

v0.0.2

*	修正``process.argv``的 BUG
*	``console.log``方法可以友好的显示``Object``数据结构

v0.0.1

*	支持 NodeJS 文件与路径操作等基础 API

## License

MIT

