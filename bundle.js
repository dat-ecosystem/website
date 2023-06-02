(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (__dirname){(function (){
const home_page = require('..')
const my_theme = require('../src/node_modules/my_theme')
const navbar = require('../src/node_modules/navbar')

// Passing theme
document.body.append(home_page(my_theme))

// Adding font link
document.head.innerHTML = ` <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" ></link> `


function page_protocol (handshake, send, mid = 0) {
    listen.id = `${__dirname}`
    if (send) return listen
    const PROTOCOL = {
        'theme': change_theme
    }
    send = handshake(null, listen)
    function listen (message) {
        const { head, type, data } = message
        const [by, to, id] = head
        if (to !== id) return console.error('address unknown', message)
        const action = PROTOCOL[type] || invalid
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function change_theme ({ head, data: theme_name }) {
        const [to] = head
        switch (theme_name) {
        case 'light': return send({
            head: [id, to, mid++], refs: { cause: head }, type: 'theme', data: light_theme
        })
        case 'dark': return send({
            head: [id, to, mid++], refs: { cause: head }, type: 'theme', data: dark_theme
        })
        }
    }
}

}).call(this)}).call(this,"/page")
},{"..":4,"../src/node_modules/my_theme":16,"../src/node_modules/navbar":17}],4:[function(require,module,exports){
module.exports = home_page

const navbar = require('navbar')
const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')

const components = [
    cover_app(),
    app_timeline_mini(),
    app_projects_mini(),
    app_about_us(),
    app_footer()
];


function home_page (opts, protocol) {

    // console.log(opts.light_theme)
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    sheet.replaceSync(get_theme(opts.light_theme))
    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        if ( active_state === 'light_theme' )  {
            // active_state = 'dark_theme'
            sheet.replaceSync( get_theme( opts.dark_theme ) )
            navbar(listen, {active_state: 'dark_theme'})
        } else {
            // active_state = 'light_theme'
            sheet.replaceSync( get_theme( opts.light_theme ) ) 
            navbar(listen, {active_state: 'light_theme'})
        }
    }

    

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})

    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0',
        opacity: `1`,
        backgroundImage: `radial-gradient(#A7A6A4 2px, #EEECE9 2px)`,
        backgroundSize: `16px 16px`
    });

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${get_theme}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    
    
    shadow.append(main, navbar(listen, {active_state: 'light_theme'}))
    shadow.adoptedStyleSheets = [sheet]
    return el

}

