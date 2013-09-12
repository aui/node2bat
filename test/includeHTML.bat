@if (0===0) @end/*!node2bat | https://github.com/aui/node2bat | sugarpie.tang@gmail.com
@echo off
title loading..
cd %~dp0
call CScript.EXE "%~dpnx0" //Nologo //e:jscript %*
title node
goto cmd
-------------------------------*/
(function () {

console.log('[HTML\u5c40\u90e8\u6a21\u677f\u66f4\u65b0\u5de5\u5177]');
console.log('@version: 0.0.1')
console.log('\u4f1a\u81ea\u52a8\u66f4\u65b0\u5982\u4e0b\u6ce8\u91ca\u683c\u5f0f\u6807\u8bb0\u5c40\u90e8\u6a21\u677f\uff1a\n')
console.log('<!--[include \'./public/header.html\']-->\n    ...\n<!--[/include]-->\n');
console.log('------------------------------');

var fs = require('fs');
var path = require('path');

var charset = 'utf-8'; // \u8bbe\u7f6e\u6a21\u677f\u7684\u7f16\u7801
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

})// NodeJS Basic API
(function (global, exports) {

global.global = global;

global.console = {
	log: function (message) {
		if (typeof message !== 'string') {
			message = this.__toSource(message);
		}
		
		WScript.Echo(message);
	},
	__toSource: (function () {
		var getType = function (obj) {
			var toString = Object.prototype.toString;
			return obj === null
			? "Null" : obj === undefined
			? "Undefined" : toString.call(obj).slice(8, -1);
		};

		return function toSource (obj) {
			var type = getType(obj);
			var string = '';
			var temp;

			switch (type) {
				case 'Object':

					temp = [];

					for (var name in obj) {
						temp.push(
							JSON.stringify(name) + ':' + toSource(obj[name])
						);
					}

					string =  '{' + temp.join(',') + '}';

					break;
				case 'Array':
					temp = [];
					var length = obj.length;

					while (length) {
						temp[--length] = toSource(obj[length]);
					}

					string = '[' + temp.join(',') + ']';

					break;
				case 'String':
					string = JSON.stringify(obj);
					break;
				case 'Undefined':
					string = 'undefined';
					break;
				case 'Boolean':
				case 'Number':
				case 'Null':
					string = obj + '';
					break;
				case 'Function':

					temp = obj
					.toString()
					.match(/^function\s*(\w+)\s*\(\)\s*\{\s*\[native\s*code\]\s*\}$/);

					if (temp) {
						string = temp[1];
					} else {
						string = obj + '';
					}

					break;
				// Namespace
				default:
					string = type;
			}

			return string;
		};
	})()
};

global.process = {

    argv: function () {
        var Arguments = WScript.Arguments;
        var length = Arguments.length;
        var argv = ['node'];
        
        if (length) {
            for (var i = 0; i < length; i ++) {
                argv.push(Arguments(i));
            }
        }
        
        return argv;
    }(),
	
	
    cwd: function () {
        return WScript
        .ScriptFullName
        .replace(WScript.ScriptName, '')
        .replace(/\\+$/, '');
    },
	
	
	env: (function () {
		var env = {};
		var wsh = new ActiveXObject("WScript.Shell"); 
		var user = wsh.Environment("User"); 
		var system = wsh.Environment("System");
		var list = [
			'ALLUSERSPROFILE',
			'APPDATA',
			'CommonProgramFiles',
			'COMPUTERNAME',
			'ComSpec',
			'configsetroot',
			'FP_NO_HOST_CHECK',
			'HOMEDRIVE',
			'HOMEPATH',
			'LOCALAPPDATA',
			'LOGONSERVER',
			'NUMBER_OF_PROCESSORS',
			'OS',
			'Path',
			'PATHEXT',
			'PROCESSOR_ARCHITECTURE',
			'PROCESSOR_IDENTIFIER',
			'PROCESSOR_LEVEL',
			'PROCESSOR_REVISION',
			'ProgramData',
			'ProgramFiles',
			'PROMPT',
			'PSModulePath',
			'PUBLIC',
			'SESSIONNAME',
			'SystemDrive',
			'SystemRoot',
			'TEMP',
			'TMP',
			'USERDOMAIN',
			'USERNAME',
			'USERPROFILE',
			'windir'
		];
		
		for (var name, info, i = 0; i < list.length; i ++) {
			name = list[i];
			info = user.Item(name);
			if (!info && info !== 0) {
				info = system.Item(name);
			}
			env[name] = info;
		}
		
		return env;
	})(),
	
	
    exit: function (code) {
        WScript.Quit(code);
    },
	
	
    stdout: {
        write: function (message) {
            WScript.Echo(message);
        }
    }
};

global.require = function (id) {
    if (!exports[id]) {
        throw new Error('Cannot find module \'' + id + '\'');
    }
    return exports[id];
};


global.__filename = WScript.ScriptFullName;

global.__dirname = global.process.cwd();


exports.fs = {};

(function (exports) {

	var fso = new ActiveXObject('Scripting.FileSystemObject');
	
	var fs = {

		renameSync: function (oldPath, newPath) {
			var statSync = fs.statSync(oldPath);
			var file = fso[statSync.isFile() ? 'GetFile' : 'GetFolder'](oldPath);
			file.Move(newPath); 
		},

		mkdirSync: function (path) {
			fso.CreateFolder(path);
		},

		rmdirSync: function (path) {
			fso.DeleteFolder(path, true);
		},

		unlinkSync: function (path) {
			fso.DeleteFile(path, true); 
		},

		existsSync: function (path) {
			var statSync = fs.statSync(path);
			return statSync.isFile() || statSync.isDirectory();
		},

		statSync: function (path) {
			return {
				isFile: function () {
					return fso.FileExists(path);
				},
				isDirectory: function () {
					return fso.FolderExists(path);
				}
			};
		},

		readdirSync: function (path) {

			var listall = function (path) {
			
				var fd = fso.GetFolder(path + '\\');
				var fe = new Enumerator(fd.files);
				var list = [];
				var item;
				
				while(!fe.atEnd()) {
					item = fe.item() + '';
					item = item.replace(/^.*\\([^\\]*)$/, '$1');
					list.push(item);
					fe.moveNext();
				}
				
				var folderList = new Enumerator(fd.SubFolders);
				for (; !folderList.atEnd(); folderList.moveNext()) {
					item = folderList.item() + '';
					item = item.replace(/^.*\\([^\\]*)$/, '$1');
					list.push(item);
				}
				
				return list;
			};

			return listall(path);
		},

		readFileSync: function (file, charset) {
			var stream = new ActiveXObject('adodb.stream');
			var fileContent;

			stream.type = charset ? 2 : 1;
			stream.mode = 3;
			stream.open();

			if (charset) {
				stream.charset = charset;
			}
			
			try {
				stream.loadFromFile(file);
			} catch (e) {
				throw e;
			}

			fileContent = new String(stream.readText());
			fileContent.charset = charset;
			stream.close();
			return fileContent.toString();
		},

		writeFileSync: function (file, data, charset) {
			var stream = new ActiveXObject('adodb.stream');
			
			stream.type = charset ? 2 : 1;

			if (charset) {
				stream.charset = charset;
			}
			
			try {
				stream.open();
				if (charset) {
					stream.writeText(data);
				} else {
					stream.write(data);
				}
				stream.saveToFile(file, 2);

				return true;
			} catch (e) {
				throw e;
			} finally {
				stream.close();
			}

			return true;
		}
	};
	
	for (var name in fs) {
		exports[name] = fs[name];
		if (/Sync$/.test(name)) {
			exports[name.replace(/Sync$/, '')] = (function (main) {
				return function () {
					var args = arguments;
					var error = null;
					var data = {};
					var callback = args[args.length - 1];
					if (typeof callback !== 'function') {
						callback = function () {};
					}
					
					try {
						main.apply(global, args);
					} catch (e) {
						error = e;
					}
					
					callback(error, data);
				};
			})(fs[name]);
		}
	}

})(exports.fs);

exports.path = {};

(function (exports) {

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
		var last = parts[i];
		if (last === '.') {
		  parts.splice(i, 1);
		} else if (last === '..') {
		  parts.splice(i, 1);
		  up++;
		} else if (up) {
		  parts.splice(i, 1);
		  up--;
		}
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
		for (; up--; up) {
		  parts.unshift('..');
		}
	  }

	  return parts;
	}
  // Regex to split a windows path into three parts: [*, device, slash,
  // tail] windows-only
  var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

  // Regex to split the tail part of the above into [*, dir, basename, ext]
  var splitTailRe =
      /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

  // Function to split a filename into [root, dir, basename, ext]
  // windows version
  var splitPath = function(filename) {
    // Separate device+slash from tail
    var result = splitDeviceRe.exec(filename),
        device = (result[1] || '') + (result[2] || ''),
        tail = result[3] || '';
    // Split the tail into dir, basename and extension
    var result2 = splitTailRe.exec(tail),
        dir = result2[1],
        basename = result2[2],
        ext = result2[3];
    return [device, dir, basename, ext];
  };

  var normalizeUNCRoot = function(device) {
    return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
  };

  // path.resolve([from ...], to)
  // windows version
  exports.resolve = function() {
    var resolvedDevice = '',
        resolvedTail = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1; i--) {
      var path;
      if (i >= 0) {
        path = arguments[i];
      } else if (!resolvedDevice) {
        path = process.cwd();
      } else {
        // Windows has the concept of drive-specific current working
        // directories. If we've resolved a drive letter but not yet an
        // absolute path, get cwd for that drive. We're sure the device is not
        // an unc path at this points, because unc paths are always absolute.
        path = process.env['=' + resolvedDevice];
        // Verify that a drive-local cwd was found and that it actually points
        // to our drive. If not, default to the drive's root.
        if (!path || path.substr(0, 3).toLowerCase() !==
            resolvedDevice.toLowerCase() + '\\') {
          path = resolvedDevice + '\\';
        }
      }

      // Skip empty and invalid entries
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      var result = splitDeviceRe.exec(path),
          device = result[1] || '',
          isUnc = device && device.charAt(1) !== ':',
          isAbsolute = exports.isAbsolute(path),
          tail = result[3];

      if (device &&
          resolvedDevice &&
          device.toLowerCase() !== resolvedDevice.toLowerCase()) {
        // This path points to another device so it is not applicable
        continue;
      }

      if (!resolvedDevice) {
        resolvedDevice = device;
      }
      if (!resolvedAbsolute) {
        resolvedTail = tail + '\\' + resolvedTail;
        resolvedAbsolute = isAbsolute;
      }

      if (resolvedDevice && resolvedAbsolute) {
        break;
      }
    }

    // Convert slashes to backslashes when `resolvedDevice` points to an UNC
    // root. Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      resolvedDevice = normalizeUNCRoot(resolvedDevice);
    }

    // At this point the path should be resolved to a full absolute path,
    // but handle relative paths to be safe (might happen when process.cwd()
    // fails)

    // Normalize the tail path

    function f(p) {
      return !!p;
    }

    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f),
                                  !resolvedAbsolute).join('\\');

    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
           '.';
  };

  // windows version
  exports.normalize = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':',
        isAbsolute = exports.isAbsolute(path),
        tail = result[3],
        trailingSlash = /[\\\/]$/.test(tail);

    // If device is a drive letter, we'll normalize to lower case.
    if (device && device.charAt(1) === ':') {
      device = device[0].toLowerCase() + device.substr(1);
    }

    // Normalize the tail path
    tail = normalizeArray(tail.split(/[\\\/]+/).filter(function(p) {
      return !!p;
    }), !isAbsolute).join('\\');

    if (!tail && !isAbsolute) {
      tail = '.';
    }
    if (tail && trailingSlash) {
      tail += '\\';
    }

    // Convert slashes to backslashes when `device` points to an UNC root.
    // Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      device = normalizeUNCRoot(device);
    }

    return device + (isAbsolute ? '\\' : '') + tail;
  };

  // windows version
  exports.isAbsolute = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':';
    // UNC paths are always absolute
    return !!result[2] || isUnc;
  };

  // windows version
  exports.join = function() {
    function f(p) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }

    var paths = Array.prototype.filter.call(arguments, f);
    var joined = paths.join('\\');

    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for an UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at an UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as an UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\')
    if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
      joined = joined.replace(/^[\\\/]{2,}/, '\\');
    }

    return exports.normalize(joined);
  };

  // path.relative(from, to)
  // it will solve the relative path from 'from' to 'to', for instance:
  // from = 'C:\\orandea\\test\\aaa'
  // to = 'C:\\orandea\\impl\\bbb'
  // The output of the function should be: '..\\..\\impl\\bbb'
  // windows version
  exports.relative = function(from, to) {
    from = exports.resolve(from);
    to = exports.resolve(to);

    // windows is not case sensitive
    var lowerFrom = from.toLowerCase();
    var lowerTo = to.toLowerCase();

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var toParts = trim(to.split('\\'));

    var lowerFromParts = trim(lowerFrom.split('\\'));
    var lowerToParts = trim(lowerTo.split('\\'));

    var length = Math.min(lowerFromParts.length, lowerToParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (lowerFromParts[i] !== lowerToParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    if (samePartsLength == 0) {
      return to;
    }

    var outputParts = [];
    for (var i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('\\');
  };

  exports.sep = '\\';
  exports.delimiter = ';';

  exports.dirname = function(path) {
      var result = splitPath(path),
          root = result[0],
          dir = result[1];

      if (!root && !dir) {
        // No dirname whatsoever
        return '.';
      }

      if (dir) {
        // It has a dirname, strip trailing slash
        dir = dir.substr(0, dir.length - 1);
      }

      return root + dir;
  };


  exports.basename = function(path, ext) {
      var f = splitPath(path)[2];
      // TODO: make this comparison case-insensitive on windows?
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
  };


  exports.extname = function(path) {
      return splitPath(path)[3];
  };


})(exports.path);


(function() {

  // es5-safe
  // ----------------
  // Provides compatibility shims so that legacy JavaScript engines behave as
  // closely as possible to ES5.
  //
  // Thanks to:
  //  - http://es5.github.com/
  //  - http://kangax.github.com/es5-compat-table/
  //  - https://github.com/kriskowal/es5-shim
  //  - http://perfectionkills.com/extending-built-in-native-objects-evil-or-not/
  //  - https://gist.github.com/1120592
  //  - https://code.google.com/p/v8/


  var OP = Object.prototype;
  var AP = Array.prototype;
  var FP = Function.prototype;
  var SP = String.prototype;
  var hasOwnProperty = OP.hasOwnProperty;
  var slice = AP.slice;


  /*---------------------------------------*
   * Function
   *---------------------------------------*/

  // ES-5 15.3.4.5
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
  FP.bind || (FP.bind = function(that) {
    var target = this;

    // If IsCallable(func) is false, throw a TypeError exception.
    if (typeof target !== 'function') {
      throw new TypeError('Bind must be called on a function');
    }

    var boundArgs = slice.call(arguments, 1);

    function bound() {
      // Called as a constructor.
      if (this instanceof bound) {
        var self = createObject(target.prototype);
        var result = target.apply(
            self,
            boundArgs.concat(slice.call(arguments))
        );
        return Object(result) === result ? result : self;
      }
      // Called as a function.
      else {
        return target.apply(
            that,
            boundArgs.concat(slice.call(arguments))
        );
      }
    }

    // NOTICE: The function.length is not writable.
    //bound.length = Math.max(target.length - boundArgs.length, 0);

    return bound;
  });


  // Helpers
  function createObject(proto) {
    var o;

    if (Object.create) {
      o = Object.create(proto);
    }
    else {
      /** @constructor */
      function F() {
      }

      F.prototype = proto;
      o = new F();
    }

    return o;
  }


  /*---------------------------------------*
   * Object
   *---------------------------------------*/
  // http://ejohn.org/blog/ecmascript-5-objects-and-properties/

  // ES5 15.2.3.14
  // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  // https://developer.mozilla.org/en/ECMAScript_DontEnum_attribute
  // http://msdn.microsoft.com/en-us/library/adebfyya(v=vs.94).aspx
  Object.keys || (Object.keys = (function() {
    var hasDontEnumBug = !{toString: ''}.propertyIsEnumerable('toString');
    var DontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var DontEnumsLength = DontEnums.length;

    return function(o) {
      if (o !== Object(o)) {
        throw new TypeError(o + ' is not an object');
      }

      var result = [];

      for (var name in o) {
        if (hasOwnProperty.call(o, name)) {
          result.push(name);
        }
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < DontEnumsLength; i++) {
          if (hasOwnProperty.call(o, DontEnums[i])) {
            result.push(DontEnums[i]);
          }
        }
      }

      return result;
    };

  })());


  /*---------------------------------------*
   * Array
   *---------------------------------------*/
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
  // https://github.com/kangax/fabric.js/blob/gh-pages/src/util/lang_array.js

  // ES5 15.4.3.2
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
  Array.isArray || (Array.isArray = function(obj) {
    return OP.toString.call(obj) === '[object Array]';
  });


  // ES5 15.4.4.18
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
  AP.forEach || (AP.forEach = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        fn.call(context, this[i], i, this);
      }
    }
  });


  // ES5 15.4.4.19
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
  AP.map || (AP.map = function(fn, context) {
    var len = this.length >>> 0;
    var result = new Array(len);

    for (var i = 0; i < len; i++) {
      if (i in this) {
        result[i] = fn.call(context, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.20
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
  AP.filter || (AP.filter = function(fn, context) {
    var result = [], val;

    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        val = this[i]; // in case fn mutates this
        if (fn.call(context, val, i, this)) {
          result.push(val);
        }
      }
    }

    return result;
  });


  // ES5 15.4.4.16
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/every
  AP.every || (AP.every = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && !fn.call(context, this[i], i, this)) {
        return false;
      }
    }
    return true;
  });


  // ES5 15.4.4.17
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/some
  AP.some || (AP.some = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this && fn.call(context, this[i], i, this)) {
        return true;
      }
    }
    return false;
  });


  // ES5 15.4.4.21
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
  AP.reduce || (AP.reduce = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = 0, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i++];
          break;
        }
        // if array contains no values, no initial value to return
        if (++i >= len) {
          throw new TypeError('reduce of empty array with on initial value');
        }
      }
      while (true);
    }

    for (; i < len; i++) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.22
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
  AP.reduceRight || (AP.reduceRight = function(fn /*, initial*/) {
    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not an function');
    }

    var len = this.length >>> 0, i = len - 1, result;

    if (arguments.length > 1) {
      result = arguments[1];
    }
    else {
      do {
        if (i in this) {
          result = this[i--];
          break;
        }
        // if array contains no values, no initial value to return
        if (--i < 0)
          throw new TypeError('reduce of empty array with on initial value');
      }
      while (true);
    }

    for (; i >= 0; i--) {
      if (i in this) {
        result = fn.call(null, result, this[i], i, this);
      }
    }

    return result;
  });


  // ES5 15.4.4.14
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.indexOf || (AP.indexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || 0;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from = Math.max(from + len, 0);
    }

    for (; from < len; from++) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  // ES5 15.4.4.15
  // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf
  AP.lastIndexOf || (AP.lastIndexOf = function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || len - 1;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);
    if (from < 0) {
      from += len;
    }
    from = Math.min(from, len - 1);

    for (; from >= 0; from--) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  });


  /*---------------------------------------*
   * String
   *---------------------------------------*/

  // ES5 15.5.4.20
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/trim
  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
  // http://jsperf.com/mega-trim-test
  SP.trim || (SP.trim = (function() {

    // http://perfectionkills.com/whitespace-deviations/
    var whiteSpaces = [

      '\\s',
      //'0009', // 'HORIZONTAL TAB'
      //'000A', // 'LINE FEED OR NEW LINE'
      //'000B', // 'VERTICAL TAB'
      //'000C', // 'FORM FEED'
      //'000D', // 'CARRIAGE RETURN'
      //'0020', // 'SPACE'

      '00A0', // 'NO-BREAK SPACE'
      '1680', // 'OGHAM SPACE MARK'
      '180E', // 'MONGOLIAN VOWEL SEPARATOR'

      '2000-\\u200A',
      //'2000', // 'EN QUAD'
      //'2001', // 'EM QUAD'
      //'2002', // 'EN SPACE'
      //'2003', // 'EM SPACE'
      //'2004', // 'THREE-PER-EM SPACE'
      //'2005', // 'FOUR-PER-EM SPACE'
      //'2006', // 'SIX-PER-EM SPACE'
      //'2007', // 'FIGURE SPACE'
      //'2008', // 'PUNCTUATION SPACE'
      //'2009', // 'THIN SPACE'
      //'200A', // 'HAIR SPACE'

      '200B', // 'ZERO WIDTH SPACE (category Cf)
      '2028', // 'LINE SEPARATOR'
      '2029', // 'PARAGRAPH SEPARATOR'
      '202F', // 'NARROW NO-BREAK SPACE'
      '205F', // 'MEDIUM MATHEMATICAL SPACE'
      '3000' //  'IDEOGRAPHIC SPACE'

    ].join('\\u');

    var trimLeftReg = new RegExp('^[' + whiteSpaces + ']+');
    var trimRightReg = new RegExp('[' + whiteSpaces + ']+$');

    return function() {
      return String(this).replace(trimLeftReg, '').replace(trimRightReg, '');
    }

  })());


  /*---------------------------------------*
   * Date
   *---------------------------------------*/

  // ES5 15.9.4.4
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
  Date.now || (Date.now = function() {
    return +new Date;
  });

})();

/*
    json2.js
    2013-05-26

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
*/


if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            return String(value);


        case 'object':


            if (!value) {
                return 'null';
            }


            gap += indent;
            partial = [];


            if (Object.prototype.toString.apply(value) === '[object Array]') {


                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }


                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }


            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            var i;
            gap = '';
            indent = '';


            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }


            } else if (typeof space === 'string') {
                indent = space;
            }


            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            return str('', {'': value});
        };
    }

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            var j;

            function walk(holder, key) {

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                j = eval('(' + text + ')');

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

            throw new SyntaxError('JSON.parse');
        };
    }
}());

}(this, {}));
/*-------------------------------
:cmd
::if %errorlevel% == 0 exit
pause>nul
*/