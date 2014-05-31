#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var extnames = ['.html', '.htm'];
var args = process.argv.slice(2);
var base = '.' + path.sep;

var charset = 'utf-8';
var INCLUDE_RE = /([\u0009\u000B\u000C\u0020\u00A0\u1680\u180E\u2000-\u200A\u200B\u2028\u2029\u202F\u205F\u3000]*?)<!--\s*\[include\s*['"]*(.*?)['"]*\]\s*-->([\w\W]*?)<!--\s*\[\/include\]\s*-->/ig;
var TEMPLATE = '{{blank}}<!--[include "{{id}}"]-->\n{{content}}\n{{blank}}<!--[/include]-->';
var TEMPLATE_RE = /\{\{(.*?)\}\}/g;


var compile = function (base, file) {
	var html = fs.readFileSync(file, charset);
	var count = 0;
	var stdout = file.replace(base + path.sep, '');

	html = html.replace(INCLUDE_RE, function ($1, blank, id, content) {

		var dirname = path.dirname(file);
		var target = path.resolve(dirname, id.split('/').join(path.sep));
		var fileContent = '';

		if (fs.existsSync(target)) {
			fileContent = fs.readFileSync(target, charset);
			if (content.trim() === fileContent.trim()) {
				return $1;
			}
		} else {
			throw new Error('File not found: ' + target);
		}

		count ++;
		return template(TEMPLATE, {
			id: id,
			blank: blank,
			content: fileContent
		});
	});
	
	
	if (count) {

		stdout += ' [ok]'
		fs.writeFileSync(file, html, charset);
	}
	
	console.log(stdout);
};


var template = function (string, data) {
	return string.replace(TEMPLATE_RE, function ($1, $2) {
		return data[$2] || '';
	});
};


var walk = function (dir) {
	var dirList = fs.readdirSync(dir);

	dirList.forEach(function (item) {
		var target = path.join(dir, item);
		
		if (fs.statSync(target).isDirectory()) {
			walk(target);
		} else if (extnames.indexOf(path.extname(target)) === 0) {
			compile(base, target);
		}
	});
};


if (args[0]) {
	base = path.resolve(args[0]);
}


if (fs.statSync(base).isDirectory()) {
	walk(base);
} else if (extnames.indexOf(path.extname(base)) === 0) {
	var file = base;
	base = path.dirname(base);
	compile(base, file);
}