function get_theme(props){
    return`
        :host{ 
            --bg_color: ${props.bg_color};
            --ac-1: ${props.ac_1};
            --ac-2: ${props.ac_2};
            --ac-3: ${props.ac_3};
            --primary_color: ${props.primary_color};
            font-family: Silkscreen;
        }
        .main-wrapper{
            padding:60px 10px;
        }

        @media(min-width: 856px){
            .main-wrapper{
                padding:60px 20px;
            }
        }

    `
}
},{"app_about_us":5,"app_cover":6,"app_footer":7,"app_projects_mini":8,"app_timeline_mini":9,"navbar":17}],5:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_about_us


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const my_theme = require('my_theme')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_about_us () {

    // Assigning all the icons
    const { img_src: { 
        about_us_cover = `${prefix}/about_us_cover.png`,
        img_robot_1 = `${prefix}/img_robot_1.svg`,
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
    } } = my_theme;

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="about_us_wrapper">
            <div class="about_us_cover_image"></div>
            <div class="content_wrapper">
                <div class="title"> ABOUT US </div>
            </div>
        </div>
        <div class="about_us_desc">
            Dat ecosystem garden supports open source projects that strengthen P2P foundations, with a focus on builder tools, infrastructure, research, and community resources.
        </div>
        <style> ${get_theme} </style>
    `

    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        ;(active_state==='active')?el.style.display = 'none':''
    }

    // Added background banner cover
    const about_us_cover_image = shadow.querySelector('.about_us_cover_image')
    banner_img = document.createElement('img')
    banner_img.src = about_us_cover
    about_us_cover_image.append(banner_img)

    // about_us_wrapper.style.backgroundImage = `url(${banner_cover})`
    const content_wrapper = shadow.querySelector('.content_wrapper')
    img_robot_1_img = document.createElement('img')
    img_robot_1_img.src = img_robot_1
    content_wrapper.prepend(img_robot_1_img)

    const view_more_btn = sm_text_button({text:'IMPORTANT DOCUMENTS'})
    const tell_me_more_btn = sm_text_button({text:'TELL ME MORE'})
    const cover_window = window_bar({
        name:'Learn_about_us.pdf', 
        src: icon_pdf_reader,
        action_buttons: [tell_me_more_btn, view_more_btn]
    }, listen)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .about_us_wrapper{
            position:relative;
            height:max-content;
            width:100%;
            display:flex;
            flex-direction:column;
            justify-content: center;
            align-items: center;
            padding: 150px 0px;
            background-image: radial-gradient(#A7A6A4 1px, #FFF 1px);
            background-size: 10px 10px;
            background-color:red;
            border: 1px solid var(--primary_color);
            box-sizing: border-box;
            container-type: inline-size;
        }

        /* This covers background-image will change to an image */
        .about_us_cover_image{
            position: absolute;
            width:100%;
            height:100%;
            overflow:hidden;
        }
        .about_us_cover_image img{
            position:absolute;
            left:50%;
            top:50%;
            width: auto;
            height: 80%;
            transform:translate(-50%, -50%);
        }

        .about_us_desc{
            width:100% !important;
            background-color:var(--bg_color);
            color: var(--primary_color);
            border:1px solid var(--primary_color);
            padding:10px;
            letter-spacing: -2px;
            line-height:18px;
            font-size:16px;
            margin-bottom:30px;
            box-sizing: border-box;
        }


        /* Cover image alignment */
        .content_wrapper{
            display: flex;
            justify-content:center;
            align-items:center;
            gap:20px;
            position: relative;
            z-index:1;
            color:var(--primary_color);
            text-align:center;
        }
        .content_wrapper img{
            width: 100px;
            height: auto;
        }
        .content_wrapper .title{
            font-size:40px;
        }


        @container(min-width: 856px) {
            .about_us_cover_image img{
                width: 100%;
                height: auto;
            }
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_about_us")
},{"_process":2,"buttons/sm_text_button":14,"my_theme":16,"path":1,"window_bar":20}],6:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = cover_app


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const my_theme = require('my_theme')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function cover_app () {

    // Assigning all the icons
    const { img_src: { 
        banner_cover = `${prefix}/banner_cover.svg`,
        tree_character = `${prefix}/tree_character.png`,
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
    } } = my_theme;

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="cover_wrapper">
            <div class="cover_image"></div>
            <div class="content_wrapper">
                WELCOME TO DAT ECOSYSTEM
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        ;(active_state==='active')?el.style.display = 'none':''
    }

    // Added background banner cover
    const cover_image = shadow.querySelector('.cover_image')
    banner_img = document.createElement('img')
    banner_img.src = banner_cover
    cover_image.append(banner_img)

    // cover_wrapper.style.backgroundImage = `url(${banner_cover})`
    const content_wrapper = shadow.querySelector('.content_wrapper')
    tree_character_img = document.createElement('img')
    tree_character_img.src = tree_character
    content_wrapper.prepend(tree_character_img)

    const view_more_btn = sm_text_button({text:'View more (20)'})
    const tell_me_more_btn = sm_text_button({text:'TELL ME MORE'})
    const cover_window = window_bar({
        name:'Learn_about_us.pdf', 
        src: icon_pdf_reader,
        action_buttons: [tell_me_more_btn, view_more_btn]
    }, listen)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .app_cover{
            display:none;
        }

        .cover_wrapper{
            position:relative;
            height:max-content;
            width:100%;
            display:flex;
            justify-content: center;
            align-items: center;
            padding: 150px 0px;
            background-image: radial-gradient(#A7A6A4 1px, #FFF 1px);
            background-size: 10px 10px;
            background-color:var(--bg_color);
            border: 1px solid var(--primary_color);
            margin-bottom: 30px;
        }

        /* This covers background-image will change to an image */
        .cover_image{
            position: absolute;
            width:100%;
            height:100%;
            overflow:hidden;
        }
        .cover_image img{
            position:absolute;
            left:50%;
            top:50%;
            width: auto;
            height: 100%;
            transform:translate(-50%, -50%);
        }


        /* Cover image alignment */
        .content_wrapper{
            display: flex;
            flex-direction: column;
            align-items:center;
            gap:20px;
            position: relative;
            z-index:1;
            color:var(--primary_color);
            text-align:center;
        }
        .content_wrapper img{
            width: 300px;
            height: auto;
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_cover")
},{"_process":2,"buttons/sm_text_button":14,"my_theme":16,"path":1,"window_bar":20}],7:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_footer


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const my_theme = require('my_theme')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_footer () {

    // Assigning all the icons
    const { img_src: {
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
        img_robot_2 = `${prefix}/img_robot_2.png`,
        pattern_img_1 = `${prefix}/pattern_img_1.png`,
    } } = my_theme;

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="footer_wrapper">
                <div class="robot_img_2"></div>
                <div class="footer_info_wrapper">
                    <div class="title"> INTERESTED IN JOINING DAT ECOSYSTEM CHAT NETWORKING? </div>
                    <div class="desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae porta aliquet sit amet ornare sagittis, ultricies sed. Viverra sit felis ullamcorper pharetra mattis amet, vel. </div>
                </div>
            </div>
            <div class="pattern_img"></div>
        </div>
        <style> ${get_theme} </style>
    `

    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        ;(active_state==='active')?el.style.display = 'none':''
    }
    
    // Adding Robot Image
    const robot_image_wrapper = shadow.querySelector('.robot_img_2')
    const robot_image = document.createElement('img')
    robot_image.src = img_robot_2
    robot_image_wrapper.append(robot_image)

    // Adding Button
    const footer_info_wrapper = shadow.querySelector('.footer_info_wrapper')
    const join_programe = sm_text_button({text:'JOIN OUR GROWTH PROGRAME'})
    footer_info_wrapper.append(join_programe)

    // Adding Pattern Image
    const pattern_image_wrapper = shadow.querySelector('.pattern_img')
    const pattern_image = document.createElement('img')
    pattern_image.src = pattern_img_1
    pattern_image_wrapper.append(pattern_image)


    // Adding Footer Window
    const footer_window = window_bar({
        name:'FOOTER.pdf', 
        src: icon_pdf_reader,
    }, listen)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(footer_window)
    return el

}




