# node2bat

##	简介

node2bat 是一个可以将 NodeJS 脚本编译为 Windows 批处理脚本的工具。编译后的 NodeJS 脚本后不再依赖 NodeJS 的环境与配置，你可以使用 NodeJS 的 API 来编写一些轻量级的自动化 Windows 批处理脚本。

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

运行完毕后会立刻生成 includeHTML.bat，这样使用者是需要双击即可运行。

##	js API

node2bat v0.0.1 支持的 js API 是 NodeJS API 的子集：

###	全局变量

*	[require(id)](http://nodejs.org/api/globals.html#globals_require)``（不支持外部模块）``
*	[process.argv](http://nodejs.org/api/process.html#process_process_argv)
*	[process.env](http://nodejs.org/api/process.html#process_process_env)
*	[process.exit([code])](http://nodejs.org/api/process.html#process_process_env)
*	[process.cwd()](http://nodejs.org/api/process.html#process_process_cwd)
*	[process.stdout.write(message)](http://nodejs.org/api/process.html#process_process_stdout)]
*	[console.log(message)](http://nodejs.org/api/console.html#console_console_log_data)
*	[__filename](http://nodejs.org/api/globals.html#globals_filename)
*	[__dirname](http://nodejs.org/api/globals.html#globals_dirname)

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

