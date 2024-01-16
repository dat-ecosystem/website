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
module.exports = require('../../../src/node_modules/theme/dark-theme')
},{"../../../src/node_modules/theme/dark-theme":49}],4:[function(require,module,exports){
module.exports = require('../../../src/node_modules/theme/lite-theme')
},{"../../../src/node_modules/theme/lite-theme":50}],5:[function(require,module,exports){
(function (process,__filename,__dirname){(function (){
const desktop = require('..')
const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')
/******************************************************************************
  INITIALIZE PAGE
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
let current_theme = light_theme
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme(current_theme))
// ----------------------------------------
config().then(() => boot({ themes: { light_theme, dark_theme } }))
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)

  const html = document.documentElement
  const meta = document.createElement('meta')
  const favicon = document.createElement('link')
  html.setAttribute('lang', 'en')
  favicon.setAttribute('rel', 'icon')
  favicon.setAttribute('type', 'image/png')
  favicon.setAttribute('href', path('theme/assets/images/logo.png'))
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  const fonts = new CSSStyleSheet()
  // @TODO: use font api and cache to avoid re-downloading the font data every time
  const font1_url = path('theme/assets/fonts/Silkscreen-Regular.ttf')
  const font2_url = path('theme/assets/fonts/Silkscreen-Bold.ttf')
  fonts.replaceSync(`
  /* latin-ext */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(${font1_url}) format('truetype');
    unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  /* latin */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(${font1_url}) format('truetype');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  /* latin-ext */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(${font2_url}) format('truetype');
    unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  /* latin */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(${font2_url}) format('truetype');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  `)
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)
  document.adoptedStyleSheets = [fonts, sheet]
  document.head.append(meta, favicon)
  await document.fonts.ready // @TODO: investigate why there is a FOUC
}
/******************************************************************************
  PAGE BOOT
******************************************************************************/
async function boot (opts) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { page = 'CONSORTIUM', theme = 'dark_theme' } = opts
  const { light_theme, dark_theme } = opts.themes
  const themes = { light_theme, dark_theme }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.body
  const shopts = { mode: 'closed' }
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // desktop
    const on = { 'theme_change': on_theme }
    const protocol = use_protocol('desktop')({ state, on })
    const opts = { page, theme, themes }
    const element = await desktop(opts, protocol)
    shadow.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return

  function on_theme (message) {
    ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    sheet.replaceSync(get_theme(current_theme))
  }
}
function get_theme (opts) {
  return `
  :host {
    --bg_color: ${opts.bg_color};
    --bg_color_2: ${opts.bg_color_2};
    --bg_color_3: ${opts.bg_color_3};
    --alt_color: ${opts.alt_color};
    --dark: #000;
    --light:#fff;
    --ac-1: ${opts.ac_1};
    --ac-2: ${opts.ac_2};
    --ac-3: ${opts.ac_3};
    --primary_color: ${opts.primary_color};
    --highlight_color: ${opts.highlight_color};
    --img_robot_3: url(${opts.img_src.img_robot_3});
    --img_robot_2: url(${opts.img_src.img_robot_2});
  }`
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/page/page.js","/page")
},{"..":6,"_process":2,"theme/dark-theme":3,"theme/lite-theme":4}],6:[function(require,module,exports){
(function (process,__filename){(function (){
const home_page = require('home-page')
const dat_garden_page = require('dat-garden')
const timeline_page = require('timeline-page')
const projects_page = require('projects-page')
const consortium_page = require('consortium-page')
const terminal = require('terminal')
const navbar = require('navbar')
/******************************************************************************
  DESKTOP COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const default_opts = { page: 'HOME' }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = desktop
// ----------------------------------------
async function desktop (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  var current_theme
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { page, theme, themes } = opts
  const { light_theme, dark_theme } = themes
  current_theme = themes[theme]
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="desktop">
    <div class="navbar"></div>
    <div class="content"></div>
    <div class="shell"></div>
  </div>`
  // ----------------------------------------
  const navbar_sh = shadow.querySelector('.navbar').attachShadow(shopts)
  const content_sh = shadow.querySelector('.content').attachShadow(shopts)
  const terminal_sh = shadow.querySelector('.shell').attachShadow(shopts)
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const navigate = cache({
    HOME, PROJECTS, DAT_GARDEN, TIMELINE, CONSORTIUM
  })
  const widget = cache({ TERMINAL })
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // navbar
    const on = {
      'social': on_social,
      'handle_page_change': on_navigate_page,
      'handle_theme_change': on_theme,
      'toggle_terminal': on_toggle_terminal,
    }
    const protocol = use_protocol('navbar')({ state, on })
    const opts = { page, data: current_theme } // @TODO: SET DEFAULTS -> but change to LOAD DEFAULTS
    const element = navbar(opts, protocol)
    navbar_sh.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_social (message) {
    console.log('@TODO: open ', message.data)
  }
  function on_navigate_page (msg) {
    const { data: active_page } = msg
    const page = navigate(active_page)
    content_sh.replaceChildren(page)
  }
  function on_navigate (msg) {
    on_navigate_page(msg)
    const { data: active_page } = msg
    const nav_channel = state.net[state.aka.navbar]
    nav_channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'change_highlight',
      data: active_page
    })
    const content = shadow.querySelector('.content')
    content.scrollTop = 0
  }
  function on_theme () {
    current_theme = current_theme === light_theme ? dark_theme : light_theme
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'theme_change',
      data: current_theme
    })
  }
  function on_toggle_terminal () {
    const has_terminal = status.terminal
    status.terminal = !has_terminal
    const channel = state.net[state.aka.navbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'toggle_terminal',
    })
    if (has_terminal) return terminal_sh.replaceChildren()
    terminal_sh.append(widget('TERMINAL'))
  }
  function open_important_documents () {
    const consortium_channel = state.net[state.aka.consortium_page]
    consortium_channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'open_important_documents'
    })
  }
  function HOME () {
    const on = {
      'navigate': on_navigate,
      'open_important_documents': open_important_documents
    }
    const protocol = use_protocol('home_page')({ state, on })
    const opts = { data: current_theme }
    const element = home_page(opts, protocol)
    return element
  }
  function PROJECTS () {
    const on = {}
    const protocol = use_protocol('projects_page')({ state, on })
    const opts = { data: current_theme }
    const element = projects_page(opts, protocol)
    return element
  } 
  function DAT_GARDEN () {
    const on = {}
    const protocol = use_protocol('dat_garden_page')({ state, on })
    const opts = { data: current_theme }
    const element = dat_garden_page(opts, protocol)
    return element
  }
  function TIMELINE () {
    const on = {}
    const protocol = use_protocol('timeline_page')({ state, on })
    const opts = { data: current_theme }
    const element = timeline_page(opts, protocol)
    return element
  }
  function CONSORTIUM () {
    const on = {}
    const protocol = use_protocol('consortium_page')({ state, on })
    const opts = { data: current_theme }
    const element = consortium_page(opts, protocol)
    return element
  }
  function TERMINAL () {
    const on = {
      'toggle_terminal': on_toggle_terminal,
      'navigate': on_navigate,
    }
    const protocol = use_protocol('terminal')({ state, on })
    const opts = { data: current_theme }
    const element = terminal(opts, protocol)
    return element
  }
}
function get_theme (opts) {
  return`
    * { box-sizing: border-box; }
    :host {
      display: flex;
      flex-direction: column;
      font-family: Silkscreen;
      color: var(--primary_color);
      background-image: radial-gradient(var(--bg_color_3) 1px, var(--bg_color_2) 2px);
      background-size: 8px 8px;
      height: 100vh;
    }
    svg {
      fill: var(--bg_color_2);
    }
    .desktop {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      height:100%;
      overflow-x: scroll;
      scrollbar-width: none;
    }
    ::-webkit-scrollbar {
      display: none;
    }
    .shell {
      flex-grow: 1;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/desktop.js")
},{"_process":2,"consortium-page":26,"dat-garden":27,"home-page":29,"navbar":34,"projects-page":41,"terminal":46,"timeline-page":53}],7:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_about_us
// ----------------------------------------
function app_about_us (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: { 
    about_us_cover,
    icon_pdf_reader_solid = `${prefix}/icon_pdf_reader_solid.svg`,
  } } = data

  const content = require(`../data/data.json`).home.about_us

  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="about_us_window">
    <div class="windowbar"></div>
    <div class="about_us_wrapper">
      <div class="about_us_cover_image">
        <img src="${about_us_cover}"/>
      </div>
      <div class="content_wrapper">
        <div class="img"></div>
        <div class="title"> ABOUT US </div>
      </div>
    </div>
    <div class="about_us_desc">
    ${content} <span class="about_us_link">dat-ecosystem visualization</span> to explore the whole universe of dat projects and the relationships between them.
    </div>
  </div>`
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  const about_us_link = shadow.querySelector('.about_us_link')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state,
      'open_consortium_page': open_consortium_page
    }
    const protocol = use_protocol('windobar')({ state, on })
    const opts = {
      name:'Learn_about_us.pdf', 
      src: icon_pdf_reader_solid,
      action_buttons: [
        {text: 'IMPORTANT DOCUMENTS', action: 'open_consortium_page', activate: false}
      ],
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state ({ data }) {
      const { active_state } = data
      if (active_state === 'active') el.style.display = 'none'
    }
    async function open_consortium_page (message){
      open_page ('CONSORTIUM')
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'open_important_documents',
        data: ''
      })
    }
  }
  about_us_link.onclick = () => open_page ('PROJECTS')
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  async function open_page (page){
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'navigate',
      data: page
    })
  }
}
function get_theme () {
  return `
  * {
    box-sizing: border-box;
  }
  .about_us_window {
    display: flex;
    flex-direction: column;
  }
  .about_us_wrapper {
    position: relative;
    height: max-content;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 150px 0px;
    background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
    background-size: 10px 10px;
    background-color: red;
    border: 1px solid var(--primary_color);
    box-sizing: border-box;
    container-type: inline-size;
  }
  .about_us_wrapper .about_us_cover_image {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .about_us_wrapper .about_us_cover_image img {
    position: absolute;
    left: 50%;
    top: 50%;
    width: auto;
    height: 80%;
    transform: translate(-50%, -50%);
  }
  .about_us_wrapper .content_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    position: relative;
    z-index: 1;
    color: var(--primary_color);
    text-align: center;
  }
  .about_us_wrapper .content_wrapper .img{
    background-image: var(--img_robot_3);
    background-size: cover;
    background-position: center;
    width: 122px;
    height: 190px;
  }
  .about_us_wrapper .content_wrapper .title {
    font-size: 40px;
  }
  .about_us_desc {
    width: 100% !important;
    background-color: var(--bg_color);
    color: var(--primary_color);
    border: 1px solid var(--primary_color);
    padding: 10px;
    letter-spacing: -2px;
    line-height: 18px;
    font-size: 16px;
    margin-bottom: 30px;
  }
  .about_us_link {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }
  @container (min-width: 856px) {
    .about_us_wrapper .about_us_cover_image img {
      width: 100%;
      height: auto;
    }
  }

  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-about-us/app-about-us.js")
},{"../data/data.json":28,"_process":2,"window-bar":55}],8:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  APP COVER COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = cover_app
// ----------------------------------------
function cover_app (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const {img_src} = data
  const {
    banner_cover = `${prefix}/banner_cover.svg`,
    tree_character = `${prefix}/tree_character.png`,
    icon_pdf_reader_solid = `${prefix}/icon_pdf_reader_solid.svg`,
  } = img_src

  const content = require(`../data/data.json`).home.cover
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="cover_wrapper">
    <div class="windowbar"></div>
    <div class="cover_content">
      <div class="cover_image">
        <img src="${banner_cover}" />
      </div>
      <div class="content_wrapper">
        <img src="${tree_character}" />
        ALL UNDER ONE TREE
      </div>
    </div>
    <div class="cover_desc">
      <h3> Community for the next generation Web </h3>
      ${content}
    </div>
  </div>`
  const cover_wrapper = shadow.querySelector('.cover_wrapper')
  // ----------------------------------------
  const cover_desc = shadow.querySelector('.cover_desc')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {
    const on = {
      'toggle_active_state': toggle_active_state,
      'toggle_desc': toggle_desc
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'Cover.pdf',
      src: icon_pdf_reader_solid,
      action_buttons: [
      {text: 'TELL ME MORE', action: 'toggle_desc', toggle_able: true}
      ],
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') el.style.display = 'none'
    }
    async function toggle_desc (message){
      cover_desc.classList.toggle('active')
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .cover_content {
      position: relative;
      height: max-content;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100px 0px;
      background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
    }
    .cover_content .cover_image {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .cover_content .cover_image img {
      position: absolute;
      left: 50%;
      top: 50%;
      width: auto;
      height: 100%;
      transform: translate(-50%, -50%);
    }
    .content_wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
      color: var(--primary_color);
      text-align: center;
    }
    .cover_content .content_wrapper img {
      width: 400px;
      height: auto;
    }
    .cover_desc{
      margin-bottom: 30px;
      height: 0;
      overflow: hidden;
    }
    .cover_desc h3{
      margin-top: 0;
    }
    .cover_desc.active{
      height: auto;
      padding: 10px;
      width: 100% !important;
      background-color: var(--bg_color);
      color: var(--primary_color);
      border: 1px solid var(--primary_color);
      letter-spacing: -2px;
      line-height: 18px;
      font-size: 16px;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-cover/app-cover.js")
},{"../data/data.json":28,"_process":2,"window-bar":55}],9:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const sm_text_button = require('buttons/sm-text-button')
/******************************************************************************
  APP FOOTER COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_footer
// ----------------------------------------
function app_footer (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_pdf_reader_solid = `${prefix}/icon_pdf_reader_solid.svg`,
    img_robot_2 = `${prefix}/img_robot_2.png`,
    pattern_img_1 = `${prefix}/pattern_img_1.png`,
  } } = data
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="main_wrapper">
    <div class="windowbar"></div>
    <div class="footer_wrapper">
      <div class="robot_img_2">
        
        <div class="img"></div>
      </div>
      <div class="footer_info_wrapper">
        <div class="title"> Interested in learning more about the Dat Ecosystem? </div>
        <div class="desc"> Join our <a target="_blank" href="https://discord.gg/egsvGc9TkQ">chat</a> and discuss tech, society, funding and your project development with the community. But you can also subscribe to the newsletter updates! </div>
        <div class="apply_button"></div>
      </div>
    </div>
    <div class="pattern_img"><img src="${pattern_img_1}"></div>
  </div>`
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  const apply_button_shadow = shadow.querySelector('.apply_button').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // join_program_button
    const on = { 'click': click}
    const protocol = use_protocol('join_button')({ state, on })
    const opts = { activate: false, text: '<a style="display: block; width: 100%; text-decoration: none; color: var(--primary-color);" href="mailto:dat-ecosystem-subscribe@lists.riseup.net?subject=subscribe&body=You are subscribing to Dat ecosystem mailing list. We are glad to have you here! Each received newsletter will include an unsubscribe link, but you can always unsubscribe by sending an email to:%0D%0A%0D%0Amailto:dat-ecosystem-unsubscribe@lists.riseup.net" target="_blank"> Join the newsletter </a>' }
    const element = sm_text_button(opts, protocol)
    apply_button_shadow.append(element)
    async function click( message ){}
  }
  { // footer window
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('footer')({ state, on })
    const opts = { name: 'FOOTER.pdf', src: icon_pdf_reader_solid, data }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  async function toggle_active_state ({ data }) {
    const { active_state } = data
    if (active_state === 'active') el.style.display = 'none'
  }
}
function get_theme () {
  return `
    * { box-sizing: border-box; }
    .main_wrapper {
      box-sizing: border-box;
      position: relative;
      container-type: inline-size;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
    }
    .main_wrapper .footer_wrapper {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-start;
      padding: 20px 20px 0 0;
    }
    
    .main_wrapper .footer_wrapper .robot_img_2{
      width:180px;
    }
    .main_wrapper .footer_wrapper .robot_img_2 .img{
      background-image: var(--img_robot_2);
      background-size: cover;
      background-position: center;
      width: 180px;
      height:200px;
    }
    .main_wrapper .footer_wrapper .footer_info_wrapper{
      margin-bottom: 30px;
    }
    .main_wrapper .footer_wrapper .footer_info_wrapper .title {
      font-size: 40px;
      color: var(--primary_color);
      font-weight: 700;
      line-height: 36px;
      letter-spacing: -5px;
      margin-bottom: 10px;
    }
    .main_wrapper .footer_wrapper .footer_info_wrapper .desc {
      font-size: 16px;
      color: var(--primary_color);
      line-height: 14px;
      letter-spacing: -2px;
      margin-bottom: 30px;
    }
    .main_wrapper .pattern_img {
      display:none;
    }
    @container (min-width: 856px) {
      .main_wrapper {
        .footer_wrapper {
          gap: 40px;
          flex-direction: row;
          align-items: flex-end;
          width: 70%;
        }
      }
      .main_wrapper .pattern_img {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
      }
      .main_wrapper .pattern_img img {
        width: 300px;
        height: auto;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-footer/app-footer.js")
},{"_process":2,"buttons/sm-text-button":21,"window-bar":55}],10:[function(require,module,exports){
(function (process,__filename){(function (){
const svg_element = require('svg-element')
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_icon
// ----------------------------------------
function app_icon (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { source, label, circle, tick } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    'activate': activate,
    'deactivate': deactivate
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="app-icon">
    <div class="svg-element"></div>
    <div class="circle">${circle}</div>
    <div class="tick">${tick}</div>
    <span>${label}</span>
  </div>`
  const svg_shadow = shadow.querySelector('.svg-element').attachShadow(shopts)
  const tick_wrapper = shadow.querySelector('.tick')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {
    const on = {}
    const protocol = use_protocol('svg')({ state, on })
    const opts = { source }
    const element = svg_element(opts, protocol)
    svg_shadow.append(element)  
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  async function activate (){
    tick_wrapper.classList.add('active')
  }
  async function deactivate (){
    tick_wrapper.classList.remove('active')
  }
  
}
function get_theme () {
  return `
    .app-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      position: relative;
    }
    span {
      background-color: var(--bg_color_2);
      width: 150px;
      padding: 10px 0;
      text-align: center;
      word-wrap: break-word;
    }
    .circle, .tick.active{
      display: block;
      position: absolute;
      left: 45px;
      top: 40px;
    }
    .tick{
      display: none;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-icon/app-icon.js")
},{"_process":2,"svg-element":44}],11:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const project_card = require('project-card')
/******************************************************************************
  APP PROJECTS MINI COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_projects_mini
// ----------------------------------------
function app_projects_mini (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_folder_solid = `${prefix}/icon_folder_solid.svg`,
  } } = data

  let cards_data = require(`../data/data.json`).projects
  const projects_count = Object.keys(cards_data).length

  cards_data = cards_data.slice(0).sort(() => 0.5 - Math.random()).slice(0, 3)
  cards_data = cards_data.map(card => {
    card.data = data
    return card
  })
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="project_section">
    <div class="windowbar"></div>
    <div class="main_wrapper">
      <div class="windowbar"></div>
      <div class="project_wrapper"></div>
    </div>
  </div>`
  const project_wrapper = shadow.querySelector('.project_wrapper')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = { 
      'toggle_active_state': toggle_active_state,
      'open_project_page': open_project_page
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name:'OUR PROJECTS', 
      src: icon_folder_solid,
      action_buttons: [
        {text:`View more (${projects_count})`, action: 'open_project_page', activate: false}
      ],
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') el.style.display = 'none'
    }
    async function open_project_page (message){
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'navigate',
        data: 'PROJECTS'
      })
    }
  }
  { // project cards
    const on = {}
    function make_card (card_data, i) {
      const protocol = use_protocol(`project_${i}`)({ state, on })
      const opts = {project_data: card_data, data}
      const element = shadowfy()(project_card(opts, protocol))
      return element
    }
    const elements = cards_data.map(make_card)
    project_wrapper.append(...elements)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    .project_section {
      display: flex;
      flex-direction: column;
    }
    .main_wrapper {
      box-sizing: border-box;
      container-type: inline-size;
      width: 100%;
      height: 100%;
    }
    .main_wrapper * {
      box-sizing: border-box;
    }

    .main_wrapper .project_wrapper {
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */ 
      background-size: var(--s) var(--s);  
      border: 1px solid var(--primary_color);
      width: 100%;
      height: 100%;
      padding: 0px;
      display: grid;
      gap: 20px;
      grid-template-columns: 12fr;
      margin-bottom: 30px;
      box-sizing: border-box;
    }
    @container (min-width: 768px) {
      .main_wrapper .project_wrapper {
        grid-template-columns: repeat(2, 6fr);
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper .project_wrapper {
        grid-template-columns: repeat(3, 4fr);
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-projects-mini/app-projects-mini.js")
},{"../data/data.json":28,"_process":2,"project-card":39,"window-bar":55}],12:[function(require,module,exports){
(function (process,__filename){(function (){
const project_card = require('project-card')
const window_bar = require('window-bar')
const project_filter = require('project-filter')
const scrollbar = require('scrollbar')
/******************************************************************************
  APP PROJECTS COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_projects
// ----------------------------------------
function app_projects (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_discord = `${prefix}/icon_discord.png`,
    icon_twitter = `${prefix}/icon_twitter.png`,
    icon_github = `${prefix}/icon_github.png`,
    icon_folder_solid = `${prefix}/icon_folder_solid.svg`,
    project_logo_1 = `${prefix}/project_logo_1.png`,
  } } = data

  const cards_data = require(`../data/data.json`)['projects']
  const tags = new Set(cards_data.flatMap(card => card.project_tags))
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="main_wrapper">
    <div class="windowbar"></div>
    <div class="content_area">
      <div class="project_wrapper"></div>
    </div>
    <div class="filter_wrapper">
      <div class="filterbar"></div>
    </div>
  </div>`
  const content_area = shadow.querySelector('.content_area')
  const project_wrapper = shadow.querySelector('.project_wrapper')
  const main_wrapper = shadow.querySelector('.main_wrapper')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  const filterbar_shadow = shadow.querySelector('.filterbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = { 'toggle_active_state': toggle_active_state }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'OUR_PROJECTS',
      src: icon_folder_solid,
      data,
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { project_active_state } = message.data
      if (project_active_state === 'active') el.style.display = 'none'
    }
  }
  { // project cards
    const on = {}
    function make_card ({ on, state }) {
      return (card_data, i) => {
        const protocol = use_protocol(`card_${i}`)({ state, on })
        const opts = {project_data: card_data, data}
        const element = shadowfy()(project_card(opts, protocol))
        card_data.element = element
        return element
      }
    }
    project_wrapper.append(...cards_data.map(make_card({ on, state })))
    project_wrapper.onscroll = on_scroll
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down
    const opts1 = { data }
    const element = shadowfy()(scrollbar(opts1, protocol))
    content_area.append(element)
  }
  { // project filter
    const on = { 'value': on_value }
    const protocol = use_protocol('project_filter')({ state, on })
    const opts = { data, tags: Array.from(tags) }
    const element = project_filter(opts, protocol)
    filterbar_shadow.append(element)
  }

  function on_value (message) {
    setFilter(message.data)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  watch_scrollbar()

  return el

  function watch_scrollbar () {
    const channel = state.net[state.aka.scrollbar]
    ro.observe(main_wrapper)
  }
  function on_scroll (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  }
  function on_set_scroll (message) {
    console.log('set_scroll', message) 
    setScrollTop(message.data)
  }
  function onstatus (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { cause: message.head },
      type: 'update_size',
      data: {
        sh: project_wrapper.scrollHeight,
        ch: project_wrapper.clientHeight,
        st: project_wrapper.scrollTop
      }
    })
  }
  async function setScrollTop (value) {
    project_wrapper.scrollTop = value
  }
  async function setFilter (data) {
    status[data.filter] = data.value
    let cardfilter = [...cards_data]
    if (status.SEARCH) {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.project_name.toLowerCase().match(status.SEARCH.toLowerCase())
      })
    }
    if (status.STATUS && status.STATUS !== 'ALL') {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.project_active_state === status.STATUS && card_data
      })
    }
    if (status.TAGS && status.TAGS !== 'ALL') {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.project_tags.includes(status.TAGS) && card_data
      })
    }
    project_wrapper.replaceChildren(...cardfilter.map(({ element }) => element))
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_scroll'
    })
  }
}
function get_theme () {
  return `
    .content_area {
      display: flex;
    }
    .main_wrapper {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;
      border: 1px solid var(--primary_color);
    }
    .main_wrapper * {
      box-sizing: border-box;
    }
    .main_wrapper .filter_wrapper {
      width: 100%;
      height: 100%;
    }
    .project_wrapper {
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */  
      background-size: var(--s) var(--s);  
      border: 1px solid var(--primary_color);
      width: 100%;
      height: 400px;
      padding: 0px;
      display: grid;
      gap: 20px;
      grid-template-columns: 12fr;
      box-sizing: border-box;
      overflow: scroll;
      scrollbar-width: none; /* For Firefox */
    }
    .project_wrapper::-webkit-scrollbar {
      display: none;
    }
    @container (min-width: 768px) {
      .project_wrapper {
        grid-template-columns: repeat(2, 6fr);
      }
    }
    @container (min-width: 1200px) {
      .project_wrapper {
        grid-template-columns: repeat(3, 4fr);
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-projects/app-projects.js")
},{"../data/data.json":28,"_process":2,"project-card":39,"project-filter":40,"scrollbar":42,"window-bar":55}],13:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const timeline_card = require('timeline-card')
const scrollbar = require('scrollbar')
/******************************************************************************
  APP TIMELINE MINI COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_timeline_mini
// ----------------------------------------
function app_timeline_mini (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_folder_solid= `${prefix}/icon_folder_solid.svg`,
  } } = data
  let cards_data = require(`../data/data.json`).timeline
  const timeline_count = Object.keys(cards_data).length

  cards_data = [
    {
      title: 'interview series',
      date: 'May 3, 2023',
      time: '',
      link: 'https://blog.dat-ecosystem.org/staying-connected/',
      desc: 'video interviews launch',
      tags: ['presentation'],
      data,
      active_state: 'ACTIVE'
    },{
      title: 'dxos',
      date: 'May 15, 2023',
      time: '',
      link: 'https://dxos.org/',
      desc: 'dxos joins the ecosystem',
      tags: ['project'],
      data,
      active_state: 'ACTIVE'
    },{
      title: 'hyper-nostr',
      date: 'July 5, 2023',
      time: '',
      link: 'https://github.com/Ruulul/hyper-nostr',
      desc: 'hypercore-nostr relay is published and project joins the ecosystem',
      tags: ['project'],
      data,
      active_state: 'ACTIVE'
    },{
      title: 'demo & AMA sessions',
      date: 'August 27, 2023',
      time: '',
      link: 'https://blog.dat-ecosystem.org/tags/demo/',
      desc: 'demo sessions and AMA commm comm calls launch',
      tags: ['presentation'],
      data,
      active_state: 'ACTIVE'
    },{
      title: 'wizard amigos code camp',
      date: 'October 1, 2023',
      time: '',
      link: 'https://wizardamigos.com/codecamp2023/',
      desc: 'wizard amigos code camp is organized in Portugal',
      tags: ['event'],
      data,
      active_state: 'ACTIVE'
    },{
      title: 'new dat ecosystem web page is released',
      date: 'January 11, 2024',
      time: '',
      link: 'https://dat-ecosystem.org',
      desc: 'Dat ecosystem releases new web page',
      tags: ['organization'],
      data,
      active_state: 'ACTIVE'
    }
  ]

  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="timeline_section">
    <div class="windowbar"></div>
    <div class="main_wrapper">
      <div class="timeline_wrapper"></div>
    </div>
  </div>`
  const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
  const main_wrapper = shadow.querySelector('.main_wrapper')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = { 
      'toggle_active_state': toggle_active_state,
      'open_timeline_page': open_timeline_page
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name:'TIMELINE', 
      src: icon_folder_solid,
      action_buttons: [
        {text: `View more (${timeline_count})`, action: 'open_timeline_page', activate: false}
      ],
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') el.style.display = 'none'
    }
    async function open_timeline_page (message){
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'navigate',
        data: 'TIMELINE'
      })
    }
  }
  { // timeline cards
    const on = {}
    function make_card (card_data, i) {
      const protocol = use_protocol(`event_${i}`)({ state, on })
      const opts = card_data
      const element = shadowfy()(timeline_card(opts, protocol))
      return element
    }
    const elements = cards_data.map(make_card)
    timeline_wrapper.append(...elements)
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down  
    const scroll_opts = { data }
    const element = scrollbar(scroll_opts, protocol)

    const channel = state.net[state.aka.scrollbar]
    timeline_wrapper.onscroll = onscroll
    ro.observe(main_wrapper)

    main_wrapper.append(shadowfy()(element))

    function onscroll (event) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { },
        type: 'handle_scroll',
      })
    }
    function on_set_scroll (message) {
      console.log('set_scroll', message) 
      setScrollTop(message.data)
    }
    function onstatus (message) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: timeline_wrapper.scrollHeight,
          ch: timeline_wrapper.clientHeight,
          st: timeline_wrapper.scrollTop
        }
      })
    }
    function setScrollTop (value) {
      timeline_wrapper.scrollTop = value
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    .timeline_section {
      display: flex;
      flex-direction: column;
    }
    .main_wrapper {
      box-sizing: border-box;
      display: flex;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;
      border: 1px solid var(--primary_color);
    }
    .main_wrapper * { box-sizing: border-box; }
    .main_wrapper .timeline_wrapper {
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */ 
      background-size: var(--s) var(--s);  
      overflow: scroll;
      scrollbar-width: none; /* For Firefox */
      border: 1px solid var(--primary_color);
      width: 100%;
      height: 400px;
      padding: 0px;
      display: grid;
      gap: 20px;
      grid-template-columns: 12fr;
    }
    .timeline_wrapper::-webkit-scrollbar {
      display: none;
    }
    @container (min-width: 768px) {
      .main_wrapper .timeline_wrapper {
        grid-template-columns: repeat(2, 6fr);
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper .timeline_wrapper {
        grid-template-columns: repeat(3, 4fr);
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-timeline-mini/app-timeline-mini.js")
},{"../data/data.json":28,"_process":2,"scrollbar":42,"timeline-card":51,"window-bar":55}],14:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const timeline_card = require('timeline-card')
const timeline_filter = require('timeline-filter')
const year_filter = require('year-filter')
const month_filter = require('month-filter')
const scrollbar = require('scrollbar')
/******************************************************************************
  APP TIMELINE COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = app_timeline
// ----------------------------------------
function app_timeline (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    !visitor && setScrollTop(timeline_wrapper.scrollHeight)
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  status.YEAR = ''
  status.MONTH = ''
  status.DATE = ''
  status.cards = []
  status.separators = []
  status.years = []
  let dates = []
  let visitor = ''
  let cardfilter
  // ----------------------------------------
  // Local Storage
  // ----------------------------------------
  if (localStorage.getItem('visitedBefore')) {
    visitor = true // old
  } else {
    visitor = false // new
    localStorage.setItem('visitedBefore', 'true')
  }
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
      icon_folder_solid= `${prefix}/icon_folder_solid.svg`,
  } } = data

  let cards_data = require(`../data/data.json`)['timeline']
  cards_data = cards_data.map(card => {
      const date = new Date(card.date + ' ' + convert_time_format(card.time))
      if(!status.years.includes(date.getFullYear()))
        status.years.push(date.getFullYear())
      card.date_raw = date.getTime()
      card.data = data
      dates.push(card.date_raw)
      return card
    }).sort(function (a, b) {
      const dateA = new Date(a.date_raw)
      const dateB = new Date(b.date_raw)
      // // Compare years in ascending/descending order
      // if (dateA.getFullYear() !== dateB.getFullYear()) {
      //   return visitor ? dateB.getFullYear() - dateA.getFullYear() : dateA.getFullYear() - dateB.getFullYear()
      // }
      // If years are the same, compare dates in ascending/descending order
      return dateB.getTime() - dateA.getTime()
    })
  status.years_max = [...status.years]
  cardfilter = [...cards_data]
  const tags = new Set(cards_data.flatMap(card => card.tags))
  const card_groups = []
  let year_cache, card_group, prev_year
  status.YEAR = new Date(cards_data[0].date_raw).getFullYear()
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const PROTOCOL = {}
  const on = {}
  const channel = use_protocol('app_timeline')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="timeline_section">
    <div class="windowbar"></div>
    <div class="main_wrapper">
      <div class="filter_wrapper">
          <div class="month_wrapper">
            <div class="current_separator">
            </div>
            <div class="timeline_wrapper">
            </div>
            <div class="empty_wrapper">
              <div>
                No match found
              <div>
            </div>
          </div>
      </div>
    </div>
  </div>`
  const main_wrapper = shadow.querySelector('.main_wrapper')
  const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
  const filter_wrapper = shadow.querySelector('.filter_wrapper')
  const month_wrapper = shadow.querySelector('.month_wrapper')
  const empty_wrapper = shadow.querySelector('.empty_wrapper')
  const current_separator = shadow.querySelector('.current_separator')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = { 'toggle_active_state': toggle_active_state }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'TIMELINE', 
      src: icon_folder_solid,
      data: data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') el.style.display = 'none'
    }
  }
  var timeline_cards
  { // timeline cards
    const on = {}
    function make_card (card_data, i) {
      const protocol = use_protocol(`card_${i}`)({ state, on })
      const opts = card_data
      const element = shadowfy()(timeline_card(opts, protocol))          
      const slice = card_data.date.slice(-4)
      
      // if(i === Object.keys(cards_data).length - 1){
      //   const latest = visitor ? Math.min(...status.years) : Math.max(...status.years)
      //   let oldest = Number(year_cache) - 1
        
      //   while(visitor ? latest <= oldest : latest >= oldest){
      //     const separator = document.createElement('div')
      //     separator.innerHTML = oldest
      //     separator.classList.add('separator')
      //     card_groups.push(separator)
      //     visitor ? oldest-- : oldest++
      //   }
      // }
      if (year_cache !== slice) {
        const latest = Number(slice)
        let oldest = year_cache ? visitor ? Number(year_cache) - 1 : Number(year_cache) + 1 : Number(slice)
        
        while(visitor ? latest <= oldest : latest >= oldest){
          const separator = document.createElement('div')
          separator.innerHTML = oldest
          separator.classList.add('separator')
          status.separators.push(separator)
          card_groups.push(separator)
          visitor ? oldest-- : oldest++
        }
  
        card_group = document.createElement('div')
        card_group.classList.add('card_group')
        card_groups.push(card_group)
        year_cache = slice
      }
      card_group.append(element)
      element.idx = i
      return element
    }
    timeline_cards = cards_data.map(make_card)
    timeline_wrapper.append(...card_groups)
    timeline_wrapper.onscroll = onscroll
  }
  { // timeline filter
    const on = {
      'toggle_month_filter': toggle_month_filter,
      'toggle_year_filter': toggle_year_filter,
      'value': on_value,
      'set_filter': setFilter
    }
    const protocol = use_protocol('timeline_filter')({ state, on })
    const opts = {
      data, tags: Array.from(tags),
      latest_date: cards_data[0].date_raw
    }
    const element = shadowfy()(timeline_filter(opts, protocol))
    main_wrapper.append(element)
    function on_value (message) { setFilter(message.data) }
    async function toggle_month_filter (message) {
      if (month_wrapper.contains(month_filter_wrapper)) {
        month_wrapper.removeChild(month_filter_wrapper)
        timeline_wrapper.style.height = '500px'
      } else {
        month_wrapper.append(month_filter_wrapper)
        timeline_wrapper.style.height = '333px'
      }
    }
    async function toggle_year_filter (message) {
      if (filter_wrapper.contains(year_filter_wrapper)) {
        filter_wrapper.removeChild(year_filter_wrapper)
      } else filter_wrapper.append(year_filter_wrapper)
    }
  }
  var year_filter_wrapper
  { // year filter
    const on = { 'set_scroll': on_set_scroll }
    const protocol =  use_protocol('year_filter')({ state, on })
    
    const opts = {
      data, latest_year: Math.max(...status.years), oldest_year: Math.min(...status.years), visitor
    }
    year_filter_wrapper = shadowfy()(year_filter(opts, protocol))
    filter_wrapper.append(year_filter_wrapper)
    
    function on_set_scroll ({ data }) {
      set_scroll(data)
      updateCalendar()
    }
  }
  year_filter_wrapper.classList.add('year_filter_wrapper')
  var month_filter_wrapper
  { // month filter
    const on = { 'set_scroll': on_set_scroll, 'set_filter': setFilter }
    const protocol = use_protocol('month_filter')({ state, on })
    const opts = { data }
    month_filter_wrapper = shadowfy()(month_filter(opts, protocol))
    month_filter_wrapper.classList.add('month_filter_wrapper')
    function on_set_scroll ({ data }) {
      set_scroll(data)
      updateCalendar()
    }
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down
    const scroll_opts = { data }
    const element = shadowfy()(scrollbar(scroll_opts, protocol))
    filter_wrapper.append(element)

    const channel = state.net[state.aka.scrollbar]
    ro.observe(timeline_wrapper)
    function on_set_scroll (message) { setScrollTop(message.data) }
    function onstatus (message) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: timeline_wrapper.scrollHeight,
          ch: timeline_wrapper.clientHeight,
          st: timeline_wrapper.scrollTop
        }
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  updateCalendar()
  current_separator.innerHTML = visitor ? Math.max(...status.years) : Math.min(...status.years)
  return el

  function onscroll (event) {
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      type: 'handle_scroll'
    })
    let check = true
    const parent_top = timeline_wrapper.getBoundingClientRect().top
    status.separators.some(separator => {
      const child_top = separator.getBoundingClientRect().top
      if (child_top && child_top >= parent_top && child_top < parent_top + 10) {
        const year = separator.innerHTML
        status.YEAR = year
        updateCalendar()
        const channel = state.net[state.aka.year_filter]
        channel.send({
          head: [id, channel.send.id, channel.mid++],
          type: 'update_year_filter',
          data: year
        })
        check = false
        return true
      }
    })
    if (check)
      timeline_cards.some(card => {
        const { idx } = card
        const child_top = card.getBoundingClientRect().top
        if (child_top && child_top >= parent_top - 180 && child_top < parent_top + 40) {
          const year = cards_data[idx].date.slice(-4)
          status.YEAR = year
          updateCalendar()
          const channel = state.net[state.aka.year_filter]
          channel.send({
            head: [id, channel.send.id, channel.mid++],
            type: 'update_year_filter',
            data: year
          })
          return true
        }
      })
    const channel = state.net[state.aka.timeline_filter]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'update_timeline_filter',
      data: { month: status.MONTH , year: status.YEAR }
    })
    current_separator.innerHTML = status.YEAR
  }
  function convert_time_format (time) {
    let temp = time.slice(0, 2)
    if (time.includes('PM')) { temp = parseInt(temp) + 12 }
    return temp + time.slice(2, -2)
  }
  async function set_scroll (data) {
    if (data.filter === 'YEAR'){
      status[data.filter] = data.value
      status.separators.some(separator => {
        const year = separator.innerHTML
        if(year.includes(data.value)){
          setScrollTop(separator.getBoundingClientRect().top - timeline_wrapper.getBoundingClientRect().top + timeline_wrapper.scrollTop)
          return true
        }
      })
    }
    else if (data.value){
      status[data.filter] = data.value
      let check = true
      timeline_cards.some(card => {
        const { idx } = card
        const card_data = cards_data[idx]
        if(cardfilter.includes(card_data)){
          const card_date = card_data.date

          if (card_date.includes(data.value) && card_date.includes(status.YEAR)) {
            if(check && status.cards){
              setScrollTop(card.getBoundingClientRect().top - timeline_wrapper.getBoundingClientRect().top + timeline_wrapper.scrollTop)

              check = false
              status.cards.forEach(status_card => {
                status_card.classList.remove('active')
              })
              if(status.cards[0] === card){
                status.cards = []
                return true
              }
              status.cards = []
            }
            if(data.filter === 'DATE'){
              card.classList.add('active')
              status.cards.push(card)
            }
          }
          else if(!check){
            return true
          }
        }
      })
      const timeline_channel = state.net[state.aka.timeline_filter]
      timeline_channel.send({
        head: [id, timeline_channel.send.id, timeline_channel.mid++],
        type: 'update_timeline_filter',
        data: { month: status.MONTH , year: status.YEAR }
      })
    }
    else if(status.cards){
      status.cards.forEach(status_card => {value
        status_card.classList.remove('active')
      })
      status.cards = []
      return
    }
    
    
    const year_channel = state.net[state.aka.year_filter]
    year_channel.send({
      head: [id, year_channel.send.id, year_channel.mid++],
      type: 'update_year_filter',
      data: status.YEAR
    })

  }
  async function setScrollTop (value) {
    timeline_wrapper.scrollTop = value
  }
  async function setFilter (data) {
    status[data.filter] = data.value
    timeline_wrapper.innerHTML = ''
    cardfilter = [...cards_data]
    if (status.SEARCH) cardfilter = cardfilter.filter((card_data) => {
      return card_data.title.toLowerCase().match(status.SEARCH.toLowerCase())
    })
    if (status.STATUS && status.STATUS !== 'ALL') cardfilter = cardfilter.filter((card_data) => {
      return card_data.active_state === status.STATUS && card_data
    })
    if (status.TAGS && status.TAGS !== 'ALL') {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.tags.includes(status.TAGS) && card_data
      })
    }
    status.separators = []
    status.years = []
    const card_groups = []
    let year_cache, card_group
    
    timeline_cards.forEach((card, i) => {
      const { idx } = card
      const card_data = cards_data[idx]
      
      if(i === Object.keys(cards_data).length - 1){
        const latest = visitor ? Math.min(...status.years_max) : Math.max(...status.years_max)
        let oldest = year_cache ? visitor ? Number(year_cache) - 1 : Number(year_cache) + 1 : visitor ? Math.max(...status.years_max) : Math.min(...status.years_max)
        while(visitor ? latest <= oldest : latest >= oldest){
          const separator = document.createElement('div')
          separator.innerHTML = oldest
          separator.classList.add('separator')
          status.separators.push(separator)
          card_groups.push(separator)
          visitor ? oldest-- : oldest++
        }
      }
      if (cardfilter.includes(card_data)) {
        const date = new Date(card_data.date)
        if(!status.years.includes(date.getFullYear()))
          status.years.push(date.getFullYear())
        const slice = card_data.date.slice(-4)
        
        if (year_cache !== slice) {
          if(i < Object.keys(cards_data).length - 1){
            const latest = Number(slice)
            let oldest = year_cache ? visitor ? Number(year_cache) - 1 : Number(year_cache) + 1 :  visitor ? Math.max(...status.years_max) : Math.min(...status.years_max)
            
            while(visitor ? latest <= oldest : latest >= oldest){
              const separator = document.createElement('div')
              separator.innerHTML = oldest
              separator.classList.add('separator')
              status.separators.push(separator)
              card_groups.push(separator)
              visitor ? oldest-- : oldest++
            }
          }
        
          card_group = document.createElement('div')
          card_group.classList.add('card_group')
          card_groups.push(card_group)
          year_cache = slice
        }
        card_group.append(card)
      }
    })
    card_groups.forEach((card_group) => {
      timeline_wrapper.append(card_group)
    })
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_scroll'
    })
    if (!cardfilter[0]) return
    set_scroll({
      filter: 'YEAR',
      value: String(new Date(cardfilter[0].date_raw).getFullYear())
    })
    updateCalendar()
  }
  async function updateCalendar () {
    let dates = []
    if (status.YEAR) cardfilter.forEach(card_data => {
      if (card_data.date.includes(status.YEAR)) dates.push(card_data.date)
    })
    const channel = state.net[state.aka.month_filter]
    if(prev_year !== String(status.YEAR)){
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'update_calendar',
        data: {dates, year: Number(status.YEAR)}
      })
      prev_year = String(status.YEAR).slice(0)
      if(status.cards){
        status.cards.forEach(status_card => {
          status_card.classList.remove('active')
        })
        status.cards = []
      }
    }
    
  }
}
function get_theme () {
  return`
    .timeline_section {
      display: flex;
      flex-direction: column;
    }
    .main_wrapper {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;
    }
    .main_wrapper * {
      box-sizing: border-box;
    }
    .main_wrapper .filter_wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      border :1px solid var(--primary_color);
      }
    .main_wrapper .filter_wrapper .month_wrapper {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--primary_color);
      position: relative;
    }
    .main_wrapper .filter_wrapper .timeline_wrapper {
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */  
      background-size: var(--s) var(--s);
      border :1px solid var(--primary_color);
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 500px;
      overflow: scroll;
      gap: 20px;
      scrollbar-width: none; /* For Firefox */
    }
    .main_wrapper .filter_wrapper .timeline_wrapper.hide > div {
      display: none;
    }
    .main_wrapper .filter_wrapper .empty_wrapper {
      display: none;
      position: absolute;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      top: 0;
    }
    .main_wrapper .filter_wrapper .empty_wrapper > div {
      background-color: white;
    }
    .main_wrapper .filter_wrapper .empty_wrapper.active {
      display: flex;
    }
    .main_wrapper .filter_wrapper .timeline_wrapper .card_group {
      width: 100%;
      padding: 0px;
      display: grid;
      gap: 20px;
      grid-template-columns: 12fr;
      border: 4px solid transparent;
    }
    .main_wrapper .filter_wrapper .timeline_wrapper .card_group > .active{
      outline: 4px solid var(--ac-1);
    }
    .main_wrapper .filter_wrapper .timeline_wrapper::-webkit-scrollbar {
      display: none;
    }
    .main_wrapper .filter_wrapper .timeline_wrapper .separator{
      background-color: var(--ac-1);
      text-align: center;
      margin: 0 4px;
      border: 1px solid var(--primary_color);
      position: relative;
      z-index: 2;
    }
    .main_wrapper .filter_wrapper .month_wrapper .current_separator{
      position: absolute;
      display: block;
      top: 0;
      width: calc(100% - 9px);
      background-color: var(--ac-1);
      text-align: center;
      margin: 0 4px;
      border: 1px solid var(--primary_color);
      z-index: 1;
    }
    .main_wrapper .filter_wrapper .year_filter_wrapper{
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */  
      background-size: var(--s) var(--s);  
      border :1px solid var(--primary_color);
    }
    .month_filter_wrapper{
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */  
      background-size: var(--s) var(--s);  
      border: 1px solid var(--primary_color);
    }
    @container(min-width: 400px) {
      .main_wrapper .filter_wrapper .timeline_wrapper .card_group:last-child,
      .main_wrapper .filter_wrapper .timeline_wrapper .separator:last-child{
        margin-bottom: 300px;
      }
    }
    @container(min-width: 768px) {
      .main_wrapper .filter_wrapper .timeline_wrapper .card_group {
        grid-template-columns: repeat(2, 6fr);
      }
    }
    @container(min-width: 1200px) {
      .main_wrapper .filter_wrapper .timeline_wrapper .card_group {
        grid-template-columns: repeat(3, 4fr);
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app-timeline/app-timeline.js")
},{"../data/data.json":28,"_process":2,"month-filter":33,"scrollbar":42,"timeline-card":51,"timeline-filter":52,"window-bar":55,"year-filter":56}],15:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  DAY BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = day_button
// ----------------------------------------
// Props - icon/img src
function day_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { i } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    toggle_active,
    add_highlight,
    remove_highlight,
    toggle_visibility,
  }
  const up_channel = use_protocol('up')({ protocol, state, on })
  // const notify = protocol({ from: id }, listen)
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="day_button"></div>`
  const day_button = shadow.querySelector(".day_button")
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  shadow.append(day_button)
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  day_button.onclick = onclick

  return el

  function onclick (e) {
    toggle_active()
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'toggle_day_button',
    })
  }
  function toggle_active () {
    day_button.classList.toggle('active')
  }
  function add_highlight () {
    day_button.classList.add('highlight')
  }
  function remove_highlight () {
    day_button.classList.remove('highlight')
  }
  function toggle_visibility ({ data }) {
    ; data ? day_button.classList.remove('hide') : day_button.classList.add('hide')
  }
}
function get_theme () {
  return `
    .day_button {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      box-sizing: border-box;
      aspect-ratio: 1/1;
      cursor: pointer;
      border: 0px solid var(--primary_color);
      border-width: 0px 1px 1px 0px;
      background-color: var(--bg_color);
    }
    .day_button.highlight {
      background-color: var(--ac-2)
    }
    .day_button.active {
      background-color: var(--ac-1);
    }
    .day_button.hide{
      display: none;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/day-button.js")
},{"_process":2}],16:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  ICON BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = icon_button
// ----------------------------------------
function icon_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { src = '', src_active = '', activate = true, link = '' } = opts
  const $src = src // @TODO: make those subscribable signals
  const $src_acitve = src_active
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'activate': onactivate, 'inactivate': oninactivate }
  const channel = use_protocol('up')({ protocol, state,  on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]

  let icon_button
  if (link) {
    shadow.innerHTML = `<div class="icon_btn">
      <a target="_blank" href=${link}></a>
    </div>`
    icon_button = shadow.querySelector('.icon_btn a')
  } else {
    shadow.innerHTML = `<div class="icon_btn"> </div>`
    icon_button = shadow.querySelector('.icon_btn')
  }
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  const [svg_icon, svg_active] = Object.assign(document.createElement('div'), {
    innerHTML: `${src} ${src_active}` // svg icons
  }).children
  icon_button.append(svg_icon)
  // Toggle Icon
  icon_button.onclick = onclick
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function oninactivate () {
    state.status.active = false
    icon_button.classList.toggle('active', state.status.active)
    if (svg_active) icon_button.replaceChildren(svg_icon)
  }
  function onactivate () {
    if(activate){
      state.status.active = true
      icon_button.classList.toggle('active', state.status.active)
      if (svg_active) icon_button.replaceChildren(svg_active)
    }
  }
  function onclick (e) {
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'click'
    })
  }
}
function get_theme () {
  return `
    .icon_btn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      box-sizing: border-box;
      aspect-ratio: 1/1;
      cursor: pointer;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
    }
    .icon_btn svg {
      height: 25px;
      width: 25px;
      fill: var(--primary_color);
      pointer-events: none;
    }
    .icon_btn *{
      fill: var(--primary_color);
    }
    .icon_btn.active {
      background-color: var(--ac-2)
    }
    .icon_btn.active *{
      fill: var(--dark);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/icon-button.js")
},{"_process":2}],17:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  LOGO BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = logo_button
// ----------------------------------------
function logo_button (opts = default_opts) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  const prefix = ID.split('/').slice(0, -1).join('/')
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: { 
    logo
  } } = data
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="logo_button">
    <img src="${logo}" />
    <span> DAT ECOSYSTEM </span>
  </div>`
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    .logo_button {
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      background-color: var(--primary_color);
      color: var(--bg_color);
      font-size: 0.875em;
      letter-spacing: 0.25rem;
    }
    .logo_button img{
      width: 30px;
      aspect-ratio:1/1;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/logo-button.js")
},{"_process":2}],18:[function(require,module,exports){
(function (process,__filename){(function (){
const scrollbar = require('scrollbar')
/******************************************************************************
  SELECT BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = select_button
// ----------------------------------------
function select_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  let active_option = ''
  let active_state = true
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_arrow_down,
    icon_arrow_up
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div tabindex="0" class="select_button_wrapper bottom">
    <div class="option_wrapper">
      <div class="option_scrollbar_wrapper">
        <div class="option active">ALL</div>
        ${opts.choices.map(choice => `<div class="option">${choice}</div>`).join('')}
      </div>
    </div>
    <div class="button_wrapper">
      <span class="button_name">${opts.name}: </span>
      <span class="selected_option">${'ALL'}</span>
      <span class="arrow_icon">
        ${icon_arrow_up}
      </span>
    </div>
  </div>`
  const select_button_wrapper = shadow.querySelector('.select_button_wrapper')
  const select_toggle_btn = shadow.querySelector('.button_wrapper')
  const options = shadow.querySelectorAll('.option')
  const selected_option = shadow.querySelector('.selected_option')
  const option_wrapper = shadow.querySelector('.option_wrapper')
  const option_scrollbar_wrapper = shadow.querySelector('.option_scrollbar_wrapper')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  select_toggle_btn.onclick = (e) => {
    select_button_wrapper.classList.toggle('active')
    shadow.querySelector('.arrow_icon').innerHTML = active_state ? icon_arrow_down : icon_arrow_up
    active_state = !active_state
  }
  select_button_wrapper.onblur = (e) => {
    setTimeout(() => {
      select_button_wrapper.classList.remove('active')
      shadow.querySelector('.arrow_icon').innerHTML = icon_arrow_up
      active_state = true
    }, 200);
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down
    const opts1 = { data }
    const element = shadowfy()(scrollbar(opts1, protocol))
    option_wrapper.append(element)
    option_scrollbar_wrapper.onscroll = on_scroll
  }
  // select_toggle_btn.addEventListener('click', function() {
  //   shadow.querySelector('.select_button_wrapper').classList.toggle('active')
  // })
  // Use event delegation
  // document.addEventListener('click', (e) => {
  //   console.log(e.target.className)
  // })
  // Select all .option divs
  // Attach click event listener to each .option div
  options.forEach((option) => {
    option.addEventListener('click', () => {
      shadow.querySelector('.arrow_icon').innerHTML = active_state ? icon_arrow_down : icon_arrow_up
      active_state = !active_state

      if (active_option) active_option.classList.remove('active')
      if (active_option === option) {
        selected_option.innerHTML = 'ALL'
        active_option = options[0]
        options[0].classList.add('active')
      }
      else {
        option.classList.add('active')
        selected_option.innerHTML = option.innerHTML
        active_option = option
      }
      select_button_wrapper.classList.remove('active')
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'value',
        data: { filter: opts.name, value: selected_option.innerHTML }
      })
    })
  })
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  active_option = options[0]
  watch_scrollbar()

  return el

  function watch_scrollbar () {
    const channel = state.net[state.aka.scrollbar]
    ro.observe(option_scrollbar_wrapper)
  }
  function on_scroll (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  }
  function on_set_scroll (message) {
    console.log('set_scroll', message) 
    setScrollTop(message.data)
  }
  function onstatus (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { cause: message.head },
      type: 'update_size',
      data: {
        sh: option_scrollbar_wrapper.scrollHeight,
        ch: option_scrollbar_wrapper.clientHeight,
        st: option_scrollbar_wrapper.scrollTop
      }
    })
  }
  async function setScrollTop (value) {
    option_scrollbar_wrapper.scrollTop = value
  }
}
function get_theme () {
  return `
    .select_button_wrapper {
      box-sizing: border-box;
      position: relative;
      z-index: 100;
      width: 100%;
      min-width:150px;
      height: 30px;
      font-size: 0.875em;
      line-height: 1.5em;
      background-color: var(--bg_color);
    }
    .select_button_wrapper.bottom .option_wrapper {
      bottom: 30px;
      left: 0px;
    }
    .select_button_wrapper.top .option_wrapper {
      /* top: 40px; */
      left: 0px;
    }
    .select_button_wrapper.active .option_wrapper{ display: flex !important; }
    .select_button_wrapper.active .option_wrapper .button_wrapper{ border: 2px solid var(--ac-1); }
    .select_button_wrapper .option_wrapper {
      position: absolute;
      display: none;
      box-sizing: border-box;
      height: max-content;
      max-height: 400px;
      width: 100%;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      word-break: break-all;
    }
    
    .select_button_wrapper .option_wrapper .option {
      box-sizing: border-box;
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 10px 5px;
      cursor: pointer;
      word-break: break-all;
      background-color: var(--bg_color);
      overflow: hidden;
    }
    .select_button_wrapper .option_wrapper .option.active {
      background-color: var(--ac-1);
      color: var(--primary_color);
    }
    .select_button_wrapper .option_wrapper .option:hover {
      filter: brightness(0.8);
    }
    .select_button_wrapper .button_wrapper {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 5px;
      cursor: pointer;
      height: 30px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
    }
    .select_button_wrapper .button_wrapper .button_name { 
      display: flex;
      vertical-align: middle;
      font-weight: 700;
      line-height: 15px;
      letter-spacing: -1px;
    }
    .select_button_wrapper .button_wrapper .selected_option { 
      display: flex;
      vertical-align: middle;
      font-weight: 300;
      line-height: 15px;
      letter-spacing: -1px;
      word-break: normal;
    }
    .select_button_wrapper .button_wrapper .arrow_icon {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
    .select_button_wrapper .button_wrapper .arrow_icon svg * {
      fill: var(--primary_color);
    }
    .option_scrollbar_wrapper{
      height: max-content;
      max-height: 200px;
      min-height: 100px;
      overflow-y: scroll;
      scrollbar-width: none;
      width: 100%;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
    }
    .select_button_wrapper .option_scrollbar_wrapper::-webkit-scrollbar {
      display: none;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/select-button.js")
},{"_process":2,"scrollbar":42}],19:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  SM ICON BUTTON ALT COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { toggle: false }
// ----------------------------------------
module.exports = sm_icon_button_alt
// ----------------------------------------
// opts - icon/img src
function sm_icon_button_alt (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  let active_state = true
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  let { toggle, src, src_active } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state , on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:'closed' })
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="sm_icon_button_alt">${src}</div>`
  const sm_icon_button_alt = shadow.querySelector('.sm_icon_button_alt')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  sm_icon_button_alt.onclick = onclick
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function onclick (e) {
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'click',
      data: { active_state }
    })
    if (!toggle) return
    if (src_active) sm_icon_button_alt.innerHTML = active_state ? src_active : src
    sm_icon_button_alt.classList.toggle('active', active_state)
    active_state = !active_state
  }
}
function get_theme () {
  return `
    .sm_icon_button_alt {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      box-sizing: border-box;
      aspect-ratio: 1/1;
      cursor: pointer;
      border: 1px solid var(--bg_color);
      background-color: var(--primary_color);
    }
    .sm_icon_button_alt.active {
      background-color: var(--ac-2)
    }
    .sm_icon_button_alt svg, .sm_icon_button_alt svg * {
      fill: var(--bg_color);
      pointer-events:none;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/sm-icon-button-alt.js")
},{"_process":2}],20:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
 SM ICON BUTTON COMPONENT
 ******************************************************************************/
 // ----------------------------------------
 // MODULE STATE & ID
 var count = 0
 const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
 const ID = dir.slice(cwd.length)
 const STATE = { ids: {}, net: {} } // all state of component module
 // ----------------------------------------
 const sheet = new CSSStyleSheet
 sheet.replaceSync(get_theme())
 const default_opts = { }
 const shopts = { mode: 'closed' }
 // ----------------------------------------
 module.exports = sm_icon_button
 // ----------------------------------------
 function sm_icon_button (opts = default_opts, protocol) {
   // ----------------------------------------
   // ID + JSON STATE
   // ----------------------------------------
   const id = `${ID}:${count++}` // assigns their own name
   const status = {}
   const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
   const cache = resources({})
   let activeState = true
   // ----------------------------------------
   // OPTS
   // ----------------------------------------
   let { src, src_active, activate, link } = opts
   // ----------------------------------------
   // PROTOCOL
   // ----------------------------------------
   const on = {}
   const channel = use_protocol('up')({ protocol, state , on })
   // ----------------------------------------
   // TEMPLATE
   // ----------------------------------------
   const el = document.createElement('div')
   const shadow = el.attachShadow(shopts)
   shadow.adoptedStyleSheets = [sheet]
   ; link ? shadow.innerHTML = `<div class="sm_icon_button">
     <a target="_blank" href=${link}>${src}</a>
   </div>` :
    shadow.innerHTML = `<div class="sm_icon_button">${src}</div>` 
   const sm_icon_button = shadow.querySelector(".sm_icon_button")
   // ----------------------------------------
   // ELEMENTS
   // ----------------------------------------
   sm_icon_button.onclick = toggle_class
   // ----------------------------------------
   // INIT
   // ----------------------------------------
 
   return el
 
   function toggle_class (e) {
     if (activate) {
       if (src_active) {
         sm_icon_button.innerHTML = activeState ? src_active: src
         activeState = !activeState
       }
       let selector = e.target.classList
       selector.toggle('active', !selector.contains('active'))  
     }
     channel.send({
       head: [id, channel.send.id, channel.mid++],
       type: 'click'
     })
   }
 }
 function get_theme () {
   return `
     .sm_icon_button {
       display: flex;
       justify-content: center;
       align-items: center;
       height: 30px;
       box-sizing: border-box;
       aspect-ratio: 1/1;
       cursor: pointer;
       border: 1px solid var(--primary_color);
       background-color: var(--bg_color);
     }
     .sm_icon_button.active {
       background-color: var(--ac-2)
     }
     .sm_icon_button svg, .sm_icon_button svg * {
       pointer-events:none;
       fill: var(--primary_color);
     }
   `
 }
 // ----------------------------------------------------------------------------
 function shadowfy (props = {}, sheets = []) {
   return element => {
     const el = Object.assign(document.createElement('div'), { ...props })
     const sh = el.attachShadow(shopts)
     sh.adoptedStyleSheets = sheets
     sh.append(element)
     return el
   }
 }
 function use_protocol (petname) {
   return ({ protocol, state, on = { } }) => {
     if (petname in state.aka) throw new Error('petname already initialized')
     const { id } = state
     const invalid = on[''] || (message => console.error('invalid type', message))
     if (protocol) return handshake(protocol(Object.assign(listen, { id })))
     else return handshake
     // ----------------------------------------
     // @TODO: how to disconnect channel
     // ----------------------------------------
     function handshake (send) {
       state.aka[petname] = send.id
       const channel = state.net[send.id] = { petname, mid: 0, send, on }
       return protocol ? channel : Object.assign(listen, { id })
     }
     function listen (message) {
       const [from] = message.head
       const by = state.aka[petname]
       if (from !== by) return invalid(message) // @TODO: maybe forward
       console.log(`[${id}]:${petname}>`, message)
       const { on } = state.net[by]
       const action = on[message.type] || invalid
       action(message)
     }
   }
 }
 // ----------------------------------------------------------------------------
 function resources (pool) {
   var num = 0
   return factory => {
     const prefix = num++
     const get = name => {
       const id = prefix + name
       if (pool[id]) return pool[id]
       const type = factory[name]
       return pool[id] = type()
     }
     return Object.assign(get, factory)
   }
 }
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/sm-icon-button.js")
},{"_process":2}],21:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  SM TEXT BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = sm_text_button
// ----------------------------------------
function sm_text_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data, text, activate = true } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state , on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="sm_text_button"> 
    ${text}
  </div>`
  let sm_text_button = shadow.querySelector('.sm_text_button')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  sm_text_button.onclick = toggle_class
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function toggle_class (e) {
    if(activate){
      let selector = e.target.classList
      selector.toggle('active', !selector.contains('active'))
    }
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'click',
      data: ''
    })
  }
}
function get_theme () {
  return `
    .sm_text_button {
      text-align: center;
      font-size: 0.875em;
      line-height: .5em;
      padding: 10px 5px;
      height: 30px;
      box-sizing: border-box;
      width: 100%;
      cursor: pointer;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
      color: var(--primary_color);
    }
    .sm_text_button.active{
      background-color: var(--ac-1);
      color: var(--primary_color);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/sm-text-button.js")
},{"_process":2}],22:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  TAB BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { name: '' }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = tab_button
// ----------------------------------------
function tab_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { img_src : {
    icon_close_dark = `${prefix}/icon_close_dark.svg`,
  }} = opts.data
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'activate': toggle_class, 'inactivate': toggle_class }
  const up_channel = use_protocol('up')({ protocol, state , on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="tab_button">
    <div class="text_wrapper"> ${opts.name} </div>
    <div class="close_button"> ${icon_close_dark} </div>
  </div>`
  const tab_button = shadow.querySelector('.tab_button')
  const text_wrapper = shadow.querySelector('.text_wrapper')
  const close_btn = shadow.querySelector('.close_button')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  text_wrapper.onclick = onclick
  close_btn.onclick = onclose
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  toggle_class({ type: 'activate' })

  return el

  function toggle_class ({ type }) {
    const mode = type === 'activate'
    tab_button.classList.toggle('active', mode)
  }
  function onclose (event) {
    el.remove()
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'close'
    })
  }
  function onclick (e) {
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'click'
    })
  }
}
function get_theme () {
  return `
    .tab_button {
      display: flex;
      cursor: pointer;
      box-sizing: border-box;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
      color: var(--primary_color);
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      height: 30px;
      width: 100%;
    }
    .tab_button .text_wrapper {
      text-align: center;
      font-size: 0.875em;
      line-height: .5em;
      padding: 12px 0;
      height :30px;
      box-sizing: border-box;
      width: 90px;
    }
    .tab_button .close_button {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tab_button.active {
      background-color: var(--primary_color);
      color: var(--bg_color);
    }
    .tab_button.active svg path {
      fill: var(--bg_color)
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/tab-button.js")
},{"_process":2}],23:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  TEXT BUTTON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = text_button
// ----------------------------------------
function text_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { text } = opts
  const $text = text // @TODO: make it subscribable signals
  // make it a signal: load initial + listen updates
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'activate': onactivate, 'inactivate': oninactivate }
  const channel = use_protocol('up')({ protocol, state , on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="text_button">${$text}</div>`
  const text_button = shadow.querySelector('.text_button')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  text_button.onclick = toggle_class
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function oninactivate (message) {
    state.status.active = false
    text_button.classList.toggle('active', state.status.active)
  }
  function onactivate (message) {
    state.status.active = true
    text_button.classList.toggle('active', state.status.active)
  }
  function toggle_class (e) {
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'click'
    })
  }
}
function get_theme () {
  return `
    .text_button {
      text-align: center;
      font-size: 0.875em;
      line-height: 1.5714285714285714em;
      padding: 10px 5px;
      height: 40px;
      box-sizing: border-box;
      width: 100%;
      cursor: pointer;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
      color: var(--primary_color);
    }
    .text_button.active {
      background-color: var(--ac-1);
      color: var(--primary_color);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/text-button.js")
},{"_process":2}],24:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = year_button
// ----------------------------------------
function year_button (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data, latest_date } = opts
  const { img_src : {
    icon_arrow_up= `${prefix}/icon_arrow_up.svg`,
  }} = data
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'update_label': on_update_label }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  const date = new Date(latest_date)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="year_button active">
    <div class="text_wrapper">${date.getFullYear()}</div>
    ${icon_arrow_up}
  </div>`
  const year_button = shadow.querySelector('.year_button')
  const text_wrapper = shadow.querySelector('.text_wrapper')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  year_button.onclick = toggle_class
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function toggle_class (e) {
    const bool = year_button.classList.toggle('active')
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'click',
      data: bool
    })
  }
  function on_update_label (message) {
    const { data } = message
    // if (data.month || data.year) text_wrapper.innerHTML = `<b>${data.month.slice(0,3)}</b>${data.month && data.year && '/'}${data.year}`
    // else text_wrapper.innerHTML = 'Select date'
    text_wrapper.innerHTML = data.year
  }
}
function get_theme () {
  return `
    .year_button {
      display: flex;
      cursor: pointer;
      box-sizing: border-box;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
      color: var(--primary_color);
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      height: 30px;
      width: 100%;
    }
    .year_button svg *{
      fill: var(--primary_color);
    }
    .year_button.active{
      background-color:var(--ac-1);
    }
    .year_button.active svg {
      rotate: 90deg;
    }
    .year_button .text_wrapper {
      text-align: center;
      font-size: 0.875em;
      line-height: .5em;
      padding: 11px 0;
      height: 30px;
      box-sizing: border-box;
      width: 100px;
      letter-spacing: -1px;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons/year-button.js")
},{"_process":2}],25:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  COMING SOON COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = commingsoon
// ----------------------------------------
function commingsoon (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    banner_cover = `${prefix}/banner_cover.svg`,
    tree_character = `${prefix}/tree_character.png`,
    icon_pdf_reader_solid = `${prefix}/icon_pdf_reader_solid.svg`,
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
  <div class="cover_wrapper">
    <div class="windowbar"></div>
    <div class="cover_content">
      <div class="cover_image">
        <img src="${banner_cover}" />
      </div>
      <div class="content_wrapper">
        <img src="${tree_character}" />
        Coming Soon
      </div>
    </div>
  </div>`
  const cover_wrapper = shadow.querySelector('.cover_wrapper')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = { 'toggle_active_state': toggle_active_state }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'post-growth-program.pdf', 
      src: icon_pdf_reader_solid,
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') el.style.display = 'none'
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .cover_content {
      position: relative;
      height: max-content;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100px 0px;
      background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
    }
    /* This covers background-image will change to an image */
    .cover_content .cover_image {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .cover_content .cover_image img {
      position: absolute;
      left: 50%;
      top: 50%;
      width: auto;
      height: 100%;
      transform: translate(-50%, -50%);
    }
    /* Cover image alignment */
    .cover_content .content_wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
      color: var(--primary_color);
      text-align: center;
    }
    .cover_content .content_wrapper img {
      width: 400px;
      height: auto;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/comingsoon/comingsoon.js")
},{"_process":2,"window-bar":55}],26:[function(require,module,exports){
(function (process,__filename){(function (){
const mission_statement = require('manifesto/manifesto')
const important_documents = require('important-documents')
const our_members = require('our-members')
const our_alumni = require('our-alumni/our-alumni')
const tools = require('tools')
const app_icon = require('app-icon')
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = consortium_page
// ----------------------------------------
function consortium_page (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  status.windows = {}
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  // Image data
  const { data } = opts
  const { img_src } = data
  const {
    icon_pdf_reader,
    icon_folder,
    circle,
    tick
  } = img_src
  const icons_data = [{
    name: 'manifesto',
    type: '.md',
    img: icon_pdf_reader,
  },{
    name: 'important_documents',
    type: '.md',
    img: icon_pdf_reader,
  },{
    name: 'our_members',
    type: '.md',
    img: icon_pdf_reader,
  },{
    name: 'our_alumni',
    type: '.md',
    img: icon_pdf_reader,
  },{
    name: 'tools',
    type: '/', // folder
    img: icon_folder,
  }]
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    'open_important_documents': open_important_documents
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="main_wrapper">
    <div class="icon_wrapper"></div>
    <div class="popup_wrapper">
      <div class="mini_popup_wrapper"></div>
    </div>
  </div>`
  const popup_wrapper = shadow.querySelector('.popup_wrapper')
  const mini_popup_wrapper = shadow.querySelector('.mini_popup_wrapper')
  const icon_wrapper = shadow.querySelector('.icon_wrapper')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // desktop icons
    const on = {}
    function make_element (icon_data, i) {
      const { name, type, img: source } = icon_data
      const label = `${name}${type}`
      const protocol = use_protocol(label)({ state, on })
      const opts = { source, label, circle, tick }
      const element = shadowfy()(app_icon(opts, protocol))
      const onclick = show(label)
      element.ondblclick = onclick // () => {PROTOCOLS['notify_'+window]()}
      element.ontouchend = onclick // () => {PROTOCOLS['notify_'+window]()}
      return element
      function show () {
        return event => {
          const channel = state.net[state.aka[name]]
          setScrollTop(status.windows[name].getBoundingClientRect().top - popup_wrapper.getBoundingClientRect().top + popup_wrapper.scrollTop)
          channel.send({
            head: [id, channel.send.id, channel.mid++],
            type: 'show'
          })
          const icon_channel = state.net[state.aka[label]]
          icon_channel.send({
            head: [id, icon_channel.send.id, icon_channel.mid++],
            type: 'activate'
          })
        }
      }
    }
    const elements = icons_data.map(make_element)
    icon_wrapper.append(...elements)
  }
  const program = cache({
    'HOME': () => home_page({ data: current_theme }, use_protocol('home_page')({ state })),
    'PROJECTS': () => projects_page({ data: current_theme }, use_protocol('projects_page')({ state })),
    'GROWTH PROGRAM': () => growth_page({ data: current_theme }, use_protocol('growth_page')({ state })),
    'TIMELINE': () => timeline_page({ data: current_theme }, use_protocol('timeline_page')({ state })),
    'CONSORTIUM': () => consortium_page({ data: current_theme }, use_protocol('consortium_page')({ state })),
  })
  { // important documents
    const { name: petname } = important_documents
    const on = {
      'deactivate_tick': deactivate_tick
    }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { data }
    const element = shadowfy()(important_documents(opts, protocol))
    status.windows[petname] = element
    mini_popup_wrapper.append(element)
  }
  { // our members
    const { name: petname } = our_members
    const on = {
      'deactivate_tick': deactivate_tick
    }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { data }
    const element = shadowfy()(our_members(opts, protocol))
    status.windows[petname] = element
    mini_popup_wrapper.append(element)
  }
  { // our alumni
    const { name: petname } = our_alumni
    const on = {
      'deactivate_tick': deactivate_tick
    }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { data }
    const element = shadowfy()(our_alumni(opts, protocol))
    status.windows[petname] = element
    mini_popup_wrapper.append(element)
  }
  { // tools
    const { name: petname } = tools
    const on = {
      'deactivate_tick': deactivate_tick
    }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { data }
    const element = shadowfy()(tools(opts, protocol))
    status.windows[petname] = element
    mini_popup_wrapper.append(element)
  }
  { // mission statement
    const { name: petname } = mission_statement
    const on = {
      'deactivate_tick': deactivate_tick
    }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { data }
    const element = shadowfy()(mission_statement(opts, protocol))
    status.windows[petname] = element
    popup_wrapper.append(element)
    // @TODO: why popup_wrapper vs. mini_popup_wrapper ?
    // @TODO: separate data from programs!
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  const icon_labels = ['manifesto.md', 'important_documents.md']
  icon_labels.forEach(label => {
    const icon_channel = state.net[state.aka[label]]
    icon_channel.send({
      head: [id, icon_channel.send.id, icon_channel.mid++],
      type: 'activate'
    })
      
  })

  return el


  async function open_important_documents () {
    icons_data.forEach(icon => {
      const channel = state.net[state.aka[icon.name]]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'hide'
      })
    })
    const channel = state.net[state.aka.important_documents]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'show'
    })
  }
  async function setScrollTop (value) {
    popup_wrapper.scrollTop = value
  }
  async function deactivate_tick ({ data }) {
    const icon_channel = state.net[state.aka[data]]
    icon_channel.send({
      head: [id, icon_channel.send.id, icon_channel.mid++],
      type: 'deactivate'
    })
  }
}
function get_theme () {
  return `
    .main_wrapper {
      box-sizing: border-box;
      container-type: inline-size;
      display: flex;
      gap: 20px;
      justify-content: space-between;
      margin: 0;
      padding: 30px 10px;
      opacity: 1;
      background-size: 16px 16px;
      position: relative;
    }
    .main_wrapper .icon_wrapper {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      gap: 25px;
      width: fit-content;
      height: fit-content;
      align-items: center;
      user-select: none;
      position:sticky;
      top:30px;
    }
    .main_wrapper .icon_wrapper:hover {
      cursor: pointer;
    }
    .main_wrapper .popup_wrapper {
      display: inline;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 20;
      overflow: scroll;
      max-height: 88vh;
    }
    .main_wrapper .popup_wrapper::-webkit-scrollbar {
      display: none;
    }
    .main_wrapper .popup_wrapper .mini_popup_wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    @container (min-width: 510px) {
      .main_wrapper .icon_wrapper {
        flex-direction: column;
      }
      .main_wrapper .main_wrapper {
        flex-direction: row;
      }
      .main_wrapper .popup_wrapper {
        display: flex;
        flex-direction: column;
        position: relative;
        top: 0;
      }
    }
    @container (min-width: 768px) {
      .main_wrapper .popup_wrapper {
        padding-left: 100px;
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper .popup_wrapper {
        flex-direction: row;
        gap: 20px;
        padding-left: 200px;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/consortium-page/consortium-page.js")
},{"_process":2,"app-icon":10,"important-documents":30,"manifesto/manifesto":31,"our-alumni/our-alumni":36,"our-members":38,"tools":54}],27:[function(require,module,exports){
(function (process,__filename){(function (){
const comingsoon = require('comingsoon')
const app_footer = require('app-footer')
/******************************************************************************
  DAT GARDEN COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = growth_page
// ----------------------------------------
function growth_page (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="main-wrapper">
    <div class="main"></div>
  </div>`
  const main = shadow.querySelector('.main')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // coming soon
    const on = {}
    const protocol = use_protocol('comingsoon')({ state, on })
    const opts = { data }
    const element = shadowfy()(comingsoon(opts, protocol))
    main.append(element)
  }
  { // app_footer
    const on = {}
    const protocol = use_protocol('app_footer')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_footer(opts, protocol))
    main.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
    }
    .main-wrapper .main {
      margin: 0;
      padding: 30px 10px;
      opacity: 1;
      background-size: 16px 16px;
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/dat-garden/dat-garden.js")
},{"_process":2,"app-footer":9,"comingsoon":25}],28:[function(require,module,exports){
module.exports={
    "info": {
      "mission_statement.md": "<p>We, the \"Dat Ecosystem\" members, come together to achieve the following goals:</p>       <ul>         <li>Share our knowledge on building decentralized systems.</li>         <li>Publish our work under permissive, open culture, licenses.</li>         <li>Build decentralized systems that profit the general public and empower users.</li>         <li>Have dat protocols (e.g. <a href=\"https://hypercore-protocol.org/\" target=\"_blank\">hypercore-protocol</a> or similar) as a foundation of our work.</li>         <li>Promote our shared goals with the public.</li>         <li>Develop solutions to shared technical problems.</li>         <li>Find and invite new members that share our goals.</li>         <li>Promote the adoption of shared technology through documentation or standardization.</li>       </ul>       <p>This group is <b>governed by individuals</b> that form together \"<i>the Consortium</i>\". The Consortium works to:</p>       <ul>         <li>Enact our <a href=\"https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct.md\" targer=\"_blank\">code of conduct</a>.</li>         <li>Raise and maintain funds and assets to fulfill the goals.</li>         <li>Use decentralized systems wherever feasible.</li>         <li>Publicly and transparently document the process and offer the public a means to comment.</li>         <li>Coordinate efforts by members.</li>         <li>Communicate on <a href=\"https://github.com/dat-ecosystem/dat-ecosystem.github.io#join-the-dat-ecosystem-chat-network\" target=\"_blank\">discord/cabal</a> </li>       </ul>       <p>         Proposals are submitted as pull requests to /consortium/decisions/{YYY}.{MM}.{DD}-{proposal_name}.md in <a href=\"https://github.com/dat-ecosystem/organization/tree/main\" target=\"_blank\">organization repository.</a><br>         Proposals to change the manifesto are submitted as pull requests to change the manifesto itself.<br>         Proposer needs to tag all consortium members in the pull request and notify consortium members in the active consortium communication channel.<br>       </p>        <p>         Decisions will be done through voting by consortium members. The voting period lasts 2 weeks.<br>         Regular voting items are accepted unless there is opposition by at least one Consortium member. Members may state opposition beforehands.<br>       </p>          <p>         The addition of a member or changes to this Manifesto requires unanimous support by all Consortium members.<br>         The removal of one member requires unanimous support by all Consortium members except by the member in question.<br>         After a consortium member is tagged in a proposals pull request and the consortium communication channel and that member does not respond within 3 months, their consortium membership becomes dormant, which means they do not count as consortium member in the context of deciding about any proposals.<br>         Dormant consortium members can reactivate themselves at any given time to become normal consortium members again unilateraly.<br>         Consortium Members can end their consortium membership and remove themselves from the consortium membership list at any given time unilateraly.<br>       </p>       <p>Consortium members <i>(alphabetic order)</i>:</p>       <ul>         <li><a href=\"https://github.com/cblgh\" target=\"_blank\">Alexander Cobleigh</a></li>         <li><a href=\"https://github.com/serapath\" target=\"_blank\">Alexander Praetorius</a></li>         <li><a href=\"https://github.com/dpaez\" target=\"_blank\">Diego Paez</a></li>         <li><a href=\"https://github.com/frando\" target=\"_blank\">Franz Heinzmann</a></li>         <li><a href=\"https://github.com/zootella\" target=\"_blank\">Kevin Faaborg</a></li>         <li><a href=\"https://github.com/nbreznik\" target=\"_blank\">Nina Breznik</a></li>       <ul>",
      "important_documents.md": "<ol type=\"1\"> <li> <a href=\"https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct.md\" target=\"_blank\">code of conduct</a> </li><li> <a href=\"https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct-contact.md\" target=\"_blank\">code of conduct - reporting guide</a> </li> <li> <a href=\"https://github.com/dat-ecosystem/comm-comm#readme\" target=\"_blank\">comm comm calls</a> </li><li> <a href=\"https://github.com/dat-ecosystem/organization/tree/main/consortium/meeting%20notes\" target=\"_blank\">consortium meeting notes</a> </li><li> <a href=\"https://github.com/dat-ecosystem/organization/tree/main/assets/logo%20%26%20visuals%20final\" target=\"_blank\">visuals</a> </li><li> <a href=\"https://github.com/dat-ecosystem/organization\" target=\"_blank\">organization repository</a> </li></ol>",
      "our_members.md": "<table><thead><tr><td> no. </td><td> name </td><td> organization </td></tr></thead><tbody><tr><td> 1 </td><td> <a href=\"https://github.com/cblgh\" target=\"_blank\">Alexander Cobleigh</a> </td><td> Cabal  </td></tr><tr><td> 2 </td><td> <a href=\"https://github.com/serapath\" target=\"_blank\">Alexander Praetorius</a> </td><td> DatDot &amp; WizardAmigos  </td></tr><tr><td> 3 </td><td> <a href=\"https://github.com/dpaez\" target=\"_blank\">Diego Paez</a> </td><td> Geut Studio  </td></tr><tr><td> 4 </td><td> <a href=\"https://github.com/frando\" target=\"_blank\">Franz Heinzmann</a> </td><td> Sonar  </td></tr><tr><td> 5 </td><td> <a href=\"https://github.com/zootella\" target=\"_blank\">Kevin Faaborg</a> </td><td> Ara  </td></tr><tr><td> 6 </td><td> <a href=\"https://github.com/nbreznik\" target=\"_blank\">Nina Breznik</a> </td><td> DatDot &amp; WizardAmigos  </td></tr></tbody></table>",
      "our_alumni.md": "<table><thead><tr><td> no. </td><td> name </td></tr></thead><tbody><tr><td> 1 </td><td> <a href=\"https://github.com/andrewosh\" target=\"_blank\">Andrew Osheroff</a> </td></tr><tr><td> 2 </td><td> <a href=\"https://twitter.com/bmpvieira\" target=\"_blank\">Bruno Vieira</a> </td></tr><tr><td> 3 </td><td> <a href=\"http://github.com/clkao\" target=\"_blank\">Chia-liang Kao</a> </td></tr><tr><td> 4 </td><td> <a href=\"https://github.com/daniellecrobinson\" target=\"_blank\">Danielle Robinson</a> </td></tr><tr><td> 5 </td><td> <a href=\"http://github.com/davidmarkclements\" target=\"_blank\">David Clements</a> </td></tr><tr><td> 6 </td><td> <a href=\"http://github.com/finnp\" target=\"_blank\">Finn Pauls</a> </td></tr><tr><td> 7 </td><td> <a href=\"http://github.com/RangerMauve\" target=\"_blank\">Georgiy Shibaev</a> </td></tr><tr><td> 8 </td><td> <a href=\"http://github.com/jimpick\" target=\"_blank\">Jim Pick</a> </td></tr><tr><td> 9 </td><td> <a href=\"http://github.com/joehand\" target=\"_blank\">Joe Hand</a> </td></tr><tr><td> 10 </td><td> <a href=\"http://github.com/jbenet\" target=\"_blank\">Juan Batiz-Benet</a> </td></tr><tr><td> 11 </td><td> <a href=\"http://github.com/juliangruber\" target=\"_blank\">Julian Gruber</a> </td></tr><tr><td> 12 </td><td> <a href=\"https://github.com/hackergrrl\" target=\"_blank\">Kira Oakley</a> </td></tr><tr><td> 13 </td><td> <a href=\"http://github.com/kriesse\" target=\"_blank\">Kristina Schneider</a> </td></tr><tr><td> 14 </td><td> <a href=\"https://github.com/martinheidegger\" target=\"_blank\">Martin Heidegger</a> </td></tr><tr><td> 15 </td><td> <a href=\"https://github.com/mafintosh\" target=\"_blank\">Mathias Buus</a> </td></tr><tr><td> 16 </td><td> <a href=\"http://twitter.com/maxogden\" target=\"_blank\">Max Ogden</a> </td></tr><tr><td> 17 </td><td> <a href=\"http://github.com/melaniecebula\" target=\"_blank\">Melanie Cebula</a> </td></tr><tr><td> 18 </td><td> <a href=\"https://github.com/pfrazee\" target=\"_blank\">Paul Frazee</a> </td></tr><tr><td> 19 </td><td> <a href=\"http://github.com/pkafei\" target=\"_blank\">Portia Burton</a> </td></tr><tr><td> 20 </td><td> <a href=\"https://github.com/okdistribute\" target=\"_blank\">Rae McKelvey</a> </td></tr><tr><td> 21 </td><td> <a href=\"http://github.com/taravancil\" target=\"_blank\">Tara Vancil</a> </td></tr><tr><td> 22 </td><td> <a href=\"https://github.com/yoshuawuyts\" target=\"_blank\">Yoshua Wuyts</a> </td></tr><tr><td> 23 </td><td> <a href=\"http://github.com/ywyw\" target=\"_blank\">Yuhong Wang</a> </td></tr></tbody></table>",
      "tools": {
        "mastodon": "<a target=\"_blank\" href=\"https://fosstodon.org/@dat_ecosystem\">mastodon</a>",
        "opencollective": "<a target=\"_blank\" href=\"https://opencollective.com/dat\">opencollective</a>",
        "matrix": "<a target=\"_blank\" href=\"https://matrix.to/#/%23datproject_discussions:gitter.im\">matrix</a>",
        "twitter": "<a target=\"_blank\" href=\"https://twitter.com/dat_ecosystem\">twitter</a>",
        "github": "<a target=\"_blank\" href=\"https://github.com/dat-ecosystem\">github</a>",
        "cabal": "<a target=\"_blank\" href=\"https://github.com/dat-ecosystem/dat-ecosystem.github.io/blob/main/README.md#connect-to-cabal-with-cli-or-download-cabal-desktop\">cabal</a>",
        "Jitsi": "<a target=\"_blank\" href=\"https://meet.jit.si/dat-ecosystem\">Jitsi</a>",
        "discord": "<a target=\"_blank\" href=\"https://discord.gg/egsvGc9TkQ\">discord</a>",
        "bigbluebutton": "<a target=\"_blank\" href=\"https://bigbluebutton.org/\">bigbluebutton</a>",
        "youtube": "<a target=\"_blank\" href=\"https://www.youtube.com/@DatEcosystem\">youtube</a>",
        "hackmd": "<a target=\"_blank\" href=\"https://hackmd.io/@T6Wf5EsOQKe-6wyPjJPtuw/Hycn0F63r/%2Fx_4tQHwtT3u7vrksrposHw\">hackmd</a>",
        "protonmail": "<a target=\"_blank\" href=\"dat-ecosystem@protonmail.com\">protonmail</a>",
        "reddit": "<a target=\"_blank\" href=\"https://www.reddit.com/r/dat_ecosystem/\">reddit</a>",
        "keet": "<a target=\"_blank\" href=\"https://keet.io/\">keet</a>"
      }
    },
    "home" : {
      "about_us": "Dat projects in its core build tools and infrastructure for distributed data syncronization. But as people and technologists we stand for Sustainable Open Source, Modularity & Technical Inclusion, Local First & Cloudless, Social Impact & Cooperative Ownership, Non-extractive Business Models, Data Sovereignty & Access Control. Dat's first project was a protocol which later grew to become the independent project (hypercore protocol). Today Dat ecosystem is a global community of many projects working side by side on open and secure protocols for the web of commons.",
      "cover": "Dat ecosystem is driven forward by many projects, most self funded. Some of the projects contribute maintainance and development to core pieces of the Dat ecosystem while others create high level applications built on top of p2p protocols."
    },
    "timeline": [
      {
        "title": "dat - brainstorming an idea",
        "date": "October 12, 2011",
        "time": "",
        "link": "https://rufuspollock.com/2011/10/17/weekly-update-rufus-pollock-2/",
        "desc": "Max Ogden chats with Rufus Pollock about a changes protocol for data to allow diffing/merging and supports micro-schemas at the Open Government Data Camp",
        "tags": [
          "article"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Knight Foundation Funding ($50.000)",
        "date": "June 23, 2013",
        "time": "",
        "link": "https://web.archive.org/web/20130810075932/http://www.knightfoundation.org/grants/201346305/",
        "desc": "Brings dat (as http://dat-data.com) from an idea to the pre-alpha stage",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat - initial readme",
        "date": "June 27, 2013",
        "time": "",
        "link": "https://github.com/dat-ecosystem/dat/tree/464679267049899eafa345125a0f2212f91be456",
        "desc": "Dat is created by Max Ogden in 2013 to standardize the way data analysts collaborate on the changes they make to data sets. Rufus Pollock from the Open Knowledge Foundation describes it as git (and github) for data",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat-data website",
        "date": "October 12, 2023",
        "time": "",
        "link": "https://dat-ecosystem-archive.github.io/dat-data.com/",
        "desc": "First website is released",
        "tags": [
          "website"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "twitter account",
        "date": "November 01, 2013",
        "time": "",
        "link": "https://twitter.com/dat_ecosystem",
        "desc": "@dat_protocol twitter account is created (later renamed to @dat_ecosystem)",
        "tags": [
          "asset"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "introducing dat",
        "date": "November 11, 2013",
        "time": "",
        "link": "https://www.youtube.com/watch?v=FX7qSwz3SCk",
        "desc": "Max Ogden presents Dat at the Strata Conference in London",
        "tags": [
          "talk"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Alfred P. Sloan Foundation Funding ($260.000)",
        "date": "April 02, 2014",
        "time": "",
        "link": "https://usopendata.org/2014/04/02/dat/",
        "desc": "Helps dat to become an US ODI (Open Data Institute) project",
        "tags": [
          "Open Data Institute"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "peermaps",
        "date": "May 22, 2014",
        "time": "",
        "link": "https://peermaps.org/",
        "desc": "Peermaps is born (peer to peer cartography)",
        "tags": [
          "project"
        ],
        "active_state": "PAUSED"
      },
      {
        "title": "dat - alpha",
        "date": "August 19, 2014",
        "time": "",
        "link": "https://usopendata.org/2014/08/19/dat-alpha/",
        "desc": "Dat Alpha version is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Alfred P. Sloan",
        "date": "April 03, 2015",
        "time": "",
        "link": "https://donations.vipulnaik.com/donor.php?donor=Sloan+Foundation",
        "desc": "Alfred P. Sloan Foundation Funding ($640.000)",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat - beta",
        "date": "July 29, 2015",
        "time": "",
        "link": "https://usopendata.org/2015/07/29/dat-beta/",
        "desc": "Dat Beta version is released -  the version focused on tabular datasets. It turns out to be too complex for typical use cases",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "designing dat 1.0",
        "date": "December 04, 2015",
        "time": "",
        "link": "https://vimeo.com/147914258",
        "desc": "Designing dat 1.0, rOpenSci Community Call v8",
        "tags": [
          "presentation"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "hyperdrive release",
        "date": "December 02, 2015",
        "time": "",
        "link": "https://github.com/hypercore-protocol/hyperdrive/releases/tag/v1.0.1",
        "desc": "Hyperdrive v1.0.0 is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "hypercore release",
        "date": "December 20, 2015",
        "time": "",
        "link": "https://github.com/hypercore-protocol/hypercore/releases/tag/v1.0.0",
        "desc": "Hypercore v1.0.0 is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "alpha testing",
        "date": "December 21, 2015",
        "time": "",
        "link": "/",
        "desc": "Alpha testing with pilot projects in science, including Sloan Digital Sky Survey (Astronomy), iRNA-Seq (Bioinformatics – RNA), and Bionode (Bioinformatics – DNA)Hypercore v1.0.0 is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat 1.0.",
        "date": "February 01, 2016",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-1-0-is-ready/",
        "desc": "Dat 1.0. is ready",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Knight Foundation Funding ($420.000)",
        "date": "February 01, 2016",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/announcing-publicbits-org/",
        "desc": "Knight Foundation Grant ($420.000) for Publicbeats project",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Code for Science and Society",
        "date": "September 01, 2016",
        "time": "",
        "link": "https://codeforscience.org/about/",
        "desc": "Code for Science and Society is founded - to support the Dat Project as a fiscal sponsor bundled with strategic project support",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "first meetups",
        "date": "December 01, 2016",
        "time": "",
        "link": "https://blog.datproject.org/tag/community/",
        "desc": "The first meetups for ‘Coding for Science & Society’ are held in Berlin, Oakland, and Portland; organized by the Dat team",
        "tags": [
          "community"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "cli tool",
        "date": "January 09, 2017",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/preview-the-new-dat-cli/",
        "desc": "New Dat CLI is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "beaker browser",
        "date": "February 07, 2017",
        "time": "",
        "link": "https://www.electronjs.org/blog/beaker-browser",
        "desc": "Beaker browser pre-release",
        "tags": [
          "project"
        ],
        "active_state": "INACTIVE"
      },
      {
        "title": "dat desktop",
        "date": "February 12, 2017",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-desktop-is-here/",
        "desc": "Dat desktop is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat 2.0",
        "date": "June 01, 2017",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-sleep-release/",
        "desc": "Dat 2.0 is released",
        "tags": [
          "milestone"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat whitepaper",
        "date": "June 01, 2017",
        "time": "",
        "link": "https://github.com/dat-ecosystem-archive/whitepaper/blob/master/dat-paper.pdf",
        "desc": "Dat whitepaper is released",
        "tags": [
          "whitepaper"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Moore Foundation Grant ($110.000)",
        "date": "September 14, 2017",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-in-the-lab/",
        "desc": "Moore Foundation grant for collaboration of dat and California Digital Library (CDL)",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "organizational changes",
        "date": "December 20, 2017",
        "time": "",
        "link": "https://blog.datproject.org/2017/12/20/organization-changes-dat-css/",
        "desc": "Organizational Changes for Dat and Code for Science & Society",
        "tags": [
          "organization"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "arso",
        "date": "March 02, 2018",
        "time": "",
        "link": "https://arso.xyz/",
        "desc": "arso joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "multifeed",
        "date": "April 12, 2018",
        "time": "",
        "link": "https://github.com/kappa-db/multifeed/releases/tag/v1.0.0",
        "desc": "Multi-writer hypercore (multifeed) is released",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Beaker browser and the Dat protocol analysis",
        "date": "May 01, 2018",
        "time": "",
        "link": "https://bernsteinbear.com/dat-paper/",
        "desc": "Beaker browser and the Dat protocol: An analysis for COMP 117: Internet-scale Distributed Systems is released",
        "tags": [
          "scientific article"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "kappa core",
        "date": "May 13, 2018",
        "time": "",
        "link": "https://github.com/kappa-db/kappa-core/releases/tag/v1.0.0",
        "desc": "Kappa Core 1.0 is released (minimal append only DB)",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "cabal",
        "date": "May 13, 2018",
        "time": "",
        "link": "https://github.com/cabal-club/cabal-core/releases/tag/v1.0.0",
        "desc": "Cabal core 1.0 is release",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Mozila Open Source Support Grant ($34,000)",
        "date": "September 05, 2018",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/moss-2019-summary/",
        "desc": "Dat Project Receives Mozilla Open Source Support Grant",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat open collective",
        "date": "October 05, 2018",
        "time": "",
        "link": "https://opencollective.com/dat",
        "desc": "Dat Open Collective page is set up for recurring donations",
        "tags": [
          "donations"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "how dat works",
        "date": "November 01, 2018",
        "time": "",
        "link": "https://dat-ecosystem-archive.github.io/how-dat-works/",
        "desc": "How dat works visualization project is started",
        "tags": [
          "asset"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Handshake Grant ($100.000)",
        "date": "December 01, 2018",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-receives-two-new-grants/",
        "desc": "Handshake Grant is received",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Samsung NEXT Stack Zero Grant ($63.000)",
        "date": "December 02, 2018",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-receives-two-new-grants/",
        "desc": "Samsung NEXT Stack Zero grant is received",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat hack unconference",
        "date": "May 19, 2019",
        "time": "",
        "link": "https://events.dat.foundation/2019/",
        "desc": "Dat Hack Unconference in Berlin",
        "tags": [
          "event"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Wireline Donation ($50,000)",
        "date": "June 01, 2019",
        "time": "",
        "link": "https://github.com/datproject/organization#2019",
        "desc": "Dat Project receives donation from Wireline",
        "tags": [
          "donation"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat consortium",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://hackmd.io/@T6Wf5EsOQKe-6wyPjJPtuw/Hycn0F63r/%2FHbu0ffkwQS6KIO_97fH-Mw",
        "desc": "Dat consortium is formed",
        "tags": [
          "organization"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "ara",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://ara.one/",
        "desc": "Ara joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "consento",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://consento.org/",
        "desc": "Consento joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "datdot",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://datdot.org/",
        "desc": "DatDot joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "decentlabs",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://decentlabs.se/",
        "desc": "Decentlabs joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "geut",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://www.geutstudio.com/",
        "desc": "Geut joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "digital democracy",
        "date": "December 01, 2019",
        "time": "",
        "link": "https://www.digital-democracy.org/",
        "desc": "Digital Democracy joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "arso - sonar release",
        "date": "December 17, 2019",
        "time": "",
        "link": "https://arso.xyz/blog/2019-12-17-introducing-sonar",
        "desc": "Arso introduces Sonar",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Hypercore protocol graduates from Dat Ecosystem",
        "date": "May 15, 2020",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-protocol-renamed-hypercore-protocol/",
        "desc": "Dat protocol is renamed to Hypercore protocol",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "NLnet grant ($50.000)",
        "date": "July 01, 2020",
        "time": "",
        "link": "https://github.com/datproject/organization#2020",
        "desc": "NLnet grant is recieved for a Rust port",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "agregore",
        "date": "June 19, 2020",
        "time": "",
        "link": "https://github.com/AgregoreWeb/agregore-browser/releases/tag/v1.0.1-0",
        "desc": "Agregore browser is pre-released",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat conference",
        "date": "July 30, 2020",
        "time": "",
        "link": "https://www.youtube.com/channel/UCbLY5Qg3t3OJbxZZUioqMOQ",
        "desc": "Dat online conference is organized",
        "tags": [
          "event"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "agregore",
        "date": "October 14, 2020",
        "time": "",
        "link": "https://agregore.mauve.moe/",
        "desc": "Agregore joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "tradle",
        "date": "November 09, 2020",
        "time": "",
        "link": "https://tradle.io/",
        "desc": "Tradle joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "gateway browser",
        "date": "January 11, 2020",
        "time": "",
        "link": "https://gitlab.com/gateway-browser/gateway",
        "desc": "Gateway browser joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "hyperbee",
        "date": "December 03, 2020",
        "time": "",
        "link": "https://github.com/hypercore-protocol/hyperbee/releases/tag/v1.0.0",
        "desc": "Hyperbee 1.0 is released",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "earthstar",
        "date": "January 10, 2021",
        "time": "",
        "link": "https://github.com/earthstar-project/earthstar",
        "desc": "Earthstar joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat manifesto",
        "date": "March 09, 2021",
        "time": "",
        "link": "https://github.com/dat-ecosystem/organization/blob/main/MANIFESTO.md",
        "desc": "Dat consortium forms Dat Ecosystem and consoritum members sign a manifesto",
        "tags": [
          "organization"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "Code for Science and Society grant ($20.000)",
        "date": "December 21, 2021",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/dat-ecosystem-relaunch/",
        "desc": "Archiving and ecosystem launch grant",
        "tags": [
          "grant"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "socket supply",
        "date": "April 15, 2022",
        "time": "",
        "link": "https://socketsupply.co/",
        "desc": "Socket Supply joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "hyperswarm",
        "date": "July 02, 2021",
        "time": "",
        "link": "https://github.com/hyperswarm/hyperswarm/releases/tag/v3.0.0-beta2",
        "desc": "Hyperswarm v3.0.0-beta is released",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "autobase",
        "date": "July 02, 2021",
        "time": "",
        "link": "https://github.com/hypercore-protocol/autobase/releases/tag/v1.0.0-alpha.0",
        "desc": "Autobase v3.0.0-beta is released",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dat ecosystem archive",
        "date": "August 01, 2021",
        "time": "",
        "link": "https://github.com/dat-ecosystem-archive",
        "desc": "Dat ecosystem archive is created to archive all the historic repositories",
        "tags": [
          "organization"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "geut - sher",
        "date": "October 08, 2021",
        "time": "",
        "link": "https://sher.geutstudio.com/",
        "desc": "Geut studio introduces new project Sher",
        "tags": [
          "organization"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "ahau",
        "date": "April 30, 2022",
        "time": "",
        "link": "https://ahau.io/",
        "desc": "ahau joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "keet",
        "date": "July 25, 2022",
        "time": "",
        "link": "https://keet.io/",
        "desc": "hypercore protocol team releases Keet",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "dcent reads",
        "date": "August 20, 2022",
        "time": "",
        "link": "https://www.dcent-reads.org/#/read",
        "desc": "Dcent Reads, a platform for decentralised publishing joins the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      },
      {
        "title": "wizard amigos",
        "date": "August 27, 2022",
        "time": "",
        "link": "https://wizardamigos.com",
        "desc": "wizard amigos join the ecosystem",
        "tags": [
          "project"
        ],
        "active_state": "ACTIVE"
      }
      ,{
        "title": "lumeweb",
        "date": "September 4, 2022",
        "time": "",
        "link": "https://lumeweb.com/",
        "desc": "lumeweb join the ecosystem",
        "tags": ["project"],
        "active_state": "ACTIVE"
      },{
        "title": "wizard amigos code camp",
        "date": "September 26, 2022",
        "time": "",
        "link": "https://wizardamigos.com/codecamp2022/",
        "desc": "wizard amigos code camp is organized in Wales",
        "tags": ["event"],
        "active_state": "ACTIVE"
      }, {
        "title": "HOP",
        "date": "November 23, 2022",
        "time": "",
        "link": "https://www.healthscience.network/",
        "desc": "HOP (health oracle protocol) joins the ecosystem",
        "tags": ["project"],
        "active_state": "ACTIVE"
      },{
        "title": "dat ecosystem visualized",
        "date": "January 07, 2023",
        "time": "",
        "link": "https://micahscopes.github.io/webscape-wanderer/",
        "desc": "webscape wanderer visualizer engine is created to visualize dat ecosystem",
        "tags": ["presentation"],
        "active_state": "ACTIVE"
      },{
        "title": "webscape wanderer",
        "date": "January 08, 2023",
        "time": "",
        "link": "https://github.com/micahscopes/webscape-wanderer/",
        "desc": "webscape wanderer joins the ecosystem",
        "tags": ["project"],
        "active_state": "ACTIVE"
      },{
        "title": "interview series",
        "date": "May 03, 2023",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/staying-connected/",
        "desc": "video interviews launch",
        "tags": ["presentation"],
        "active_state": "ACTIVE"
      },{
        "title": "dxos",
        "date": "May 15, 2023",
        "time": "",
        "link": "https://dxos.org/",
        "desc": "dxos joins the ecosystem",
        "tags": ["project"],
        "active_state": "ACTIVE"
      },{
        "title": "hyper-nostr",
        "date": "July 05, 2023",
        "time": "",
        "link": "https://github.com/Ruulul/hyper-nostr",
        "desc": "hypercore-nostr relay is published and project joins the ecosystem",
        "tags": ["project"],
        "active_state": "ACTIVE"
      },{
        "title": "demo & AMA sessions",
        "date": "August 27, 2023",
        "time": "",
        "link": "https://blog.dat-ecosystem.org/tags/demo/",
        "desc": "demo sessions and AMA commm comm calls launch",
        "tags": ["presentation"],
        "active_state": "ACTIVE"
      },{
        "title": "wizard amigos code camp",
        "date": "October 01, 2023",
        "time": "",
        "link": "https://wizardamigos.com/codecamp2023/",
        "desc": "wizard amigos code camp is organized in Portugal",
        "tags": ["event"],
        "active_state": "ACTIVE"
      },{
        "title": "new dat ecosystem web page is released",
        "date": "January 11, 2024",
        "time": "",
        "link": "https://dat-ecosystem.org",
        "desc": "Dat ecosystem releases new web page",
        "tags": ["organization"],
        "active_state": "ACTIVE"
      }
    ],
    "projects": [
      {
        "project_name": "Agregore",
        "project_desc": "Agregore, a browser for the distributed web, facilitates peer-to-peer data sharing without central servers, supporting protocols like BitTorrent and IPFS for direct loading and sharing of content.",
        "project_website": "https://agregore.mauve.moe/",
        "project_socials": [
          {
            "github": "https://github.com/RangerMauve/agregore-browser"
          },
          {
            "discord": "https://discord.com/invite/QMthd4Y"
          }
        ],
        "project_tags": [
          "hypercore",
          "browser",
          "p2p",
          "electron"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "ahau",
        "project_desc": "Āhau is a Whānau Data Platform that helps whānau-based communities (whānau, hapū, Iwi) capture, preserve, and share important information and histories into secure, whānau managed databases and servers.",
        "project_website": "https://www.ahau.io/",
        "project_socials": [
          {
            "github": "https://www.hypercore.com/ahau"
          },
          {
            "discord": "https://chat.ahau.io/"
          }
        ],
        "project_tags": [
          "hypercore",
          "māori",
          "genealogy"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "ara",
        "project_desc": "Ara represents a new era for content on the internet. Where we get our voices back. Where what's ours is ours. All content, decentralized, secure, owned, distributed, paid for, and rewarded between peers.",
        "project_website": "https://ara.one/",
        "project_socials": [
          {
            "github": "https://github.com/AraBlocks"
          },
          {
            "discord": "https://discord.gg/eUMzA4Y"
          }
        ],
        "project_tags": [
          "Hypercore",
          "nft",
          "subscription"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "cabal",
        "project_desc": "Cabal is an experimental P2P community chat platform where servers are unnecessary, everything runs locally, and each community is identified by a secret key, offering both internet and local network connectivity.",
        "project_website": "https://cabal.chat/",
        "project_socials": [
          {
            "github": "https://github.com/cabal-club"
          }
        ],
        "project_tags": [
          "hypercore", 
          "cable", 
          "p2p", 
          "chat", 
          "desktop", 
          "terminal"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "datdot",
        "project_desc": "DatDot enables peer-to-peer sharing of storage space and data seeding to make data sovereignity and portability more accessible and reliable for users.",
        "project_website": "https://datdot.org/",
        "project_socials": [
          {
            "github": "https://github.com/datdotorg"
          },
          {
            "twitter": "https://twitter.com/datdotorg"
          },
          {
            "discord": "https://discord.com/invite/3CJuGxkyyE"
          }
        ],
        "project_tags": [
          "hypercore", 
          "p2p", 
          "hosting network", 
          "backup"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "dxos",
        "project_desc": "DXOS provides developers with everything they need to build real-time, collaborative apps which run entirely on the client, and communicate peer-to-peer, without servers.",
        "project_website": "https://dxos.org/",
        "project_socials": [
          {
            "github": "https://github.com/dxos/dxos"
          },
          {
            "discord": "https://discord.gg/eXVfryv3sW"
          }
        ],
        "project_tags": [
          "hypercore", 
          "p2p", 
          "offline", 
          "platform"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "earthstar",
        "project_desc": "Earthstar is a small and resilient distributed storage protocol designed with a strong focus on simplicity and versatility, with the social realities of peer-to-peer computing kept in mind.",
        "project_website": "https://github.com/earthstar-project/earthstar",
        "project_socials": [
          {
            "github": "https://github.com/earthstar-project/earthstar"
          },
          {
            "discord": "https://discord.gg/5b8q7VtunU"
          }
        ],
        "project_tags": [
          "p2p", 
          "key-value database", 
          "offline"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "gatewaybrowser",
        "project_desc": "An experimental mobile browser that aims to help build a sustainable community-owned P2P web.",
        "project_website": "https://twitter.com/GatewayBrowser",
        "project_socials": [
          {
            "github": "https://hypercore.com/gateway-browser/gateway"
          },
          {
            "twitter": "https://twitter.com/GatewayBrowser"
          }
        ],
        "project_tags": [
          "hypercore", 
          "mobile", 
          "browser"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "hop",
        "project_desc": "We are building a choherence protocol based on peer to peer open source software and toolkit that empower everyone to have sovereignity over data that shapes the health of the world. ",
        "project_website": "https://www.healthscience.network/",
        "project_socials": [
          {
            "github": "https://github.com/healthscience"
          },
          {
            "discord": "https://discord.gg/UZWgrjZZXK"
          }
        ],
        "project_tags": [
          "hypercore", 
          "health oracle"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "hyper-nostr",
        "project_desc": "The goal of this tool is to behave as a public relay; think of the chosen topic as a public relay, where you can send and receive notes from your peers!",
        "project_website": "https://github.com/Ruulul/hyper-nostr",
        "project_socials": [
          {
            "github": "https://github.com/Ruulul/hyper-nostr"
          },
          {
            "discord": "https://discord.gg/8jvhQYKnwQ"
          }
        ],
        "project_tags": [
          "hypercore", 
          "nostr", 
          "relay"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "hypercore-protocol",
        "project_desc": "Hypercore is a secure, distributed append-only log built for sharing large datasets and streams of real-time data.",
        "project_website": "https://docs.holepunch.to/building-blocks/hypercore",
        "project_socials": [
          {
            "github": "https://github.com/holepunchto/hypercore"
          },
          {
            "discord": "https://discord.gg/qkV4YMwHgZ"
          }
        ],
        "project_tags": [
          "hypercore", 
          "p2p", 
          "protocol"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "Keet",
        "project_desc": "Keet only shares end-to-end encrypted data between the participants in every call. Without middlemen, third-parties, or servers, there’s nobody left who can snoop on calls, leak or collect data.",
        "project_website": "https://keet.io/",
        "project_socials": [
          {
            "twitter": "https://twitter.com/keet_io"
          },
          {
            "discord": "https://discord.gg/znw6KfTyw8"
          }
        ],
        "project_tags": [
          "hypercore", 
          "p2p", 
          "chat", 
          "video", 
          "electron"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "peermaps",
        "project_desc": "Peermaps is a distributed, offline-friendly alternative to commercial map providers such as google maps. Instead of fetching data from a centralized tile service, your computer fetches map data from other peers across the network.",
        "project_website": "https://peermaps.org/",
        "project_socials": [
          {
            "github": "https://github.com/peermaps"
          }
        ],
        "project_tags": [
          "hypercore", 
          "p2p", 
          "OpenStreetMap", 
          "offline"
        ],
        "project_active_state": "PAUSED"
      },
      {
        "project_name": "peershare",
        "project_desc": "PeerShare enables you to share files to your friends, family, colleagues etc, using peer-to-peer technology. With a clean, easy to read interface, you can share your files right away.",
        "project_website": "https://peershare.lone-wolf.software/",
        "project_socials": [
          {
            "github": "https://github.com/connor-davis/peershare"
          },
          {
            "twitter": "https://twitter.com/PeerShareApp"
          },
          {
            "discord": "https://discord.gg/U8sYVMts4W"
          }
        ],
        "project_tags": [
          "hypercore"
        ],
        "project_active_state": "INACTIVE"
      },
      {
        "project_name": "picostack",
        "project_desc": "0% Backend, 10'000% Frontend",
        "project_website": "https://pico-todo.surge.sh/",
        "project_socials": [
          {
            "github": "https://github.com/telamon/picostack"
          },
          {
            "discord": "https://discord.com/invite/8RMRUPZ9RS"
          }
        ],
        "project_tags": [
          "hypercore", 
          "pico", 
          "blockend"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "sher",
        "project_desc": "It's simple. You create your show and share the link with your audience.",
        "project_website": "https://sher.geutstudio.com/",
        "project_socials": [
          {
            "twitter": "https://twitter.com/the_sher_app"
          }
        ],
        "project_tags": [
          "hypercore", 
          "live-streaming", 
          "audio"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "socket supply",
        "project_desc": "Build mobile and destkop apps for any OS using HTML, CSS, and JavaScript. Connect users with modern P2P that can make the cloud entirely optional.",
        "project_website": "https://socketsupply.co/",
        "project_socials": [
          {
            "github": "https://github.com/socketsupply"
          },
          {
            "twitter": "https://twitter.com/socketsupply"
          },
          {
            "discord": "https://discord.gg/YPV32gKCsH"
          }
        ],
        "project_tags": [
          "runtime", 
          "web", 
          "p2p", 
          "native apps"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "sonar",
        "project_desc": "Sonar is based on the Hypercore Protocol and part of the Dat ecosystem of peer-to-peer tools.",
        "project_website": "https://sonar.dev.arso.xyz/",
        "project_socials": [
          {
            "github": "https://github.com/arso-project"
          }
        ],
        "project_tags": [
          "hypercore", 
          "kappa", 
          "p2p", 
          "search", 
          "database"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "webscape-wanderer",
        "project_desc": "An interactive visualization engine for open source ecosystems",
        "project_website": "https://micahscopes.github.io/webscape-wanderer/",
        "project_socials": [
          {
            "github": "https://github.com/micahscopes/webscape-wanderer/"
          },
          {
            "twitter": "https://twitter.com/micahscopes"
          }
        ],
        "project_tags": [
          "hypercore", 
          "web-gl", 
          "three-js", 
          "3D"
        ],
        "project_active_state": "ACTIVE"
      },
      {
        "project_name": "wizardamigos",
        "project_desc": "Wizard Amigos is a global community of self-employed nomadic developers, technologists, creators, problem solvers, thinkers, activists, researchers, artists, and individuals from diverse backgrounds who share a common passion for technology and open collaboration.",
        "project_website": "https://wizardamigos.com/",
        "project_socials": [
          {
            "twitter": "https://twitter.com/wizardamigos"
          },
          {
            "discord": ""
          }
        ],
        "project_tags": [
          "p2p", 
          "workshop", 
          "code camp"
        ],
        "project_active_state": "ACTIVE"
      }
    ]
}
  
},{}],29:[function(require,module,exports){
(function (process,__filename){(function (){
const cover_app = require('app-cover')
const app_timeline_mini = require('app-timeline-mini')
const app_projects_mini = require('app-projects-mini')
const app_about_us = require('app-about-us')
const app_footer = require('app-footer')
/******************************************************************************
  HOME PAGE COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = home_page
// ----------------------------------------
function home_page (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  // adding a `main-wrapper` 
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="main-wrapper">
    <div class="main"></div>
  </div>`
  // ----------------------------------------
  const main = shadow.querySelector('.main').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // cover app
    const on = {}
    const protocol = use_protocol('cover_app')({ state, on })
    const opts = { data }
    const element = shadowfy()(cover_app(opts, protocol))
    main.append(element)
  }
  { // app timeline mini
    const on = {
      'navigate': navigate
    }
    const protocol = use_protocol('app_timeline_mini')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_timeline_mini(opts, protocol))
    main.append(element)
  }
  { // app projects mini
    const on = {
      'navigate': navigate
    }
    const protocol = use_protocol('app_projects_mini')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_projects_mini(opts, protocol))
    main.append(element)
  }
  { // app about us
    const on = {
      'navigate': navigate,
      'open_important_documents': open_important_documents
    }
    const protocol = use_protocol('app_about_us')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_about_us(opts, protocol))
    main.append(element)
  }
  { // app footer
    const on = {}
    const protocol = use_protocol('app_footer')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_footer(opts, protocol))
    main.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  async function navigate( {data} ){
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'navigate',
      data
    })
  }
  async function open_important_documents( {data} ){
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'open_important_documents',
      data
    })
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
    }
    .main-wrapper .main {
      margin: 0;
      padding: 30px 10px;
      opacity: 1;
      background-size: 16px 16px;
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/home-page/home-page.js")
},{"_process":2,"app-about-us":7,"app-cover":8,"app-footer":9,"app-projects-mini":11,"app-timeline-mini":13}],30:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  IMPORTANT DOCUMENTS COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = important_documents
// ----------------------------------------
function important_documents (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'show': on_show, 'hide': on_hide }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="important_documents">
    <div class="window_bar_wrapper"></div>
    <div class="documents_content">
      <h2>Visit links for more info</h2>
      <ol type="1">
        <li> <a href="https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct.md" target="_blank">code of conduct</a> </li>
        <li> <a href="https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct-contact.md" target="_blank">code of conduct - reporting guide</a> </li>
        <li> <a href="https://github.com/dat-ecosystem/comm-comm#readme" target="_blank">comm comm calls</a> </li>
        <li> <a href="https://github.com/dat-ecosystem/organization/tree/main/consortium/meeting%20notes" target="_blank">consortium meeting notes</a> </li>
        <li> <a href="https://github.com/dat-ecosystem/organization/tree/main/assets/logo%20%26%20visuals%20final" target="_blank">visuals</a> </li>
        <li> <a href="https://github.com/dat-ecosystem/organization" target="_blank">organization repository</a> </li>
      </ol>
    </div>
  </div>`
  const important_documents_wrapper = shadow.querySelector('.important_documents')
  // ----------------------------------------
  const window_bar_wrapper = shadow.querySelector('.window_bar_wrapper').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'important_documents.md', 
      src: icon_pdf_reader,
      data
    }
    const element = window_bar(opts, protocol)
    window_bar_wrapper.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') important_documents_wrapper.style.display = 'none'
      const channel = state.net[state.aka.up]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'deactivate_tick',
        data: opts.name
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_show (message) {
    important_documents_wrapper.style.display = 'inline'
  }
  function on_hide (message) {
    important_documents_wrapper.style.display = 'none'
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .important_documents {
      display: inline;
    }
    .important_documents .documents_content {
      position: relative;
      display: flex;
      width: 100vw;
      height: 100vh;
      flex-direction: column;
      padding: 10px;
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
    }
    .important_documents .documents_content h2 {
      margin: 0;
    }
    .important_documents a{
      color: var(--primary_color);
      text-decoration: none;
    }
    .important_documents a:hover{
      text-decoration: underline;
    }
    @container (min-width: 510px) {
      .important_documents .documents_content {
        width: auto;
        height: auto;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/important-documents/important-documents.js")
},{"_process":2,"window-bar":55}],31:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const scrollbar = require('scrollbar')
/******************************************************************************
  MISSION STATEMENT COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = manifesto
// ----------------------------------------
function manifesto (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'show': on_show, 'hide': on_hide }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="mission_statement">
    <div class="window_bar_wrapper"></div>
    <div class="main_wrapper">

      <div class="mission_content">
        <h2># MANIFESTO </h2>
        <p>We, the "Dat Ecosystem" members, come together to achieve the following goals:</p>
        <ul>
          <li>Share our knowledge on building decentralized systems.</li>
          <li>Publish our work under permissive, open culture, licenses.</li>
          <li>Build decentralized systems that profit the general public and empower users.</li>
          <li>Have dat protocols (e.g. <a href="https://hypercore-protocol.org/" target="_blank">hypercore-protocol</a> or similar) as a foundation of our work.</li>
          <li>Promote our shared goals with the public.</li>
          <li>Develop solutions to shared technical problems.</li>
          <li>Find and invite new members that share our goals.</li>
          <li>Promote the adoption of shared technology through documentation or standardization.</li>
        </ul>
        <p>This group is <b>governed by individuals</b> that form together "<i>the Consortium</i>". The Consortium works to:</p>
        <ul>
          <li>Enact our <a href="https://github.com/dat-ecosystem/organization/blob/main/code-of-conduct.md" targer="_blank">code of conduct</a>.</li>
          <li>Raise and maintain funds and assets to fulfill the goals.</li>
          <li>Use decentralized systems wherever feasible.</li>
          <li>Publicly and transparently document the process and offer the public a means to comment.</li>
          <li>Coordinate efforts by members.</li>
          <li>Communicate on <a href="https://github.com/dat-ecosystem/dat-ecosystem.github.io#join-the-dat-ecosystem-chat-network" target="_blank">discord/cabal</a> </li>
        </ul>
        <p>
          Proposals are submitted as pull requests to /consortium/decisions/{YYY}.{MM}.{DD}-{proposal_name}.md in <a href="https://github.com/dat-ecosystem/organization/tree/main" target="_blank">organization repository.</a><br>
          Proposals to change the manifesto are submitted as pull requests to change the manifesto itself.<br>
          Proposer needs to tag all consortium members in the pull request and notify consortium members in the active consortium communication channel.<br>
        </p> 
        <p>
          Decisions will be done through voting by consortium members. The voting period lasts 2 weeks.<br>
          Regular voting items are accepted unless there is opposition by at least one Consortium member. Members may state opposition beforehands.<br>
        </p>   
        <p>
          The addition of a member or changes to this Manifesto requires unanimous support by all Consortium members.<br>
          The removal of one member requires unanimous support by all Consortium members except by the member in question.<br>
          After a consortium member is tagged in a proposals pull request and the consortium communication channel and that member does not respond within 3 months, their consortium membership becomes dormant, which means they do not count as consortium member in the context of deciding about any proposals.<br>
          Dormant consortium members can reactivate themselves at any given time to become normal consortium members again unilateraly.<br>
          Consortium Members can end their consortium membership and remove themselves from the consortium membership list at any given time unilateraly.<br>
        </p>
        <p>Consortium members <i>(alphabetic order)</i>:</p>
        <ul>
          <li><a href="https://github.com/cblgh" target="_blank">Alexander Cobleigh</a></li>
          <li><a href="https://github.com/serapath" target="_blank">Alexander Praetorius</a></li>
          <li><a href="https://github.com/dpaez" target="_blank">Diego Paez</a></li>
          <li><a href="https://github.com/frando" target="_blank">Franz Heinzmann</a></li>
          <li><a href="https://github.com/zootella" target="_blank">Kevin Faaborg</a></li>
          <li><a href="https://github.com/nbreznik" target="_blank">Nina Breznik</a></li>
        <ul>
      </div>

    </div>
  </div>`
  const mission_statement_wrapper = shadow.querySelector('.mission_statement')
  const mission_content = shadow.querySelector('.mission_content')
  const main_wrapper = shadow.querySelector('.main_wrapper')
  // ----------------------------------------
  const window_bar_wrapper = shadow.querySelector('.window_bar_wrapper').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'manifesto.md', 
      src: icon_pdf_reader,
      data
    }
    const element = window_bar(opts, protocol)
    window_bar_wrapper.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') mission_statement_wrapper.style.display = 'none'
      const channel = state.net[state.aka.up]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'deactivate_tick',
        data: opts.name
      })
    }
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down  
    const scroll_opts = { data }
    const element = scrollbar(scroll_opts, protocol)

    const channel = state.net[state.aka.scrollbar]
    mission_content.onscroll = onscroll
    ro.observe(main_wrapper)

    main_wrapper.append(shadowfy()(element))

    function onscroll (event) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { },
        type: 'handle_scroll',
      })
    }
    function on_set_scroll (message) {
      console.log('set_scroll', message) 
      setScrollTop(message.data)
    }
    function onstatus (message) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: mission_content.scrollHeight,
          ch: mission_content.clientHeight,
          st: mission_content.scrollTop
        }
      })
    }
    function setScrollTop (value) {
      mission_content.scrollTop = value
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_show (message) {
    mission_statement_wrapper.style.display = 'inline'
  }
  function on_hide (message) {
    mission_statement_wrapper.style.display = 'none'
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
      color: var(--primary_color);
    }
    .mission_statement {
      display: inline;
    } 
    .main_wrapper{
      display: flex;
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        var(--bg_color_3);  /* second color */  
      background-size: var(--s) var(--s);  
      border: 1px solid var(--primary_color);
    }
    .mission_statement .mission_content {
      position: relative;
      display: flex;
      flex-direction: column;
      font-size:0.87em;
      letter-spacing: -1px;
      line-height: 18px;
      width: 100%;
      height: 100vh;
      padding: 10px;
      overflow:scroll;
      scrollbar-width: none; /* For Firefox */
      background-size: 10px 10px;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
    }
    a{
      color:blue;
    }
    .mission_statement .mission_content::-webkit-scrollbar {
      display: none;
    }
    .mission_statement .mission_content h2 {
      margin: 0;
    }
    @container (min-width: 510px) {
      .mission_statement .mission_content {
        width: auto;
        height: 100%;
        max-width:1200px;
        max-height:600px;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/manifesto/manifesto.js")
},{"_process":2,"scrollbar":42,"window-bar":55}],32:[function(require,module,exports){
(function (process,__filename){(function (){
const day_button = require('buttons/day-button')
/******************************************************************************
  MONTH CARD COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = month_card
// ----------------------------------------
function month_card (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { name: label, days } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    toggle_month_button,
    toggle_all_days,
    toggle_day_highlight,
    toggle_day_button_visibility,
  }
  const up_channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="month_card">
    <span class="month_name"><b>${label}</b></span>
    <div class="days_wrapper"></div>
  </div>`
  const days_wrapper = shadow.querySelector('.days_wrapper')
  const month_name = shadow.querySelector('.month_name')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // day buttons
    const elements = []
    for (let i = 1; i <= days; i++) {
      const petname = `day_${i}`
      const on = { toggle_day_button }
      const protocol = use_protocol(petname)({ state, on })
      const opts = { i }
      const element = shadowfy()(day_button(opts, protocol))
      elements.push(element)
      async function toggle_day_button ({ data }) {
        up_channel.send({
          head: [id, up_channel.send.id, up_channel.mid++],
          type: 'toggle_day_button',
          data: label + ' ' + ('0' + i).slice(-2)
        })
      }
    }
    days_wrapper.append(...elements)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  month_name.onclick = onclick

  return el

  function onclick (e) {
    toggle_month_button()
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'toggle_month_button',
      data: label
    })
  }
  async function toggle_month_button () {
    month_name.classList.toggle('active')
  }
  async function toggle_all_days ({ data }) {
    let day = new Date(data).getDate()
    if(!day){
      day = new Date(data + ', 2000').getDate()
    }
    const petname = `day_${day}`
    const channel = state.net[state.aka[petname]]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'toggle_active',
      data: ''
    })
  }
  async function toggle_day_highlight ({ data }) {
    const { mode, date } = data
    const day = new Date(date).getDate()
    const petname = `day_${day}`
    const channel = state.net[state.aka[petname]]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: mode,
      data: ''
    })
  }

  async function toggle_day_button_visibility ({ data }) {
    const petname = 'day_29'
    const channel = state.net[state.aka[petname]]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'toggle_visibility',
      data
    })
  }
}
function get_theme () {
  return `
    .month_card {
      width: 140px;
      border: 1px solid var(--primary_color);
      background-image: radial-gradient(var(--bg_color_3) 1px, var(--bg_color_2) 2px);
      background-size: 8px 8px;
      min-height:130px;
      height:100%;
    }
    .month_card .month_name {
      display: block;
      text-align: center;
      padding: 5px 0;
      cursor: pointer;
      box-size: border-box;
      border: 0px solid var(--primary_color);
      border-width: 0 1px 2px 0;
      background-color:var(--bg_color);
    }
    .month_card .month_name.active {
      background-color: var(--ac-1)
    }
    .month_card .days_wrapper {
      display: flex;
      flex-wrap: wrap;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/month-card/month-card.js")
},{"_process":2,"buttons/day-button":15}],33:[function(require,module,exports){
(function (process,__filename){(function (){
const month_card = require('month-card')
const scrollbar = require('scrollbar')
/******************************************************************************
  MONTH FILTER COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = month_filter
// ----------------------------------------
function month_filter (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  let active_month = ''
  let active_day = ''
  let active_date_prev = []
  const month_buttons = {}
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  let month_data = [
    { name: 'January', days: 31 },
    { name: 'February', days: 29 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 },
  ]
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'update_calendar': update_calendar }
  const up_channel = use_protocol('up')({ protocol, state, on })
  
  function update_calendar ({ data }) {
    const {dates, year} = data
    if (active_day) {
      const key = `month_${new Date(active_day + ', 2000').getMonth()}`
      const channel = state.net[state.aka[key]]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'toggle_all_days',
        data: active_day
      })
      active_day = ''
    }
    if (active_month) {
      const key = `month_${new Date('01 '+ active_month + ', 2000').getMonth()}`
      const active_channel = state.net[state.aka[key]]
      active_channel.send({
        head: [id, active_channel.send.id, active_channel.mid++],
        type: 'toggle_month_button',
        data: ''
      })
      active_month = ''
    }
    
    active_date_prev.forEach(date => {
      const petname = `month_${new Date(date).getMonth()}`
      const channel = state.net[state.aka[petname]]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'toggle_day_highlight',
        data: { mode: 'remove_highlight', date }
      })
    })
    active_date_prev = dates

    //Leap year check
    month_data[1] = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ? 
    { name: 'February', days: 29 } : { name: 'February', days: 28 }
    const petname = 'month_1'
    const channel = state.net[state.aka[petname]]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'toggle_day_button_visibility',
      data: month_data[1].days === 29 ? true : false
    })

    dates.forEach(date => {
      const petname = `month_${new Date(date).getMonth()}`
      const channel = state.net[state.aka[petname]]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'toggle_day_highlight',
        data: { mode: 'add_highlight', date }
      })
    })
  }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="scrollbar_wrapper">
    <div class="month_filter_wrapper"></div>
    <div class="scrollbar-wrapper"></div>
  </div>`
  const month_filter_wrapper = shadow.querySelector('.month_filter_wrapper')
  const scrollbar_wrapper = shadow.querySelector('.scrollbar-wrapper')
  // ----------------------------------------
  const scrollbar_wrapper_shadow = scrollbar_wrapper.attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // month cards
    function make_card (month, i) {
      const on = {
        'toggle_month_button': toggle_month_button,
        'toggle_day_button': toggle_day_button
      }
      const petname = `month_${i}`
      const protocol = use_protocol(petname)({ state, on })
      const opts = month
      const element = shadowfy()(month_card(opts, protocol))
      const channel = state.net[state.aka[petname]]
      return element
    }
    const elements = month_data.map(make_card)
    month_filter_wrapper.append(...elements)
    async function toggle_month_button (message) {
      const { data } = message
      if (active_day) {
        const key = `month_${new Date(active_day + ', 2000').getMonth()}`
        const channel = state.net[state.aka[key]]
        channel.send({
          head: [id, channel.send.id, channel.mid++],
          type: 'toggle_all_days',
          data: active_day
        })
        active_day = ''
      }
      if (active_month && active_month !== data) {
        const key = `month_${new Date('01 '+ active_month + ', 2000').getMonth()}`
        const active_channel = state.net[state.aka[key]]
        active_channel.send({
          head: [id, active_channel.send.id, active_channel.mid++],
          type: 'toggle_month_button',
          data: ''
        })
      }
      active_month = active_month === data ? '' : data
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'set_scroll',
        data: { filter: 'MONTH', value: active_month }
      })
    }
    async function toggle_day_button (message) {
      const { data } = message
      if (active_month) {
        const key = `month_${new Date('01 '+ active_month + ', 2000').getMonth()}`
        const active_channel = state.net[state.aka[key]]
        active_channel.send({
          head: [id, active_channel.send.id, active_channel.mid++],
          type: 'toggle_month_button',
          data: ''
        })
        active_month = ''
      }

      if (active_day && active_day !== data) {
        const key = `month_${new Date(active_day + ', 2000').getMonth()}`
        const channel = state.net[state.aka[key]]
        if (channel) 
          channel.send({
            head: [id, channel.send.id, channel.mid++],
            type: 'toggle_all_days',
            data: active_day
          })
      }
      active_day = active_day === data ? '' : data

      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'set_scroll',
        data: { filter: 'DATE', value: active_day }
      })
    }
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.horizontal = true
    opts.data.img_src.icon_arrow_start = data.img_src.icon_arrow_left
    opts.data.img_src.icon_arrow_end = data.img_src.icon_arrow_right  
    const scroll_opts = opts 
    const element = scrollbar(scroll_opts, protocol)

    ro.observe(scrollbar_wrapper)
    month_filter_wrapper.onscroll = onscroll

    scrollbar_wrapper_shadow.append(element)
    
    function onscroll (event) {
      const scroll_channel = state.net[state.aka.scrollbar]
      scroll_channel.send({
        head: [id, scroll_channel.send.id, scroll_channel.mid++],
        refs: { },
        type: 'handle_scroll',
      })
    }
    function on_set_scroll (message) {
      console.log('set_scroll', message) 
      setScrollLeft(message.data)
    }
    const channel = state.net[state.aka.scrollbar]
    function onstatus (message) {
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: month_filter_wrapper.scrollWidth, 
          ch: month_filter_wrapper.clientWidth, 
          st: month_filter_wrapper.scrollLeft
        }
      })
    }
    async function setScrollLeft (value) {
      month_filter_wrapper.scrollLeft = value
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  
  return el
}
function get_theme () {
  return `
    .month_filter_wrapper {
      display: flex;
      height: 131px;
      width: 100%;
      border: 1px solid var(--primary_color);
      border-width: 1px 1px 3px 1px;
      overflow-x: scroll;
      overflow-y: hidden;
      scrollbar-width:none;
    }
    ::-webkit-scrollbar {
      display: none;
    } 
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/month-filter/month-filter.js")
},{"_process":2,"month-card":32,"scrollbar":42}],34:[function(require,module,exports){
(function (process,__filename){(function (){
const icon_button = require('buttons/icon-button')
const logo_button = require('buttons/logo-button')
const text_button = require('buttons/text-button')
/******************************************************************************
  NAVBAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const default_opts = { page: 'HOME' }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = navbar
// ----------------------------------------
function navbar (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data, page = default_opts.page } = opts
  // Assigning all the icons
  const {
    icon_consortium,
    icon_blogger,
    icon_discord,
    icon_twitter,
    icon_github,
    icon_terminal,
    icon_theme,
    icon_arrow_down,
    icon_arrow_up
  } = data.img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'theme': handle_active_change,
    'do_page_change': do_page_change,
    'change_highlight': change_highlight,
    'toggle_terminal': on_toggle_terminal
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="navbar_wrapper">
    <div class="navbar">
      <div class="nav_toggle_wrapper">
        <div class="info_wrapper"></div>
        <div class="logo_wrapper"></div>
        <div class="nav_toggle"></div>
      </div>
      <div class="page_btns_wrapper"></div>
      <div class="icon_btn_wrapper"></div>
    </div>
  </div>`
  const navbar = shadow.querySelector('.navbar')
  const text_wrapper = shadow.querySelector('.page_btns_wrapper')
  const icon_wrapper = shadow.querySelector('.icon_btn_wrapper')
  // ----------------------------------------
  const info_sh = shadow.querySelector('.info_wrapper').attachShadow(shopts)
  const logo_sh = shadow.querySelector('.logo_wrapper').attachShadow(shopts)
  const nav_sh = shadow.querySelector('.nav_toggle').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // consortium button
    const petname = 'CONSORTIUM'
    const on = { 'click': onclick }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { src: icon_consortium }
    const element = icon_button(opts, protocol)
    const channel = state.net[state.aka.CONSORTIUM]
    info_sh.append(element)
    function onclick (message) { // receive click from a button -> that button will become active!
      const active_id = state.status.active_button
      const default_id = state.aka[page] // only exists because it got initialized first (timing issue?)
      if (active_id === channel.send.id && active_id === default_id) return // means default is already active
      // @TODO: maybe change logic to be able to toggle an "empty desktop" too?
      const [
        next_id, data
      ] = active_id === channel.send.id ? [default_id, page] : [channel.send.id, petname]
      const be_channel = state.net[next_id]
      const ex_channel = state.net[active_id] // active button
      const up_channel = state.net[state.aka.up] // parent element
      do_page_change(data, message.head, { be_channel, ex_channel, up_channel })
    }
  }
  { // logo button
    const on = {}
    const protocol = use_protocol('logo_button')({ state, on })
    const element = logo_button(opts, protocol)
    logo_sh.append(element)
  }
  { // nav toggle button
    const on = { 'click': onclick }
    const protocol = use_protocol('navtoggle')({ state, on })
    const opts = { src: icon_arrow_down, src_active: icon_arrow_up, activate: true }
    const element = icon_button(opts, protocol)
    const channel = state.net[state.aka.navtoggle]
    nav_sh.append(element)
    function onclick (message) {
      state.status.dropdown_collapsed = !state.status.dropdown_collapsed
      navbar.classList.toggle('active', state.status.dropdown_collapsed)
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: state.status.dropdown_collapsed ? 'activate' : 'inactivate',
      })
    }
  }
  { // text buttons
    const names = ['HOME', 'PROJECTS', 'DAT_GARDEN', 'TIMELINE']
    function make_button (text) {
      const petname = text
      const on = { 'click': onclick }
      const protocol = use_protocol(petname)({ state, on })
      const opts = { text }
      const element = shadowfy({ className: 'text_button_wrapper' })(text_button(opts, protocol))
      const channel = state.net[state.aka[petname]]
      return element
      function onclick (message) { // receive click from a button -> that button will become active!
        const active_id = state.status.active_button
        const default_id = state.aka[page] // only exists because it got initialized first (timing issue?)
        if (active_id === channel.send.id && active_id === default_id) return // means default is already active
        // @TODO: maybe change logic to be able to toggle an "empty desktop" too?
        const [
          next_id, data
        ] = active_id === channel.send.id ? [default_id, page] : [channel.send.id, petname]
        const be_channel = state.net[next_id]
        const ex_channel = state.net[active_id] // active button
        const up_channel = state.net[state.aka.up] // parent element
        do_page_change(data, message.head, { be_channel, ex_channel, up_channel })
      }
    }
    const elements = names.map(make_button)
    text_wrapper.append(...elements)
  }
  { // social buttons
    const socials = [{
      name: 'blog_button',
      src: icon_blogger,
      activate: false,
      link: 'https://blog.dat-ecosystem.org/'
    }, {
      name: 'discord_button',
      src: icon_discord,
      activate: false,
      link: 'https://discord.com/invite/egsvGc9TkQ'
    }, {
      name: 'twitter_button',
      src: icon_twitter,
      activate: false,
      link: 'https://twitter.com/dat_ecosystem'
    }, {
      name: 'github_button',
      src: icon_github,
      activate: false,
      link: 'https://github.com/dat-ecosystem'
    }]
    function make_button ({ name: petname, src, activate, link }) {
      const on = { 'click': onclick }
      const protocol = use_protocol(petname)({ state, on })
      const opts = { src, activate, link }
      const element = shadowfy({ className: '' })(icon_button(opts, protocol))
      return element
      function onclick (message) {
        const up_channel = state.net[state.aka[petname]]
        const [by, to, mid] = [id, up_channel.send.id, up_channel.mid++]
        up_channel.send({
          head: [by, to, mid],
          refs: { cause: message.head },
          type: 'activate',
        })
      }
    }
    const elements = socials.map(make_button)
    icon_wrapper.append(...elements)
  }
  { // terminal button
    const petname = 'terminal_button'
    const on = { 'click': onclick }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { src: icon_terminal }
    const element = icon_button(opts, protocol)
    icon_wrapper.append(element)
    function onclick (message) {
      const up_channel = state.net[state.aka.up]
      const [by, to, mid] = [id, up_channel.send.id, up_channel.mid++]
      up_channel.send({
        head: [by, to, mid],
        refs: { cause: message.head },
        type: 'toggle_terminal',
      })
    }
  }
  { // theme button
    const petname = 'theme_button'
    const on = { 'click': onclick }
    const protocol = use_protocol(petname)({ state, on })
    const opts = { src: icon_theme, activate: true }
    const element = icon_button(opts, protocol)
    const channel = state.net[state.aka.theme_button]
    icon_wrapper.append(element)
    function onclick (message) {
      state.status.theme_dark = !state.status.theme_dark
      const up_channel = state.net[state.aka.up]
      const [by, to, mid] = [id, up_channel.send.id, up_channel.mid++]
      up_channel.send({
        head: [by, to, mid],
        refs: { cause: message.head },
        type: 'handle_theme_change',
        data: ''
      })
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        refs: { cause: message.head },
        type: state.status.theme_dark ? 'activate' : 'inactivate',
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  initialize(page)

  return el

  function initialize (page) {
    // SET DEFAULTS
    state.status.active_button = state.aka[page]
    const active_id = state.status.active_button
    const be_channel = state.net[active_id]
    const up_channel = state.net[state.aka.up]

    // APPLY OPTS (1):
    // @TODO: issue: how to submit an `onclick` event to trigger the initial change?

    const [by, to, mid] = [id, id, 0] // @TODO: improve self messaging
    let message = { head: [by, to, mid], type: 'init' }
    do_page_change(page, message.head, { be_channel, up_channel })
  }
  function handle_active_change (message) { // handle on
    const { data: active_page } = message

    console.log('INITIALIZE', {active_page, active_id: state.aka[active_page] })

    state.status.active_button = state.aka[active_page]
    // APPLY OPTS (2):
    // @TODO: PROBLEM: this makes navbar know what is active, but it doesnt highlight it yet
  }
  function do_page_change (page, head, { be_channel, ex_channel, up_channel }) {
    if (ex_channel) ex_channel.send({ // old active nav button
      head: [id, ex_channel.send.id, ex_channel.mid++],
      refs: { cause: head },
      type: 'inactivate',
    })
    if (be_channel) be_channel.send({ // new active nav button
      head: [id, be_channel.send.id, be_channel.mid++],
      refs: { cause: head },
      type: 'activate',
    })
    if (up_channel) up_channel.send({ // send parent to update page content
      head: [id, up_channel.send.id, up_channel.mid++],
      refs: { cause: head },
      type: 'handle_page_change',
      data: page
    })
    state.status.active_button = be_channel.send.id
  }
  function change_highlight ( {head, data: page} ) {
    const ex_channel = state.net[state.status.active_button]
    state.status.active_button = state.aka[page]
    const be_channel = state.net[state.status.active_button]
    if (ex_channel) ex_channel.send({ // old active nav button
      head: [id, ex_channel.send.id, ex_channel.mid++],
      refs: { cause: head },
      type: 'inactivate',
    })
    if (be_channel) be_channel.send({ // new active nav button
      head: [id, be_channel.send.id, be_channel.mid++],
      refs: { cause: head },
      type: 'activate',
    })
  }
  function on_toggle_terminal () {
    state.status.terminal_collapsed = !state.status.terminal_collapsed
    const channel = state.net[state.aka.terminal_button]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: state.status.terminal_collapsed ? 'activate' : 'inactivate',
    })
  }
}
function get_theme () {
  return `
    .navbar_wrapper {
      container-type: inline-size;
      width: 100%;
    }
    .navbar {
      display: block;
      width: 100%;
      height: 40px;
      overflow: hidden;
      border-bottom: 1px solid var(--primary_color);
      --s: 15px; /* control the size */
      --_g: var(--bg_color_2) /* first color */ 0 25%, #0000 0 50%;
      background:
          repeating-conic-gradient(at 33% 33%,var(--_g)),
          repeating-conic-gradient(at 66% 66%,var(--_g)),
          var(--bg_color_3);  /* second color */
      background-size: var(--s) var(--s);
    }
    .navbar.active {
      height: max-content;
    }
    .nav_toggle_wrapper {
      display: flex;
      width:1 00%;
      justify-content: stretch;
    }
    .nav_toggle_wrapper .logo_wrapper{
      width: 100% !important;
      flex-grow: 1;
    }
    .nav_toggle_wrapper .nav_toggle {
      display: block;
    }
    .page_btns_wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    .page_btns_wrapper .text_button_wrapper {
      width: 100%;
      flex-grow: 1;
    }
    .icon_btn_wrapper {
      display: flex;
      justify-content: flex-start;
    }
    @container(min-width: 899px) {
      .navbar_wrapper .navbar {
        display: flex;
      }
      .navbar_wrapper .navbar .nav_toggle_wrapper {
        width: max-content;
        display: flex;
      }
      .nav_toggle_wrapper .logo_wrapper {
        width: max-content !important;
      }
      .nav_toggle_wrapper .nav_toggle {
        display: none;
      }
      .navbar_wrapper .navbar .page_btns_wrapper {
        flex-direction: row;
      }
      .page_btns_wrapper .text_button_wrapper {
        width: max-content !important;
        flex-grow: unset;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/navbar/navbar.js")
},{"_process":2,"buttons/icon-button":16,"buttons/logo-button":17,"buttons/text-button":23}],35:[function(require,module,exports){
module.exports=[
  {"name": "Andrew Osheroff", "link": "https://github.com/andrewosh"},
  {"name": "Bruno Vieira", "link": "https://twitter.com/bmpvieira"},
  {"name": "Chia-liang Kao", "link": "http://github.com/clkao"},
  {"name": "Danielle Robinson", "link": "https://github.com/daniellecrobinson"},
  {"name": "David Clements", "link": "http://github.com/davidmarkclements"},
  {"name": "Finn Pauls", "link": "http://github.com/finnp"},
  {"name": "Georgiy Shibaev", "link": "http://github.com/RangerMauve"},
  {"name": "Jim Pick", "link": "http://github.com/jimpick"},
  {"name": "Joe Hand", "link": "http://github.com/joehand"},
  {"name": "Juan Batiz-Benet", "link": "http://github.com/jbenet"},
  {"name": "Julian Gruber", "link": "http://github.com/juliangruber"},
  {"name": "Kira Oakley", "link": "https://github.com/hackergrrl"},
  {"name": "Kristina Schneider", "link": "http://github.com/kriesse"},
  {"name": "Martin Heidegger", "link": "https://github.com/martinheidegger"},
  {"name": "Mathias Buus", "link": "https://github.com/mafintosh"},
  {"name": "Max Ogden", "link": "http://twitter.com/maxogden"},
  {"name": "Melanie Cebula", "link": "http://github.com/melaniecebula"},
  {"name": "Paul Frazee", "link": "https://github.com/pfrazee"},
  {"name": "Portia Burton", "link": "http://github.com/pkafei"},
  {"name": "Rae McKelvey", "link": "https://github.com/okdistribute"},
  {"name": "Tara Vancil", "link": "http://github.com/taravancil"},
  {"name": "Yoshua Wuyts", "link": "https://github.com/yoshuawuyts"},
  {"name": "Yuhong Wang", "link": "http://github.com/ywyw"}
]
},{}],36:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const scrollbar = require('scrollbar')
const alumni = require('./alumni.json');

/******************************************************************************
  OUR alumni COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = our_alumni
// ----------------------------------------
function our_alumni (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'show': on_show, 'hide': on_hide }
  const channel = use_protocol('up')({ protocol, state, on })
  function on_show (message) {
    our_alumni_wrapper.style.display = 'block'
  }
  function on_hide (message) {
    our_alumni_wrapper.style.display = 'none'
  }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="our_alumni">
    <div class="windowbar"></div>
    <div class="scrollbar_wrapper">
      <div class="alumni_content">
        <h2>## our alumni</h2>
      </div>
    </div>
  </div>`

  // Function to create a table from the alumni data
  function createTable(data) {
    const tableHeader = '<thead><tr><td> no. </td><td> name </td></tr></thead>'
    const tableRows = data.map((alumni, index) => {
      const anchorLink = `<a href="${alumni.link}" target="_blank">${alumni.name}</a>`
      return `<tr><td> ${index + 1} </td><td> ${anchorLink} </td></tr>`
    })
    const table = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`
    return table
  }

  const tableHTML = createTable(alumni)
  const tempContainer = document.createElement('div')
  tempContainer.innerHTML = tableHTML
  const tableElement = tempContainer.querySelector('table')
  const alumni_content = shadow.querySelector('.alumni_content')
  alumni_content.appendChild(tableElement)



  const our_alumni_wrapper = shadow.querySelector('.our_alumni')
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('windowbar')({ state,  on })
    const opts = {
      name:'our_alumni.md', 
      src: icon_pdf_reader,
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') our_alumni_wrapper.style.display = 'none'
      const channel = state.net[state.aka.up]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'deactivate_tick',
        data: opts.name
      })
    }
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, status: onstatus }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down
    const opts1 = { data }
    const element = shadowfy()(scrollbar(opts1, protocol))
    scrollbar_wrapper.append(element)
    alumni_content.onscroll = on_scroll
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  watch_scrollbar()

  return el

  function watch_scrollbar () {
    const channel = state.net[state.aka.scrollbar]
    ro.observe(alumni_content)
  }
  function on_scroll (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  }
  function on_set_scroll (message) {
    console.log('set_scroll', message) 
    setScrollTop(message.data)
  }
  function onstatus (message) {
    const channel = state.net[state.aka.scrollbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { cause: message.head },
      type: 'update_size',
      data: {
        sh: alumni_content.scrollHeight,
        ch: alumni_content.clientHeight,
        st: alumni_content.scrollTop
      }
    })
  }
  async function setScrollTop (value) {
    alumni_content.scrollTop = value
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .our_alumni {
      display: none;
      margin-bottom: 30px;
    }
    .alumni_content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 10px;
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      max-height: 600px;
      overflow-y: scroll;
    }
    .alumni_content::-webkit-scrollbar{
      display: none;
    }
    .alumni_content h2 {
      margin: 0;
    }
    .alumni_content table {
      border-collapse: collapse;
    }
    .alumni_content table thead {
      font-weight: bold;
    }
    .alumni_content table td {
      border: 1px solid var(--primary_color);
      padding: 8px;
    }
    .our_alumni .scrollbar_wrapper{
      display: flex;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/our-alumni/our-alumni.js")
},{"./alumni.json":35,"_process":2,"scrollbar":42,"window-bar":55}],37:[function(require,module,exports){
module.exports=[
    { "name": "Alexander Cobleigh", "organization": "Cabal", "link": "https://github.com/cblgh" },
    { "name": "Alexander Praetorius", "organization": "DatDot & WizardAmigos", "link": "https://github.com/serapath" },
    { "name": "Diego Paez", "organization": "Geut Studio", "link": "https://github.com/dpaez" },
    { "name": "Franz Heinzmann", "organization": "Sonar", "link": "https://github.com/frando" },
    { "name": "Kevin Faaborg", "organization": "Ara", "link": "https://github.com/zootella" },
    { "name": "Nina Breznik", "organization": "DatDot & WizardAmigos", "link": "https://github.com/ninabreznik" }
  ]  
},{}],38:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
const members = require('./members.json');

/******************************************************************************
  OUR MEMBERS COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = our_members
// ----------------------------------------
function our_members (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'show': on_show, 'hide': on_hide }
  const channel = use_protocol('up')({ protocol, state, on })
  function on_show (message) {
    our_members_wrapper.style.display = 'inline'
  }
  function on_hide (message) {
    our_members_wrapper.style.display = 'none'
  }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="our_member">
    <div class="windowbar"></div>
    <div class="member_content">
      <h2>## our members</h2>
    </div>
  </div>`

  // Function to create a table from the members data
  function createTable(data) {
    const tableHeader = '<thead><tr><td> no. </td><td> name </td><td> organization </td></tr></thead>'
    const tableRows = data.map((member, index) => {
      const anchorLink = `<a href="${member.link}" target="_blank">${member.name}</a>`
      return `<tr><td> ${index + 1} </td><td> ${anchorLink} </td><td> ${member.organization}  </td></tr>`
    })
    const table = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`
    return table
  }

  const tableHTML = createTable(members)
  const tempContainer = document.createElement('div')
  tempContainer.innerHTML = tableHTML
  const tableElement = tempContainer.querySelector('table')
  const memberContent = shadow.querySelector('.member_content')
  memberContent.appendChild(tableElement)



  const our_members_wrapper = shadow.querySelector('.our_member')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('windowbar')({ state,  on })
    const opts = {
      name:'our_members.md', 
      src: icon_pdf_reader,
      data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') our_members_wrapper.style.display = 'none'
      const channel = state.net[state.aka.up]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'deactivate_tick',
        data: opts.name
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .our_member {
      display: none;
    }
    .member_content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      padding: 10px;
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
    }
    .member_content h2 {
      margin: 0;
    }
    .member_content table {
      border-collapse: collapse;
    }
    .member_content table thead {
      font-weight: bold;
    }
    .member_content table td {
      border: 1px solid var(--primary_color);
      padding: 8px;
    }
    @container (min-width: 510px) {
      .our_member .member_content {
        width: auto;
        height: auto;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/our-members/our-members.js")
},{"./members.json":37,"_process":2,"window-bar":55}],39:[function(require,module,exports){
(function (process,__filename){(function (){
const sm_icon_button = require('buttons/sm-icon-button')
/******************************************************************************
  PROJECT CARD COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = project_card
// ----------------------------------------
function project_card (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data, project_data } = opts
  const { 
    project_name,
    project_desc,
    project_logo,
    project_website, 
    project_socials,
    project_tags, 
    } = project_data
  
  // Assigning all the icons
  const { img_src: { 
      icon_consortium = `${prefix}/icon_consortium_page.png`,
  } } = data
  
  const social_icons = []
  project_socials.forEach((item) => {
    Object.entries(data.img_src).some(([key, value]) => {
      const icon_name = key.split('_')[1]
      if(item[icon_name] !== undefined){
        social_icons.push({icon: value, link: item[icon_name]})
        return true
      }
    })
  })

  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  el.style.height = "100%"
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="project_card">
    <div class="icon_wrapper">
      <div class="project_title">
        <a href="${project_website}" target="_blank">${project_name}</a>
        <img hidden src="${project_logo}">
      </div>
      <div class="socials_wrapper"><socials></socials></div>
    </div>
    <div class="content_wrapper">
      <div class="desc"> ${project_desc}</div>
    </div>
    <div class="tags_wrapper">
      ${project_tags.map(tag => `<div class="tag">${tag}</div>`).join('')}
    </div>
  </div>`
  const socials_wrapper = shadow.querySelector('socials')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  socials_wrapper.replaceWith(...social_icons.map(x => sm_icon_button({ src: x.icon, link: x.link })).map(shadowfy()))
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .project_card {
      display: flex;
      flex-direction: column;
      justify-content:space-between;
      height: 100%;
      width: 100%;
      line-height: normal;
      background-color: var(--bg_color);
      color: var(--primary_color) !important;
      border: 1px solid var(--primary_color);
      container-type: inline-size;
      box-sizing: border-box;
    }
    .icon_wrapper {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--primary_color);
    }
    .project_title {
      display: flex;
      gap: 5px;
      font-size: 16px;
      letter-spacing: -2px;
      align-items: center;
      font-weight: 700;
      margin-left: 5px;
    }
    .socials_wrapper {
      display: flex;
    }
    .content_wrapper {
      padding: 20px;
    }
    .desc {
      font-size: 14px;
      letter-spacing: -2px;
      line-height: 16px;
    }
    .tags_wrapper {
      width: 100%;
      justify-self: flex-end;
      display: flex;
      flex-wrap: wrap;
    }
    .tag {
      flex-grow: 1;
      min-width: max-content;
      padding:5px 10px;
      border: 1px solid var(--primary_color);
      text-align:center;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/project-card/project-card.js")
},{"_process":2,"buttons/sm-icon-button":20}],40:[function(require,module,exports){
(function (process,__filename){(function (){
const search_input = require('search-input')
const select_button = require('buttons/select-button')
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = project_filter
// ----------------------------------------
function project_filter (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { tags, data } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const up_channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="filter_wrapper">
    <div class="project_filter"></div>
  </div>`
  const project_filter = shadow.querySelector('.project_filter')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // status button
    const on = { 'value': on_value }
    const protocol = use_protocol('status_button')({ state, on })
    const opts = { data, name: 'STATUS', choices: ['ACTIVE', 'INACTIVE', 'PAUSED'] }
    const element = shadowfy()(select_button(opts, protocol))
    project_filter.append(element)
  }
  { // tag button
    const on = { 'value': on_value }
    const protocol = use_protocol('tag_button')({ state, on })
    const opts = { data, name: 'TAGS', choices: tags }
    const element = shadowfy()(select_button(opts, protocol))
    project_filter.append(element)
  }
  { // search project
    const on = { 'value': on_value }
    const protocol = use_protocol('search_project')({ state, on })
    const search_opts = opts
    const element = shadowfy()(search_input(search_opts, protocol))
    project_filter.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_value (message) {
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      refs: { cause: message.head },
      type: 'value',
      data: message.data
    })
  }
}
function get_theme () {
  return `
    .filter_wrapper {
      container-type: inline-size;
    }
    .project_filter {
      display: grid;
      grid-template-columns: 12fr;
      align-items: flex-end;
    }
    @container (min-width: 412px) {
      .project_filter {
        grid-template-columns: 1fr 1fr 10fr;
      }
    }
  `
} 
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/project-filter/project-filter.js")
},{"_process":2,"buttons/select-button":18,"search-input":43}],41:[function(require,module,exports){
(function (process,__filename){(function (){
const app_projects = require('app-projects')
const the_dat = require('the-dat')
const app_footer = require('app-footer')
/******************************************************************************
  PROJECTS PAGE COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = projects_page
// ----------------------------------------
function projects_page (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    '': msg => {
      console.error('what')
    }
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  // adding a `main-wrapper` 
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="main-wrapper">
    <div class="main"></div>
  </div>`
  const main = shadow.querySelector('.main')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // the dat
    const on = {}
    const protocol = use_protocol('the_dat')({ state, on })
    const opts = { data }
    const element = shadowfy()(the_dat(opts, protocol))
    main.append(element)
  }
  { // projects
    const on = {}
    const protocol = use_protocol('app_projects')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_projects(opts, protocol))
    main.append(element)
  }
  { // footer
    const on = {}
    const protocol = use_protocol('app_footer')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_footer(opts, protocol))
    main.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
    }
    .main {
      margin: 0;
      padding: 30px 10px;
      opacity: 1;
      background-size: 16px 16px;
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/projects-page/projects-page.js")
},{"_process":2,"app-footer":9,"app-projects":12,"the-dat":47}],42:[function(require,module,exports){
(function (process,__filename){(function (){
const sm_icon_button = require('buttons/sm-icon-button')
/******************************************************************************
  SCROLL COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const svgdot_datauri = `
<svg width="16px" height="16px" viewBox="8 8 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#2ACA4B" d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z"></path>
</svg>
`
const default_opts = { svgdot_datauri }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = scrollbar
// ----------------------------------------
function scrollbar (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  const size = {
    content_scrollSize: null,   // Width, Height
    content_clientSize: null,  // Width, Height
    content_scrollStart: null, // Left, Top
  }
  let lastPage
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const {
    horizontal = false,
    data: {
      img_src: {
        icon_arrow_start = default_opts.svgdot_datauri,
        icon_arrow_end = default_opts.svgdot_datauri,
      }
    }
  } = opts
  const direction = horizontal ? 'horizontal' : 'vertical'
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { update_size, handle_scroll }
  const up_channel= use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="scrollbar_wrapper ${direction}-wrapper">
    <div class="bar_wrapper ${direction}-bar-wrapper">
      <div class="bar ${direction}-bar"></div>
    </div>
    <div class="controls ${direction}-ctrls-wrapper"></div>
  </div>`
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  const bar = shadow.querySelector('.bar')
  // ----------------------------------------
  const controls_wrapper = shadow.querySelector('.controls')
  const controls = controls_wrapper.attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // bar
    bar.onmousedown = handle_mousedown
  }
  { // arrow start
    const on = { 'click': on_click }
    const protocol = use_protocol('arrow_start')({ state, on })
    const opts = { src: icon_arrow_start, activate: false }
    const element = shadowfy()(sm_icon_button(opts, protocol))
    controls.append(element)
    function on_click (event) {
      emit_status()
      const ratio = size.content_clientSize / size.content_scrollSize
      const data = size.content_scrollStart - 30 / ratio
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'set_scroll',
        data
      })
    }
  }
  { // arrow end
    const on = { 'click': on_click }
    const protocol = use_protocol('arrow_end')({ state, on })
    const opts = { src: icon_arrow_end, activate: false }
    const element = shadowfy()(sm_icon_button(opts, protocol))
    controls.append(element)
    function on_click (event) {
      emit_status()
      const ratio = size.content_clientSize / size.content_scrollSize
      const data = size.content_scrollStart + 30 / ratio
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'set_scroll',
        data
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          handle_scroll()
          observer.unobserve(entry.target)
        }
      })
    })
    observer.observe(scrollbar_wrapper)
  }, 2000)

  return el

  function update_size ({ data }) {
    const { sh, ch, st } = data
    size.content_clientSize = ch
    size.content_scrollSize = sh
    size.content_scrollStart = st
  }
  function handle_scroll () {
    emit_status()
    const ratio = size.content_clientSize / size.content_scrollSize
    if (ratio >= 1) el.style.cssText = 'display: none;'
    else el.style.cssText = 'display: inline;'
    const [prop1, prop2] = horizontal ? ['width', 'left'] : ['height', 'top']
    const percent1 = ratio * 100
    const percent2 = (size.content_scrollStart / size.content_scrollSize ) * 100
    bar.style.cssText = `${prop1}: ${percent1}%; ${prop2}: ${percent2}%;`
  }
  function emit_status () {
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'status',
      data: null
    })
  }
  function handle_mousedown (e) {
    lastPage = horizontal ? e.pageX : e.pageY
    // @TODO:
    // => maybe refactor to use ELEMENT instead of WINDOW
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
    window.onmousemove = handle_mousemove
    window.onmouseup = handle_mouseup
  }
  function handle_mouseup () {
    window.onmousemove = null
    window.onmouseup = null
  }
  function handle_mousemove (e) {
    emit_status()
    const nextPage = horizontal ? e.pageX : e.pageY
    const delta = nextPage - lastPage
    lastPage = nextPage
    const ratio = size.content_clientSize / size.content_scrollSize
    const data = size.content_scrollStart + delta / ratio
    up_channel.send({
      head: [id, up_channel.send.id, up_channel.mid++],
      type: 'set_scroll',
      data
    })
  }
}
function get_theme () {
  return `
    .horizontal-wrapper {
      height: 30px;
      width: 100%;
      flex-direction: row;
    }
    .horizontal-ctrls-wrapper {
      display: flex;
    }
    .vertical-ctrls-wrapper {
      display: flex;
      flex-direction: column;
    }
    .vertical-wrapper {
      width: 30px;
      height: 100%;
      flex-direction: column;
    }
    .scrollbar_wrapper {
      box-sizing: border-box;
      display: flex;
    }
    .scrollbar_wrapper .vertical-bar-wrapper {
      flex-direction: column;
      height: 100%;
    }
    .scrollbar_wrapper .horizontal-bar-wrapper {
      width: 100%;
    }
    .scrollbar_wrapper .controls {
      display: flex;
    }
    .scrollbar_wrapper .bar_wrapper {
      display: flex;
    }
    .bar_wrapper .vertical-bar {
      height: 30px;
    }
    .bar_wrapper .horizontal-bar {
      width: 30px;
    }
    .bar_wrapper .bar {
      position: relative;
      background-color: var(--primary_color);
      cursor: pointer;
      transition: opacity 0.25s linear;
      box-shadow:inset 0px 0px 0px 1px var(--bg_color);
    }
    .bar_wrapper .bar:hover {
      cursor: pointer
    }
    .bar_wrapper .bar:active {
      -o-user-select: none;
      -ms-user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/scrollbar/scrollbar.js")
},{"_process":2,"buttons/sm-icon-button":20}],43:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  SEARCH INPUT COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = input_search
// ----------------------------------------
function input_search (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
      icon_search = `${prefix}/icon_search.svg`,
  } } = data
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="search_input">
    <input class="input" type="text" placeholder="SEARCH...">
      ${icon_search}
    </input>
  </div>`
  const input = shadow.querySelector('.input')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  input.oninput = oninput
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function oninput (e) {
    const { value } = e.target
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'value',
      data: { filter: 'SEARCH', value }
    })
  }
}
function get_theme () {
  return `
  .search_input {
    width: 100%;
    min-width: 100% !important;
    height: 30px;
    max-height: 40px;
    position: relative;
    flex-grow: 1;
  }
  .search_input input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 2px solid var(--primary_color);
    padding: 10px 40px 10px 5px;
    outline: none;
    font-family: Silkscreen;
    font-size: 18px;
    letter-spacing: -1px;
    background-color: var(--bg_color);
    color: var(--primary-color);
  }
  .search_input input:focus {
    border-color: var(--ac-1) !important;
  }
  .search_input svg {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: auto;
  }
  .search_input svg * {
    fill: var(--primary_color);
  }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/search-input/search-input.js")
},{"_process":2}],44:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = svg_element
// ----------------------------------------
function svg_element (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { source } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = source
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  el.onclick = undefined
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    svg {
      height: 40px;
      width: 40px;
      margin: 5px 0;
      padding: 3px;
      background-color: var(--bg_color_2);
    }
    svg path {
      fill: var(--primary_color);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/svg-element/svg-element.js")
},{"_process":2}],45:[function(require,module,exports){
(function (process,__filename){(function (){
const scrollbar = require('scrollbar')
/******************************************************************************
  TAB WINDOW COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = tab_window
// ----------------------------------------
function tab_window (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  status.commands = {
    'help': on_help,
    'list': on_list,
    'goto': on_goto,
    'read': on_read,
    'unknown': {content: 'Command not found', status: 'red'}
  }
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { text } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'toggle_fullscreen': toggle_fullscreen
  }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="tab_wrapper">
    <div class="scrollbar_wrapper">
      <div class="color1">
        Type <span class="prompt">help()</span> for more info.
      </div>
      <div class="history">
      </div>
      <div class="dollar">
        <textarea type="text" id="input" autocomplete="off"></textarea>
      </div>
    </div>
  </div>`
  const tab_wrapper = shadow.querySelector('.tab_wrapper')
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  const history = shadow.querySelector('.history')
  const input = shadow.querySelector('textarea')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  input.onkeyup = textAreaAdjust
  input.onkeydown = handleKeyDown
  
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, 'status': on_update_size }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.horizontal = false
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_up
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_down
    const scroll_opts = opts
    const element = scrollbar(scroll_opts, protocol)

    scrollbar_wrapper.onscroll = on_scroll
    const scroll_channel = state.net[state.aka.scrollbar]
    ro.observe(scrollbar_wrapper)

    tab_wrapper.append(element)

    function on_scroll (event) {
      console.log('scrollbar_wrapper:terminal:scroll')
      scroll_channel.send({
        head: [id, scroll_channel.send.id, scroll_channel.mid++],
        refs: { },
        type: 'handle_scroll',
      })
    }
    function on_set_scroll (message) {
      console.log('set_scroll', message) 
      setScrollTop(message.data)
    }
    function on_update_size (message) {
      const head = [id, scroll_channel.send.id, scroll_channel.mid++]
      scroll_channel.send({
        head,
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: scrollbar_wrapper.scrollHeight,
          ch: scrollbar_wrapper.clientHeight,
          st: scrollbar_wrapper.scrollTop
        }
      })
    }
    async function setScrollTop (value) {
      scrollbar_wrapper.scrollTop = value
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function textAreaAdjust (e) {
    e.target.style.height = "1px";
    e.target.style.height = (25+e.target.scrollHeight)+"px";
  }
  function handleKeyDown (e) {
    if (e.which === 13){
      if (input.value) {
        const prompt = document.createElement('div')
        prompt.classList.add('prompt')
        prompt.innerHTML = `<span class="no-select">$&nbsp</span>${input.value}`
        
        let [command, data] = input.value.trim().toLowerCase().split('(')
        command = command.trim()

        const response = document.createElement('div')
        let response_data
        if(status.commands[command] && data && data.slice(-1) === ')'){
          response_data = status.commands[command](data.replace(/[)]/g, '').trim())
        }
        else{
          response_data = status.commands['unknown']
        }
        
        response.classList.add(response_data.status)
        response.innerHTML = response_data.content

        history.append(...[prompt, response])
      }
      else{
        const prompt = document.createElement('div')
        prompt.innerHTML = '$'
        history.append(prompt)
      }
      //Clear input
      setTimeout(() => input.value = '', 2)
    }
  }
  function on_list (data){
    const command_list = require(`../data/data.json`)
    let response, check

    if(data){
      response = command_list
      const arguments = data.split('/') 
      arguments.forEach(argument => {
          console.error(argument)
          if(argument){
            response = response[argument]
            check = false
          }
          else if(check)
            response = ''
          else
            check = true
        }
      )
    }
    else{
      response = command_list
    }
    
    if(typeof(response) === 'object'){
      return {content: '<span class="ac-3">[</span>' + Object.entries(response).map(v => {
        if(typeof(v[1]) === 'string')
          return v[0]
        else
          return v[0] + '/'
      }).toString().replace(/,/g, '<span class="ac-3">, </span>') + '<span class="ac-3">]</span>', status: 'color1'}
    }
    return {content: 'undefined', status: 'red'}
  }
  function on_read (data){
    const command_list = require(`../data/data.json`)
    let response, check

    if(data){
      response = command_list
      const arguments = data.split('/') 
      arguments.forEach(argument => {
          console.error(response)
          if(argument){
            response = response[argument]
            check = false
          }
          else if(check)
            response = {}
          else
            check = true
        }
      )
    }

    if(typeof(response) === 'string')
      return {content: response, status: 'color1'}
    return {content: 'undefined', status: 'red'}
  }
  function on_help (){
    return {content: `
      <br>
      <b class="ac-3">
        ##----------------------------------------- <br>
        ## Description of commands <br>
        ##----------------------------------------- <br>
      </b>
      <span class="prompt">goto(<u class="argument">page_name</u>)</span> <br>
      - goto command will bring you to the specified page <br>
      - <u class="argument">page_name</u> refers to website pages. For instance 'goto(projects)' <br>
      <br>
      <span class="prompt">list(<u class="argument">folder_address</u>: optional)</span>  <br>
      - list command will list the items in the specified folder <br>
      - <u class="argument">folder_address</u> refers to the JSON address of the folder. For instance 'list(info)' <br>
      <br>
      <span class="prompt">read(<u class="argument">file_address</u>)</span> <br>
      - read command will print the content in the specified file <br>
      - <u class="argument">file_address</u> refers to the JSON address of the file. For instance 'read(info/mission_statement.md)' <br>
      <br>
      <b class="ac-3">
        ##----------------------------------------- <br>
        ## Pages <br>
        ##----------------------------------------- <br>
      </b>
      Consortium<br>
      Home<br>
      Timeline<br>
      Dat_garden<br>
      Projects<br>
      <br>
      <b class="ac-3">
      ##----------------------------------------- <br>
      ## Files and Folders <br>
      ##----------------------------------------- <br>
      </b>
      Folders end with a / and Files end with a letter. Type <span class="prompt">list()</span> for more info.<br>
      <br>
      `, status: 'color1'}
  }
  function on_goto (data){
    data = data.toUpperCase()
    const pages = ['TIMELINE', 'PROJECTS', 'HOME', 'DAT_GARDEN', 'CONSORTIUM']
    if(pages.includes(data)){
      const up_channel = state.net[state.aka.up]
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'navigate',
        data
      })
      return {content: 'success', status: 'color1'}
    }
    return {content: 'page not found', status: 'red'}
  }
  function toggle_fullscreen (msg){
    scrollbar_wrapper.classList.toggle('fullscreen')
  }

}

function get_theme() {
  return `
    .tab_wrapper{
      display: flex;
    }
    .tab_wrapper > div:last-child{
      border-left: 1px solid var(--primary_color);
    }
    .scrollbar_wrapper{
      max-height: 220px;
      overflow-y: scroll;
      overflow-x: clip;
      width: 100%;
    }
    .scrollbar_wrapper.fullscreen{
      max-height: calc(100vh - 80px);
    }
    .scrollbar_wrapper::-webkit-scrollbar {
      display: none;
    }
    .tab_wrapper #input{
      display: inline;
      background-color: transparent;
      color: blue;
      border: none;
      outline: none;
      width: 100%;
      text-indent: 20px;
      font-family: Silkscreen;
      font-size: 16px;
      padding: 0;
      resize: none;
    }
    .tab_wrapper .dollar{
      position: relative;
    }
    .tab_wrapper .dollar::before{
      content: '$';
      position: absolute;
      color: blue;
      top: 0;
    }
    .tab_wrapper .prompt{
      color: blue;
    }
    .tab_wrapper .red{
      color: red;
    }
    .tab_wrapper .color1{
      color: var(--ac-1);
    }
    .tab_wrapper .argument{
      color: gray;
    }
    .tab_wrapper .no-select{
      user-select: none;
    }
    .tab_wrapper .ac-3{
      color: var(--ac-3);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/tab-window/tab-window.js")
},{"../data/data.json":28,"_process":2,"scrollbar":42}],46:[function(require,module,exports){
(function (process,__filename){(function (){
const tab_window = require('tab-window')
const tab_button = require('buttons/tab-button')
const sm_icon_button_alt = require('buttons/sm-icon-button-alt')
const scrollbar = require('scrollbar')
/******************************************************************************
  TERMINAL COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = terminal
// ----------------------------------------
function terminal (opts = default_opts, protocol) {
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const viewports = {}
  const _ = { viewports }
  const ro = new ResizeObserver(entries => {
    console.log('ResizeObserver:terminal:resize')
    const scroll_channel = state.net[state.aka.scrollbar]
    scroll_channel.send({
      head: [id, scroll_channel.send.id, scroll_channel.mid++],
      refs: { },
      type: 'handle_scroll',
    })
  })
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = { active_tab: null, tab_id: 0, tab: {} }
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const {
    icon_terminal,
    icon_close_light,
    icon_plus,
    icon_full_screen
  } = opts.data.img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="terminal_wrapper">
    <div class="terminal">
      <div class="header">${icon_terminal}Terminal</div>
      <div class="tab_display"></div>
      <div class="footer">
        <div class="tabs_bar">
          <div class="tab_buttons"></div>
          <div class="scrollbar-wrapper"></div>
        </div>
        <div class="buttons"></div>
      </div>
    </div>
  </div>`
  const terminal_wrapper = shadow.querySelector('.terminal')
  const tab_buttons = shadow.querySelector('.tab_buttons')
  // ----------------------------------------
  const tab_buttons_shadow = tab_buttons.attachShadow(shopts)
  const tab_display = shadow.querySelector('.tab_display').attachShadow(shopts)
  const scrollbar_wrapper = shadow.querySelector('.scrollbar-wrapper').attachShadow(shopts)
  const buttons = shadow.querySelector('.buttons').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // plus button
    const on = { 'click': on_spawn }
    const protocol = use_protocol('plus_button')({ state, on })
    const opts = { src: icon_plus }
    const element = shadowfy()(sm_icon_button_alt(opts, protocol))
    buttons.append(element)
    function on_spawn (message) { add_tab('tab-' + state.status.tab_id++) }
  }
  { // fullscreen button
    if (screen.width > 510) {
      const on = { 'click': on_fullscreen }
      const protocol = use_protocol('fullscreen')({ state, on })
      const opts = { src: icon_full_screen }
      const element = shadowfy()(sm_icon_button_alt(opts, protocol))
      buttons.append(element)
      status.fullscreen = terminal_wrapper.style.height === '100vh'
      function on_fullscreen (message) {
        const ismax = status.fullscreen
        terminal_wrapper.style.height = ismax ? '100%' : '100vh'
        terminal_wrapper.style.width = '100%'
        terminal_wrapper.style.position = 'absolute'
        terminal_wrapper.style.bottom = 0
        status.fullscreen = !ismax
        Object.keys(state.aka).forEach(x => {
          if(x.includes('win')){
            const channel = state.net[state.aka[x]]
            channel.send({
              head: [id, channel.send.id, channel.mid++],
              type: 'toggle_fullscreen'
            })
          }
        })
      }
    }
  }
  { // close button
    const on = { 'click': on_close }
    const protocol = use_protocol('close_button')({ state, on })
    const opts = { src: icon_close_light }
    const element = shadowfy()(sm_icon_button_alt(opts, protocol))
    buttons.append(element)
    function on_close (message) {
      const up_channel = state.net[state.aka.up]
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        refs: { cause: message.head },
        type: 'toggle_terminal',
      })
    }
  }
  { // scrollbar
    const on = { 'set_scroll': on_set_scroll, 'status': on_update_size }
    const protocol = use_protocol('scrollbar')({ state, on })
    opts.horizontal = true
    opts.data.img_src.icon_arrow_start = opts.data.img_src.icon_arrow_left
    opts.data.img_src.icon_arrow_end = opts.data.img_src.icon_arrow_right
    const scroll_opts = opts
    const element = scrollbar(scroll_opts, protocol)

    tab_buttons.onscroll = on_scroll
    const scroll_channel = state.net[state.aka.scrollbar]
    ro.observe(tab_buttons)

    scrollbar_wrapper.append(element)

    function on_scroll (event) {
      console.log('tab_buttons:terminal:scroll')
      scroll_channel.send({
        head: [id, scroll_channel.send.id, scroll_channel.mid++],
        refs: { },
        type: 'handle_scroll',
      })
    }
    function on_set_scroll (message) {
      console.log('set_scroll', message) 
      setScrollLeft(message.data)
    }
    function on_update_size (message) {
      const head = [id, scroll_channel.send.id, scroll_channel.mid++]
      scroll_channel.send({
        head,
        refs: { cause: message.head },
        type: 'update_size',
        data: {
          sh: tab_buttons.scrollWidth,
          ch: tab_buttons.clientWidth,
          st: tab_buttons.scrollLeft
        }
      })
    }
    async function setScrollLeft (value) {
      tab_buttons.scrollLeft = value
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  add_tab('Home')

  return el

  function add_tab (label) {
    const petname_win = `win-${label}`
    const petname_btn = `btn-${label}`
    { // tab button
      const on = { 'close': close_tab, 'click': switch_tab }
      const protocol = use_protocol(petname_btn)({ state, on })
      const btn_opts = { data: opts.data, name: label }
      const element = tab_button(btn_opts, protocol)
      tab_buttons_shadow.append(element)

      state.status.tab[petname_btn] = state.aka[petname_btn]

      if (Object.keys(viewports).length < 1) ro.observe(tab_buttons)

      if (state.status.active_tab) {
        const active_channel = state.net[state.status.active_tab]
        active_channel.send({
          head: [id, active_channel.send.id, active_channel.mid++],
          type: 'inactivate'
        })
        const scroll_channel = state.net[state.aka.scrollbar]
        const head = [id, scroll_channel.send.id, scroll_channel.mid++]
        scroll_channel.send({ head, type: 'handle_scroll' })
      }
    }
    { // tab window
      const on = {
        'navigate': on_navigate
      }
      const protocol = use_protocol(petname_win)({ state, on })
      const win_opts = { data: opts.data, text: label }
      const element = tab_window(win_opts, protocol)
      tab_display.replaceChildren(element)

      const tab_id = state.status.tab[petname_btn]
      _.viewports[tab_id] = element
      state.status.active_tab = tab_id
      function on_navigate ({ data }){
        const up_channel = state.net[state.aka.up]
        up_channel.send({
          head: [id, up_channel.send.id, up_channel.mid++],
          type: 'navigate',
          data
        })
      }
    }

    async function switch_tab () {
      const btn_id = state.status.tab[petname_btn]
      if (state.status.active_tab === btn_id) return
      const active_channel = state.net[state.status.active_tab]
      active_channel.send({
        head: [id, active_channel.send.id, active_channel.mid++],
        type: 'inactivate'
      })
      state.status.active_tab = btn_id // set tab as active one
      const channel = state.net[btn_id]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'activate'
      })
      tab_display.replaceChildren(viewports[btn_id])
    }
    async function close_tab (message) {
      const tab_id = state.status.tab[petname_btn]
      if (Object.keys(viewports).length > 1) {
        if (state.status.active_tab === tab_id) {
          const ids = Object.values(status.tab)
          const next_id = ids[(ids.indexOf(tab_id) || ids.length) - 1]
          state.status.active_tab = next_id
          const btn_channel = state.net[next_id]
          btn_channel.send({
            head: [id, btn_channel.send.id, btn_channel.mid++],
            type: 'activate'
          })
          const next_tab_win = viewports[next_id]
          tab_display.replaceChildren(next_tab_win)
        }
      } else {
        state.status.active_tab = undefined
        tab_display.replaceChildren()
        ro.unobserve(tab_buttons)
        return cleanup()
      }
      cleanup()
      const scroll_channel = state.net[state.aka.scrollbar]
      const head = [id, scroll_channel.send.id, scroll_channel.mid++]
      scroll_channel.send({ head, refs: { cause: message.head }, type: 'handle_scroll' })
      function cleanup () {
        delete viewports[tab_id]
        const { petname } = state.net[tab_id]
        delete state.net[tab_id]
        delete state.status.tab[petname]
        delete state.aka[petname]  
      }
    }
  }
}
function get_theme () {
  return `
    :host {
      height: 100%;
    }
    * {
      box-sizing: border-box;
    }
    .terminal_wrapper {
      display: flex;
      flex-direction: column;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
    
    .terminal_wrapper .terminal {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      background-color: var(--bg_color);
    }
    .terminal .header {
      display: flex;
      background-color: var(--primary_color);
      color: var(--bg_color);
      padding: 10px 5px;
      align-items: center;
      gap: 5px;
    }
    .terminal .header svg path {
      fill: white;
    }
    .tab_display {
      background-color: var(--bg_color);
      border: 5px solid var(--primary_color);
      flex-grow: 1;
    }
    .footer {
      width: 100%;
      max-width: 100%;
      --s: 20px; /* control the size */
      --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        var(--primary_color);  /* second color */ 
      background-size: var(--s) var(--s);
      display: flex;
      justify-content: space-between;
    }
    .footer .tabs_bar {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .tabs_bar .tab_buttons {
      display: flex;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .tabs_bar .tab_buttons::-webkit-scrollbar {
      display: none;
    }
    .footer .buttons {
      display: flex;
      widht: fit-content;
    }
    .footer .buttons div {
      height: fit-content;
    }
    @container (min-width: 510px) {
      .terminal {
        height: 100%;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/terminal/terminal.js")
},{"_process":2,"buttons/sm-icon-button-alt":19,"buttons/tab-button":22,"scrollbar":42,"tab-window":45}],47:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  THE DAT COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = the_dat
// ----------------------------------------
function the_dat (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_the_dat,
    icon_vr,
    icon_full_screen
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="the_dat">
    <div class="windowbar"></div>
    <div class="dat_content">
      <iframe class="visualization" src="https://micahscopes.github.io/webscape-wanderer/" title="the dat garden visualization"></iframe>
    </div>
  </div>`
  const the_dat_wrapper = shadow.querySelector('.the_dat')
  const dat_content = shadow.querySelector('.dat_content')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
    'toggle_fullscreen': toggle_fullscreen,
    'toggle_VR': toggle_VR,
    'toggle_active_state': toggle_active_state,
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name:'the_dat', 
      src: icon_the_dat,
      icon_buttons: [
        { icon: icon_vr, action: 'toggle_VR' },
        { icon: icon_full_screen, action: 'toggle_fullscreen' }
      ],
      data: data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.prepend(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  async function toggle_active_state (message) {
    const { active_state } = message.data
    if (active_state === 'active') the_dat_wrapper.style.display = 'none'
    if (document.fullscreenElement) document.exitFullscreen()
  }
  async function toggle_fullscreen (message) {
    the_dat_wrapper.classList.toggle('active')
    dat_content.classList.toggle('active')
    if (document.fullscreenElement) document.exitFullscreen()
    else the_dat_wrapper.requestFullscreen()    
  }
  async function toggle_VR (message) {
    console.log('VR')
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
      color: var(--primary_color);
    }
    .visualization {
      background-color: black;
      flex-grow: 1;
    }
    .the_dat.active {
      position: fixed;
      width: 100vw;
      height: 100vh;
      top: 0;
      left: 0;
      z-index: 20;
    }
    .the_dat .dat_content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      aspect-ratio:1/0.5;
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
      /*max-height: 80vh;*/
      aspect-ratio: 4/1;
    }
    .the_dat .dat_content.active {
      height: 96vh;
      max-height: 96vh;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/the-dat/the-dat.js")
},{"_process":2,"window-bar":55}],48:[function(require,module,exports){
const white = {} // hsla(0, 0%, 100%, 1)
white.hue = 0
white.saturation = '0%'
white.lightness = '100%'
white.opacity = 1
white.color = `hsla(${white.hue}, ${white.saturation}, ${white.lightness}, ${white.opacity})`
const isabelline = {} //hsla(36, 13%, 92%, 1)
isabelline.hue = 36
isabelline.saturation = '13%'
isabelline.lightness = '92%'
isabelline.opacity = 1
isabelline.color = `hsla(${isabelline.hue}, ${isabelline.saturation}, ${isabelline.lightness}, ${isabelline.opacity})`
const gray = {} // hsla(40, 1%, 46%, 1)
gray.hue = 40
gray.saturation = '1%'
gray.lightness = '46%'
gray.opacity = 1
gray.color = `hsla(${gray.hue}, ${gray.saturation}, ${gray.lightness}, ${gray.opacity})`
const black = {} // hsla(0, 0%, 0%, 1)
black.hue = 0
black.saturation = '0%'
black.lightness = '0%'
black.opacity = 1
black.color = `hsla(${black.hue}, ${black.saturation}, ${black.lightness}, ${black.opacity})`
const eerie_black = {} // hsla(0, 0%, 9%, 1)
eerie_black.hue = 0
eerie_black.saturation = '0%'
eerie_black.lightness = '15%'
eerie_black.opacity = 1
eerie_black.color = `hsla(${eerie_black.hue}, ${eerie_black.saturation}, ${eerie_black.lightness}, ${eerie_black.opacity})`
const night_black = {} // hsla(0, 0%, 9%, 1)
night_black.hue = 0
night_black.saturation = '0%'
night_black.lightness = '5%'
night_black.opacity = 1
night_black.color = `hsla(${night_black.hue}, ${night_black.saturation}, ${night_black.lightness}, ${night_black.opacity})`
const darkblue = {} // hsla(215, 27%, 22%, 1)'
darkblue.hue = 215
darkblue.saturation = '27%'
darkblue.lightness = '22%'
darkblue.opacity = 1
darkblue.color = `hsla(${darkblue.hue}, ${darkblue.saturation}, ${darkblue.lightness}, ${darkblue.opacity})`
const green = {} // hsla(133, 57%, 45%, 1)
green.hue = 133
green.saturation = '57%'
green.lightness = '45%'
green.opacity = 1
green.color = `hsla(${green.hue}, ${green.saturation}, ${green.lightness}, ${green.opacity})`
const pink = {} // hsla(315, 88%, 81%, 1)
pink.hue = 315
pink.saturation = '88%'
pink.lightness = '81%'
pink.opacity = 1
pink.color = `hsla(${pink.hue}, ${pink.saturation}, ${pink.lightness}, ${pink.opacity})`
const purple = {} // hsla(282, 30%, 47%, 1)
purple.hue = 282
purple.saturation = '38%'
purple.lightness = '47%'
purple.opacity = 1
purple.color = `hsla(${purple.hue}, ${purple.saturation}, ${purple.lightness}, ${purple.opacity})`

module.exports = { white, isabelline, gray, black, eerie_black, night_black, darkblue, green, pink, purple }
},{}],49:[function(require,module,exports){
(function (process,__dirname){(function (){
const brand = require('theme/brand')
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const {white, black, eerie_black, night_black, darkblue, green, pink, purple } = brand
const bg_color = night_black.color
const bg_color_2 = black.color
const bg_color_3 = eerie_black.color
const alt_color = white.color
const primary_color = green.color
const ac_1 = darkblue.color
const ac_2 = pink.color
const ac_3 = purple.color
const highlight_color = `hsla(${green.hue}, ${green.saturation}, ${green.lightness}, 0.5)`

const dark_theme = {
  bg_color,
  bg_color_2,
  bg_color_3,
  alt_color,
  primary_color,
  ac_1,
  ac_2,
  ac_3,
  highlight_color,

  img_src:{
    // social icons
    icon_blogger: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
    icon_twitter: `<svg width="17" height="17" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
    icon_github: `<svg width="18" height="18" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // social icons smooth
    icon_mastodon:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.9982 16.4153C47.9982 5.56761 40.9884 2.39005 40.9884 2.39005C37.4552 0.745015 31.3873 0.052501 25.0826 0H24.9273C18.6227 0.052501 12.5597 0.745015 9.02399 2.39005C9.02399 2.39005 2.01421 5.57011 2.01421 16.4153C2.01421 18.8979 1.96736 21.8679 2.0438 25.018C2.29776 35.6257 3.96206 46.0809 13.6347 48.6759C18.095 49.8735 21.9242 50.1235 25.0062 49.951C30.5983 49.636 33.737 47.9284 33.737 47.9284L33.5521 43.8133C33.5521 43.8133 29.5553 45.0909 25.0678 44.9359C20.6199 44.7809 15.9278 44.4509 15.2078 38.9133C15.1398 38.3987 15.1069 37.8799 15.1092 37.3607C15.1092 37.3607 19.4733 38.4432 25.0062 38.7007C28.389 38.8582 31.5598 38.5007 34.7824 38.1107C40.9613 37.3632 46.3413 33.5031 47.0169 29.9756C48.087 24.418 47.9982 16.4153 47.9982 16.4153ZM39.7309 30.3906H34.6V17.6428C34.6 14.9553 33.4855 13.5928 31.2541 13.5928C28.7885 13.5928 27.5532 15.2103 27.5532 18.4104V25.388H22.4518V18.4104C22.4518 15.2103 21.2165 13.5928 18.7484 13.5928C16.517 13.5928 15.4026 14.9578 15.4026 17.6428V30.3906H10.2716V17.2578C10.2716 14.5728 10.9447 12.4402 12.3008 10.8627C13.6964 9.28518 15.5234 8.47516 17.7942 8.47516C20.4201 8.47516 22.4099 9.49768 23.7241 11.5452L25.0013 13.7178L26.2809 11.5452C27.5951 9.49768 29.5849 8.47516 32.2108 8.47516C34.4792 8.47516 36.3087 9.28518 37.7042 10.8627C39.0578 12.4402 39.7309 14.5728 39.7309 17.2578V30.3906Z" fill="#2ACA4B"/></svg>`,
    icon_opencollective:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_68)"><path d="M45.9543 38.6405C48.5129 34.718 50 30.0326 50 25C50 19.9674 48.5129 15.282 45.9543 11.3595L40.1106 17.2031C41.318 19.5385 42 22.1896 42 25C42 27.8104 41.318 30.4615 40.1106 32.7969L45.9543 38.6405Z" fill="#2ACA4B"/><path d="M34.8542 11.1458C32.0745 9.16504 28.6733 8 25 8C15.6112 8 8 15.6112 8 25C8 34.3888 15.6112 42 25 42C28.6733 42 32.0745 40.835 34.8542 38.8542L40.5648 44.5648C36.2942 47.9669 30.8845 50 25 50C11.1929 50 0 38.8071 0 25C0 11.1929 11.1929 0 25 0C30.8845 0 36.2942 2.03309 40.5648 5.43515L34.8542 11.1458Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_68"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_matrix:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_59)"><path d="M1.31875 1.15V48.8547H4.75156V50.0031H0V0.003125H4.75156V1.15156L1.31875 1.15ZM15.9922 16.2703V18.6875H16.0563C16.7 17.7578 17.4813 17.0516 18.3828 16.5453C19.2875 16.0406 20.3375 15.7891 21.5078 15.7891C22.6313 15.7891 23.6641 16.0094 24.5937 16.4406C25.5297 16.8797 26.2297 17.6531 26.7172 18.7516C27.2469 17.9703 27.9719 17.2781 28.8734 16.6844C29.7781 16.0906 30.8531 15.7891 32.0969 15.7891C33.0406 15.7891 33.9109 15.9031 34.7172 16.1391C35.5312 16.3656 36.2156 16.7328 36.7922 17.2375C37.3625 17.7516 37.8094 18.4109 38.1359 19.225C38.4531 20.0375 38.6156 21.0234 38.6156 22.1797V34.1094H33.7266V24.0031C33.7266 23.4078 33.7016 22.8391 33.6516 22.3094C33.6203 21.8297 33.4969 21.3656 33.2781 20.9344C33.0734 20.5422 32.7578 20.2172 32.3656 20.0078C31.9672 19.7703 31.4141 19.6578 30.7297 19.6578C30.0375 19.6578 29.4844 19.7875 29.0609 20.0469C28.6469 20.3078 28.2969 20.6656 28.0609 21.0891C27.8094 21.5375 27.6469 22.0328 27.5797 22.5375C27.4984 23.0828 27.4594 23.6297 27.45 24.175V34.1109H22.5578V24.1094C22.5578 23.5797 22.55 23.0594 22.5187 22.5469C22.5016 22.0516 22.4047 21.5719 22.2172 21.1156C22.0547 20.6766 21.7469 20.3094 21.3547 20.0656C20.9562 19.8047 20.3609 19.6672 19.5797 19.6672C19.3438 19.6672 19.0359 19.7156 18.6609 19.8219C18.2859 19.9266 17.9125 20.1219 17.5625 20.4078C17.2047 20.7016 16.8938 21.1156 16.6422 21.6531C16.3906 22.1891 16.2687 22.8969 16.2687 23.7766V34.1203H11.3766V16.275L15.9922 16.2703ZM48.6813 48.8531V1.14844H45.2484V0H50V50H45.2484V48.8516L48.6813 48.8531Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_59"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_twitter_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_63)"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.7235 45.0005C34.5914 45.0005 44.9117 29.609 44.9117 16.2632C44.9117 15.8251 44.9117 15.3902 44.8817 14.957C46.8893 13.5294 48.6218 11.7568 49.9993 9.72861C48.1293 10.5458 46.1417 11.0817 44.1092 11.318C46.2492 10.0553 47.8518 8.07152 48.6193 5.73071C46.6042 6.90726 44.4017 7.73763 42.1041 8.18316C38.219 4.11688 31.7214 3.91987 27.5888 7.74492C24.9262 10.2113 23.7937 13.8885 24.6212 17.396C16.3735 16.9875 8.68827 13.1526 3.47814 6.84402C0.755567 11.4592 2.1481 17.361 6.65572 20.3246C5.02318 20.2778 3.42564 19.8451 1.9981 19.0623V19.1905C2.0006 23.9977 5.44319 28.1369 10.2283 29.0895C8.71827 29.4956 7.13323 29.5545 5.59819 29.2616C6.94073 33.3771 10.7933 36.1959 15.1809 36.2771C11.5483 39.0881 7.06073 40.6144 2.44061 40.6095C1.62559 40.6071 0.810568 40.5602 -0.00195312 40.4643C4.69067 43.4278 10.1483 45.0006 15.7235 44.9932" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_63"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_github_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_42)"><path fill-rule="evenodd" clip-rule="evenodd" d="M25 0C38.8075 0 50 11.4748 50 25.6323C50 36.9548 42.845 46.5599 32.9175 49.9524C31.65 50.2049 31.2 49.4044 31.2 48.7219C31.2 47.8769 31.23 45.117 31.23 41.687C31.23 39.297 30.43 37.7371 29.5325 36.9421C35.1 36.3071 40.95 34.1394 40.95 24.2944C40.95 21.4944 39.98 19.2096 38.375 17.4146C38.635 16.7671 39.4925 14.1599 38.13 10.6299C38.13 10.6299 36.035 9.94306 31.2625 13.2581C29.265 12.6906 27.125 12.405 25 12.395C22.875 12.405 20.7375 12.6906 18.7425 13.2581C13.965 9.94306 11.865 10.6299 11.865 10.6299C10.5075 14.1599 11.365 16.7671 11.6225 17.4146C10.025 19.2096 9.04751 21.4944 9.04751 24.2944C9.04751 34.1144 14.885 36.3154 20.4375 36.9629C19.7225 37.6029 19.075 38.7319 18.85 40.3894C17.425 41.0444 13.805 42.178 11.575 38.2605C11.575 38.2605 10.2525 35.7977 7.7425 35.6177C7.7425 35.6177 5.305 35.5853 7.5725 37.1753C7.5725 37.1753 9.21 37.9628 10.3475 40.9253C10.3475 40.9253 11.815 45.5002 18.77 43.9502C18.7825 46.0927 18.805 48.1119 18.805 48.7219C18.805 49.3994 18.345 50.1923 17.0975 49.9548C7.16249 46.5673 0 36.9573 0 25.6323C0 11.4748 11.195 0 25 0Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_42"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_cabal:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.5 50L49 0L24.5 7.54717L0 0L24.5 50Z" fill="#2ACA4B"/></svg>`,
    icon_jitsi:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_55)"><mask id="path-1-outside-1_2281_55" maskUnits="userSpaceOnUse" x="7" y="-1" width="36" height="53" fill="black"><rect fill="white" x="7" y="-1" width="36" height="53"/><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z"/></mask><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z" fill="#2ACA4B"/><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z" stroke="#2ACA4B" mask="url(#path-1-outside-1_2281_55)"/></g><defs><clipPath id="clip0_2281_55"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42.3201 9.18609C39.0846 7.70961 35.6387 6.62168 32.0086 6C31.5614 6.77709 31.0354 7.83912 30.6934 8.69393C26.8529 8.12406 23.0387 8.12406 19.2771 8.69393C18.9089 7.83912 18.3828 6.77709 17.9356 6C14.3055 6.62168 10.8596 7.70961 7.62408 9.18609C1.10049 18.8739 -0.661938 28.3286 0.206122 37.6278C4.54642 40.8139 8.72888 42.7307 12.8587 44C13.8846 42.6271 14.779 41.1507 15.5681 39.6224C14.0688 39.0784 12.6483 38.379 11.3068 37.576C11.675 37.317 12.017 37.0321 12.3589 36.773C20.5923 40.5549 29.5097 40.5549 37.6379 36.773C37.9798 37.058 38.3218 37.317 38.6901 37.576C37.3485 38.379 35.9017 39.0525 34.4287 39.6224C35.2178 41.1507 36.1122 42.6271 37.1381 44C41.2679 42.7307 45.4767 40.8139 49.7907 37.6278C50.8166 26.8262 48.0283 17.4751 42.3727 9.18609H42.3201ZM16.6729 31.9291C14.2003 31.9291 12.1748 29.6756 12.1748 26.9039C12.1748 24.1323 14.1477 21.8787 16.6729 21.8787C19.1982 21.8787 21.1973 24.1323 21.171 26.9039C21.171 29.6497 19.1982 31.9291 16.6729 31.9291ZM33.2713 31.9291C30.7986 31.9291 28.7731 29.6756 28.7731 26.9039C28.7731 24.1323 30.746 21.8787 33.2713 21.8787C35.7965 21.8787 37.7957 24.1323 37.7694 26.9039C37.7694 29.6497 35.7965 31.9291 33.2713 31.9291Z" fill="#2ACA4B"/></svg>`,
    icon_bigbluebutton:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_38)"><path d="M25 0C18.3696 0 12.0107 2.63392 7.32233 7.32233C2.63392 12.0107 0 18.3696 0 25C0 31.6304 2.63392 37.9893 7.32233 42.6777C12.0107 47.3661 18.3696 50 25 50C31.6304 50 37.9893 47.3661 42.6777 42.6777C47.3661 37.9893 50 31.6304 50 25C50 18.3696 47.3661 12.0107 42.6777 7.32233C37.9893 2.63392 31.6304 0 25 0ZM14.2458 9.40833C15.7937 9.40833 17.1167 10.1667 18.2125 11.6812C19.3083 13.1979 19.8521 15.0188 19.8521 17.15V31.2333C19.8521 32.3562 20.4146 32.9187 21.5375 32.9187H30.2333C31.3542 32.9187 31.9167 32.3562 31.9167 31.2333V24.5562C31.9167 23.4729 31.3542 22.9146 30.2333 22.875H28.5521C26.3833 22.8 24.5458 22.2333 23.0521 21.175C21.5542 20.1187 20.8083 18.8146 20.8083 17.2646H30.2333C32.2542 17.2646 33.975 17.9771 35.3958 19.3979C36.0848 20.0665 36.6296 20.8691 36.9965 21.7562C37.3634 22.6434 37.5447 23.5963 37.5292 24.5562V31.2333C37.5292 33.2542 36.8167 34.9771 35.3958 36.3979C33.975 37.8187 32.2521 38.525 30.2333 38.525H21.5375C19.5167 38.525 17.7979 37.8187 16.3771 36.3979C15.6879 35.7283 15.1432 34.9246 14.7766 34.0363C14.4101 33.1481 14.2294 32.1941 14.2458 31.2333V9.40833Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_38"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_youtube:`<svg width="51" height="50" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49.9625 13.5028C49.6723 12.4472 49.105 11.4845 48.3173 10.7106C47.5296 9.93668 46.5488 9.37849 45.4726 9.09158C41.4821 8.0175 25.5177 8.00002 25.5177 8.00002C25.5177 8.00002 9.55574 7.98253 5.56272 9.00915C4.48719 9.30926 3.50842 9.87535 2.72037 10.6531C1.93233 11.4308 1.36147 12.3941 1.0626 13.4503C0.010197 17.362 3.73348e-06 25.475 3.73348e-06 25.475C3.73348e-06 25.475 -0.010189 33.628 1.03457 37.4997C1.62066 39.6404 3.34069 41.3314 5.52704 41.9084C9.55829 42.9825 25.4794 43 25.4794 43C25.4794 43 41.4439 43.0175 45.4344 41.9933C46.511 41.7069 47.4927 41.15 48.2824 40.3777C49.0721 39.6053 49.6424 38.6443 49.937 37.5896C50.992 33.6805 50.9996 25.5699 50.9996 25.5699C50.9996 25.5699 51.0506 17.4144 49.9625 13.5028ZM20.4111 32.9911L20.4238 18.0039L33.6923 25.51L20.4111 32.9911Z" fill="#2ACA4B"/></svg>`,
    icon_hackmd:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_47)"><path d="M47 17.2141V47.2698C47 47.9939 46.7105 48.6884 46.1952 49.2004C45.6798 49.7124 44.9809 50 44.2521 50H5.75094C5.38982 50.0004 5.03217 49.9301 4.69843 49.793C4.36469 49.656 4.0614 49.455 3.80591 49.2014C3.55042 48.9479 3.34774 48.6468 3.20946 48.3153C3.07117 47.9839 3 47.6286 3 47.2698V1.73016C3.0008 1.0058 3.29098 0.311381 3.8068 -0.200537C4.32261 -0.712456 5.02187 -1 5.75094 -1H28.6674V14.4809C28.6674 15.2058 28.9572 15.901 29.4732 16.4135C29.9891 16.9261 30.6888 17.2141 31.4184 17.2141H47ZM36.0023 21.7683C36.0023 21.5296 35.9068 21.3007 35.7369 21.1319C35.567 20.9631 35.3366 20.8683 35.0964 20.8683H14.9187C14.6785 20.8683 14.4481 20.9631 14.2782 21.1319C14.1083 21.3007 14.0128 21.5296 14.0128 21.7683V23.5894C14.0128 23.8282 14.1083 24.0571 14.2782 24.2259C14.4481 24.3947 14.6785 24.4895 14.9187 24.4895H35.0843C35.3245 24.4895 35.555 24.3947 35.7248 24.2259C35.8947 24.0571 35.9902 23.8282 35.9902 23.5894L36.0023 21.7683ZM36.0023 29.0528C36.0023 28.8141 35.9068 28.5851 35.7369 28.4163C35.567 28.2475 35.3366 28.1527 35.0964 28.1527H14.9187C14.6785 28.1527 14.4481 28.2475 14.2782 28.4163C14.1083 28.5851 14.0128 28.8141 14.0128 29.0528V30.8769C14.0128 31.1156 14.1083 31.3445 14.2782 31.5133C14.4481 31.6821 14.6785 31.7769 14.9187 31.7769H35.0843C35.3245 31.7769 35.555 31.6821 35.7248 31.5133C35.8947 31.3445 35.9902 31.1156 35.9902 30.8769L36.0023 29.0528ZM36.0023 36.3402C36.0023 36.1015 35.9068 35.8726 35.7369 35.7038C35.567 35.535 35.3366 35.4401 35.0964 35.4401H14.9187C14.6785 35.4401 14.4481 35.535 14.2782 35.7038C14.1083 35.8726 14.0128 36.1015 14.0128 36.3402V38.1613C14.0128 38.4 14.1083 38.6289 14.2782 38.7977C14.4481 38.9665 14.6785 39.0614 14.9187 39.0614H35.0843C35.3245 39.0614 35.555 38.9665 35.7248 38.7977C35.8947 38.6289 35.9902 38.4 35.9902 38.1613L36.0023 36.3402ZM45.8555 13.5719H32.3333V0.137065C32.7049 0.366237 33.051 0.633736 33.3661 0.935113L45.0523 12.5458C45.3565 12.858 45.6258 13.202 45.8555 13.5719Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_47"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_protonmail:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.1115V16.7959L15 29.3296L22.7083 22.96C22.5 22.96 22.5 22.7546 22.2917 22.7546L1.66667 5.28962C1.04167 4.67321 0 5.08415 0 6.1115ZM12.2917 32.4116L0 22.1381V42.8906C0 45.1508 1.875 47 4.16667 47H35.4167V17.6178L17.7083 32.4116C16.0417 33.6445 13.9583 33.6445 12.2917 32.4116ZM39.5833 13.3029V12.4811L48.3333 5.28962C48.9583 4.67321 50 5.28962 50 6.1115V42.8906C50 45.1508 48.125 47 45.8333 47H39.5833V13.7139C39.5833 13.7139 39.5833 13.5084 39.5833 13.3029Z" fill="#2ACA4B"/></svg>`,
    icon_reddit:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2281_72)"><path d="M19.5 30C19.0056 30 18.5222 29.8534 18.1111 29.5787C17.7 29.304 17.3795 28.9134 17.1903 28.4565C17.0011 28 16.9516 27.4972 17.0481 27.0122C17.1445 26.5272 17.3826 26.0819 17.7323 25.7322C18.0819 25.3825 18.5273 25.1444 19.0122 25.0481C19.4972 24.9515 20 25.0009 20.4566 25.1903C20.9134 25.3794 21.3041 25.7 21.5788 26.1109C21.8534 26.5222 22 27.0056 22 27.5C22 27.8284 21.9353 28.1534 21.8097 28.4565C21.6841 28.76 21.5 29.0356 21.2678 29.2678C21.0356 29.5 20.76 29.684 20.4566 29.8097C20.1534 29.9353 19.8284 30 19.5 30ZM50 25C50 29.9447 48.5338 34.7781 45.7869 38.8893C43.0397 43.0006 39.1353 46.2046 34.5672 48.0968C29.9991 49.989 24.9722 50.4843 20.1228 49.5196C15.2732 48.555 10.8187 46.174 7.32234 42.6778C3.82603 39.1812 1.445 34.7268 0.480373 29.8772C-0.484252 25.0278 0.0108423 20.0009 1.90303 15.4329C3.79522 10.8647 6.99953 6.96027 11.1107 4.21325C15.222 1.46622 20.0556 0 25 0C31.6303 0 37.9894 2.6339 42.6778 7.32234C47.3659 12.0107 50 18.3696 50 25ZM36.6562 20.8437C35.7947 20.8944 34.9822 21.2619 34.375 21.875C31.8047 20.1762 28.7994 19.254 25.7187 19.2187L27.4687 11.3125L33.0625 12.5625C33.0584 12.8893 33.1191 13.2137 33.2413 13.5168C33.3638 13.82 33.5447 14.0958 33.7744 14.3284C34.0041 14.561 34.2778 14.7456 34.5794 14.8716C34.8809 14.9976 35.2044 15.0625 35.5312 15.0625C36.1972 15.0543 36.8331 14.784 37.3009 14.3101C37.7691 13.8363 38.0313 13.1972 38.0313 12.5312C38.05 11.9598 37.8697 11.3997 37.5216 10.9464C37.1731 10.493 36.6781 10.1746 36.1212 10.0456C35.5644 9.91646 34.98 9.98468 34.4675 10.2385C33.9553 10.4924 33.5472 10.9161 33.3125 11.4375L27.0625 10.0625C26.9137 10.034 26.7597 10.0633 26.6319 10.1447C26.5041 10.226 26.4122 10.3531 26.375 10.5L24.4375 19.2187C21.3581 19.2628 18.3553 20.184 15.7813 21.875C15.443 21.5256 15.0326 21.2544 14.5787 21.08C14.1248 20.9056 13.6383 20.8322 13.1532 20.8653C12.6681 20.8981 12.1959 21.0362 11.7697 21.2703C11.3435 21.5044 10.9735 21.8287 10.6854 22.2203C10.3974 22.6122 10.1982 23.0622 10.1019 23.5387C10.0056 24.0153 10.0143 24.5072 10.1276 24.98C10.2408 25.4528 10.4558 25.8953 10.7576 26.2765C11.0594 26.6578 11.4407 26.9687 11.875 27.1875C11.8272 27.7072 11.8272 28.2303 11.875 28.75C11.875 34.0312 17.8437 38.3437 25.1875 38.3437C32.5313 38.3437 38.5 34.0312 38.5 28.75C38.5012 28.2131 38.4381 27.6781 38.3125 27.1562C38.9441 26.7984 39.4422 26.245 39.7313 25.5794C40.0206 24.9137 40.0856 24.1722 39.9162 23.4662C39.7469 22.7606 39.3522 22.129 38.7925 21.6672C38.2325 21.2056 37.5375 20.9384 36.8125 20.9062L36.6562 20.8437ZM29.7188 32.5625C28.3144 33.4447 26.6897 33.9125 25.0312 33.9125C23.3728 33.9125 21.7481 33.4447 20.3438 32.5625C20.2284 32.4572 20.0781 32.3987 19.9219 32.3987C19.7656 32.3987 19.6153 32.4572 19.5 32.5625C19.4394 32.6181 19.3909 32.6856 19.3578 32.7609C19.3247 32.8362 19.3078 32.9178 19.3078 33C19.3078 33.0822 19.3247 33.1637 19.3578 33.239C19.3909 33.3143 19.4394 33.3818 19.5 33.4375C21.1412 34.5512 23.0791 35.1465 25.0625 35.1465C27.0459 35.1465 28.9837 34.5512 30.625 33.4375C30.6856 33.3818 30.7341 33.3143 30.7672 33.239C30.8003 33.1637 30.8175 33.0822 30.8175 33C30.8175 32.9178 30.8003 32.8362 30.7672 32.7609C30.7341 32.6856 30.6856 32.6181 30.625 32.5625C30.5666 32.5009 30.4962 32.4522 30.4184 32.4187C30.3406 32.3853 30.2566 32.3678 30.1719 32.3678C30.0872 32.3678 30.0031 32.3853 29.9253 32.4187C29.8475 32.4522 29.7772 32.5009 29.7188 32.5625ZM30.5 25C30.0056 25 29.5222 25.1465 29.1109 25.4212C28.7 25.6959 28.3794 26.0865 28.1903 26.5434C28.0012 27 27.9516 27.5028 28.0481 27.9878C28.1444 28.4728 28.3825 28.9181 28.7322 29.2678C29.0819 29.6175 29.5272 29.8556 30.0122 29.9518C30.4972 30.0484 31 29.999 31.4569 29.8097C31.9134 29.6206 32.3041 29.3 32.5788 28.889C32.8534 28.4778 33 27.9943 33 27.5C33 26.8369 32.7366 26.2009 32.2678 25.7322C31.7991 25.2634 31.1631 25 30.5 25Z" fill="#2ACA4B"/></g><defs><clipPath id="clip0_2281_72"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_keet:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.5 50L49 0L24.5 7.54717L0 0L24.5 50Z" fill="#2ACA4B"/></svg>    `,
    // terminal
    icon_consortium: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_terminal: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
    icon_theme: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // window icons
    icon_close_dark: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
    icon_close_light: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
    icon_pdf_reader: `<svg width="18" height="18" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_pdf_reader_solid:`<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M35.3636 0H6V50H44V8.92857H35.3636V0ZM10.4902 11.0698H27.072V13.2127H10.4902V11.0698ZM33.2902 26.0633H10.4902V28.2062H33.2902V26.0633ZM10.4902 15.3492H35.3629V17.4921H10.4902V15.3492ZM33.2902 30.3531H10.4902V32.496H33.2902V30.3531Z" fill="white"/><path d="M37.0909 1.78571H38.8182V3.57143H40.5455V5.35714H42.2727V7.14286H37.0909V1.78571Z" fill="white"/></svg>`,
    icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,
    icon_folder_solid:`<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M30.137 9V15.5306H0V41H50V9H30.137Z" fill="#FFFAF4"/></svg>`,
    // arrows
    icon_arrow_down: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
    icon_arrow_up: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
    icon_arrow_down_light: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="white"/></svg>`,
    icon_arrow_up_light: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.579 9L18.421 9V17H7.89475V27.6667H1.2659e-06L0 41H18.421V33H31.579V41H50V27.6667H42.1054V17H31.579V9Z" fill="white"/></svg>`,
    // actions
    icon_search : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7627 2.27344H25.5832V4.73044H12.7627V2.27344Z" fill="#293648"/><path d="M12.7627 32.9844H25.5832V35.4414H12.7627V32.9844Z" fill="#293648"/><path d="M6.93457 4.73047H12.7621V7.18747H6.93457V4.73047Z" fill="#293648"/><path d="M6.93457 30.5273H12.7621V32.9844H6.93457V30.5273Z" fill="#293648"/><path d="M4.60352 7.1875H6.93452V14.5585H4.60352V7.1875Z" fill="#293648"/><path d="M4.60352 23.1562H6.93452V30.5272H4.60352V23.1562Z" fill="#293648"/><path d="M2.27246 13.3281H4.60346V24.3846H2.27246V13.3281Z" fill="#293648"/><path d="M31.4102 7.1875H33.7413V14.5585H31.4102V7.1875Z" fill="#293648"/><path d="M33.7416 35.4433H31.4105V32.9863H25.583V30.5292H31.4105V24.3867H33.7416V30.5292H36.0726V32.9863H38.4035V35.4433H40.7346V37.9004H43.0655V40.3574H45.3966V42.8142H47.7276V47.7283H43.0655V45.2713H40.7346V42.8142H38.4035V40.3574H36.0726V37.9004H33.7416V35.4433Z" fill="#293648"/><path d="M33.7412 13.3281H36.0721V24.3846H33.7412V13.3281Z" fill="#293648"/><path d="M25.583 4.73047H31.4105V7.18747H25.583V4.73047Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1936 1.70312H26.1505V4.16012H31.978V6.61712H34.3091V12.7596H36.64V24.9524H34.3091V29.9586H36.64V32.4156H38.9709V34.8727H41.3021V37.3297H43.633V39.7868H45.9641V42.2436H48.295V48.294H42.4966V45.837H40.1657V43.3799H37.8346V40.9231H35.5036V38.4661H33.1727V36.009H30.8416V33.552H26.1505V36.009H12.1936V33.552H6.3661V31.0949H4.0351V24.9524H1.7041V12.7596H4.0351V6.61712H6.3661V4.16012H12.1936V1.70312ZM12.7618 4.72831H6.93428V7.18531H4.60328V13.3278H2.27228V24.3843H4.60328V30.5268H6.93428V32.9838H12.7618V35.4409H25.5823V32.9838H31.4098V35.4409H33.7409V37.8979H36.0718V40.3549H38.4027V42.8118H40.7339V45.2688H43.0648V47.7259H47.7268V42.8118H45.3959V40.3549H43.0648V37.8979H40.7339V35.4409H38.4027V32.9838H36.0718V30.5268H33.7409V24.3843H36.0718V13.3278H33.7409V7.18531H31.4098V4.72831H25.5823V2.27131H12.7618V4.72831ZM25.5823 4.72831H12.7618V7.18531H6.93428V14.5563H4.60328V23.1559H6.93428V30.5268H12.7618V32.9838H25.5823V30.5268H31.4098V24.3843H33.7409V14.5563H31.4098V7.18531H25.5823V4.72831ZM25.0141 5.29649H13.33V7.75349H7.50247V15.1245H5.17147V22.5876H7.50247V29.9586H13.33V32.4156H25.0141V29.9586H30.8416V23.8161H33.1727V15.1245H30.8416V7.75349H25.0141V5.29649Z" fill="#293648"/></svg>`,
    // images - @TODO: those images below should be svgs as well:
    banner_cover : `${prefix}/../assets/images/banner_cover.svg`,
    about_us_cover : `${prefix}/../assets/images/about_us_cover.png`,
    tree_character : `${prefix}/../assets/images/tree_character.png`,
    // others
    icon_clock : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1964)"><path fill-rule="evenodd" clip-rule="evenodd" d="M33.3333 38.889H38.889V33.3333H44.4444V16.6667H38.889V11.1111H33.3333V5.55556H16.6667V11.1111H11.1111V16.6667H5.55556V33.3333H11.1111V38.889H16.6667V44.4444H33.3333V38.889ZM38.889 44.4444V50H11.1111V44.4444H5.55556V38.889H0V11.1111H5.55556V5.55556H11.1111V0H38.889V5.55556H44.4444V11.1111H50V38.889H44.4444V44.4444H38.889Z" fill="#293648"/><path d="M22.2226 22.2206H16.667V27.776H27.778V11.1094H22.2226V22.2206Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1964"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_link : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1975)"><path d="M28 0L28 5L37 5V10H32L32 15L27 15V20H22V28L30 28L30 23H35L35 18H40V13H45L45 23H50V0H28Z" fill="#293648"/><path d="M0 5H22V11H6V44H39V28H45V50H0V5Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1975"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_calendar : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M47 14H3V45H47V14ZM0 6V48H50V6H46V2H40V6H10V2H4V6H0Z" fill="#293648"/><path d="M15 38V35H12V25H14.9901L15 22H22V25H25V35H22V38H15ZM15 35H22V25H14.9901L15 35Z" fill="#293648"/><path d="M28 38V35H32V25H28V22H35.0098V35H39V38H28Z" fill="#293648"/></svg>`,
    project_logo_1 : `${prefix}/../assets/images/project_logo_1.png`,
    img_robot_1 : `${prefix}/../assets/images/img_robot_1.png`,
    img_robot_3 : `${prefix}/../assets/images/img_robot_1_dark.png`,
    img_robot_2 : `${prefix}/../assets/images/img_robot_2_dark.png`,
    pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,
    logo:  `${prefix}/../assets/images/logo.png`,
    circle: `<?xml version="1.0" ?><svg width="15" height="15" version="1.1" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="hsla(133, 57%, 45%, 1)"><circle cx="8" cy="8" r="8"/></svg>`,
    tick: `<?xml version="1.0" ?><svg height="10" version="1.1" viewBox="0 0 13 19" width="12" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" transform="translate(-423.000000, -47.000000)"><g id="check" transform="translate(423.000000, 47.500000)"><path d="M6,10.2 L1.8,6 L0.4,7.4 L6,13 L18,1 L16.6,-0.4 L6,10.2 Z" id="Shape"/></g></g></g></svg>`,

    icon_arrow_right: `<svg transform="rotate(90 0 0)" width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
    icon_arrow_left: `<svg transform="rotate(90 0 0)" width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
    icon_the_dat : `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M210 280H190V300H210V280Z" fill="#fff"/><path d="M190 160H150V180H190V160Z" fill="#fff"/><path d="M390 20V80H370V100H310V80H290V20H310V0H370V20H390Z" fill="#fff"/><path d="M210 140H190V160H210V140Z" fill="#fff"/><path d="M190 260H150V280H190V260Z" fill="#fff"/><path d="M250 100H230V120H250V100Z" fill="#fff"/><path d="M270 320H250V340H270V320Z" fill="#fff"/><path d="M290 320H270V340H290V320Z" fill="#fff"/><path d="M290 80H250V100H290V80Z" fill="#fff"/><path d="M290 400V340H310V320H370V340H390V400H370V420H310V400H290Z" fill="#fff"/><path d="M130 180H150V260H130V280H50V260H30V180H50V160H130V180Z" fill="#fff"/><path d="M250 300H210V320H250V300Z" fill="#fff"/><path d="M230 120H210V140H230V120Z" fill="#fff"/></svg>`,

    icon_vr: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="40" y="108" width="339" height="204" fill="url(#pattern0)"/><path d="M371.952 133.154V116.077H354.905V99H65.0952V116.077H48.0476V133.154H31V303.923H48.0476V321H150.333V303.923H167.381V286.846H184.429V269.769H201.476V252.692H218.524V269.769H235.571V286.846H252.619V303.923H269.667V321H371.952V303.923H389V133.154H371.952ZM82.1429 252.692V150.231H150.333V252.692H82.1429ZM337.857 252.692H269.667V150.231H337.857V252.692Z" fill="white"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_2206_52" transform="matrix(0.0454545 0 0 0.0714286 -0.181818 -0.571429)"/></pattern><image id="image0_2206_52" width="30" height="30" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAIRJREFUSEvtlksOwCAIBfUi3P9cXKSNCzaWT0iepWlw6W9gFOMcRW0WcUeDXzPfqutVE9GFiIKZ1eNUO1FQCVyDP8BoqAX/JnhXFNnw5u9jbsYN/r9qxAMCLye5eJF+KDh72xc8VU6aauvtjTIPwQtmbWJBJcDMuv4IICvI3atVt+pjBm54bHAflRebbgAAAABJRU5ErkJggg=="/></defs></svg>`,
    icon_full_screen: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M40 170.465V40H170.465V82.5H82.5V170.465H40ZM380 170.465V40H249.535V82.5H337.5V170.465H380ZM380 249.535H337.5V337.5H249.535V380H380V249.535ZM170.465 380V337.5H82.5V249.535H40V380H170.465Z" fill="white"/></svg>`,
    icon_plus: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M176 380V244H40V176H176V40H244V176H380V244H244V380H176Z" fill="#EEECE9"/></svg>`,
  }
}

module.exports = dark_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/theme/dark-theme")
},{"_process":2,"path":1,"theme/brand":48}],50:[function(require,module,exports){
(function (process,__dirname){(function (){
const brand = require('theme/brand')
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const { white, isabelline, gray, black, darkblue, green, pink, purple } = brand
const bg_color = white.color
const bg_color_2 = isabelline.color
const bg_color_3 = gray.color
const alt_color = black.color
const primary_color = darkblue.color
const ac_1 = green.color
const ac_2 = pink.color
const ac_3 = purple.color
const highlight_color = `hsla(${pink.hue}, ${pink.saturation}, ${pink.lightness}, 0.5)`

const light_theme = {
  bg_color,
  alt_color,
  bg_color_2,
  bg_color_3,
  primary_color,
  ac_1,
  ac_2,
  ac_3,
  highlight_color,
  
  img_src:{
    // social icons pixel
    icon_blogger: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
    icon_twitter: `<svg width="17" height="17" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
    icon_github: `<svg width="18" height="18" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // social icons smooth
    icon_mastodon:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.9982 16.4153C47.9982 5.56761 40.9884 2.39005 40.9884 2.39005C37.4552 0.745015 31.3873 0.052501 25.0826 0H24.9273C18.6227 0.052501 12.5597 0.745015 9.02399 2.39005C9.02399 2.39005 2.01421 5.57011 2.01421 16.4153C2.01421 18.8979 1.96736 21.8679 2.0438 25.018C2.29776 35.6257 3.96206 46.0809 13.6347 48.6759C18.095 49.8735 21.9242 50.1235 25.0062 49.951C30.5983 49.636 33.737 47.9284 33.737 47.9284L33.5521 43.8133C33.5521 43.8133 29.5553 45.0909 25.0678 44.9359C20.6199 44.7809 15.9278 44.4509 15.2078 38.9133C15.1398 38.3987 15.1069 37.8799 15.1092 37.3607C15.1092 37.3607 19.4733 38.4432 25.0062 38.7007C28.389 38.8582 31.5598 38.5007 34.7824 38.1107C40.9613 37.3632 46.3413 33.5031 47.0169 29.9756C48.087 24.418 47.9982 16.4153 47.9982 16.4153ZM39.7309 30.3906H34.6V17.6428C34.6 14.9553 33.4855 13.5928 31.2541 13.5928C28.7885 13.5928 27.5532 15.2103 27.5532 18.4104V25.388H22.4518V18.4104C22.4518 15.2103 21.2165 13.5928 18.7484 13.5928C16.517 13.5928 15.4026 14.9578 15.4026 17.6428V30.3906H10.2716V17.2578C10.2716 14.5728 10.9447 12.4402 12.3008 10.8627C13.6964 9.28518 15.5234 8.47516 17.7942 8.47516C20.4201 8.47516 22.4099 9.49768 23.7241 11.5452L25.0013 13.7178L26.2809 11.5452C27.5951 9.49768 29.5849 8.47516 32.2108 8.47516C34.4792 8.47516 36.3087 9.28518 37.7042 10.8627C39.0578 12.4402 39.7309 14.5728 39.7309 17.2578V30.3906Z" fill="#293648"/></svg>`,
    icon_opencollective:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_208)"><path d="M45.9543 38.6405C48.5129 34.718 50 30.0326 50 25C50 19.9674 48.5129 15.282 45.9543 11.3595L40.1106 17.2031C41.318 19.5385 42 22.1896 42 25C42 27.8104 41.318 30.4615 40.1106 32.7969L45.9543 38.6405Z" fill="#293648"/><path d="M34.8542 11.1458C32.0745 9.16504 28.6733 8 25 8C15.6112 8 8 15.6112 8 25C8 34.3888 15.6112 42 25 42C28.6733 42 32.0745 40.835 34.8542 38.8542L40.5648 44.5648C36.2942 47.9669 30.8845 50 25 50C11.1929 50 0 38.8071 0 25C0 11.1929 11.1929 0 25 0C30.8845 0 36.2942 2.03309 40.5648 5.43515L34.8542 11.1458Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_208"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_matrix:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_206)"><path d="M1.31875 1.15V48.8547H4.75156V50.0031H0V0.003125H4.75156V1.15156L1.31875 1.15ZM15.9922 16.2703V18.6875H16.0563C16.7 17.7578 17.4813 17.0516 18.3828 16.5453C19.2875 16.0406 20.3375 15.7891 21.5078 15.7891C22.6313 15.7891 23.6641 16.0094 24.5937 16.4406C25.5297 16.8797 26.2297 17.6531 26.7172 18.7516C27.2469 17.9703 27.9719 17.2781 28.8734 16.6844C29.7781 16.0906 30.8531 15.7891 32.0969 15.7891C33.0406 15.7891 33.9109 15.9031 34.7172 16.1391C35.5312 16.3656 36.2156 16.7328 36.7922 17.2375C37.3625 17.7516 37.8094 18.4109 38.1359 19.225C38.4531 20.0375 38.6156 21.0234 38.6156 22.1797V34.1094H33.7266V24.0031C33.7266 23.4078 33.7016 22.8391 33.6516 22.3094C33.6203 21.8297 33.4969 21.3656 33.2781 20.9344C33.0734 20.5422 32.7578 20.2172 32.3656 20.0078C31.9672 19.7703 31.4141 19.6578 30.7297 19.6578C30.0375 19.6578 29.4844 19.7875 29.0609 20.0469C28.6469 20.3078 28.2969 20.6656 28.0609 21.0891C27.8094 21.5375 27.6469 22.0328 27.5797 22.5375C27.4984 23.0828 27.4594 23.6297 27.45 24.175V34.1109H22.5578V24.1094C22.5578 23.5797 22.55 23.0594 22.5187 22.5469C22.5016 22.0516 22.4047 21.5719 22.2172 21.1156C22.0547 20.6766 21.7469 20.3094 21.3547 20.0656C20.9562 19.8047 20.3609 19.6672 19.5797 19.6672C19.3438 19.6672 19.0359 19.7156 18.6609 19.8219C18.2859 19.9266 17.9125 20.1219 17.5625 20.4078C17.2047 20.7016 16.8938 21.1156 16.6422 21.6531C16.3906 22.1891 16.2687 22.8969 16.2687 23.7766V34.1203H11.3766V16.275L15.9922 16.2703ZM48.6813 48.8531V1.14844H45.2484V0H50V50H45.2484V48.8516L48.6813 48.8531Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_206"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_twitter_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_214)"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.7235 45.0005C34.5914 45.0005 44.9117 29.609 44.9117 16.2632C44.9117 15.8251 44.9117 15.3902 44.8817 14.957C46.8893 13.5294 48.6218 11.7568 49.9993 9.72861C48.1293 10.5458 46.1417 11.0817 44.1092 11.318C46.2492 10.0553 47.8518 8.07152 48.6193 5.73071C46.6042 6.90726 44.4017 7.73763 42.1041 8.18316C38.219 4.11688 31.7214 3.91987 27.5888 7.74492C24.9262 10.2113 23.7937 13.8885 24.6212 17.396C16.3735 16.9875 8.68827 13.1526 3.47814 6.84402C0.755567 11.4592 2.1481 17.361 6.65572 20.3246C5.02318 20.2778 3.42564 19.8451 1.9981 19.0623V19.1905C2.0006 23.9977 5.44319 28.1369 10.2283 29.0895C8.71827 29.4956 7.13323 29.5545 5.59819 29.2616C6.94073 33.3771 10.7933 36.1959 15.1809 36.2771C11.5483 39.0881 7.06073 40.6144 2.44061 40.6095C1.62559 40.6071 0.810568 40.5602 -0.00195312 40.4643C4.69067 43.4278 10.1483 45.0006 15.7235 44.9932" fill="#293648"/></g><defs><clipPath id="clip0_2284_214"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_github_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_195)"><path fill-rule="evenodd" clip-rule="evenodd" d="M25 0C38.8075 0 50 11.4748 50 25.6323C50 36.9548 42.845 46.5599 32.9175 49.9524C31.65 50.2049 31.2 49.4044 31.2 48.7219C31.2 47.8769 31.23 45.117 31.23 41.687C31.23 39.297 30.43 37.7371 29.5325 36.9421C35.1 36.3071 40.95 34.1394 40.95 24.2944C40.95 21.4944 39.98 19.2096 38.375 17.4146C38.635 16.7671 39.4925 14.1599 38.13 10.6299C38.13 10.6299 36.035 9.94306 31.2625 13.2581C29.265 12.6906 27.125 12.405 25 12.395C22.875 12.405 20.7375 12.6906 18.7425 13.2581C13.965 9.94306 11.865 10.6299 11.865 10.6299C10.5075 14.1599 11.365 16.7671 11.6225 17.4146C10.025 19.2096 9.04751 21.4944 9.04751 24.2944C9.04751 34.1144 14.885 36.3154 20.4375 36.9629C19.7225 37.6029 19.075 38.7319 18.85 40.3894C17.425 41.0444 13.805 42.178 11.575 38.2605C11.575 38.2605 10.2525 35.7977 7.7425 35.6177C7.7425 35.6177 5.305 35.5853 7.5725 37.1753C7.5725 37.1753 9.21 37.9628 10.3475 40.9253C10.3475 40.9253 11.815 45.5002 18.77 43.9502C18.7825 46.0927 18.805 48.1119 18.805 48.7219C18.805 49.3994 18.345 50.1923 17.0975 49.9548C7.16249 46.5673 0 36.9573 0 25.6323C0 11.4748 11.195 0 25 0Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_195"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_cabal:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.5 50L49 0L24.5 7.54717L0 0L24.5 50Z" fill="#293648"/></svg>`,
    icon_jitsi:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_202)"><mask id="path-1-outside-1_2284_202" maskUnits="userSpaceOnUse" x="7" y="-1" width="36" height="53" fill="black"><rect fill="white" x="7" y="-1" width="36" height="53"/><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z"/></mask><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z" fill="#293648"/><path d="M39.7233 16.309C38.3714 15.4632 36.4876 15.5882 35.9091 15.6486L35.5786 15.6549C35.2925 15.534 35.5871 14.8278 35.6655 14.0861C35.7735 13.0528 35.3879 11.6341 34.6886 10.4987C34.3517 9.95288 34.2309 9.9008 34.481 9.63831C36.3223 7.70501 36.6105 5.56339 36.0257 3.78009C34.8836 0.290578 34.6526 -0.25941 34.6886 0.0905825C34.8327 1.51347 34.5106 3.50093 34.2902 4.30925C33.9766 5.45506 32.9044 6.9092 30.0968 8.23417C29.4378 8.54458 26.7806 9.7758 26.3081 10.3133C25.7232 10.982 25.5791 11.6549 25.3037 12.9862C25.0113 14.3945 24.9032 15.709 25.2465 17.2152C25.3122 17.509 25.38 17.7277 25.4181 17.9006C25.4173 17.897 25.4158 17.8935 25.4139 17.8902C25.4923 18.1965 25.3651 18.3777 25.1914 18.486C25.0189 18.5574 24.8402 18.6132 24.6574 18.6527L24.651 18.6548C24.2209 18.7215 23.8077 18.7944 23.4114 18.8715C20.4894 19.3652 14.0858 20.8672 16.3595 28.6713C17.1668 31.3191 18.7412 33.0003 19.6524 33.3087L19.6842 33.3191C19.8346 33.3857 19.9978 33.4441 20.1567 33.4753C20.1736 33.4795 20.1821 33.7337 20.1482 34.092L20.1249 34.2461C19.9978 35.1503 19.4723 36.5461 18.6988 36.5648C18.3895 36.5732 17.0248 35.7607 16.6392 35.5128C14.4778 34.117 13.7065 33.3295 12.1724 33.1608C10.9074 33.0212 8.0637 35.4378 8.00225 40.5544C7.92809 46.8021 9.71015 49.9083 9.761 50C11.0811 44.1168 12.0325 43.5418 15.4589 41.2398C15.7302 41.0585 18.9489 43.721 19.7223 43.7064C23.5937 43.6355 30.5333 43.8793 33.8961 37.0482C33.9618 36.9169 35.0594 38.0357 35.1569 38.0336C35.1972 38.0315 41.0646 35.4628 41.9355 23.6609C42.3339 18.2715 40.7997 16.9819 39.7233 16.309ZM35.1209 12.4633C35.2904 13.1445 35.2417 13.8528 35.034 14.4361C34.6568 15.3257 34.0805 15.7924 33.36 15.7424C33.1274 15.7108 32.9039 15.6328 32.7031 15.5132C31.9022 15.0528 31.4678 13.8757 31.8089 12.9612C31.8168 12.9477 31.8239 12.9338 31.8301 12.9195C31.9191 12.6862 32.1352 12.4258 32.4128 12.1612C32.9828 11.6654 34.1017 10.8279 34.2224 10.8279C34.375 10.832 34.945 11.7508 35.1209 12.4633ZM35.1124 2.23221C35.1251 2.11138 35.4366 3.03427 35.5383 3.3551C35.9812 4.74049 35.9219 5.35506 35.8223 6.05713C35.5637 7.84459 34.5954 9.01957 33.8643 9.73622C32.718 10.8612 32.4489 11.0237 32.9489 10.1341C34.5445 7.29877 34.8814 4.63216 35.1124 2.23221ZM26.4183 10.9529C26.6238 10.455 27.6557 9.90497 28.5139 9.41331C29.3997 8.90499 32.2158 8.18417 33.9512 5.9363C34.4873 5.24256 33.4977 9.9258 30.9486 12.1903C30.0883 12.9549 27.7235 13.3507 25.683 14.7778C25.4732 14.9257 25.7296 12.3758 26.4183 10.9529ZM25.8716 15.1049C26.3716 14.6965 27.2786 14.1111 30.5524 13.0487C30.9571 12.9174 30.9274 13.0528 31.1245 14.0007C31.3343 15.0132 31.5419 15.9444 33.6821 16.4548C33.8347 16.4923 32.9871 18.0631 32.7434 18.2694C32.2666 19.0194 29.745 21.1693 28.6771 20.9652C27.946 20.8256 26.3738 19.1006 25.9457 18.1486C25.6385 17.4652 25.0875 15.7444 25.8716 15.1049ZM16.7579 24.0359C17.1075 22.4047 18.417 21.5776 18.4552 21.5443C19.1184 20.9777 20.4025 20.4652 21.7396 20.0777C21.9409 20.0256 22.0659 19.9985 22.0955 19.9923C22.9219 19.8256 23.9602 19.5485 24.6468 19.4798C25.1681 19.4277 25.8101 19.161 26.3377 19.5548C26.9099 20.2381 28.1685 21.3693 28.8614 21.4277C29.0966 21.4464 30.6795 20.961 33.2753 18.6756C33.5995 18.3902 33.9406 18.109 34.3008 17.8465L34.4047 17.7715C35.2014 17.2027 36.0829 16.7298 37.0407 16.5215C37.3373 16.4569 35.9812 17.7819 37.1424 20.5548C37.9031 22.3714 40.0051 28.6025 39.6597 29.6004C39.4542 30.1962 39.2677 30.3066 38.7443 30.0691C37.278 29.4004 35.4726 27.4254 32.0039 26.0942C29.2089 25.0213 26.8929 25.0463 25.3927 25.3359C21.9409 26.0046 20.1525 27.4817 19.1502 28.3067C18.9976 28.4338 20.6356 27.7963 22.8245 27.5525C24.8078 27.3317 26.7976 27.5442 29.2598 29.19C30.8321 30.4837 30.4485 30.3837 29.7387 30.5775C27.0264 31.3191 21.8582 32.8524 20.055 32.5941C18.1903 32.3254 15.8891 27.6192 16.7579 24.0359ZM31.2707 30.5983C29.0924 28.0463 26.6068 27.2567 25.024 27.1525C23.0597 27.0234 21.6463 27.2713 20.3071 27.7088C20.163 27.7567 27.4841 22.5651 35.5468 28.7275C36.9983 29.8379 37.865 30.4566 38.6278 30.9483C38.738 31.0191 36.6847 31.5524 36.3372 31.6483C32.9998 32.192 32.0823 31.5483 31.2707 30.5983ZM29.406 31.117C28.6093 31.3983 27.4926 31.7858 26.2763 32.1566C27.315 31.7972 28.3584 31.4506 29.406 31.117ZM13.6091 38.2231C13.7362 36.9711 14.018 35.8357 13.893 34.5711C13.8909 34.5461 17.5249 36.994 18.5102 37.1628C18.6713 37.1898 16.8129 38.8544 14.9143 39.6377C14.2638 39.5544 13.5561 38.7461 13.6091 38.2231ZM9.62115 48.5042C9.4262 48.2355 8.15058 43.2751 8.50445 40.1002C8.99181 35.7253 11.488 34.1753 11.969 34.1191C12.3673 34.0732 13.1556 34.3274 12.7869 38.6981C12.7424 39.2252 15.1538 40.8648 15.1538 40.8648C10.2335 43.7064 10.6277 45.8459 9.62115 48.5042ZM19.6948 43.223C19.4468 43.2126 14.8974 40.1544 15.05 40.096C20.2987 38.0877 20.678 34.9565 21.0403 34.1607C20.9979 34.0941 22.0659 33.6691 23.5195 33.1378C25.8588 32.3129 29.0945 31.2816 30.2112 30.8754L30.2684 30.8587C30.7749 30.715 30.7961 30.8087 30.9317 30.9837C31.3343 31.4983 32.0102 31.842 32.0844 31.8774C33.0803 32.342 34.3644 32.2983 34.3941 32.3379C34.5933 32.6212 34.7204 43.871 19.6948 43.223ZM35.1845 37.6377C35.14 37.6398 34.0656 36.6544 34.0656 36.6544C34.0656 36.6544 34.481 35.7649 34.6907 34.6336C34.8602 33.7128 34.945 32.3483 34.945 32.3483C34.945 32.3483 39.8843 31.7691 40.1047 30.0941C40.3547 28.1817 38.9477 24.2047 38.738 23.5547C38.649 23.2797 37.4221 20.0339 37.242 19.1944C37.0386 18.2486 37.4263 16.7215 38.0048 16.4986C39.3673 15.9715 41.374 18.2236 41.4948 21.5006C41.9546 34.0628 35.229 37.6357 35.1845 37.6377Z" stroke="#293648" mask="url(#path-1-outside-1_2284_202)"/></g><defs><clipPath id="clip0_2284_202"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord_smooth:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42.3201 9.18609C39.0846 7.70961 35.6387 6.62168 32.0086 6C31.5614 6.77709 31.0354 7.83912 30.6934 8.69393C26.8529 8.12406 23.0387 8.12406 19.2771 8.69393C18.9089 7.83912 18.3828 6.77709 17.9356 6C14.3055 6.62168 10.8596 7.70961 7.62408 9.18609C1.10049 18.8739 -0.661938 28.3286 0.206122 37.6278C4.54642 40.8139 8.72888 42.7307 12.8587 44C13.8846 42.6271 14.779 41.1507 15.5681 39.6224C14.0688 39.0784 12.6483 38.379 11.3068 37.576C11.675 37.317 12.017 37.0321 12.3589 36.773C20.5923 40.5549 29.5097 40.5549 37.6379 36.773C37.9798 37.058 38.3218 37.317 38.6901 37.576C37.3485 38.379 35.9017 39.0525 34.4287 39.6224C35.2178 41.1507 36.1122 42.6271 37.1381 44C41.2679 42.7307 45.4767 40.8139 49.7907 37.6278C50.8166 26.8262 48.0283 17.4751 42.3727 9.18609H42.3201ZM16.6729 31.9291C14.2003 31.9291 12.1748 29.6756 12.1748 26.9039C12.1748 24.1323 14.1477 21.8787 16.6729 21.8787C19.1982 21.8787 21.1973 24.1323 21.171 26.9039C21.171 29.6497 19.1982 31.9291 16.6729 31.9291ZM33.2713 31.9291C30.7986 31.9291 28.7731 29.6756 28.7731 26.9039C28.7731 24.1323 30.746 21.8787 33.2713 21.8787C35.7965 21.8787 37.7957 24.1323 37.7694 26.9039C37.7694 29.6497 35.7965 31.9291 33.2713 31.9291Z" fill="#293648"/></svg>`,
    icon_bigbluebutton:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_191)"><path d="M25 0C18.3696 0 12.0107 2.63392 7.32233 7.32233C2.63392 12.0107 0 18.3696 0 25C0 31.6304 2.63392 37.9893 7.32233 42.6777C12.0107 47.3661 18.3696 50 25 50C31.6304 50 37.9893 47.3661 42.6777 42.6777C47.3661 37.9893 50 31.6304 50 25C50 18.3696 47.3661 12.0107 42.6777 7.32233C37.9893 2.63392 31.6304 0 25 0ZM14.2458 9.40833C15.7937 9.40833 17.1167 10.1667 18.2125 11.6812C19.3083 13.1979 19.8521 15.0188 19.8521 17.15V31.2333C19.8521 32.3562 20.4146 32.9187 21.5375 32.9187H30.2333C31.3542 32.9187 31.9167 32.3562 31.9167 31.2333V24.5562C31.9167 23.4729 31.3542 22.9146 30.2333 22.875H28.5521C26.3833 22.8 24.5458 22.2333 23.0521 21.175C21.5542 20.1187 20.8083 18.8146 20.8083 17.2646H30.2333C32.2542 17.2646 33.975 17.9771 35.3958 19.3979C36.0848 20.0665 36.6296 20.8691 36.9965 21.7562C37.3634 22.6434 37.5447 23.5963 37.5292 24.5562V31.2333C37.5292 33.2542 36.8167 34.9771 35.3958 36.3979C33.975 37.8187 32.2521 38.525 30.2333 38.525H21.5375C19.5167 38.525 17.7979 37.8187 16.3771 36.3979C15.6879 35.7283 15.1432 34.9246 14.7766 34.0363C14.4101 33.1481 14.2294 32.1941 14.2458 31.2333V9.40833Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_191"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_youtube:`<svg width="51" height="50" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49.9625 13.5028C49.6723 12.4472 49.105 11.4845 48.3173 10.7106C47.5296 9.93668 46.5488 9.37849 45.4726 9.09158C41.4821 8.0175 25.5177 8.00002 25.5177 8.00002C25.5177 8.00002 9.55574 7.98253 5.56272 9.00915C4.48719 9.30926 3.50842 9.87535 2.72037 10.6531C1.93233 11.4308 1.36147 12.3941 1.0626 13.4503C0.010197 17.362 3.73348e-06 25.475 3.73348e-06 25.475C3.73348e-06 25.475 -0.010189 33.628 1.03457 37.4997C1.62066 39.6404 3.34069 41.3314 5.52704 41.9084C9.55829 42.9825 25.4794 43 25.4794 43C25.4794 43 41.4439 43.0175 45.4344 41.9933C46.511 41.7069 47.4927 41.15 48.2824 40.3777C49.0721 39.6053 49.6424 38.6443 49.937 37.5896C50.992 33.6805 50.9996 25.5699 50.9996 25.5699C50.9996 25.5699 51.0506 17.4144 49.9625 13.5028ZM20.4111 32.9911L20.4238 18.0039L33.6923 25.51L20.4111 32.9911Z" fill="#293648"/></svg>`,
    icon_hackmd:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_200)"><path d="M47 17.2141V47.2698C47 47.9939 46.7105 48.6884 46.1952 49.2004C45.6798 49.7124 44.9809 50 44.2521 50H5.75094C5.38982 50.0004 5.03217 49.9301 4.69843 49.793C4.36469 49.656 4.0614 49.455 3.80591 49.2014C3.55042 48.9479 3.34774 48.6468 3.20946 48.3153C3.07117 47.9839 3 47.6286 3 47.2698V1.73016C3.0008 1.0058 3.29098 0.311381 3.8068 -0.200537C4.32261 -0.712456 5.02187 -1 5.75094 -1H28.6674V14.4809C28.6674 15.2058 28.9572 15.901 29.4732 16.4135C29.9891 16.9261 30.6888 17.2141 31.4184 17.2141H47ZM36.0023 21.7683C36.0023 21.5296 35.9068 21.3007 35.7369 21.1319C35.567 20.9631 35.3366 20.8683 35.0964 20.8683H14.9187C14.6785 20.8683 14.4481 20.9631 14.2782 21.1319C14.1083 21.3007 14.0128 21.5296 14.0128 21.7683V23.5894C14.0128 23.8282 14.1083 24.0571 14.2782 24.2259C14.4481 24.3947 14.6785 24.4895 14.9187 24.4895H35.0843C35.3245 24.4895 35.555 24.3947 35.7248 24.2259C35.8947 24.0571 35.9902 23.8282 35.9902 23.5894L36.0023 21.7683ZM36.0023 29.0528C36.0023 28.8141 35.9068 28.5851 35.7369 28.4163C35.567 28.2475 35.3366 28.1527 35.0964 28.1527H14.9187C14.6785 28.1527 14.4481 28.2475 14.2782 28.4163C14.1083 28.5851 14.0128 28.8141 14.0128 29.0528V30.8769C14.0128 31.1156 14.1083 31.3445 14.2782 31.5133C14.4481 31.6821 14.6785 31.7769 14.9187 31.7769H35.0843C35.3245 31.7769 35.555 31.6821 35.7248 31.5133C35.8947 31.3445 35.9902 31.1156 35.9902 30.8769L36.0023 29.0528ZM36.0023 36.3402C36.0023 36.1015 35.9068 35.8726 35.7369 35.7038C35.567 35.535 35.3366 35.4401 35.0964 35.4401H14.9187C14.6785 35.4401 14.4481 35.535 14.2782 35.7038C14.1083 35.8726 14.0128 36.1015 14.0128 36.3402V38.1613C14.0128 38.4 14.1083 38.6289 14.2782 38.7977C14.4481 38.9665 14.6785 39.0614 14.9187 39.0614H35.0843C35.3245 39.0614 35.555 38.9665 35.7248 38.7977C35.8947 38.6289 35.9902 38.4 35.9902 38.1613L36.0023 36.3402ZM45.8555 13.5719H32.3333V0.137065C32.7049 0.366237 33.051 0.633736 33.3661 0.935113L45.0523 12.5458C45.3565 12.858 45.6258 13.202 45.8555 13.5719Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_200"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_protonmail:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.1115V16.7959L15 29.3296L22.7083 22.96C22.5 22.96 22.5 22.7546 22.2917 22.7546L1.66667 5.28962C1.04167 4.67321 0 5.08415 0 6.1115ZM12.2917 32.4116L0 22.1381V42.8906C0 45.1508 1.875 47 4.16667 47H35.4167V17.6178L17.7083 32.4116C16.0417 33.6445 13.9583 33.6445 12.2917 32.4116ZM39.5833 13.3029V12.4811L48.3333 5.28962C48.9583 4.67321 50 5.28962 50 6.1115V42.8906C50 45.1508 48.125 47 45.8333 47H39.5833V13.7139C39.5833 13.7139 39.5833 13.5084 39.5833 13.3029Z" fill="#293648"/></svg>`,
    icon_reddit:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2284_212)"><path d="M19.5 30C19.0056 30 18.5222 29.8534 18.1111 29.5787C17.7 29.304 17.3795 28.9134 17.1903 28.4565C17.0011 28 16.9516 27.4972 17.0481 27.0122C17.1445 26.5272 17.3826 26.0819 17.7323 25.7322C18.0819 25.3825 18.5273 25.1444 19.0122 25.0481C19.4972 24.9515 20 25.0009 20.4566 25.1903C20.9134 25.3794 21.3041 25.7 21.5788 26.1109C21.8534 26.5222 22 27.0056 22 27.5C22 27.8284 21.9353 28.1534 21.8097 28.4565C21.6841 28.76 21.5 29.0356 21.2678 29.2678C21.0356 29.5 20.76 29.684 20.4566 29.8097C20.1534 29.9353 19.8284 30 19.5 30ZM50 25C50 29.9447 48.5338 34.7781 45.7869 38.8893C43.0397 43.0006 39.1353 46.2046 34.5672 48.0968C29.9991 49.989 24.9722 50.4843 20.1228 49.5196C15.2732 48.555 10.8187 46.174 7.32234 42.6778C3.82603 39.1812 1.445 34.7268 0.480373 29.8772C-0.484252 25.0278 0.0108423 20.0009 1.90303 15.4329C3.79522 10.8647 6.99953 6.96027 11.1107 4.21325C15.222 1.46622 20.0556 0 25 0C31.6303 0 37.9894 2.6339 42.6778 7.32234C47.3659 12.0107 50 18.3696 50 25ZM36.6562 20.8437C35.7947 20.8944 34.9822 21.2619 34.375 21.875C31.8047 20.1762 28.7994 19.254 25.7187 19.2187L27.4687 11.3125L33.0625 12.5625C33.0584 12.8893 33.1191 13.2137 33.2413 13.5168C33.3638 13.82 33.5447 14.0958 33.7744 14.3284C34.0041 14.561 34.2778 14.7456 34.5794 14.8716C34.8809 14.9976 35.2044 15.0625 35.5312 15.0625C36.1972 15.0543 36.8331 14.784 37.3009 14.3101C37.7691 13.8363 38.0313 13.1972 38.0313 12.5312C38.05 11.9598 37.8697 11.3997 37.5216 10.9464C37.1731 10.493 36.6781 10.1746 36.1212 10.0456C35.5644 9.91646 34.98 9.98468 34.4675 10.2385C33.9553 10.4924 33.5472 10.9161 33.3125 11.4375L27.0625 10.0625C26.9137 10.034 26.7597 10.0633 26.6319 10.1447C26.5041 10.226 26.4122 10.3531 26.375 10.5L24.4375 19.2187C21.3581 19.2628 18.3553 20.184 15.7813 21.875C15.443 21.5256 15.0326 21.2544 14.5787 21.08C14.1248 20.9056 13.6383 20.8322 13.1532 20.8653C12.6681 20.8981 12.1959 21.0362 11.7697 21.2703C11.3435 21.5044 10.9735 21.8287 10.6854 22.2203C10.3974 22.6122 10.1982 23.0622 10.1019 23.5387C10.0056 24.0153 10.0143 24.5072 10.1276 24.98C10.2408 25.4528 10.4558 25.8953 10.7576 26.2765C11.0594 26.6578 11.4407 26.9687 11.875 27.1875C11.8272 27.7072 11.8272 28.2303 11.875 28.75C11.875 34.0312 17.8437 38.3437 25.1875 38.3437C32.5313 38.3437 38.5 34.0312 38.5 28.75C38.5012 28.2131 38.4381 27.6781 38.3125 27.1562C38.9441 26.7984 39.4422 26.245 39.7313 25.5794C40.0206 24.9137 40.0856 24.1722 39.9162 23.4662C39.7469 22.7606 39.3522 22.129 38.7925 21.6672C38.2325 21.2056 37.5375 20.9384 36.8125 20.9062L36.6562 20.8437ZM29.7188 32.5625C28.3144 33.4447 26.6897 33.9125 25.0312 33.9125C23.3728 33.9125 21.7481 33.4447 20.3438 32.5625C20.2284 32.4572 20.0781 32.3987 19.9219 32.3987C19.7656 32.3987 19.6153 32.4572 19.5 32.5625C19.4394 32.6181 19.3909 32.6856 19.3578 32.7609C19.3247 32.8362 19.3078 32.9178 19.3078 33C19.3078 33.0822 19.3247 33.1637 19.3578 33.239C19.3909 33.3143 19.4394 33.3818 19.5 33.4375C21.1412 34.5512 23.0791 35.1465 25.0625 35.1465C27.0459 35.1465 28.9837 34.5512 30.625 33.4375C30.6856 33.3818 30.7341 33.3143 30.7672 33.239C30.8003 33.1637 30.8175 33.0822 30.8175 33C30.8175 32.9178 30.8003 32.8362 30.7672 32.7609C30.7341 32.6856 30.6856 32.6181 30.625 32.5625C30.5666 32.5009 30.4962 32.4522 30.4184 32.4187C30.3406 32.3853 30.2566 32.3678 30.1719 32.3678C30.0872 32.3678 30.0031 32.3853 29.9253 32.4187C29.8475 32.4522 29.7772 32.5009 29.7188 32.5625ZM30.5 25C30.0056 25 29.5222 25.1465 29.1109 25.4212C28.7 25.6959 28.3794 26.0865 28.1903 26.5434C28.0012 27 27.9516 27.5028 28.0481 27.9878C28.1444 28.4728 28.3825 28.9181 28.7322 29.2678C29.0819 29.6175 29.5272 29.8556 30.0122 29.9518C30.4972 30.0484 31 29.999 31.4569 29.8097C31.9134 29.6206 32.3041 29.3 32.5788 28.889C32.8534 28.4778 33 27.9943 33 27.5C33 26.8369 32.7366 26.2009 32.2678 25.7322C31.7991 25.2634 31.1631 25 30.5 25Z" fill="#293648"/></g><defs><clipPath id="clip0_2284_212"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_keet:`<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99472 15.2267C6.51879 16.9459 3.66532 22.1035 4.0589 28.9802C4.55088 37.5761 10.9462 46.9088 21.0317 48.6279C29.1002 50.0033 34.7251 47.2362 36.529 45.6808C36.611 44.8621 36.8734 42.9792 37.267 41.9968C37.759 40.7688 39.2349 36.8393 35.791 32.4185C35.0697 31.4925 34.3604 30.6943 33.7053 29.9571C31.2332 27.175 29.5334 25.2622 30.8713 20.6299C32.5026 14.9814 38.1603 14.2446 41.6948 14.7356C39.8909 12.1159 34.7087 6.77848 28.4114 6.38552C26.2419 6.25015 24.4648 6.18939 22.9153 6.13642C18.8427 5.99718 16.3424 5.9117 12.4221 4.66634C8.09274 3.291 5.86245 0.982388 5.28848 0C4.8785 0.982388 4.40292 3.291 5.78045 4.66634C7.15799 6.04169 8.32233 7.36791 8.73231 7.85911C7.58437 7.85911 5.23928 7.95734 5.04249 8.3503C4.8457 8.74325 7.25638 10.3151 8.48633 11.0519C6.76441 11.1337 3.12378 11.6413 2.33661 13.0166C1.79771 13.9582 1.92279 13.9421 2.59079 13.8559C3.14246 13.7847 4.06442 13.6658 5.28848 13.999C7.45347 14.5885 7.99472 15.0631 7.99472 15.2267ZM23.302 24.4897C23.2528 24.6956 22.9727 24.7314 22.8311 24.5738C22.7196 24.4498 22.596 24.3349 22.4622 24.2297C21.9452 23.8229 21.2736 23.5773 20.5395 23.5773C19.6136 23.5773 18.7877 23.9637 18.2464 24.5724C18.1056 24.7308 17.8261 24.6955 17.7769 24.4895C17.6543 23.9769 17.5876 23.4208 17.5876 22.8405C17.5876 20.2637 18.9088 18.1742 20.5395 18.1742C22.1701 18.1742 23.4913 20.2637 23.4913 22.8405C23.4913 23.4208 23.4246 23.977 23.302 24.4897Z" fill="#293648"/><path d="M47.2957 32.1806C49.2239 24.7096 47.0547 17.7207 42.4752 15.7923C38.8598 14.829 33.0327 15.8675 31.6293 21.3318C30.4241 26.0239 32.4772 27.4531 34.7625 30.0089C35.4066 30.729 36.2107 31.7188 36.9317 32.6598C40.065 36.7497 38.3606 41.0203 37.8928 42.2081C37.5854 42.9898 37.5127 44.1328 37.4529 44.955C37.4383 45.1552 37.6543 45.293 37.8245 45.1862C40.566 43.4654 45.4631 39.281 47.2957 32.1806Z" fill="#293648"/></svg>`,
    // terminal
    icon_consortium: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_terminal: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
    icon_theme: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // window icons
    icon_close_dark: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
    icon_close_light: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
    icon_pdf_reader: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_pdf_reader_solid:`<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M35.3636 0H6V50H44V8.92857H35.3636V0ZM10.4902 11.0698H27.072V13.2127H10.4902V11.0698ZM33.2902 26.0633H10.4902V28.2062H33.2902V26.0633ZM10.4902 15.3492H35.3629V17.4921H10.4902V15.3492ZM33.2902 30.3531H10.4902V32.496H33.2902V30.3531Z" fill="white"/><path d="M37.0909 1.78571H38.8182V3.57143H40.5455V5.35714H42.2727V7.14286H37.0909V1.78571Z" fill="white"/></svg>`,
    icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,    
    icon_folder_solid:`<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M30.137 9V15.5306H0V41H50V9H30.137Z" fill="#FFFAF4"/></svg>`,
    // arrows
    icon_arrow_down: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
    icon_arrow_up: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
    icon_arrow_down_light: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="white"/></svg>`,
    icon_arrow_up_light: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.579 9L18.421 9V17H7.89475V27.6667H1.2659e-06L0 41H18.421V33H31.579V41H50V27.6667H42.1054V17H31.579V9Z" fill="white"/></svg>`,
    // actions
    icon_search : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7627 2.27344H25.5832V4.73044H12.7627V2.27344Z" fill="#293648"/><path d="M12.7627 32.9844H25.5832V35.4414H12.7627V32.9844Z" fill="#293648"/><path d="M6.93457 4.73047H12.7621V7.18747H6.93457V4.73047Z" fill="#293648"/><path d="M6.93457 30.5273H12.7621V32.9844H6.93457V30.5273Z" fill="#293648"/><path d="M4.60352 7.1875H6.93452V14.5585H4.60352V7.1875Z" fill="#293648"/><path d="M4.60352 23.1562H6.93452V30.5272H4.60352V23.1562Z" fill="#293648"/><path d="M2.27246 13.3281H4.60346V24.3846H2.27246V13.3281Z" fill="#293648"/><path d="M31.4102 7.1875H33.7413V14.5585H31.4102V7.1875Z" fill="#293648"/><path d="M33.7416 35.4433H31.4105V32.9863H25.583V30.5292H31.4105V24.3867H33.7416V30.5292H36.0726V32.9863H38.4035V35.4433H40.7346V37.9004H43.0655V40.3574H45.3966V42.8142H47.7276V47.7283H43.0655V45.2713H40.7346V42.8142H38.4035V40.3574H36.0726V37.9004H33.7416V35.4433Z" fill="#293648"/><path d="M33.7412 13.3281H36.0721V24.3846H33.7412V13.3281Z" fill="#293648"/><path d="M25.583 4.73047H31.4105V7.18747H25.583V4.73047Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1936 1.70312H26.1505V4.16012H31.978V6.61712H34.3091V12.7596H36.64V24.9524H34.3091V29.9586H36.64V32.4156H38.9709V34.8727H41.3021V37.3297H43.633V39.7868H45.9641V42.2436H48.295V48.294H42.4966V45.837H40.1657V43.3799H37.8346V40.9231H35.5036V38.4661H33.1727V36.009H30.8416V33.552H26.1505V36.009H12.1936V33.552H6.3661V31.0949H4.0351V24.9524H1.7041V12.7596H4.0351V6.61712H6.3661V4.16012H12.1936V1.70312ZM12.7618 4.72831H6.93428V7.18531H4.60328V13.3278H2.27228V24.3843H4.60328V30.5268H6.93428V32.9838H12.7618V35.4409H25.5823V32.9838H31.4098V35.4409H33.7409V37.8979H36.0718V40.3549H38.4027V42.8118H40.7339V45.2688H43.0648V47.7259H47.7268V42.8118H45.3959V40.3549H43.0648V37.8979H40.7339V35.4409H38.4027V32.9838H36.0718V30.5268H33.7409V24.3843H36.0718V13.3278H33.7409V7.18531H31.4098V4.72831H25.5823V2.27131H12.7618V4.72831ZM25.5823 4.72831H12.7618V7.18531H6.93428V14.5563H4.60328V23.1559H6.93428V30.5268H12.7618V32.9838H25.5823V30.5268H31.4098V24.3843H33.7409V14.5563H31.4098V7.18531H25.5823V4.72831ZM25.0141 5.29649H13.33V7.75349H7.50247V15.1245H5.17147V22.5876H7.50247V29.9586H13.33V32.4156H25.0141V29.9586H30.8416V23.8161H33.1727V15.1245H30.8416V7.75349H25.0141V5.29649Z" fill="#293648"/></svg>`,
    // images - @TODO: should be svgs as well
    banner_cover : `${prefix}/../assets/images/banner_cover.svg`,
    about_us_cover : `${prefix}/../assets/images/about_us_cover.png`,
    tree_character : `${prefix}/../assets/images/tree_character.png`,
    // others
    icon_clock : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1964)"><path fill-rule="evenodd" clip-rule="evenodd" d="M33.3333 38.889H38.889V33.3333H44.4444V16.6667H38.889V11.1111H33.3333V5.55556H16.6667V11.1111H11.1111V16.6667H5.55556V33.3333H11.1111V38.889H16.6667V44.4444H33.3333V38.889ZM38.889 44.4444V50H11.1111V44.4444H5.55556V38.889H0V11.1111H5.55556V5.55556H11.1111V0H38.889V5.55556H44.4444V11.1111H50V38.889H44.4444V44.4444H38.889Z" fill="#293648"/><path d="M22.2226 22.2206H16.667V27.776H27.778V11.1094H22.2226V22.2206Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1964"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_link : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1975)"><path d="M28 0L28 5L37 5V10H32L32 15L27 15V20H22V28L30 28L30 23H35L35 18H40V13H45L45 23H50V0H28Z" fill="#293648"/><path d="M0 5H22V11H6V44H39V28H45V50H0V5Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1975"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_calendar : `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M47 14H3V45H47V14ZM0 6V48H50V6H46V2H40V6H10V2H4V6H0Z" fill="#293648"/><path d="M15 38V35H12V25H14.9901L15 22H22V25H25V35H22V38H15ZM15 35H22V25H14.9901L15 35Z" fill="#293648"/><path d="M28 38V35H32V25H28V22H35.0098V35H39V38H28Z" fill="#293648"/></svg>`,
    project_logo_1 : `${prefix}/../assets/images/project_logo_1.png`,
    img_robot_1 : `${prefix}/../assets/images/img_robot_1.png`,
    img_robot_3 : `${prefix}/../assets/images/img_robot_1_light.png`,
    img_robot_2 : `${prefix}/../assets/images/img_robot_2_light.png`,
    pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,
    logo:  `${prefix}/../assets/images/logo.png`,
    circle: `<?xml version="1.0" ?><svg width="15" height="15" version="1.1" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="hsla(133, 57%, 45%, 1)"><circle cx="8" cy="8" r="8"/></svg>`,
    tick: `<?xml version="1.0" ?><svg height="10" version="1.1" viewBox="0 0 13 19" width="12" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" id="Core" transform="translate(-423.000000, -47.000000)"><g id="check" transform="translate(423.000000, 47.500000)"><path d="M6,10.2 L1.8,6 L0.4,7.4 L6,13 L18,1 L16.6,-0.4 L6,10.2 Z" id="Shape"/></g></g></g></svg>`,

    icon_arrow_right: `<svg transform="rotate(90 0 0)" width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
    icon_arrow_left: `<svg transform="rotate(90 0 0)" width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
    icon_the_dat : `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M210 280H190V300H210V280Z" fill="#fff"/><path d="M190 160H150V180H190V160Z" fill="#fff"/><path d="M390 20V80H370V100H310V80H290V20H310V0H370V20H390Z" fill="#fff"/><path d="M210 140H190V160H210V140Z" fill="#fff"/><path d="M190 260H150V280H190V260Z" fill="#fff"/><path d="M250 100H230V120H250V100Z" fill="#fff"/><path d="M270 320H250V340H270V320Z" fill="#fff"/><path d="M290 320H270V340H290V320Z" fill="#fff"/><path d="M290 80H250V100H290V80Z" fill="#fff"/><path d="M290 400V340H310V320H370V340H390V400H370V420H310V400H290Z" fill="#fff"/><path d="M130 180H150V260H130V280H50V260H30V180H50V160H130V180Z" fill="#fff"/><path d="M250 300H210V320H250V300Z" fill="#fff"/><path d="M230 120H210V140H230V120Z" fill="#fff"/></svg>`,

    icon_vr: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="40" y="108" width="339" height="204" fill="url(#pattern0)"/><path d="M371.952 133.154V116.077H354.905V99H65.0952V116.077H48.0476V133.154H31V303.923H48.0476V321H150.333V303.923H167.381V286.846H184.429V269.769H201.476V252.692H218.524V269.769H235.571V286.846H252.619V303.923H269.667V321H371.952V303.923H389V133.154H371.952ZM82.1429 252.692V150.231H150.333V252.692H82.1429ZM337.857 252.692H269.667V150.231H337.857V252.692Z" fill="white"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_2206_52" transform="matrix(0.0454545 0 0 0.0714286 -0.181818 -0.571429)"/></pattern><image id="image0_2206_52" width="30" height="30" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAIRJREFUSEvtlksOwCAIBfUi3P9cXKSNCzaWT0iepWlw6W9gFOMcRW0WcUeDXzPfqutVE9GFiIKZ1eNUO1FQCVyDP8BoqAX/JnhXFNnw5u9jbsYN/r9qxAMCLye5eJF+KDh72xc8VU6aauvtjTIPwQtmbWJBJcDMuv4IICvI3atVt+pjBm54bHAflRebbgAAAABJRU5ErkJggg=="/></defs></svg>`,
    icon_full_screen: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M40 170.465V40H170.465V82.5H82.5V170.465H40ZM380 170.465V40H249.535V82.5H337.5V170.465H380ZM380 249.535H337.5V337.5H249.535V380H380V249.535ZM170.465 380V337.5H82.5V249.535H40V380H170.465Z" fill="white"/></svg>`,
    icon_plus: `<svg width="15" height="15" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M176 380V244H40V176H176V40H244V176H380V244H244V380H176Z" fill="#EEECE9"/></svg>`,
  }
}

module.exports = light_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/theme/lite-theme")
},{"_process":2,"path":1,"theme/brand":48}],51:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  TIMELINE CARD COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = timeline_card
// ----------------------------------------
function timeline_card (opts = default_opts) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data, date, time, link, title, desc, tags} = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_clock,
    icon_link,
    icon_calendar,
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  el.style.height = "100%"
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="timeline_card">
    <div class="content_wrapper">
      <div class="icon_wrapper">
        <div> ${icon_calendar} ${date} </div>
        <div> ${time === '' ? '' : icon_clock } ${time} </div>
        <div> <a target="_blank" href="${link}">${icon_link}</a> </div>
      </div>
      <div class="title"> ${title} </div>
      <div class="desc"> ${desc}</div>
    </div>
    <div class="tags_wrapper">
      ${tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
    </div>
  </div>`
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .timeline_card {
      display: flex;
      flex-direction:column;
      justify-content:space-between;
      height: 100%;
      width: 100%;
      line-height: normal;
      background-color: var(--bg_color);
      color: var(--primary_color) !important;
      border: 1px solid var(--primary_color);
      container-type: inline-size;
    }
    .content_wrapper {
      padding: 20px;
    }
    .icon_wrapper {
      display: flex;
      gap: 20px;
    }
    .icon_wrapper div {
      display: flex;
      gap: 5px;
      font-size: 16px;
      letter-spacing: -2px;
      align-items: center;
    }
    .icon_wrapper svg *{
      fill: var(--primary_color);
    }
    .icon_wrapper img {
      width: 20px;
      height: 20px;
    }
    .icon_wrapper div:nth-last-child(1) {
      margin-left: auto;
    }
    .title {
      margin-top: 20px;
      margin-bottom: 5px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -2px;
      line-height: 16px;
    }
    .desc {
      font-size: 14px;
      letter-spacing: -2px;
      line-height: 16px;
    }
    .tags_wrapper {
      display: flex;
      flex-wrap: wrap;
    }
    .tag {
      flex-grow: 1;
      min-width: max-content;
      padding: 5px 10px;
      border: 1px solid var(--primary_color);
      // line-height:0px;
      text-align: center;
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline-card/timeline-card.js")
},{"_process":2}],52:[function(require,module,exports){
(function (process,__filename){(function (){
const search_input = require('search-input')
const select_button = require('buttons/select-button')
const sm_icon_button = require('buttons/sm-icon-button')
const year_button = require('buttons/year-button')
/******************************************************************************
  TIMELINE FILTER COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = timeline_filter
// ----------------------------------------
function timeline_filter (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { img_src : { icon_arrow_up = `${prefix}/icon_arrow_up.svg` }} = opts.data
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { update_timeline_filter }
  const up_channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="filter_wrapper">
    <div class="timeline_filter">
      <div class="date_wrapper"></div>
    </div>
  </div>`
  const timeline_filter = shadow.querySelector('.timeline_filter')
  const date_wrapper = shadow.querySelector('.date_wrapper')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // search project
    const on = { 'value': on_value }
    const protocol = use_protocol('search_project')({ state, on })
    const search_opts = opts 
    const element = shadowfy()(search_input(search_opts, protocol))
    timeline_filter.prepend(element)
    function on_value (message) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        refs: { cause: message.head },
        type: 'value',
        data: message.data
      })
    }
  }
  { // tag button
    const on = { 'value': on_value }
    const protocol = use_protocol('tag_button')({ state, on })
    const tag_opts = { data: opts.data, name: 'TAGS', choices: opts.tags }
    const element = shadowfy()(select_button(tag_opts, protocol))
    timeline_filter.prepend(element)
    function on_value (message) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        refs: { cause: message.head },
        type: 'value',
        data: message.data
      })
    }
  }
  { // status button
    const on = { 'value': on_value }
    const protocol = use_protocol('status_button')({ state, on })
    const status_opts = { data: opts.data, name: 'STATUS', choices: ['ACTIVE', 'INACTIVE', 'PAUSED'] }
    const element = shadowfy()(select_button(status_opts, protocol))
    timeline_filter.prepend(element)
    function on_value (message) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        refs: { cause: message.head },
        type: 'value',
        data: message.data
      })
    }
  }
  { // month button
    const on = { 'click': on_click }
    const protocol = use_protocol('month_button')({ state, on })
    const opts = { src: icon_arrow_up, activate: true }
    const element = shadowfy()(sm_icon_button(opts, protocol))
    date_wrapper.append(element)
    function on_click (message) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'toggle_month_filter'
      })
    }
  }
  { // year button
    const on = { 'click': on_click }
    const protocol = use_protocol('year_button')({ state, on })
    const year_opts = { data: opts.data, latest_date: opts.latest_date }
    const element = shadowfy()(year_button(year_opts, protocol))
    date_wrapper.append(element)
    function on_click (message) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        refs: { cause: message.head },
        type: 'toggle_year_filter'
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function update_timeline_filter (message) {
    const channel = state.net[state.aka.year_button]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      refs: { cause: message.head },
      type: 'update_label',
      data: message.data
    })
  }
}
function get_theme () {
  return `
    .filter_wrapper {
      container-type: inline-size;
      position:relative;
      z-index:4;
    }
    .timeline_filter {
      display: grid;
      grid-template-columns: 12fr;
      align-items: flex-end;   
    }
    .date_wrapper {
      display: grid;
      grid-template-columns: 1fr 12fr;
    }
    @container (min-width: 450px) {
      .filter_wrapper {
      }
      .timeline_filter {
        grid-template-columns: 1fr 1fr 9fr 1fr;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline-filter/timeline-filter.js")
},{"_process":2,"buttons/select-button":18,"buttons/sm-icon-button":20,"buttons/year-button":24,"search-input":43}],53:[function(require,module,exports){
(function (process,__filename){(function (){
const app_timeline = require('app-timeline')
const app_footer = require('app-footer')
/******************************************************************************
  TIMELINE PAGE COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = timeline_page
// ----------------------------------------
function timeline_page (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const up_channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="main-wrapper">
    <div class="main"></div>
  </div>`
  const main = shadow.querySelector('.main')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // app timeline
    const on = {}
    const protocol = use_protocol('app_timeline')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_timeline(opts, protocol))
    main.append(element)
  }
  { // app footer
    const on = {}
    const protocol = use_protocol('app_footer')({ state, on })
    const opts = { data }
    const element = shadowfy()(app_footer(opts, protocol))
    main.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
    }
    .main {
      margin: 0;
      padding: 30px 10px;
      opacity: 1;
      background-size: 16px 16px;
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline-page/timeline-page.js")
},{"_process":2,"app-footer":9,"app-timeline":14}],54:[function(require,module,exports){
(function (process,__filename){(function (){
const window_bar = require('window-bar')
/******************************************************************************
  TOOLS COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = tools
// ----------------------------------------
function tools (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_folder,
    icon_discord,
    icon_github,
    icon_mastodon,
    icon_opencollective,
    icon_matrix,
    icon_twitter_smooth,
    icon_github_smooth,
    icon_cabal,
    icon_jitsi,
    icon_discord_smooth,
    icon_bigbluebutton,
    icon_youtube,
    icon_hackmd,
    icon_protonmail,
    icon_reddit,
    icon_keet,
  } = img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 'show': on_show, 'hide': on_hide }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="tools">
    <div class="windowbar"></div>
    <div class="tools_content">
      <a href="https://fosstodon.org/@dat_ecosystem" target="_blank"> 
        <div class="icon"> ${icon_mastodon} Mastodon </div> 
      </a>
      <a href="https://opencollective.com/dat" target="_blank"> 
        <div class="icon"> ${icon_opencollective} OpenCollective </div> 
      </a>
      <a href="https://matrix.to/#/%23datproject_discussions:gitter.im" target="_blank"> 
        <div class="icon"> ${icon_matrix} Matrix </div> 
      </a>
      <a href="https://twitter.com/dat_ecosystem" target="_blank"> 
        <div class="icon"> ${icon_twitter_smooth} Twitter </div> 
      </a>
      <a href="https://github.com/dat-ecosystem" target="_blank"> 
        <div class="icon"> ${icon_github_smooth} github </div> 
      </a>
      <a href="https://github.com/dat-ecosystem/dat-ecosystem.github.io/blob/main/README.md#connect-to-cabal-with-cli-or-download-cabal-desktop" target="_blank"> 
        <div class="icon"> ${icon_cabal} Cabal </div> 
      </a>
      <a href="https://meet.jit.si/dat-ecosystem" target="_blank"> 
        <div class="icon"> ${icon_jitsi} Jitsi </div> 
      </a>
      <a href="https://discord.gg/egsvGc9TkQ" target="_blank"> 
        <div class="icon"> ${icon_discord_smooth} discord </div> 
      </a>
      <a href="https://bigbluebutton.org/" target="_blank"> 
        <div class="icon"> ${icon_bigbluebutton} BigBlueButton </div> 
      </a>
      <a href="https://www.youtube.com/@DatEcosystem-" target="_blank"> 
        <div class="icon"> ${icon_youtube} Youtube </div> 
      </a>
      <a href="https://hackmd.io/@T6Wf5EsOQKe-6wyPjJPtuw/Hycn0F63r/%2Fx_4tQHwtT3u7vrksrposHw" target="_blank"> 
        <div class="icon"> ${icon_hackmd} HackMD </div> 
      </a>
      <a href="dat-ecosystem@protonmail.com" target="_blank"> 
        <div class="icon"> ${icon_protonmail} Protonmail </div> 
      </a>
      <a href="https://www.reddit.com/r/dat_ecosystem/" target="_blank"> 
        <div class="icon"> ${icon_reddit} Reddit </div> 
      </a>
      <a href="https://keet.io/" target="_blank"> 
        <div class="icon"> ${icon_keet} Keet </div> 
      </a>
    </div>
  </div>`
  const tools_wrapper = shadow.querySelector('.tools')
  // ----------------------------------------
  const windowbar_shadow = shadow.querySelector('.windowbar').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // windowbar
    const on = {
      'toggle_active_state': toggle_active_state
    }
    const protocol = use_protocol('windowbar')({ state, on })
    const opts = {
      name: 'tools/', 
      src: icon_folder,
      data: data
    }
    const element = window_bar(opts, protocol)
    windowbar_shadow.append(element)
    async function toggle_active_state (message) {
      const { active_state } = message.data
      if (active_state === 'active') tools_wrapper.style.display = 'none'
      const channel = state.net[state.aka.up]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'deactivate_tick',
        data: opts.name
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_show (event) {
    tools_wrapper.style.display = 'inline'
  }
  function on_hide (event) {
    tools_wrapper.style.display = 'none'
  }
}

function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .tools {
      display: none;
    }
    .tools_content {
      position: relative;
      display: grid;
      grid-template-columns: 4fr 4fr 4fr;
      padding: 10px;
      width: 100%;
      height: 100vh;
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      gap: 25px;
      margin-bottom: 30px;
    }
    .tools_content a{
      text-decoration:none;
    }
    .tools_content .icon {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
      color: var(--primary_color);
    }
    .tools_content .icon svg {
      width: 50px;
      height: 50px;
    }
    path{
      fill: var(--primary_color);
      stroke: var(--primary_color);
    }
    @container (min-width: 510px) {
      .tools_content {
        width: auto;
        height: auto;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/tools/tools.js")
},{"_process":2,"window-bar":55}],55:[function(require,module,exports){
(function (process,__filename){(function (){
const sm_icon_button_alt = require('buttons/sm-icon-button-alt')
const sm_text_button = require('buttons/sm-text-button')
/******************************************************************************
  WINDOW BAR COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = window_bar
// ----------------------------------------
function window_bar (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const {
    icon_close_light, 
    icon_arrow_down_light, 
    icon_arrow_up_light
  } = opts.data.img_src
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const up_channel = use_protocol('up')({ protocol, state })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="window_bar">
    <div class="data_type_icon"></div>
    <div class="application_name"><span>${opts.name}</span></div>
    <div class="window_bar_actions">
    <div class="actions_wrapper"></div>
    <div class="actions_toggle_btn"></div>
    </div>
  </div>`
  const window_bar_actions = shadow.querySelector('.window_bar_actions')
  const actions_wrapper = shadow.querySelector('.actions_wrapper')
  // ----------------------------------------
  const actions_toggle_btn_shadow = shadow.querySelector('.actions_toggle_btn').attachShadow(shopts)
  const data_type_icon_shadow = shadow.querySelector('.data_type_icon').attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // data type icon
    const on = { 'click': on_click }
    const protocol = use_protocol('data_type_icon')({ state, on })
    const data_type_opts = { src: opts.src }
    const element = sm_icon_button_alt(data_type_opts, protocol)
    data_type_icon_shadow.append(element)
    function on_click (message) {
      console.log('data program type:', null)
    }
  }
  if (opts.action_buttons) {
    { // action buttons
      function make_element ({text, action: type, activate}, i) {
        const on = { 'click': onclick }
        const protocol = use_protocol(text)({ state, on })
        const opts = { toggle: true, text, activate }
        const element = shadowfy()(sm_text_button(opts, protocol))
        return element
        function onclick (message) {
          up_channel.send({
            head: [id, up_channel.send.id, up_channel.mid++],
            type
          })
        }
      }
      const elements = opts.action_buttons.map(make_element)
      actions_wrapper.append(...elements)
    }
    { // responsive actions toggle
      const on = {
        'click': toggle_window_active_state
      }
      const protocol = use_protocol('windowbar')({ state, on })
      const toggle_opts = {
        src: icon_arrow_down_light,
        src_active: icon_arrow_up_light
      }
      const element = sm_icon_button_alt(toggle_opts, protocol)
      actions_toggle_btn_shadow.append(element)
      async function toggle_window_active_state (message) {
        const  { active_state } = message.data
        actions_wrapper.style.display = active_state ? 'none' : 'flex'
      }
    }
  }
  { // icon buttons
    if (opts.icon_buttons) {
      function make_element ({ icon, action: type }, i) {
        const on = { 'click': onclick }
        const protocol = use_protocol(`${type}_${i}`)({ state, on })
        const icon_opts = { src: icon }
        const element = shadowfy()(sm_icon_button_alt(icon_opts, protocol))
        return element
        function onclick (message) {
          up_channel.send({
            head: [id, up_channel.send.id, up_channel.mid++],
            type
          })
        }
      }
      const elements = opts.icon_buttons.map(make_element)
      window_bar_actions.append(...elements)
    }
  }
  { // close button
    const on = { 'click': onclose }
    const protocol = use_protocol('close_window')({ state, on })
    const opts = { src: icon_close_light }
    const element = shadowfy()(sm_icon_button_alt(opts, protocol))
    window_bar_actions.append(element)
    function onclose (event) {
      up_channel.send({
        head: [id, up_channel.send.id, up_channel.mid++],
        type: 'toggle_active_state',
        data: { active_state : 'active' }
      })
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el
}
function get_theme () {
  return `
    .window_bar {
      position: relative;
      z-index: 2;
      background-color: var(--primary_color);
      display: flex;
      width: 100%;
      justify-content: flex-start;
      background-size: 5px 5px;
      background-image: repeating-linear-gradient(0deg, var(--bg_color_2), var(--bg_color_2) 1px, var(--primary_color) 2px, var(--primary_color));
      container-type: inline-size;
      border: 1px solid var(--primary_color);
      box-sizing: border-box;
    }
    .window_bar_actions {
      margin-left: auto;
      display: flex;
    }
    .window_bar_actions.active .actions_wrapper {
      display: flex;
    }
    .actions_wrapper {
      display: none;
      position: absolute;
      flex-direction: column;
      z-index: 10;
      width: 100%;
      height: max-content;
      top: 30px;
      right: 0;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
    }
    .application_name {
      display: flex;
      align-items: center;
      min-height: 100%;
      width: max-content;
      color: var(--bg_color);
      padding: 0 10px;
      font-size: 14px;
      letter-spacing: -1px;
      box-sizing: border-box;
      border: 1px solid var(--primary_color);
      background-color: var(--primary_color);
    }
    @container (min-width: 856px) {
      .actions_toggle_btn {
        display: none;
      }
      .actions_wrapper {
        display: flex !important;
        position: relative;
        flex-direction: row;
        top: unset;
        right: unset;
        height: 100%;
        width: max-content;
        border: 0px;
      }
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/window-bar/window-bar.js")
},{"_process":2,"buttons/sm-icon-button-alt":19,"buttons/sm-text-button":21}],56:[function(require,module,exports){
(function (process,__filename){(function (){
/******************************************************************************
  YEAR FILTER COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())
const default_opts = { }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = year_filter
// ----------------------------------------
function year_filter (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  let active_state = ''
  const year_buttons = {}
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { latest_year, oldest_year, visitor } = opts
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { update_year_filter: on_active_state }
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="year_wrapper"></div>`
  const year_wrapper = shadow.querySelector('.year_wrapper')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  for (let i = oldest_year; i <= latest_year; i++) {
    const year_button = document.createElement('span')
    year_button.classList.add('year_button')
    year_button.innerHTML = i.toString()
    year_button.onclick = toggle_active_state
    year_buttons[i.toString()] = year_button
    year_wrapper.prepend(year_button)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  const year = visitor ? latest_year : oldest_year
  on_active_state({ data: year })
  
  return el

  function toggle_active_state (e) {
    const selected_year = e.target.innerHTML
    if (active_state) year_buttons[active_state].classList.toggle('active')
    active_state = selected_year
    e.target.classList.toggle('active')
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set_scroll',
      data: { value: active_state, filter: 'YEAR' }
    })
  }
  function on_active_state ({ data: year_button }) {
    if (active_state) year_buttons[active_state].classList.remove('active')
    year_buttons[year_button].classList.add('active')
    active_state = year_button
  }
}
function get_theme () {
  return `
    .year_wrapper {
      --s: 20px; /* control the size */
      --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
      background:
        repeating-conic-gradient(at 66% 66%,var(--_g)),
        repeating-conic-gradient(at 33% 33%,var(--_g)),
        var(--primary_color);  /* second color */ 
      background-size: var(--s) var(--s);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: 94px;
      height: 100%;
      border: 1px solid var(--primary_color);
      box-sizing: border-box;
    }
    .year_button {
      display: block;
      text-align: center;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      padding: 4px 10px;
      cursor: pointer;
    }
    .year_button.active {
      background-color: var(--ac-1);
      color: var(--primary_color);
    }
  `
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/year-filter/year-filter.js")
},{"_process":2}]},{},[5]);
