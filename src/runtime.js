@if (0===0) @end/*
@echo off
title node
cd %~dp0
call CScript.EXE "%~dpnx0" //Nologo //e:jscript %*
goto cmd
-------------------------------------------------------
Build       '<:build_time>'
Compiler    node2bat.js@'<:compiler_version>' | https://github.com/aui/node2bat
-------------------------------------------------------
*/(function () {

try {
'<:node_code>'
} catch (e) {
    console.error(e);
    WScript.Quit(1);
}

}).call({
    node2bat: "'<:compiler_version>'"
}, function (global, exports) {
    // NodeJS Runtime
    global.global = global;


    global.__filename = WScript.ScriptFullName;

    global.__dirname = WScript
                .ScriptFullName
                .replace(WScript.ScriptName, '')
                .replace(/\\+$/, '');

    global.process = {

        title: 'node',

        argv: function () {
            var Arguments = WScript.Arguments;
            var length = Arguments.length;
            var argv = ['node', WScript.ScriptFullName];

            if (length) {
                for (var i = 0; i < length; i++) {
                    argv.push(Arguments(i));
                }
            }

            return argv;
        }(),


        cwd: function () {
            return global.__dirname;
        },

        // @see http://technet.microsoft.com/en-us/library/ee156595.aspx
        env: (function () {
            var wsh = new ActiveXObject("WScript.Shell");
            var processObject = wsh.Environment("Process");
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


            var Env = function () {
                for (var name, info, i = 0; i < list.length; i++) {
                    name = list[i];
                    info = processObject.Item(name);
                    info = wsh.ExpandEnvironmentStrings(info);
                    this[name] = info;
                    Env.prototype[name.toUpperCase()] = info;
                }
            };

            return new Env();
        })(),


        exit: function (code) {
            WScript.Quit(code);
        },


        stdout: {
            write: function (message) {
                WScript.StdOut.Write(message);
            }
        },

        stderr: {
            write: function (message) {
                WScript.StdOut.Write(message);
            }
        }
    };


    // CommonJS require()
    global.require = function require (id) {
        
        var path = require.resolve(id);
        var mod = require._modules[path];

        if (!mod) {
            if (/\.json$/i.test(id)) {
                var fs = require('fs');
                var text = fs.readFileSync(id, 'utf-8');
                var json = JSON.parse(text);
                return json;
            } else {
                throw new Error('failed to require "' + id + '"');
            } 
        }

        if (!mod.exports) {
            mod.exports = {};
            mod.call(mod.exports, require.relative(path), mod.exports, mod);
        }

        return mod.exports;
    }

    // fn: function (require, exports, module) {}
    function define (path, fn) {
        require._modules[path] = fn;
    };

    require._modules = {};

    require.resolve = function (path) {
        var orig = path,
            reg = path + '.js',
            index = path + '/index.js';
        return require._modules[reg] && reg || require._modules[index] && index || orig;
    };


    require.relative = function (parent) {
        return function (p) {
            if ('.' != p.substr(0, 1)) return require(p);

            var path = parent.split('/'),
                segs = p.split('/');
            path.pop();

            for (var i = 0; i < segs.length; i++) {
                var seg = segs[i];
                if ('..' == seg) path.pop();
                else if ('.' != seg) path.push(seg);
            }

            return require(path.join('/'));
        };
    };


    /*global.setTimeout = function (fn, time) {
        WScript.Sleep(time);
        if (typeof fn === 'function') {
            fn();
        } else {
            eval(fn);
        }
    };


    global.setInterval = function (fn, time) {
        var interval = function () {

            WScript.Sleep(time);

            if (typeof fn === 'function') {
                fn();
            } else {
                eval(fn);
            }

            interval();
        };

        interval();
    };*/


    define('util', function (require, exports, module) {
        // 2014-04-04 02:39:42
        var formatRegExp = /%[sdj%]/g;
        exports.format = function (f) {
            if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(inspect(arguments[i]));
                }
                return objects.join(' ');
            }

            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function (x) {
                if (x === '%%') return '%';
                if (i >= len) return x;
                switch (x) {
                case '%s':
                    return String(args[i++]);
                case '%d':
                    return Number(args[i++]);
                case '%j':
                    try {
                        return JSON.stringify(args[i++]);
                    } catch (_) {
                        return '[Circular]';
                    }
                default:
                    return x;
                }
            });
            for (var x = args[i]; i < len; x = args[++i]) {
                if (isNull(x) || !isObject(x)) {
                    str += ' ' + x;
                } else {
                    str += ' ' + inspect(x);
                }
            }
            return str;
        };


         // Mark that a method should not be used.
         // Returns a modified function which warns once by default.
         // If --no-deprecation is set, then it is a no-op.
        exports.deprecate = function (fn, msg) {
            // Allow for deprecating things in the process of starting up.
            if (isUndefined(global.process)) {
                return function () {
                    return exports.deprecate(fn, msg).apply(this, arguments);
                };
            }

            if (process.noDeprecation === true) {
                return fn;
            }

            var warned = false;

            function deprecated() {
                if (!warned) {
                    if (process.throwDeprecation) {
                        throw new Error(msg);
                    } else if (process.traceDeprecation) {
                        console.trace(msg);
                    } else {
                        console.error(msg);
                    }
                    warned = true;
                }
                return fn.apply(this, arguments);
            }

            return deprecated;
        };


        var debugs = {};
        var debugEnviron;
        exports.debuglog = function (set) {
            if (isUndefined(debugEnviron))
                debugEnviron = process.env.NODE_DEBUG || '';
            set = set.toUpperCase();
            if (!debugs[set]) {
                if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                    var pid = process.pid;
                    debugs[set] = function () {
                        var msg = exports.format.apply(exports, arguments);
                        console.error('%s %d: %s', set, pid, msg);
                    };
                } else {
                    debugs[set] = function () {};
                }
            }
            return debugs[set];
        };


        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
            // default options
            var ctx = {
                seen: [],
                stylize: stylizeNoColor
            };
            // legacy...
            if (arguments.length >= 3) ctx.depth = arguments[2];
            if (arguments.length >= 4) ctx.colors = arguments[3];
            if (isBoolean(opts)) {
                // legacy...
                ctx.showHidden = opts;
            } else if (opts) {
                // got an "options" object
                exports._extend(ctx, opts);
            }
            // set default options
            if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
            if (isUndefined(ctx.depth)) ctx.depth = 2;
            if (isUndefined(ctx.colors)) ctx.colors = false;
            if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
            if (ctx.colors) ctx.stylize = stylizeWithColor;
            return formatValue(ctx, obj, ctx.depth);
        }
        exports.inspect = inspect;


         // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
            'bold': [1, 22],
            'italic': [3, 23],
            'underline': [4, 24],
            'inverse': [7, 27],
            'white': [37, 39],
            'grey': [90, 39],
            'black': [30, 39],
            'blue': [34, 39],
            'cyan': [36, 39],
            'green': [32, 39],
            'magenta': [35, 39],
            'red': [31, 39],
            'yellow': [33, 39]
        };

         // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
            'special': 'cyan',
            'number': 'yellow',
            'boolean': 'yellow',
            'undefined': 'grey',
            'null': 'bold',
            'string': 'green',
            'date': 'magenta',
            // "name": intentionally not styling
            'regexp': 'red'
        };


        function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];

            if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                    '\u001b[' + inspect.colors[style][1] + 'm';
            } else {
                return str;
            }
        }


        function stylizeNoColor(str, styleType) {
            return str;
        }


        function arrayToHash(array) {
            var hash = {};

            array.forEach(function (val, idx) {
                hash[val] = true;
            });

            return hash;
        }


        function formatValue(ctx, value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (ctx.customInspect &&
                value &&
                isFunction(value.inspect) &&
                // Filter out the util module, it's inspect function is special
                value.inspect !== exports.inspect &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                var ret = value.inspect(recurseTimes, ctx);
                if (!isString(ret)) {
                    ret = formatValue(ctx, ret, recurseTimes);
                }
                return ret;
            }

            // Primitive types cannot have properties
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
                return primitive;
            }

            // Look up the keys of the object.
            var keys = Object.keys(value);
            var visibleKeys = arrayToHash(keys);

            if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
            }

            // This could be a boxed primitive (new String(), etc.), check valueOf()
            // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
            // a number which, when object has some additional user-stored `keys`,
            // will be printed out.
            var formatted;
            var raw = value;
            try {
                // the .valueOf() call can fail for a multitude of reasons
                if (!isDate(value))
                    raw = value.valueOf();
            } catch (e) {
                // ignore...
            }

            if (isString(raw)) {
                // for boxed Strings, we have to remove the 0-n indexed entries,
                // since they just noisey up the output and are redundant
                keys = keys.filter(function (key) {
                    return !(key >= 0 && key < raw.length);
                });
            }

            // Some type of object without properties can be shortcutted.
            if (keys.length === 0) {
                if (isFunction(value)) {
                    var name = value.name ? ': ' + value.name : '';
                    return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                    return ctx.stylize(Date.prototype.toString.call(value), 'date');
                }
                if (isError(value)) {
                    return formatError(value);
                }
                // now check the `raw` value to handle boxed primitives
                if (isString(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[String: ' + formatted + ']', 'string');
                }
                if (isNumber(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Number: ' + formatted + ']', 'number');
                }
                if (isBoolean(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
                }
            }

            var base = '',
                array = false,
                braces = ['{', '}'];

            // Make Array say that they are Array
            if (isArray(value)) {
                array = true;
                braces = ['[', ']'];
            }

            // Make functions say that they are functions
            if (isFunction(value)) {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
            }

            // Make RegExps say that they are RegExps
            if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
            }

            // Make error with message first say the error
            if (isError(value)) {
                base = ' ' + formatError(value);
            }

            // Make boxed primitive Strings look like such
            if (isString(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[String: ' + formatted + ']';
            }

            // Make boxed primitive Numbers look like such
            if (isNumber(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Number: ' + formatted + ']';
            }

            // Make boxed primitive Booleans look like such
            if (isBoolean(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Boolean: ' + formatted + ']';
            }

            if (keys.length === 0 && (!array || value.length === 0)) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                    return ctx.stylize('[Object]', 'special');
                }
            }

            ctx.seen.push(value);

            var output;
            if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
            } else {
                output = keys.map(function (key) {
                    return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
            }

            ctx.seen.pop();

            return reduceToSingleString(output, base, braces);
        }


        function formatPrimitive(ctx, value) {
            if (isUndefined(value))
                return ctx.stylize('undefined', 'undefined');
            if (isString(value)) {
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') + '\'';
                return ctx.stylize(simple, 'string');
            }
            if (isNumber(value)) {
                // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
                // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
                if (value === 0 && 1 / value < 0)
                    return ctx.stylize('-0', 'number');
                return ctx.stylize('' + value, 'number');
            }
            if (isBoolean(value))
                return ctx.stylize('' + value, 'boolean');
            // For some reason typeof null is "object", so special case here.
            if (isNull(value))
                return ctx.stylize('null', 'null');
        }


        function formatPrimitiveNoColor(ctx, value) {
            var stylize = ctx.stylize;
            ctx.stylize = stylizeNoColor;
            var str = formatPrimitive(ctx, value);
            ctx.stylize = stylize;
            return str;
        }


        function formatError(value) {
            return '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            for (var i = 0, l = value.length; i < l; ++i) {
                if (hasOwnProperty(value, String(i))) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        String(i), true));
                } else {
                    output.push('');
                }
            }
            keys.forEach(function (key) {
                if (!key.match(/^\d+$/)) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        key, true));
                }
            });
            return output;
        }


        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str, desc;
            desc = /*Object.getOwnPropertyDescriptor(value, key) ||*/ {
                value: value[key]
            };
            if (desc.get) {
                if (desc.set) {
                    str = ctx.stylize('[Getter/Setter]', 'special');
                } else {
                    str = ctx.stylize('[Getter]', 'special');
                }
            } else {
                if (desc.set) {
                    str = ctx.stylize('[Setter]', 'special');
                }
            }
            if (!hasOwnProperty(visibleKeys, key)) {
                name = '[' + key + ']';
            }
            if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                    if (isNull(recurseTimes)) {
                        str = formatValue(ctx, desc.value, null);
                    } else {
                        str = formatValue(ctx, desc.value, recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (array) {
                            str = str.split('\n').map(function (line) {
                                return '  ' + line;
                            }).join('\n').substr(2);
                        } else {
                            str = '\n' + str.split('\n').map(function (line) {
                                return '   ' + line;
                            }).join('\n');
                        }
                    }
                } else {
                    str = ctx.stylize('[Circular]', 'special');
                }
            }
            if (isUndefined(name)) {
                if (array && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                    name = ctx.stylize(name, 'name');
                } else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'")
                        .replace(/\\\\/g, '\\');
                    name = ctx.stylize(name, 'string');
                }
            }

            return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces) {
            var length = output.reduce(function (prev, cur) {
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
            }, 0);

            if (length > 60) {
                return braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];
            }

            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }


         // NOTE: These type checking functions intentionally don't use `instanceof`
         // because it is fragile and can be easily faked with `Object.create()`.
        var isArray = exports.isArray = Array.isArray;

        function isBoolean(arg) {
            return typeof arg === 'boolean';
        }
        exports.isBoolean = isBoolean;

        function isNull(arg) {
            return arg === null;
        }
        exports.isNull = isNull;

        function isNullOrUndefined(arg) {
            return arg == null;
        }
        exports.isNullOrUndefined = isNullOrUndefined;

        function isNumber(arg) {
            return typeof arg === 'number';
        }
        exports.isNumber = isNumber;

        function isString(arg) {
            return typeof arg === 'string';
        }
        exports.isString = isString;

        function isSymbol(arg) {
            return typeof arg === 'symbol';
        }
        exports.isSymbol = isSymbol;

        function isUndefined(arg) {
            return arg === void 0;
        }
        exports.isUndefined = isUndefined;

        function isRegExp(re) {
            return isObject(re) && objectToString(re) === '[object RegExp]';
        }
        exports.isRegExp = isRegExp;

        function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
        }
        exports.isObject = isObject;

        function isDate(d) {
            return isObject(d) && objectToString(d) === '[object Date]';
        }
        exports.isDate = isDate;

        function isError(e) {
            return isObject(e) &&
                (objectToString(e) === '[object Error]' || e instanceof Error);
        }
        exports.isError = isError;

        function isFunction(arg) {
            return typeof arg === 'function';
        }
        exports.isFunction = isFunction;

        function isPrimitive(arg) {
            return arg === null ||
                typeof arg === 'boolean' ||
                typeof arg === 'number' ||
                typeof arg === 'string' ||
                typeof arg === 'symbol' || // ES6 symbol
                typeof arg === 'undefined';
        }
        exports.isPrimitive = isPrimitive;

        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }


        function pad(n) {
            return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }


        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'
        ];

         // 26 Feb 16:19:34
        function timestamp() {
            var d = new Date();
            var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())
            ].join(':');
            return [d.getDate(), months[d.getMonth()], time].join(' ');
        }


         // log is just a thin wrapper to console.log that prepends a timestamp
        exports.log = function () {
            console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
        };


        exports._extend = function (origin, add) {
            // Don't do anything if add isn't an object
            if (!add || !isObject(add)) return origin;

            var keys = Object.keys(add);
            var i = keys.length;
            while (i--) {
                origin[keys[i]] = add[keys[i]];
            }
            return origin;
        };

        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }


        var uv;
        exports._errnoException = function (err, syscall, original) {
            if (isUndefined(uv)) uv = process.binding('uv');
            var errname = uv.errname(err);
            var message = syscall + ' ' + errname;
            if (original)
                message += ' ' + original;
            var e = new Error(message);
            e.code = errname;
            e.errno = errname;
            e.syscall = syscall;
            return e;
        };
    });


    define('console', function (require, exports, module) {
        // 2013-08-02 06:08:01 
        var util = require('util');

        function Console(stdout, stderr) {
            if (!(this instanceof Console)) {
                return new Console(stdout, stderr);
            }
            if (!stdout || !util.isFunction(stdout.write)) {
                throw new TypeError('Console expects a writable stream instance');
            }
            if (!stderr) {
                stderr = stdout;
            }

            this._stdout = stdout;
            this._stderr = stderr;
            this._times = {};

            // bind the prototype functions to this Console instance
            Object.keys(Console.prototype).forEach(function (k) {
                this[k] = this[k].bind(this);
            }, this);
        }

        Console.prototype.log = function () {
            this._stdout.write(util.format.apply(this, arguments) + '\n');
        };


        Console.prototype.info = Console.prototype.log;


        Console.prototype.warn = function () {
            this._stderr.write(util.format.apply(this, arguments) + '\n');
        };


        Console.prototype.error = Console.prototype.warn;


        Console.prototype.dir = function (object) {
            this._stdout.write(util.inspect(object, {
                customInspect: false
            }) + '\n');
        };


        Console.prototype.time = function (label) {
            this._times[label] = Date.now();
        };


        Console.prototype.timeEnd = function (label) {
            var time = this._times[label];
            if (!time) {
                throw new Error('No such label: ' + label);
            }
            var duration = Date.now() - time;
            this.log('%s: %dms', label, duration);
        };


        Console.prototype.assert = function (expression) {
            if (!expression) {
                var arr = Array.prototype.slice.call(arguments, 1);
                require('assert').ok(false, util.format.apply(this, arr));
            }
        };


        module.exports = new Console(process.stdout, process.stderr);
        module.exports.Console = Console;
    });


    define('fs', function (require, exports, module) {

        var fso = new ActiveXObject('Scripting.FileSystemObject');

        var Stat = function (path) {
            var info;
            this._path = path;

            if (this.isFile()) {
                info = fso.GetFile(path);
            } else if (this.isDirectory()) {
                info = fso.GetFolder(path);
            } else {
                throw new Error('ENOENT, no such file or directory ' + JSON.stringify(path));
            }

            this.size = info.Size; // TODO: 读取目录不准确
            this.atime = new Date(info.DateLastAccessed);
            this.mtime = new Date(info.DateLastModified);
            this.ctime = new Date(info.DateCreated);
        };

        Stat.prototype = {
            isFile: function () {
                return fso.FileExists(this._path);
            },
            isDirectory: function () {
                return fso.FolderExists(this._path);
            }
        };

        exports.renameSync = function (oldPath, newPath) {
            var statSync = exports.statSync(oldPath);
            var file = fso[statSync.isFile() ? 'GetFile' : 'GetFolder'](oldPath);
            if (exports.existsSync(newPath)) {
                exports.unlinkSync(newPath);
            }
            file.Move(newPath);
        };

        exports.mkdirSync = function (path) {
            // TODO: Error Info
            fso.CreateFolder(path);
        };

        exports.mkdirSync = function (path) {
            fso.CreateFolder(path);
        };

        exports.rmdirSync = function (path) {
            fso.DeleteFolder(path, true);
        };

        exports.unlinkSync = function (path) {
            fso.DeleteFile(path, true);
        };

        exports.existsSync = function (path) {
            try {
                var statSync = exports.statSync(path);
                return statSync.isFile() || statSync.isDirectory();
            } catch (e) {
                return false;
            }  
        };

        exports.statSync = function (path) {
            return new Stat(path);
        };

        exports.readdirSync = function (path) {

            var listall = function (path) {

                var fd = fso.GetFolder(path + '\\');
                var fe = new Enumerator(fd.files);
                var list = [];
                var item;

                while (!fe.atEnd()) {
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
        };

        exports.readFileSync = function (file, charset) {
            var stream = new ActiveXObject('adodb.stream');
            var fileContent;

            stream.Type = charset ? 2 : 1;
            stream.Open();

            if (charset) {
                stream.Charset = charset;
            } else {
                throw new TypeError('Bad arguments');
            }

            try {
                stream.LoadFromFile(file);
            } catch (e) {
                throw e;
            }

            fileContent = new String(stream.ReadText());
            fileContent.Charset = charset;
            stream.Close();

            return fileContent.toString();
        };

        // @see http://bathome.l3.wuyou.com/redirect.php?goto=findpost&ptid=10300&pid=66972
        // @see http://www.clockworksoftware.com/asp/Products/vbs2js.asp
        exports.writeFileSync = function (file, data, charset) {
            var binData;
            var stream = new ActiveXObject("adodb.Stream");

            stream.Open();

            try {
                
                if (charset) {


                    stream.Position = 0;
                    stream.CharSet = charset;
                    stream.WriteText(data);
                    stream.SetEOS();

                    stream.Position = 0;
                    stream.Type = 1;

                    // TODO: test BOM
                    // /^0xEF0xBB0xBF/
                    if (charset !== 'ascii') {
                        stream.Position = 3;
                    }
                    
                    binData = stream.Read(-1); 

                    stream.Position = 0;
                    stream.Write(binData);
                    stream.SetEOS();
                    

                    stream.SaveToFile(file, 2);
                } else {
                    
                    //stream.Type = 1;
                    //stream.Write(data);
                    //stream.SaveToFile(file, 2);
                    throw new TypeError('Bad arguments');
                }

            } catch (e) {
                throw e;
            } finally {
                stream.close();
            }
        };
    });


    define('path', function (require, exports, module) {

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
        var splitPath = function (filename) {
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

        var normalizeUNCRoot = function (device) {
            return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
        };

        // path.resolve([from ...], to)
        // windows version
        exports.resolve = function () {
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

            resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f), !resolvedAbsolute).join('\\');

            return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
                '.';
        };

        // windows version
        exports.normalize = function (path) {
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
            tail = normalizeArray(tail.split(/[\\\/]+/).filter(function (p) {
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
        exports.isAbsolute = function (path) {
            var result = splitDeviceRe.exec(path),
                device = result[1] || '',
                isUnc = device && device.charAt(1) !== ':';
            // UNC paths are always absolute
            return !!result[2] || isUnc;
        };

        // windows version
        exports.join = function () {
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
        exports.relative = function (from, to) {
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

        exports.dirname = function (path) {
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


        exports.basename = function (path, ext) {
            var f = splitPath(path)[2];
            // TODO: make this comparison case-insensitive on windows?
            if (ext && f.substr(-1 * ext.length) === ext) {
                f = f.substr(0, f.length - ext.length);
            }
            return f;
        };


        exports.extname = function (path) {
            return splitPath(path)[3];
        };
    });

    
    define('assert', function (require, exports, module) {
        // 2014-03-03 03:54:19 
        var util = require('util');
        var pSlice = Array.prototype.slice;

        // 1. The assert module provides functions that throw
        // AssertionError's when particular conditions are not met. The
        // assert module must conform to the following interface.

        var assert = module.exports = ok;

        // 2. The AssertionError is defined in assert.
        // new assert.AssertionError({ message: message,
        //                             actual: actual,
        //                             expected: expected })

        assert.AssertionError = function AssertionError(options) {
            this.name = 'AssertionError';
            this.actual = options.actual;
            this.expected = options.expected;
            this.operator = options.operator;
            if (options.message) {
                this.message = options.message;
                this.generatedMessage = false;
            } else {
                this.message = getMessage(this);
                this.generatedMessage = true;
            }
            //var stackStartFunction = options.stackStartFunction || fail;
            //Error.captureStackTrace(this, stackStartFunction);
        };

        // assert.AssertionError instanceof Error
        //util.inherits(assert.AssertionError, Error);
        assert.AssertionError.prototype = Error.prototype;

        function replacer(key, value) {
            if (util.isUndefined(value)) {
                return '' + value;
            }
            if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
                return value.toString();
            }
            if (util.isFunction(value) || util.isRegExp(value)) {
                return value.toString();
            }
            return value;
        }

        function truncate(s, n) {
            if (util.isString(s)) {
                return s.length < n ? s : s.slice(0, n);
            } else {
                return s;
            }
        }

        function getMessage(self) {
            return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
                self.operator + ' ' +
                truncate(JSON.stringify(self.expected, replacer), 128);
        }

        // At present only the three keys mentioned above are used and
        // understood by the spec. Implementations or sub modules can pass
        // other keys to the AssertionError's constructor - they will be
        // ignored.

        // 3. All of the following functions must throw an AssertionError
        // when a corresponding condition is not met, with a message that
        // may be undefined if not provided.  All assertion methods provide
        // both the actual and expected values to the assertion error for
        // display purposes.

        function fail(actual, expected, message, operator, stackStartFunction) {
            throw new assert.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator,
                stackStartFunction: stackStartFunction
            });
        }

        // EXTENSION! allows for well behaved errors defined elsewhere.
        assert.fail = fail;

        // 4. Pure assertion tests whether a value is truthy, as determined
        // by !!guard.
        // assert.ok(guard, message_opt);
        // This statement is equivalent to assert.equal(true, !!guard,
        // message_opt);. To test strictly for the value true, use
        // assert.strictEqual(true, guard, message_opt);.

        function ok(value, message) {
            if (!value) fail(value, true, message, '==', assert.ok);
        }
        assert.ok = ok;

        // 5. The equality assertion tests shallow, coercive equality with
        // ==.
        // assert.equal(actual, expected, message_opt);

        assert.equal = function equal(actual, expected, message) {
            if (actual != expected) fail(actual, expected, message, '==', assert.equal);
        };

        // 6. The non-equality assertion tests for whether two objects are not equal
        // with != assert.notEqual(actual, expected, message_opt);

        assert.notEqual = function notEqual(actual, expected, message) {
            if (actual == expected) {
                fail(actual, expected, message, '!=', assert.notEqual);
            }
        };

        // 7. The equivalence assertion tests a deep equality relation.
        // assert.deepEqual(actual, expected, message_opt);

        assert.deepEqual = function deepEqual(actual, expected, message) {
            if (!_deepEqual(actual, expected)) {
                fail(actual, expected, message, 'deepEqual', assert.deepEqual);
            }
        };

        function _deepEqual(actual, expected) {
            // 7.1. All identical values are equivalent, as determined by ===.
            if (actual === expected) {
                return true;

            } else if (util.isDate(actual) && util.isDate(expected)) {
                return actual.getTime() === expected.getTime();

                // 7.3 If the expected value is a RegExp object, the actual value is
                // equivalent if it is also a RegExp object with the same source and
                // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
            } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
                return actual.source === expected.source &&
                    actual.global === expected.global &&
                    actual.multiline === expected.multiline &&
                    actual.lastIndex === expected.lastIndex &&
                    actual.ignoreCase === expected.ignoreCase;

                // 7.4. Other pairs that do not both pass typeof value == 'object',
                // equivalence is determined by ==.
            } else if (!util.isObject(actual) && !util.isObject(expected)) {
                return actual == expected;

                // 7.5 For all other Object pairs, including Array objects, equivalence is
                // determined by having the same number of owned properties (as verified
                // with Object.prototype.hasOwnProperty.call), the same set of keys
                // (although not necessarily the same order), equivalent values for every
                // corresponding key, and an identical 'prototype' property. Note: this
                // accounts for both named and indexed properties on Arrays.
            } else {
                return objEquiv(actual, expected);
            }
        }

        function isArguments(object) {
            return Object.prototype.toString.call(object) == '[object Arguments]';
        }

        function objEquiv(a, b) {
            if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
                return false;
            // an identical 'prototype' property.
            if (a.prototype !== b.prototype) return false;
            //~~~I've managed to break Object.keys through screwy arguments passing.
            //   Converting to array solves the problem.
            var aIsArgs = isArguments(a),
                bIsArgs = isArguments(b);
            if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
                return false;
            if (aIsArgs) {
                a = pSlice.call(a);
                b = pSlice.call(b);
                return _deepEqual(a, b);
            }
            try {
                var ka = Object.keys(a),
                    kb = Object.keys(b),
                    key, i;
            } catch (e) { //happens when one is a string literal and the other isn't
                return false;
            }
            // having the same number of owned properties (keys incorporates
            // hasOwnProperty)
            if (ka.length != kb.length)
                return false;
            //the same set of keys (although not necessarily the same order),
            ka.sort();
            kb.sort();
            //~~~cheap key test
            for (i = ka.length - 1; i >= 0; i--) {
                if (ka[i] != kb[i])
                    return false;
            }
            //equivalent values for every corresponding key, and
            //~~~possibly expensive deep test
            for (i = ka.length - 1; i >= 0; i--) {
                key = ka[i];
                if (!_deepEqual(a[key], b[key])) return false;
            }
            return true;
        }

        // 8. The non-equivalence assertion tests for any deep inequality.
        // assert.notDeepEqual(actual, expected, message_opt);

        assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
            if (_deepEqual(actual, expected)) {
                fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
            }
        };

        // 9. The strict equality assertion tests strict equality, as determined by ===.
        // assert.strictEqual(actual, expected, message_opt);

        assert.strictEqual = function strictEqual(actual, expected, message) {
            if (actual !== expected) {
                fail(actual, expected, message, '===', assert.strictEqual);
            }
        };

        // 10. The strict non-equality assertion tests for strict inequality, as
        // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

        assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
            if (actual === expected) {
                fail(actual, expected, message, '!==', assert.notStrictEqual);
            }
        };

        function expectedException(actual, expected) {
            if (!actual || !expected) {
                return false;
            }

            if (Object.prototype.toString.call(expected) == '[object RegExp]') {
                return expected.test(actual);
            } else if (actual instanceof expected) {
                return true;
            } else if (expected.call({}, actual) === true) {
                return true;
            }

            return false;
        }

        function _throws(shouldThrow, block, expected, message) {
            var actual;

            if (util.isString(expected)) {
                message = expected;
                expected = null;
            }

            try {
                block();
            } catch (e) {
                actual = e;
            }

            message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                (message ? ' ' + message : '.');

            if (shouldThrow && !actual) {
                fail(actual, expected, 'Missing expected exception' + message);
            }

            if (!shouldThrow && expectedException(actual, expected)) {
                fail(actual, expected, 'Got unwanted exception' + message);
            }

            if ((shouldThrow && actual && expected &&
                !expectedException(actual, expected)) || (!shouldThrow && actual)) {
                throw actual;
            }
        }

        // 11. Expected to throw an error:
        // assert.throws(block, Error_opt, message_opt);

        assert.throws = function (block, /*optional*/ error, /*optional*/ message) {
            _throws.apply(this, [true].concat(pSlice.call(arguments)));
        };

        // EXTENSION! This is annoying to write outside this module.
        assert.doesNotThrow = function (block, /*optional*/ message) {
            _throws.apply(this, [false].concat(pSlice.call(arguments)));
        };

        assert.ifError = function (err) {
            if (err) {
                throw err;
            }
        };
    });
    

    (function () {

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
        FP.bind || (FP.bind = function (that) {
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
            } else {
                /** @constructor */

                function F() {}

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
        Object.keys || (Object.keys = (function () {
            var hasDontEnumBug = !{
                toString: ''
            }.propertyIsEnumerable('toString');
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

            return function (o) {
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


        // ES5 1.8.5
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
        Object.getOwnPropertyNames || (Object.getOwnPropertyNames = function (obj) {
            var keys = [];

            // Only iterate the keys if we were given an object, and
            // a special check for null, as typeof null == "object"
            if (typeof obj === "object" && obj !== null) {
                // Use a standard for in loop
                for (var x in obj) {
                    // A for in will iterate over members on the prototype
                    // chain as well, but Object.getOwnPropertyNames returns
                    // only those directly on the object, so use hasOwnProperty.
                    if (obj.hasOwnProperty(x)) {
                        keys.push(x);
                    }
                }
            }

            return keys;
        });



        /*---------------------------------------*
         * Array
         *---------------------------------------*/
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
        // https://github.com/kangax/fabric.js/blob/gh-pages/src/util/lang_array.js

        // ES5 15.4.3.2
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
        Array.isArray || (Array.isArray = function (obj) {
            return OP.toString.call(obj) === '[object Array]';
        });


        // ES5 15.4.4.18
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
        AP.forEach || (AP.forEach = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this) {
                    fn.call(context, this[i], i, this);
                }
            }
        });


        // ES5 15.4.4.19
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
        AP.map || (AP.map = function (fn, context) {
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
        AP.filter || (AP.filter = function (fn, context) {
            var result = [],
                val;

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
        AP.every || (AP.every = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this && !fn.call(context, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        });


        // ES5 15.4.4.17
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/some
        AP.some || (AP.some = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this && fn.call(context, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        });


        // ES5 15.4.4.21
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
        AP.reduce || (AP.reduce = function (fn /*, initial*/ ) {
            if (typeof fn !== 'function') {
                throw new TypeError(fn + ' is not an function');
            }

            var len = this.length >>> 0,
                i = 0,
                result;

            if (arguments.length > 1) {
                result = arguments[1];
            } else {
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
        AP.reduceRight || (AP.reduceRight = function (fn /*, initial*/ ) {
            if (typeof fn !== 'function') {
                throw new TypeError(fn + ' is not an function');
            }

            var len = this.length >>> 0,
                i = len - 1,
                result;

            if (arguments.length > 1) {
                result = arguments[1];
            } else {
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
        AP.indexOf || (AP.indexOf = function (value, from) {
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
        AP.lastIndexOf || (AP.lastIndexOf = function (value, from) {
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
        SP.trim || (SP.trim = (function () {

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

            return function () {
                return String(this).replace(trimLeftReg, '').replace(trimRightReg, '');
            }

        })());


        /*---------------------------------------*
         * Date
         *---------------------------------------*/

        // ES5 15.9.4.4
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
        Date.now || (Date.now = function () {
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

                return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z' : null;
            };

            String.prototype.toJSON =
                Number.prototype.toJSON =
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
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
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


                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
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

                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
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

                return str('', {
                    '': value
                });
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

                    return typeof reviver === 'function' ? walk({
                        '': j
                    }, '') : j;
                }

                throw new SyntaxError('JSON.parse');
            };
        }
    }());


    global.console = require('console');

}(this, {}));

WScript.Sleep(500);

/*
:cmd
::if %errorlevel% == 0 exit
pause>nul
::*/