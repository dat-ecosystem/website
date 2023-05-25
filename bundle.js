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
const home_page = require('..')

document.body.append(home_page())

},{"..":4}],4:[function(require,module,exports){
module.exports = home_page
const navbar = require('navbar')
const cover_app = require('app_cover')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function home_page () {

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})


    const navbar_component = navbar()
    const cover_application = cover_app()

    // adding a `main-wrapper` 
    const main = document.createElement('div')
    main.classList.add('main-wrapper')
    const style = document.createElement('style')
    style.textContent = get_theme()
    
    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0',
        opacity: `1`,
        backgroundImage: `radial-gradient(#A7A6A4 2px, #EEECE9 2px)`,
        backgroundSize: `16px 16px`
    });

    // Adding font link
    var link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('type', 'text/css')
    link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap')
    document.head.appendChild(link)
    
    main.append(cover_application,  style)
    main.adoptedStyleSheets = [sheet]
    shadow.append(navbar_component, main)
    return el

}


function get_theme(){
    return`
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
            font-family: Silkscreen;
        }
        .main-wrapper{
            padding:10px;
            
        }

        @media(min-width: 856px){
            .main-wrapper{
                padding:20px;
            }
        }

    `
}

},{"app_cover":5,"navbar":10}],5:[function(require,module,exports){
module.exports = cover_app

const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function cover_app () {

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

    const cover_window = window_bar({name:'Learn_about_us.pdf'}, listen)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

}




function get_theme(){
    return`
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }

        .app_cover{
            display:none;
        }

        .cover_wrapper{
            position:relative;
            height:300px;
            width:100%;
            display:flex;
            justify-content: center;
            align-items: center;
            background-image: radial-gradient(#A7A6A4 1px, #FFF 1px);
            background-size: 10px 10px;
            background-color:red;
            border: 1px solid var(--ac-4);
        }

        /* This covers background-image will change to an image */
        .cover_image{
            position: absolute;
            width:100%;
            height:100%;
            background-image: radial-gradient(red 1px, #FFF 1px);
            background-size: 10px 10px;
        }

        /* Cover image alignment */
        .content_wrapper{
            position: relative;
            z-index:1;
            color:red;
            text-align:center;
        }

    `
}
},{"window_bar":11}],6:[function(require,module,exports){

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
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }
        .icon_btn{
            display:flex;
            justify-content: center;
            align-items:center;
            height:40px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--ac-4);
            background-color: var(--white);
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
},{}],7:[function(require,module,exports){
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
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }
        .logo_button{
            width: 100%;
            height:40px;
            box-sizing:border-box;
            padding: 10px;
            display:flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            background-color: var(--ac-4);
            color: var(--white);
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
},{"_process":2,"path":1}],8:[function(require,module,exports){
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
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }
        .text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: 1.5714285714285714em;
            padding:10px 5px;
            height:40px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--ac-4);
            background-color: var(--white);
            color:var(--ac-4);
        }
        .text_button.active{
            background-color: var(--ac-1);
            color: var(--ac-4);
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],9:[function(require,module,exports){
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
    icon_pdf_reader: `${prefix}/icon_pdf_reader.svg`,
    icon_arrow_down: `${prefix}/icon_arrow_down.svg`,
    icon_arrow_up: `${prefix}/icon_arrow_up.svg`,
  }
}

module.exports = my_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/my_theme")
},{"_process":2,"path":1}],10:[function(require,module,exports){
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


function navbar(){

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

    // Change the src value of icon_button after it is declared
    nav_toggle_btn.src = icon_arrow_up;

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
        {element: icon_button({src:icon_theme}) }
    ] 
    for (const button_data of icon_btns) {
        const { element } = button_data
        element.classList.add('icon_btn')
    }
    const icon_btn_wrapper = shadow.querySelector('.icon_btn_wrapper')
    icon_btn_wrapper.append(...icon_btns.map(button_data => button_data.element))





    // shadow.append(navbar)
    shadow.adoptedStyleSheets = [sheet]
    return el

}


function get_theme(){
    return`
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }
        .navbar_wrapper{
            container-type: inline-size;
        }
        .navbar{
            display: block;
            width:100%;
            height:40px;
            overflow:hidden;
            border-bottom: 1px solid var(--ac-4);

            // background-color: #EEECE9;
            // opacity: 0.8;
            // background: repeating-linear-gradient( -45deg, #777674, #777674 9px, #EEECE9 9px, #EEECE9 45px );

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

        @container(min-width: 856px) {

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
},{"_process":2,"buttons/icon_button":6,"buttons/logo_button":7,"buttons/text_button":8,"my_theme":9,"path":1}],11:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = window_bar


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const icon_button = require('buttons/icon_button')
const text_button = require('buttons/text_button')
const my_theme = require('my_theme')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function window_bar (props, notify) {

    // Assigning all the icons
    const { img_src: { 
        icon_close_dark = `${prefix}/icon_close_dark.svg`,
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
        icon_arrow_down = `${prefix}/icon_arrow_down.svg`,
        icon_arrow_up = `${prefix}/icon_arrow_up.svg`
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
    const application_icon = icon_button({src:icon_pdf_reader})
    const application_icon_wrapper = shadow.querySelector('.application_icon_wrapper')
    application_icon_wrapper.append(application_icon)

    // adding close window button
    const window_bar_actions = shadow.querySelector('.window_bar_actions')
    const close_window_btn = icon_button({src:icon_close_dark})
    close_window_btn.addEventListener('click', function() {
        notify( { active_state : 'active' } )
    });
    

    // adding additional actions wrapper
    const actions_wrapper = shadow.querySelector('.actions_wrapper')
    const view_more_btn = text_button({text:'View more (20)'})
    const tell_me_more_btn = text_button({text:'TELL ME MORE'})
    actions_wrapper.append(tell_me_more_btn, view_more_btn)

    // adding toggle button for action wrapper
    const actions_toggle_btn = icon_button({ src: icon_arrow_down, src_active: icon_arrow_up })
    actions_toggle_btn.classList.add('actions_toggle_btn')
    actions_toggle_btn.addEventListener('click', function() {
        shadow.querySelector('.window_bar_actions').classList.toggle('active');
    });


    window_bar_actions.append(actions_toggle_btn, close_window_btn)


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
        }

        .window_bar{
            position: relative;
            z-index:2;
            height:40px;
            background-color: var(--ac-4);
            display:inline-flex;
            width:100%;
            justify-content: flex-start;
            background-size: 10px 10px;
            background-image:  repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF 2px, #293648 2px, #293648);
            container-type: inline-size;
            border: 1px solid var(--ac-4);
        }

        .application_icon_wrapper{ 
            display:none;
        }

        .application_name{
            display:flex;
            align-items:center;
            min-height: 100%;
            width: max-content;
            color:var(--white);
            padding: 0 10px;
            box-sizing:border-box;
            border: 1px solid var(--ac-4);
            background-color:var(--ac-4);
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
            top:40px;
            right:0;
            background-color:var(--white);
            // background-color:red;
            border: 1px solid var(--ac-4);
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
},{"_process":2,"buttons/icon_button":6,"buttons/text_button":8,"my_theme":9,"path":1}]},{},[3]);
