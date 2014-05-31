'use strict';

var fs = require('fs');
var path = require('path');
var version = require('../package.json').version;

var runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf-8');

var toAnsi = function (code) {
	var unicode = [], ansi;
	for (var i = 0 ; i < code.length; i ++) {
		ansi = code.charCodeAt(i);
		if (ansi > 255) {
			unicode.push('\\u' + ansi.toString(16));
		} else {
			unicode.push(code.charAt(i));
		} 
	}
	return unicode.join('').trim();
};

var compile = function (code) {
	code = code.replace(/^\#\!.*/, '');
	code = toAnsi(code);
	return runtime
	.replace(/'<\:build_time>'/g, Date.now())
	.replace(/'<\:node_code>'/g, code)
	.replace(/'<\:compiler_version>'/g, version);
};

exports.compile = function (file) {
	var code = fs.readFileSync(file, 'utf-8');
	code = compile(code);
	
	var cmd = file.replace(/\.js$/, '.bat');
	fs.writeFileSync(cmd, code, 'utf-8');
	process.stdout.write('>>>' + cmd + '\n');
};


