var fs = require('fs');
var path = require('path');
var assert = require('assert');

var index = 0;
var log = function (label, message) {
	console.log("> " + label);
	console.log(message);
}

var label = function (label) {
	index ++;
	console.log("[" + index + "] " + label + '');
};


if (typeof WScript === 'object') {
	console.log('node2bat 支持核心的 NodeJS API，并且支持 ECMA5 新增加的 JS 方法');
	console.log('\n');
	console.log('global');
	console.log('    ' + Object.keys(global).join(', '));
	console.log('process');
	console.log('    ' + Object.keys(global.process).join(', '));
	console.log('console');
	console.log('    ' + Object.keys(global.console).join(', '));
	console.log("require('fs')");
	console.log('    ' + Object.keys(require('fs')).join(', '));
	console.log("require('path')");
	console.log('    ' + Object.keys(require('path')).join(', '));
	console.log("require('util')");
	console.log('    ' + Object.keys(require('util')).join(', '));

	console.log('\n');
	console.log('NodeJS API: http://nodejs.org/api/index.html');
	console.log('----------------------------------------------------');
	console.log('\n');
}

label('当前运行的文件名');
log("__filename", __filename);

label('进程当前工作目录');
log("__dirname", __dirname);

label('进程');
log("process", process);

label('进程当前工作目录');
log("process.cwd()", process.cwd());

label('向终端打印信息');
log("process.stdout.write('hello world')", '');
process.stdout.write('hello world');

label('读取外部 json');
log("require('../package.json').name", require('../package.json').name);

try {
	fs.mkdirSync('./temp');
} catch(e) {}

try {
	fs.mkdirSync('./temp/folder');
} catch(e) {}


label('删除已有的文件夹');
log("fs.rmdirSync('./temp/folder')", fs.rmdirSync('./temp/folder'));

label('创建文件夹')
log("fs.mkdirSync('./temp/folder')", fs.mkdirSync('./temp/folder'));

// 创建文件夹（目标已经存在）
assert.throws(function () {
	return fs.mkdirSync('./temp/folder');
});

label('重命名文件夹');
log("fs.renameSync('./temp/folder', './temp/folder_2')", fs.renameSync('./temp/folder', './temp/folder_2'));

label('删除已有的文件夹');
log("fs.rmdirSync('./temp/folder_2')", fs.rmdirSync('./temp/folder_2'));

// 重命名文件夹（源文件夹不存在）
assert.throws(function () {
	return fs.renameSync('./temp/folder', './temp/folder_2');
});

label('创建 utf-8 的文本（无 BOM）');
log("fs.writeFileSync('./temp/file.txt', '糖饼', 'utf-8')", fs.writeFileSync('./temp/file.txt', '糖饼', 'utf-8'));

label('读取 utf-8 的文本');
log("fs.readFileSync('./temp/file.txt', 'utf-8')", fs.readFileSync('./temp/file.txt', 'utf-8'));

label('写入 ascii 的文本');
log("fs.writeFileSync('./temp/file.txt', 'hello world', 'ascii')", fs.writeFileSync('./temp/file.txt', 'hello world', 'ascii'));

label('读取 ascii 的文本');
log("fs.readFileSync('./temp/file.txt', 'ascii')", fs.readFileSync('./temp/file.txt', 'ascii'));

label('判断文件或目录是否存在');
log("fs.existsSync('./temp/file.txt')", fs.existsSync('./temp/file.txt'));

label('判断文件或目录是否存在');
log("fs.existsSync('./temp/folder')", fs.existsSync('./temp/folder'));

label('判断文件或目录是否存在');
log("fs.existsSync('./temp/777')", fs.existsSync('./temp/777'));

label('读取目录信息');
log("fs.statSync('./temp')", fs.statSync('./temp'));

label('读取文件信息');
log("fs.statSync('./temp/file.txt')", fs.statSync('./temp/file.txt'));

label('判断目录');
log("fs.statSync('./temp').isDirectory()", fs.statSync('./temp').isDirectory());

label('判断文件');
log("fs.statSync('./temp').isFile()", fs.statSync('./temp').isFile());

// 判断不存在的目录或文件
assert.throws(function () {
	return fs.statSync('./temp_12345');
});

label('删除文件');
log("fs.unlinkSync('./temp/file.txt')", fs.unlinkSync('./temp/file.txt'));

// 读取不存在的 json 文件
assert.throws(function () {
	return require('../package_12345.json');
});

label('格式化路径');
log("path.normalize('/foo/bar//baz/asdf/quux/..')", path.normalize('/foo/bar//baz/asdf/quux/..'));

label('路径联合');
log("path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')", path.join('/foo', 'bar', 'baz/asdf', 'quux', '..'));

label('路径寻航');
log("path.resolve('/foo/bar', './baz')", path.resolve('/foo/bar', './baz'));
log("path.resolve('/foo/bar', '/tmp/file/')", path.resolve('/foo/bar', '/tmp/file/'));
log("path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')", path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif'));

label('相对路径');
log("path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')", path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb'));
log("path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')", path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb'));

label("文件夹名称");
log("path.dirname('/foo/bar/baz/asdf/quux')", path.dirname('/foo/bar/baz/asdf/quux'));

label("文件名称");
log("path.basename('/foo/bar/baz/asdf/quux.html')", path.basename('/foo/bar/baz/asdf/quux.html'));
log("path.basename('/foo/bar/baz/asdf/quux.html', '.html')", path.basename('/foo/bar/baz/asdf/quux.html', '.html'));

label("扩展名称");
log("path.extname('index.html')", path.extname('index.html'));
log("path.extname('index.coffee.md')", path.extname('index.coffee.md'));
log("path.extname('index.')", path.extname('index.'));
log("path.extname('index')", path.extname('index'));

label("路径分隔符");
log("'foo/bar/baz'.split(path.sep)", 'foo/bar/baz'.split(path.sep));
log("'foo\\bar\\baz'.split(path.sep)", 'foo\\bar\\baz'.split(path.sep));

label("路径界定符");
log("process.env.PATH.split(path.delimiter)", process.env.PATH.split(path.delimiter));