function get_theme(){
    return`
        *{ box-sizing: border-box; }

        .main_wrapper{
            position: relative;
            container-type: inline-size;
            background-color: var(--bg_color);
            border: 1px solid var(--primary_color);
        }
        .footer_wrapper{
            display:flex;
            flex-direction:column-reverse;
            align-items:flex-start;
            padding: 20px;
            padding-bottom:0px !important;

        }

        .title{
            font-size: 40px;
            color:var(--primary_color);
            font-weight: 700;
            line-height: 36px;
            letter-spacing: -5px;
            margin-bottom: 10px;
        }
        .desc{
            font-size: 16px;
            color:var(--primary_color);
            line-height: 14px;
            letter-spacing: -2px;
            margin-bottom: 30px;
        }
        .footer_info_wrapper{
            margin-bottom:30px;
        }
        .robot_img_2 img{
            width:150px;
        }
        .pattern_img{
            display:none;
        }


        @container(min-width: 856px) {
            .footer_wrapper{
                gap:40px;
                flex-direction: row;
                align-items:flex-end;
                width:70%;
            }
            .pattern_img{
                display:block;
                position:absolute;
                top:0;
                right:0;
            }
            .pattern_img img{
                width: 300px;
                height: auto;
            }
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_footer")
},{"_process":2,"buttons/sm_text_button":14,"my_theme":16,"path":1,"window_bar":20}],8:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_projects_mini


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const project_card = require('project_card')
const my_theme = require('my_theme')
const sm_text_button = require('buttons/sm_text_button')
const sm_icon_button = require('buttons/sm_icon_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_projects_mini () {

    // Assigning all the icons
    const { img_src: {
        icon_discord = `${prefix}/icon_discord.png`,
        icon_twitter = `${prefix}/icon_twitter.png`,
        icon_github = `${prefix}/icon_github.png`,
        icon_folder = `${prefix}/icon_folder.svg`,
        project_logo_1 = `${prefix}/project_logo_1.png`,
    } } = my_theme

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="project_wrapper">
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        ;(active_state==='active')?el.style.display = 'none':''
    }

    // Adding Applicatin window Bar
    const view_more_btn = sm_text_button({text:'View more (12)'})
    const cover_window = window_bar({
        name:'OUR PROJECTS', 
        src: icon_folder,
        action_buttons: [view_more_btn]
    }, listen)


    // Adding project cards
    const project_wrapper = shadow.querySelector('.project_wrapper')
    const cardsData = [
        { 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },
    ]
    const project_cards = cardsData.map((card_data) => project_card(card_data))
    project_cards.forEach((card) => {
        project_wrapper.append(card)
    })

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

}




function get_theme(){
    return`
        .main_wrapper{
            container-type: inline-size;
            width:100%;
            height: 100%;
        }
        *{
            box-sizing: border-box;
        }
        .project_wrapper{
            --s: 20px; /* control the size */
            --_g: #EEECE9 /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                #777674;  /* second color */ 
            background-size: var(--s) var(--s);  
            border:1px solid var(--primary_color);
            width:100%;
            height: 100%;
            padding: 0px;
            display: grid;
            gap:20px;
            grid-template-columns: 12fr;
            margin-bottom: 30px;
            box-sizing: border-box;
        }

        @container(min-width: 768px) {
            .project_wrapper{
                grid-template-columns: repeat(2, 6fr);
            }
        }

        @container(min-width: 1200px) {
            .project_wrapper{
                grid-template-columns: repeat(3, 4fr);
            }
        }

        /*---------- Mobile devices ----------*/
        @media (min-width: 480px) {
        }

        /*---------- iPads, Tablets ----------*/
        @media (min-width: 768px) {
        }

        /*---------- Mediuem screens, laptops ----------*/
        @media (min-width: 1024px) {}
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_projects_mini")
},{"_process":2,"buttons/sm_icon_button":12,"buttons/sm_text_button":14,"my_theme":16,"path":1,"project_card":18,"window_bar":20}],9:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_timeline_mini


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const timeline_card = require('timeline_card')
const my_theme = require('my_theme')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_timeline_mini () {

    // Assigning all the icons
    const { img_src: {
        icon_folder= `${prefix}/icon_folder.svg`,
    } } = my_theme

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="timeline_wrapper">
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        ;(active_state==='active')?el.style.display = 'none':''
    }

    // Adding Applicatin window Bar
    const view_more_btn = sm_text_button({text:'View more (12)'})
    const cover_window = window_bar({
        name:'TIMELINE', 
        src: icon_folder,
        action_buttons: [view_more_btn]
    }, listen)


    // Adding timeline cards
    const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
    const cards_data = [
        { title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },
    ]
    const timeline_cards = cards_data.map((card_data) => timeline_card(card_data))
    timeline_cards.forEach((card) => {
        timeline_wrapper.append(card)
    })

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }
        .main_wrapper{
            container-type: inline-size;
            width:100%;
            height: 100%;
        }
        .timeline_wrapper{
            --s: 20px; /* control the size */
            --_g: #EEECE9 /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                #777674;  /* second color */ 
            background-size: var(--s) var(--s);  
            border:1px solid var(--primary_color);
            width:100%;
            height: 100%;
            padding: 0px;
            display: grid;
            gap:20px;
            grid-template-columns: 12fr;
            margin-bottom: 30px;
        }

        @container(min-width: 768px) {
            .timeline_wrapper{
                grid-template-columns: repeat(2, 6fr);
            }
        }

        @container(min-width: 1200px) {
            .timeline_wrapper{
                grid-template-columns: repeat(3, 4fr);
            }
        }

        /*---------- Mobile devices ----------*/
        @media (min-width: 480px) {
        }

        /*---------- iPads, Tablets ----------*/
        @media (min-width: 768px) {
        }

        /*---------- Mediuem screens, laptops ----------*/
        @media (min-width: 1024px) {}
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_timeline_mini")
},{"_process":2,"buttons/sm_text_button":14,"my_theme":16,"path":1,"timeline_card":19,"window_bar":20}],10:[function(require,module,exports){

module.exports = icon_button

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





// Props - icon/img src
function icon_button (props) {
    let {src, src_active} = props

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const icon_button = document.createElement('div')
    icon_button.classList.add('icon_btn')
    
    const icon = document.createElement('img')
    icon.src = src
    icon_button.append(icon)

    // Toggle Icon
    if(src_active){
        let activeState = true;
        icon_button.onclick = (e) =>{
            ;(activeState)?icon.src = src_active: icon.src = src
            activeState = !activeState
            toggle_class(e)
        }
    }else{
        // Toggle Class
        icon_button.onclick = (e) => toggle_class(e)
    }

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(icon_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}



function get_theme(){
    return`
        .icon_btn{
            display:flex;
            justify-content: center;
            align-items:center;
            height:40px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
        }
        .icon_btn img{
            pointer-events:none;
        }
        .icon_btn.active{
            background-color: var(--ac-2)
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],11:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = logo_button

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function logo_button(){

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const logo_button = document.createElement('div')
    logo_button.classList.add('logo_button')


    const logo = document.createElement('img')
    logo.src = `${prefix}/logo.png`
    const company_name = document.createElement('span')
    company_name.innerHTML = 'DAT ECOSYSTEM'
    logo_button.append(logo, company_name)


    logo_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(logo_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}


function get_theme(){
    return`
        .logo_button{
            width: 100%;
            height:40px;
            box-sizing:border-box;
            padding: 10px;
            display:flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            background-color: var(--primary_color);
            color: var(--bg_color);
            font-size: 0.875em;
            letter-spacing: 0.25rem;
        }
    `
}

function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons")
},{"_process":2,"path":1}],12:[function(require,module,exports){

module.exports = sm_icon_button

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





// Props - icon/img src
function sm_icon_button (props) {
    let {src, src_active} = props

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const sm_icon_button = document.createElement('div')
    sm_icon_button.classList.add('sm_icon_button')
    
    const icon = document.createElement('img')
    icon.src = src
    sm_icon_button.append(icon)

    // Toggle Icon
    if(src_active){
        let activeState = true;
        sm_icon_button.onclick = (e) =>{
            ;(activeState)?icon.src = src_active: icon.src = src
            activeState = !activeState
            toggle_class(e)
        }
    }else{
        // Toggle Class
        sm_icon_button.onclick = (e) => toggle_class(e)
    }

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(sm_icon_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}



function get_theme(){
    return`
        .sm_icon_button{
            display:flex;
            justify-content: center;
            align-items:center;
            height:30px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            // border-left: var(--bg_color);
            background-color: var(--bg_color);
        }
        .sm_icon_button img{
            pointer-events:none;
        }
        .sm_icon_button.active{
            background-color: var(--ac-2)
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],13:[function(require,module,exports){

module.exports = sm_icon_button_alt

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





// Props - icon/img src
function sm_icon_button_alt (props) {
    let {src, src_active} = props

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const sm_icon_button_alt = document.createElement('div')
    sm_icon_button_alt.classList.add('sm_icon_button_alt')
    
    const icon = document.createElement('img')
    icon.src = src
    sm_icon_button_alt.append(icon)

    // Toggle Icon
    if(src_active){
        let activeState = true;
        sm_icon_button_alt.onclick = (e) =>{
            ;(activeState)?icon.src = src_active: icon.src = src
            activeState = !activeState
            toggle_class(e)
        }
    }else{
        // Toggle Class
        sm_icon_button_alt.onclick = (e) => toggle_class(e)
    }

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(sm_icon_button_alt, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}



function get_theme(){
    return`
        .sm_icon_button_alt{
            display:flex;
            justify-content: center;
            align-items:center;
            height:30px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--bg_color);
            // border-left: var(--bg_color);
            background-color: var(--primary_color);
        }
        .sm_icon_button_alt img{
            pointer-events:none;
        }
        .sm_icon_button_alt.active{
            background-color: var(--ac-2)
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],14:[function(require,module,exports){
module.exports = sm_text_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function sm_text_button (props) {

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const sm_text_button = document.createElement('div')
    sm_text_button.classList.add('sm_text_button')
    sm_text_button.innerHTML = props.text
    sm_text_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(sm_text_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

}



function get_theme(){
    return`
        .sm_text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: .5em;
            padding:10px 5px;
            height:30px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
            color:var(--primary_color);
        }
        .sm_text_button.active{
            background-color: var(--ac-1);
            color: var(--primary_color);
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],15:[function(require,module,exports){
module.exports = text_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function text_button (props) {

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const text_button = document.createElement('div')
    text_button.classList.add('text_button')
    text_button.innerHTML = props.text
    text_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(text_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

}



function get_theme(){
    return`
        .text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: 1.5714285714285714em;
            padding:10px 5px;
            height:40px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
            color:var(--primary_color);
        }
        .text_button.active{
            background-color: var(--ac-1);
            color: var(--primary_color);
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],16:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


const my_theme = {
  img_src:{
    icon_consortium: `${prefix}/icon_consortium_page.png`,
    icon_blogger: `${prefix}/icon_blogger.png`,
    icon_discord: `${prefix}/icon_discord.png`,
    icon_twitter: `${prefix}/icon_twitter.png`,
    icon_github: `${prefix}/icon_github.png`,
    icon_terminal: `${prefix}/icon_terminal.png`,
    icon_theme: `${prefix}/icon_theme.png`,
    icon_close_dark: `${prefix}/icon_close_dark.svg`,
    icon_close_light: `${prefix}/icon_close_light.svg`,
    icon_pdf_reader: `${prefix}/icon_pdf_reader.svg`,
    icon_folder: `${prefix}/icon_folder.svg`,
    icon_arrow_down: `${prefix}/icon_arrow_down.svg`,
    icon_arrow_up: `${prefix}/icon_arrow_up.svg`,
    icon_arrow_down_light: `${prefix}/icon_arrow_down_light.svg`,
    icon_arrow_up_light: `${prefix}/icon_arrow_up_light.svg`,
    icon_arrow_up_light: `${prefix}/icon_arrow_up_light.svg`,
    banner_cover : `${prefix}/banner_cover.svg`,
    about_us_cover : `${prefix}/about_us_cover.png`,
    tree_character : `${prefix}/tree_character.png`,
    icon_clock : `${prefix}/icon_clock.svg`,
    icon_link : `${prefix}/icon_link.svg`,
    icon_calendar : `${prefix}/icon_calendar.svg`,
    project_logo_1 : `${prefix}/project_logo_1.png`,
    img_robot_1 : `${prefix}/img_robot_1.png`,
    img_robot_2 : `${prefix}/img_robot_2.png`,
    pattern_img_1 : `${prefix}/pattern_img_1.png`,
  },
  light_theme:{
    bg_color : '#fff',
    primary_color : '#293648',
    ac_1 : '#2ACA4B',
    ac_2 : '#F9A5E4',
    ac_3 : '#88559D',
  },
  dark_theme:{
    bg_color : '#293648',
    primary_color : '#fff',
    ac_1 : '#2ACA4B',
    ac_2 : '#F9A5E4',
    ac_3 : '#88559D',
  }
}

module.exports = my_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/my_theme")
},{"_process":2,"path":1}],17:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = navbar

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


const icon_button = require('buttons/icon_button')
const logo_button = require('buttons/logo_button')
const text_button = require('buttons/text_button')
const my_theme = require('my_theme')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function navbar(notify, props){
    
    let active_state = props.active_state;
    ; ( props.active_state === 'light_theme' ) ? active_state = 'dark_theme' :  active_state = 'light_theme' ;


    // Assigning all the icons
    const { img_src: { 
        icon_consortium = `${prefix}/icon_consortium_page.png`,
        icon_blogger = `${prefix}/icon_blogger.png`,
        icon_discord = `${prefix}/icon_discord.png`,
        icon_twitter = `${prefix}/icon_twitter.png`,
        icon_github = `${prefix}/icon_github.png`,
        icon_terminal = `${prefix}/icon_terminal.png`,
        icon_theme = `${prefix}/icon_theme.png`,
        icon_arrow_down = `${prefix}/icon_arrow_down.svg`,
        icon_arrow_up = `${prefix}/icon_arrow_up.svg`
    } } = my_theme
    

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const navbar = document.createElement('div')
    navbar.classList.add('navbar')

    shadow.innerHTML = `
    <div class="navbar_wrapper">
        <div class="navbar">
            <div class="nav_toggle_wrapper"></div>
            <div class="page_btns_wrapper"></div>
            <div class="icon_btn_wrapper"></div>
        </div>
    </div>
    <style>${get_theme()}</style>
  `


    
    // sm nav buttons
    const consortium_btn = icon_button({src:icon_consortium})
    const logo_btn = logo_button()
    logo_btn.classList.add('logo_btn')
    
    // icon_consortium_page.png
    // adding nav toggle button
    const nav_toggle_btn = icon_button({ src: icon_arrow_down, src_active: icon_arrow_up });
    nav_toggle_btn.classList.add('nav_toggle_btn');
    nav_toggle_btn.src = icon_arrow_up;     // Change the src value of icon_button after it is declared
    nav_toggle_btn.addEventListener('click', function() {
        shadow.querySelector('.navbar').classList.toggle('active');
    });
    const nav_toggle_wrapper = shadow.querySelector('.nav_toggle_wrapper')
    nav_toggle_wrapper.append(consortium_btn, logo_btn, nav_toggle_btn)





    // Page List Buttons
    const text_btns = [
        { element: text_button({ text: 'HOME' }) },
        { element: text_button({ text: 'PROJECTS' }) },
        { element: text_button({ text: 'GROWTH PROGRAM' }) },
        { element: text_button({ text: 'TIMELINE' }) }
    ] 
    for (const button_data of text_btns) {
        const { element } = button_data
        element.classList.add('text_button')
    }
    const page_btns_wrapper = shadow.querySelector('.page_btns_wrapper')
    page_btns_wrapper.append(...text_btns.map(button_data => button_data.element))





    // Adding social and action buttons
    const icon_btns = [
        {element: icon_button({src:icon_blogger}) },
        {element: icon_button({src:icon_discord}) },
        {element: icon_button({src:icon_twitter}) },
        {element: icon_button({src:icon_github}) },
        {element: icon_button({src:icon_terminal}) },
        // {element: icon_button({src:icon_theme}) }
    ] 
    for (const button_data of icon_btns) {
        const { element } = button_data
        element.classList.add('icon_btn')
    }
    
    const theme_btn = icon_button({src:icon_theme});
    theme_btn.classList.add('icon_btn');
    theme_btn.addEventListener('click', function() {
        console.log(active_state)
        notify( { active_state : active_state } )
    });
    const icon_btn_wrapper = shadow.querySelector('.icon_btn_wrapper')
    // const nav_toggle_wrapper = shadow.querySelector('.nav_toggle_wrapper')
    // nav_toggle_wrapper.append(consortium_btn, logo_btn, nav_toggle_btn)
    icon_btn_wrapper.append(...icon_btns.map(button_data => button_data.element), theme_btn)





    // shadow.append(navbar)
    shadow.adoptedStyleSheets = [sheet]
    return el

}


function get_theme(){
    return`
        .navbar_wrapper{
            container-type: inline-size;
            position: fixed;
            top:0px;
            left:0px;
            z-index: 10;
            width: 100%;
        }
        .navbar{
            display: block;
            width:100%;
            height:40px;
            overflow:hidden;
            border-bottom: 1px solid var(--primary_color);

            --s: 20px; /* control the size */
            --_g: #EEECE9 /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                #777674;  /* second color */ 
            background-size: var(--s) var(--s);                   
        }
        .navbar.active{
            height:max-content;
        }


        /* Starting buttons wrapper */
        .nav_toggle_wrapper{
            display: flex;
            width:100%;
            justify-content:stretch;
        }
        .nav_toggle_wrapper .logo_btn{
            width:100% !important;
            flex-grow:1;
        }
        .page_btns_wrapper{
            width:100%;
            display:flex;
            flex-direction:column;
        }
        .page_btns_wrapper .text_button{
            width:100%;
            flex-grow:1;
        }
        .icon_btn_wrapper{
            display:flex;
            justify-content:flex-start;
            // grid-template-columns: repeat(6, 2fr)
        }










        .page_list{
            display: none;
        }

        @container(min-width: 899px) {

            .navbar{
                display: flex;
            }

            .nav_toggle_wrapper{
                width:max-content;
                display:flex;
            }
            .nav_toggle_wrapper .logo_btn{
                width: max-content !important;
            }
            .page_list{
                display:flex;
            }

            .nav_toggle_wrapper .nav_toggle_btn{
                display: none;
            }
            .page_btns_wrapper{
                flex-direction: row;
            }
            .page_btns_wrapper .text_button{
                width:max-content !important;
                flex-grow: unset;
            }
        }
        
        .socials_list{
            display: flex;
        }
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/navbar")
},{"_process":2,"buttons/icon_button":10,"buttons/logo_button":11,"buttons/text_button":15,"my_theme":16,"path":1}],18:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = project_card


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sm_icon_button = require('buttons/sm_icon_button')
const my_theme = require('my_theme')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function project_card (props) {

    // Assigning all the icons
    const { img_src: { 
        icon_consortium = `${prefix}/icon_consortium_page.png`,
    } } = my_theme;


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="project_card">
            <div class="icon_wrapper">
                <div class="project_title">
                    ${props.project}
                </div>
                <div class="socials_wrapper"></div>
            </div>
            <div class="content_wrapper">
                <div class="desc"> ${props.desc}</div>
            </div>
            <div class="tags_wrapper">
                ${props.tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
            </div>
        </div>
        <style>${get_theme}</style>
    `

    // Adding Project Logo
    const project_title = shadow.querySelector('.project_title');
    
    const project_logo = document.createElement('img')
    project_logo.src = props.project_logo
    project_title.prepend(project_logo)
    
    // Adding Socials
    const socials_wrapper = shadow.querySelector('.socials_wrapper');
    const social_link = props.socials.map((social) => sm_icon_button({src:social}));
    social_link.forEach((social) => {
        socials_wrapper.append(social);
    });


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }
        .project_card{
            height:max-content;
            width:100%;
            line-height: normal;
            background-color: var(--bg_color);
            color: var(--primary_color) !important;
            border:1px solid var(--primary_color);
            container-type: inline-size;
            box-sizing: border-box;
        }
        .content_wrapper{
            padding:20px;
        }
        .icon_wrapper{
            display:flex;
            justify-content:space-between;
            border-bottom: 1px solid var(--primary_color);
        }
        .project_title{
            display:flex;
            gap:5px;
            font-size:16px;
            letter-spacing:-2px;
            align-items:center;
            font-weight: 700;
            margin-left:5px;
        }
        .socials_wrapper{
            display:flex;
        }
        .socials_wrapper a{
            display:flex;
            height:100%;
            align-items:center;
        }
        .desc{
            font-size:14px;
            letter-spacing:-2px;
            line-height:16px;
        }
        .tags_wrapper{
            display: flex;
            flex-wrap:wrap;
        }
        .tag{
            flex-grow:1;
            min-width:max-content;
            padding:5px 10px;
            border: 1px solid var(--primary_color);
            text-align:center;
        }
        




        @container(min-width: 856px) {
            
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/project_card")
},{"_process":2,"buttons/sm_icon_button":12,"my_theme":16,"path":1}],19:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = timeline_card


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// const sm_icon_button_alt = require('buttons/sm_icon_button_alt')
// const sm_text_button = require('buttons/sm_text_button')
const my_theme = require('my_theme')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function timeline_card (props) {

    // Assigning all the icons
    const { img_src: { 
        icon_clock = `${prefix}/icon_clock.svg`,
        icon_link = `${prefix}/icon_link.svg`,
        icon_calendar = `${prefix}/icon_calendar.svg`
    } } = my_theme;


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="timeline_card">
            <div class="content_wrapper">

                <div class="icon_wrapper">
                    <div>
                        <img src=${icon_calendar} />
                        ${props.date}
                    </div>
                    <div>
                        <img src=${icon_clock} />
                        ${props.time}
                    </div>
                    <div>
                        <a href="${props.link}"><img src=${icon_link} /></a>
                    </div>
                </div>

                <div class="title"> ${props.title} </div>
                <div class="desc"> ${props.desc}</div>

            </div>
            <div class="tags_wrapper">
                ${props.tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
            </div>
        </div>
        <style>${get_theme}</style>
    `


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .timeline_card{
            height:max-content;
            width:100%;
            line-height: normal;
            background-color: var(--bg_color);
            color: var(--primary_color) !important;
            border:1px solid var(--primary_color);
            container-type: inline-size;
        }
        .content_wrapper{
            padding:20px;
        }
        .icon_wrapper{
            display:flex;
            gap:20px;
        }
        .icon_wrapper div{
            display:flex;
            gap:5px;
            font-size:16px;
            letter-spacing:-2px;
            align-items:center;
        }
        .icon_wrapper div:nth-last-child(1){
            margin-left:auto;
        }
        .title{
            margin-top:20px;
            margin-bottom:5px;
            font-size:18px;
            font-weight: 700;
            letter-spacing: -2px;
            line-height:16px;
        }
        .desc{
            font-size:14px;
            letter-spacing:-2px;
            line-height:16px;
        }
        .tags_wrapper{
            display: flex;
            flex-wrap:wrap;
        }
        .tag{
            flex-grow:1;
            min-width:max-content;
            padding:5px 10px;
            border: 1px solid var(--primary_color);
            // line-height:0px;
            text-align:center;
        }
        




        @container(min-width: 856px) {
            
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline_card")
},{"_process":2,"my_theme":16,"path":1}],20:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = window_bar


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sm_icon_button_alt = require('buttons/sm_icon_button_alt')
const sm_text_button = require('buttons/sm_text_button')
const my_theme = require('my_theme')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function window_bar (props, notify) {

    // Assigning all the icons
    const { img_src: { 
        icon_close_light = `${prefix}/icon_close_light.svg`,
        icon_arrow_down_light = `${prefix}/icon_arrow_down._lightsvg`,
        icon_arrow_up_light = `${prefix}/icon_arrow_up_light.svg`
    } } = my_theme;


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="window_bar">
            <div class="application_icon_wrapper"></div>
            <div class="application_name"><span>${props.name}</span></div>
            <div class="window_bar_actions">
                <div class="actions_wrapper"></div>
            </div>
        </div>
        <style>${get_theme}</style>
    `

    // adding application icon
    const application_icon = sm_icon_button_alt({src:props.src})
    const application_icon_wrapper = shadow.querySelector('.application_icon_wrapper')
    application_icon_wrapper.append(application_icon)

    // adding close window button
    const window_bar_actions = shadow.querySelector('.window_bar_actions')
    const close_window_btn = sm_icon_button_alt({src:icon_close_light})
    close_window_btn.addEventListener('click', function() {
        notify( { active_state : 'active' } )
    });
    

    if(props.action_buttons){
        
        // adding additional actions wrapper
        const actions_wrapper = shadow.querySelector('.actions_wrapper')
        props.action_buttons.forEach((button) => {
            actions_wrapper.append(button);
        });

        // adding toggle button for action wrapper
        const actions_toggle_btn = sm_icon_button_alt({ src: icon_arrow_down_light, src_active: icon_arrow_up_light })
        actions_toggle_btn.classList.add('actions_toggle_btn')
        actions_toggle_btn.addEventListener('click', function() {
            shadow.querySelector('.window_bar_actions').classList.toggle('active');
        });

        window_bar_actions.append(actions_toggle_btn)

    }


    window_bar_actions.append(close_window_btn)


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        .window_bar{
            position: relative;
            z-index:2;
            height:30px;
            background-color: var(--primary_color);
            display:inline-flex;
            width:100%;
            justify-content: flex-start;
            background-size: 5px 5px;
            background-image:  repeating-linear-gradient(0deg, var(--bg_color), var(--bg_color) 2px, var(--primary_color) 2px, var(--primary_color));
            container-type: inline-size;
            border: 1px solid var(--primary_color);
            box-sizing: border-box;
        }

        .application_icon_wrapper{ 
            display:none;
        }

        .application_name{
            display:flex;
            align-items:center;
            min-height: 100%;
            width: max-content;
            color:var(--bg_color);
            padding: 0 10px;
            font-size:14px;
            letter-spacing: -1px;
            box-sizing:border-box;
            border: 1px solid var(--primary_color);
            background-color:var(--primary_color);
        }

        .window_bar_actions{
            margin-left: auto;
            display:flex;
        }
        .window_bar_actions.active .actions_wrapper{
            display:block;
        }
        .actions_wrapper{
            display:none;
            position: absolute;
            z-index:10;
            width: 100%;
            height:max-content;
            top:30px;
            right:0;
            background-color:var(--bg_color);
            // background-color:red;
            border: 1px solid var(--primary_color);
        }




        @container(min-width: 856px) {
            .application_icon_wrapper{ 
                display:block;
            }

            .actions_toggle_btn{
                display:none;
            }

            .actions_wrapper{
                display: flex;
                position: relative;
                top: unset;
                right: unset;
                height:100%;
                width:max-content;
                border: 0px;
            }
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/window_bar")
},{"_process":2,"buttons/sm_icon_button_alt":13,"buttons/sm_text_button":14,"my_theme":16,"path":1}]},{},[3]);
