#!/usr/bin/env node

console.log('[HTML局部模板更新工具]');
console.log('@version: 0.0.1')
console.log('会自动更新如下注释格式标记局部模板：\n')
console.log('<!--[include \'./public/header.html\']-->\n    ...\n<!--[/include]-->\n');
console.log('------------------------------');

var fs = require('fs');
var path = require('path');

var charset = 'utf-8'; // 设置模板的编码
var EXTNAME_RE = /\.(html|htm|tpl)$/i;
var INCLUDE_RE = /([\s\t]*)<!--\s*\[include\s*['"]*(.*?)['"]*\]\s*-->([\w\W]*?)<!--\s*\[\/include\]\s*-->/ig;
var args = process.argv.slice(2);

var compile = function (file) {
	var html = fs.readFileSync(file, charset);
	
	console.log(file);
	
	html = html.replace(INCLUDE_RE, function ($1, blank, id, innerHTML) {

		var newid = id.split('/').join(path.sep);
		
		var dirname = path.dirname(file);
		var target = path.resolve(dirname, id.split('/').join(path.sep));

		
		if (fs.existsSync(target)) {
			innerHTML = fs.readFileSync(target, charset);
		} else {
			console.log('Page not found: ' + target);
		}
		
		return blank
		+ "<!--[include '" + id.split('\\').join('/') + "']-->\n"
		+ innerHTML
		+ blank +  "<!--[/include]-->";
	});
	
	fs.writeFileSync(file, html, charset);
};


var walk = function (dir) {
	var dirList = fs.readdirSync(dir);

	dirList.forEach(function (item) {
		var target = path.join(dir, item);
		
		if (fs.statSync(target).isDirectory()) {
			walk(target);
		} else if (EXTNAME_RE.test(target)) {
			compile(target);
		}
	});
};

if (args.length) {
	args.forEach(function (target) {
		if (!fs.existsSync(target)) {
			return;
		}
		
		if (fs.statSync(target).isDirectory()) {
			walk(target);
		} else if (EXTNAME_RE.test(target)) {
			compile(target);
		}
	});
} else {
	walk('.\\');
}

console.log('------------------------------');
console.log('End');