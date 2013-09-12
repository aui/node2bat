# node2bat

##	简介

node2bat 是一个可以将 NodeJS 脚本编译为 Windows 批处理脚本的工具。编译后的批处理不再依赖 NodeJS，双击可直接运行。你可以使用 NodeJS 的 API 来编写一些轻量级的自动化 Windows 批处理脚本。

##	安装

先安装 NodeJS 与 npm，然后执行：

	$ npm install node2bat -g
	
##	使用

	$ node2bat <file>
	
``<file>`` 为 node 脚本，只支持 utf-8 编码

##	运行示例

源码 test 目录是一个演示例子，其中 includeHTML.js 是基于 NodeJS 编写的自动化脚本，它的用途是给页面制作人员批量更新局部模板的。我们可以编译 includeHTML.js，让其不再依赖 NodeJS。

切换到源码目录，运行：

	$ node2bat test/includeHTML.js

运行完毕后会立刻生成独立的 includeHTML.bat，双击即可运行，无需安装 NodeJS 与学习命令行。

##	js API

node2bat v0.0.1 支持的 js API 是 NodeJS API 的子集，包含基本的文件与路径操作：

###	全局变量

*	[require(id)](http://nodejs.org/api/globals.html#globals_require)``（注意：不支持外部模块）``
*	[process.argv](http://nodejs.org/api/process.html#process_process_argv)
*	[process.env](http://nodejs.org/api/process.html#process_process_env)
*	[process.exit([code])](http://nodejs.org/api/process.html#process_process_env)
*	[process.cwd()](http://nodejs.org/api/process.html#process_process_cwd)
*	[process.stdout.write(message)](http://nodejs.org/api/process.html#process_process_stdout)
*	[console.log(message)](http://nodejs.org/api/console.html#console_console_log_data)
*	[__filename](http://nodejs.org/api/globals.html#globals_filename)
*	[__dirname](http://nodejs.org/api/globals.html#globals_dirname)

>	注：使用 process.argv.slice(2) 可返回拖拽到批处理程序图标上后所有的文件列表

###	内置模块

*   File System
    *   [fs.rename(oldPath, newPath, callback)](http://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback)
    *   [fs.renameSync(oldPath, newPath)](http://nodejs.org/api/fs.html#fs_fs_renamesync_oldpath_newpath)
    *   [fs.stat(path, callback)](http://nodejs.org/api/fs.html#fs_fs_stat_path_callback)
    *   [fs.statSync(path)](http://nodejs.org/api/fs.html#fs_fs_statsync_path)
    *   [fs.unlink(path, callback)](http://nodejs.org/api/fs.html#fs_fs_unlink_path_callback)
    *   [fs.unlinkSync(path)](http://nodejs.org/api/fs.html#fs_fs_unlinksync_path)
    *   [fs.rmdir(path, callback)](http://nodejs.org/api/fs.html#fs_fs_rmdir_path_callback)
    *   [fs.rmdirSync(path)](http://nodejs.org/api/fs.html#fs_fs_rmdirsync_path)
    *   [fs.mkdir(path, [mode], callback)](http://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback)
    *   [fs.mkdirSync(path, [mode])](http://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_mode)
    *   [fs.readFile(filename, [options], callback)](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback)
    *   [fs.readFileSync(filename, [options])](http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_options)
    *   [fs.writeFile(filename, data, [options], callback)](http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback)
    *   [fs.writeFileSync(filename, data, [options])](http://nodejs.org/api/fs.html#fs_fs_writefilesync_filename_data_options)
    *   [fs.exists(path, callback)](http://nodejs.org/api/fs.html#fs_fs_exists_path_callback)
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

##	开源节流

正如您若见，这是一个奇葩的项目，欢迎你参与进来，移植更多的 NodeJS 特性在其中。

不要想象这有多么难，node2bat v0.0.1 作者从想法到实现不到 2 天的时间，涉及到 OS 层面的模块可能花费多点时间处理，其余类似 Path 等模块直接去复制 NodeJS 在 Github 上的源码即可。

关于它的目标场景：自动化工具快速定制化。NodeJS 很强大，但是毕竟需要安装运行时结合命令输出才能操作，对于不了解 NodeJS 的使用者来说上手成本有点高，因此封装打包成独立的批处理更有利于快速解决用户遇到的问题。


