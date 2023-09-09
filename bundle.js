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
},{"../../../src/node_modules/theme/dark-theme":43}],4:[function(require,module,exports){
module.exports = require('../../../src/node_modules/theme/lite-theme')
},{"../../../src/node_modules/theme/lite-theme":44}],5:[function(require,module,exports){
config().then(boot)
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  // @TODO: there are font files in `src/node_modules/theme/assets/fonts/...`
  // => those could be used instead
  const searchparams = `family=Silkscreen:wght@400;700&display=swap`
  const google_font_url = `https://fonts.googleapis.com/css2?${searchparams}`
  const html = document.documentElement
  const meta = document.createElement('meta')
  const link = document.createElement('link')
  const sheet = new CSSStyleSheet()
  html.setAttribute('lang', 'en')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', google_font_url)
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)
  document.adoptedStyleSheets = [sheet]
  document.head.append(meta, link)
  await document.fonts.ready
}
/******************************************************************************
  INITIALIZE PAGE
******************************************************************************/
async function boot () {
  const desktop = require('..')
  const light_theme = require('theme/lite-theme')
  const dark_theme = require('theme/dark-theme')

  const shadow = document.body.attachShadow({ mode: 'closed' })
  
  console.log({light_theme, dark_theme})
  const opts = { page: 'CONSORTIUM' }
  const el = await desktop(opts)

  shadow.append(el)
}
},{"..":6,"theme/dark-theme":3,"theme/lite-theme":4}],6:[function(require,module,exports){
(function (__filename){(function (){
const home_page = require('home_page')
const growth_page = require('growth_page')
const timeline_page = require('timeline_page')
const projects_page = require('projects_page')
const consortium_page = require('consortium_page')
const terminal = require('terminal')
const navbar = require('navbar')

const sheet = new CSSStyleSheet()

const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')
let current_theme = light_theme
sheet.replaceSync(get_theme(current_theme))
/******************************************************************************
  DESKTOP COMPONENT
******************************************************************************/
var count = 0
const ID = __filename
const STATE = { ids: {}, hub: {} } // all state of component module
// ----------------------------------------
const default_opts = { page: 'HOME' }

module.exports = desktop

async function desktop (opts = default_opts, protocol) {
  // ----------------------------------------
  // INSTANCE STATE & ID
  const id = `${ID}:${count++}` // assigns their own name
  const state = STATE.ids[id] = { id, wait: {}, hub: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const sh = el.attachShadow({ mode: 'closed' })
  sh.innerHTML = `<div class="desktop">
    <div class="navbar"></div>
    <div class="content"></div>
    <div class="shell"></div>
  </div>`
  sh.adoptedStyleSheets = [sheet]
  const [desktop] = sh.children
  const [nav, content, terminal_wrapper] = desktop.children
  const navbar_sh = nav.attachShadow({ mode: 'closed' })
  const content_sh = content.attachShadow({ mode: 'closed' })
  const terminal_sh = terminal_wrapper.attachShadow({ mode: 'closed' })
  // ----------------------------------------
  // TERMINAL
  // ----------------------------------------
  const terminal_el = terminal({ data: current_theme })
  // ----------------------------------------
  // CONTENT
  // ----------------------------------------
  const page_404 = Object.assign(document.createElement('div'), {
    innerHTML: `<h1 style="color:black;">404 - not found</h1>`
  })
  const page_list = { // LRU cache?
    // @TODO: maybe only store "factories" and create instance on demand?
    'HOME': home_page({ data: current_theme }),
    'PROJECTS': projects_page({ data: current_theme }),
    'GROWTH PROGRAM': growth_page({ data: current_theme }),
    'TIMELINE': timeline_page({ data: current_theme }),
    'CONSORTIUM': consortium_page({ data: current_theme }),
  } // @INFO: the initial visible content is set when receiving the first navbar message
  // ----------------------------------------
  // NAVBAR
  // ----------------------------------------
  const PROTOCOL = {
    'active_page': 'HOME', // @TODO: remove
    'handle_page_change': function handle_page_change (msg) {
      const { data: active_page } = msg
      const page = page_list[active_page] || page_404
      content_sh.replaceChildren(page)
    },
    'handle_theme_change': function handle_theme_change () {
      ;current_theme = current_theme === light_theme ? dark_theme : light_theme
      sheet.replaceSync(get_theme(current_theme))
    },
    'toggle_terminal': function toggle_terminal () {
      if (terminal_sh.contains(terminal_el)) return terminal_el.remove()
      terminal_sh.append(terminal_el)
    }
  }
  const navbar_opts = { page: opts.page, data: current_theme } // @TODO: SET DEFAULTS -> but change to LOAD DEFAULTS
  navbar_sh.append(navbar(navbar_opts, navbar_protocol))

  return el

  function navbar_protocol (send) {
    // const on = { 'ask-opts': on_ask_opts }
    PROTOCOL.social = onsocial
    state.hub[send.id] = { mid: 0, send, on: PROTOCOL }
    state.aka.navbar = send.id
    return Object.assign(listen, { id })
    function invalid (message) { console.error('invalid type', message) }
    function listen (message) {
      console.log(`[${id}]`, message)
      const { on } = state.hub[state.aka.navbar]
      const action = on[message.type] || invalid
      action(message)
    }
    function onsocial (message) {
      console.log('@TODO: open ', message.data)
    }
  }
}

function get_theme (opts) {
  return`
    * { box-sizing: border-box; }
    :host {
      --bg_color: ${opts.bg_color};
      --ac-1: ${opts.ac_1};
      --ac-2: ${opts.ac_2};
      --ac-3: ${opts.ac_3};
      --primary_color: ${opts.primary_color};
      display: flex;
      flex-direction: column;
      font-family: Silkscreen;
      color: var(--primary_color);
      background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
      background-size: 16px 16px;
      height: 100vh;
    }
    svg {
      fill: var(--bg_color);
    }
    .desktop {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .shell {
      flex-grow: 1;
    }
  `
}
}).call(this)}).call(this,"/src/desktop.js")
},{"consortium_page":25,"growth_page":26,"home_page":27,"navbar":32,"projects_page":36,"terminal":41,"theme/dark-theme":43,"theme/lite-theme":44,"timeline_page":47}],7:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = app_about_us

function app_about_us (opts) {
  const { data } = opts
  // Assigning all the icons
  const { img_src: { 
    about_us_cover = `${prefix}/about_us_cover.png`,
    img_robot_1 = `${prefix}/img_robot_1.svg`,
    icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="about_us_wrapper">
      <div class="about_us_cover_image">
        <img src="${about_us_cover}"/>
      </div>
      <div class="content_wrapper">
        <img src="${img_robot_1}"/>
        <div class="title"> ABOUT US </div>
      </div>
    </div>
    <div class="about_us_desc">
      Dat ecosystem garden supports open source projects that strengthen P2P foundations, with a focus on builder tools, infrastructure, research, and community resources.
    </div>
    <style> ${get_theme()} </style>
  `
  const cover_window = window_bar({
    name:'Learn_about_us.pdf', 
    src: icon_pdf_reader,
    action_buttons: ['IMPORTANT DOCUMENTS', 'TELL ME MORE'],
    data
  }, about_us_protocol)
  shadow.prepend(cover_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // about us protocol
  function about_us_protocol (message, send) {
    return listen
  }
  // Listening to toggle event 
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;(active_state === 'active')?el.style.display = 'none':''
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .about_us_wrapper {
      position:r elative;
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
      /* This covers background-image will change to an image */
      .about_us_cover_image {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        img {
          position: absolute;
          left: 50%;
          top: 50%;
          width: auto;
          height: 80%;
          transform: translate(-50%, -50%);
        }
      }
      /* Cover image alignment */
      .content_wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        position: relative;
        z-index: 1;
        color: var(--primary_color);
        text-align: center;
        img {
          width: 100px;
          height: auto;
        }
        .title{ 
          font-size: 40px;
        }
      }
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
      box-sizing: border-box;
    }
    @container (min-width: 856px) {
      .about_us_cover_image {
        img {
          width: 100%;
          height: auto;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_about_us")
},{"_process":2,"buttons/sm_text_button":20,"path":1,"window_bar":49}],8:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = cover_app

function cover_app (opts, protocol) {
  const name = `cover_app-${id++}`
  const { data } = opts
  // Assigning all the icons
  const {img_src} = data
  const {
    banner_cover = `${prefix}/banner_cover.svg`,
    tree_character = `${prefix}/tree_character.png`,
    icon_pdf_reader
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="cover_wrapper">
      <div class="cover_content">
        <div class="cover_image">
          <img src="${banner_cover}" />
        </div>
        <div class="content_wrapper">
          <img src="${tree_character}" />
          ALL UNDER ONE TREE
        </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const cover_window = window_bar({
    name:'Cover.pdf',
    src: icon_pdf_reader,
    action_buttons: ['View more (20)', 'TELL ME MORE'],
    data
  }, cover_protocol)
  const cover_wrapper = shadow.querySelector('.cover_wrapper')
  cover_wrapper.prepend(cover_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // cover protocol
  function cover_protocol(message, send){
    return listen
  }
  // Listening to toggle event 
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;( active_state === 'active')?cover_wrapper.style.display = 'none':''
  }
}
function get_theme () {
  return`
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
      padding: 150px 0px;
      background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
      .cover_image {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        img {
          position: absolute;
          left: 50%;
          top: 50%;
          width: auto;
          height: 100%;
          transform: translate(-50%, -50%);
        }
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
        img {
          width: 300px;
          height: auto;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_cover")
},{"_process":2,"buttons/sm_text_button":20,"path":1,"window_bar":49}],9:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = app_footer

function app_footer (opts) {
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
    img_robot_2 = `${prefix}/img_robot_2.png`,
    pattern_img_1 = `${prefix}/pattern_img_1.png`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="footer_wrapper">
        <div class="robot_img_2"><img src="${img_robot_2}"></div>
        <div class="footer_info_wrapper">
          <div class="title"> INTERESTED IN JOINING DAT ECOSYSTEM CHAT NETWORKING? </div>
          <div class="desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae porta aliquet sit amet ornare sagittis, ultricies sed. Viverra sit felis ullamcorper pharetra mattis amet, vel. </div>
          <apply_button></apply_button>    
        </div>
      </div>
      <div class="pattern_img"><img src="${pattern_img_1}"></div>
    </div>
    <style> ${get_theme()} </style>
  `
  // the following is the pattern we usually use, but what you do is more or less the same
  // so you can also keep your three liner :-)
  const join_programe = sm_text_button({ text: 'JOIN OUR GROWTH PROGRAME' })
  shadow.querySelector('apply_button').replaceWith(join_programe)
  // Adding Footer Window
  const footer_window = window_bar({
    name:'FOOTER.pdf', 
    src: icon_pdf_reader,
    data,
  }, footer_protocol)
  shadow.prepend(footer_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // footer protocol
  function footer_protocol (message, send) {
    return listen
  }
  // Listening to toggle event 
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;( active_state === 'active')?el.style.display = 'none':''
  }
}
function get_theme () {
  return`
    * { box-sizing: border-box; }
    .main_wrapper {
      position: relative;
      container-type: inline-size;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
      .footer_wrapper {
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-start;
        padding: 20px;
        padding-bottom: 0px !important;
        .robot_img_2 img {
          width: 150px;
        }
        .footer_info_wrappe r{
          margin-bottom: 30px;
          .title {
            font-size: 40px;
            color: var(--primary_color);
            font-weight: 700;
            line-height: 36px;
            letter-spacing: -5px;
            margin-bottom: 10px;
          }
          .desc {
            font-size: 16px;
            color: var(--primary_color);
            line-height: 14px;
            letter-spacing: -2px;
            margin-bottom: 30px;
          }
        }
      }
      .pattern_img {
        display:none;
      }
    }
    @container (min-width: 856px) {
      .main_wrapper {
        .footer_wrapper {
          gap: 40px;
          flex-direction: row;
          align-items: flex-end;
          width: 70%;
        }
        .pattern_img {
          display: block;
          position: absolute;
          top: 0;
          right: 0;
          & img {
            width: 300px;
            height: auto;
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_footer")
},{"_process":2,"buttons/sm_text_button":20,"path":1,"window_bar":49}],10:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const project_card = require('project_card')
const window_bar = require('window_bar')
const project_filter = require('project_filter')
const scrollbar = require('scrollbar')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = app_projects

function app_projects (opts, protocol) {
  const { data } = opts
  const PROTOCOL = { setFilter }
  // Assigning all the icons
  const { img_src: {
    icon_discord = `${prefix}/icon_discord.png`,
    icon_twitter = `${prefix}/icon_twitter.png`,
    icon_github = `${prefix}/icon_github.png`,
    icon_folder = `${prefix}/icon_folder.svg`,
    project_logo_1 = `${prefix}/project_logo_1.png`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="filter_wrapper">
        <div class="project_wrapper"></div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  // Adding applcation window bar
  const app_project_window = window_bar({
    name: 'OUR_PROJECTS',
    src: icon_folder,
    data,
  }, app_projects_protocol)
  // Adding project cards
  const project_wrapper = shadow.querySelector('.project_wrapper')
  const cardsData = [{ 
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Agregore', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Hypercore', 'Hyperplane', 'Hypertension'],
    active_state: 'ACTIVE',
    data,
  },{
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Ogre', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Dag', 'tag', 'Decentralized'],
    active_state: 'ACTIVE',
    data,
  },{
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Gerger', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Dag', 'Hyperplane', 'Hypercore'],
    active_state: 'UNACTIVE',
    data
  },{ 
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Agregored', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Daff', 'Dep1', 'Hypertension'],
    active_state: 'PAUSED',
    data
  },{
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Ogred', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Decentralized', 'tag', 'Hypercore'],
    active_state: 'UNACTIVE',
    data
  },{
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Ragregore', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Hypertension', 'Hypercore', 'Decentralized'],
    active_state: 'PAUSED',
    data
  },{
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    project: 'Agregorey',
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Daff', 'Hyperplane', 'Dep1'],
    active_state: 'ACTIVE',
    data
  }]
  const tags = new Set()
  cardsData.forEach(card_data => card_data.tags.forEach(tag => tags.add(tag))) 
  project_wrapper.append(...cardsData.map(project_card))
  const main_wrapper = shadow.querySelector('.main_wrapper')
  main_wrapper.append(scrollbar({data}, app_projects_protocol))
  const filter_wrapper = shadow.querySelector('.filter_wrapper')
  filter_wrapper.append(project_filter({data, tags: Array.from(tags)}, app_projects_protocol))
  shadow.prepend(app_project_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  //protocol
  function app_projects_protocol (handshake, send) {
    if (handshake.from.includes('scrollbar')) {
      const ro = new ResizeObserver(entries => send[0]())
      ro.observe(main_wrapper)
      project_wrapper.onscroll = send[0]
      PROTOCOL['handleScroll'] = send[0]
      PROTOCOL['getScrollInfo'] = send[1]
      return [listen, setScrollTop]
    }
    else if (handshake.from.includes('project_filter')) {
      return listen
    }
    else if (handshake.from.includes('window_bar')) {
      PROTOCOL['toggle_active_state'] = toggle_active_state
      return listen
    }
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, mid } = head
      // if( to !== name) return console.error('address unknown', message)
      if (by.includes('scrollbar')) {
        message.data = {
          sh: project_wrapper.scrollHeight,
          ch: project_wrapper.clientHeight,
          st: project_wrapper.scrollTop
        }
        PROTOCOL.getScrollInfo(message)
      }
      else if (by.includes('project_filter')) {
        PROTOCOL[type](data)
      }
      else if (by.includes('window_bar')) {
        PROTOCOL[type](message)
      }
    }
  }
  async function setScrollTop (value) {
    project_wrapper.scrollTop = value
  }
  async function setFilter (data) {
    PROTOCOL[data.filter] = data.value
    project_wrapper.innerHTML = ''
    let cardfilter = [...cardsData]
    if (PROTOCOL.SEARCH) {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.project.toLowerCase().match(PROTOCOL.SEARCH.toLowerCase())
      })
    }
    if (PROTOCOL.STATUS && PROTOCOL.STATUS !== 'NULL') {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.active_state === PROTOCOL.STATUS && card_data
      })
    }
    if (PROTOCOL.TAGS && PROTOCOL.TAGS !== 'NULL') {
      cardfilter = cardfilter.filter((card_data) => {
        return card_data.tags.includes(PROTOCOL.TAGS) && card_data
      })
    }
    project_wrapper.append(...cardfilter.map(project_card))
    PROTOCOL['handleScroll']()
  }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;(active_state === 'active')?el.style.display = 'none':''
  }
}
function get_theme () {
  return`
    .main_wrapper {
      display: flex;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;
      border: 1px solid var(--primary_color);
      * {
        box-sizing: border-box;
      }
      .filter_wrapper {
        width: 100%;
        height: 100%;
        .project_wrapper {
          --s: 20px; /* control the size */
          --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
          background:
            repeating-conic-gradient(at 66% 66%,var(--_g)),
            repeating-conic-gradient(at 33% 33%,var(--_g)),
            var(--primary_color);  /* second color */ 
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
          &::-webkit-scrollbar {
            display: none;
          }
        }
      }
    }
    @container (min-width: 768px) {
      .main_wrapper {
        .filter_wrapper {
          .project_wrapper {
            grid-template-columns: repeat(2, 6fr);
          }
        }
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper {
        .filter_wrapper {
          .project_wrapper {
            grid-template-columns: repeat(3, 4fr);
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_projects")
},{"_process":2,"path":1,"project_card":34,"project_filter":35,"scrollbar":37,"window_bar":49}],11:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const project_card = require('project_card')
const sm_text_button = require('buttons/sm_text_button')
const sm_icon_button = require('buttons/sm_icon_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = app_projects_mini

function app_projects_mini (opts) {
  const { data } = opts
  // Assigning all the icons
  const { img_src: {
    icon_discord = `${prefix}/icon_discord.png`,
    icon_twitter = `${prefix}/icon_twitter.png`,
    icon_github = `${prefix}/icon_github.png`,
    icon_folder = `${prefix}/icon_folder.svg`,
    project_logo_1 = `${prefix}/project_logo_1.png`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="project_wrapper"></div>
    </div>
    <style> ${get_theme()} </style>
  `
  // Adding Applicatin window Bar
  const cover_window = window_bar({
    name:'OUR PROJECTS', 
    src: icon_folder,
    action_buttons: ['View more (12)'],
    data: data
  }, projects_mini_protocol)
  // Adding project cards
  const project_wrapper = shadow.querySelector('.project_wrapper')
  const cardsData = [{ 
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    data: data,
    project: 'Agregore', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Hypercore', 'Hypercore', 'Hypercore'],
  },{ 
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    data: data,
    project: 'Agregore', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Hypercore', 'Hypercore', 'Hypercore'],
  },{ 
    title: 'Official starting of the web course.',
    project_logo: project_logo_1,
    data: data,
    project: 'Agregore', 
    link: '/',
    socials: [icon_github, icon_twitter, icon_discord],
    desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
    tags: ['Hypercore', 'Hypercore', 'Hypercore'],
  }]
  project_wrapper.append(...cardsData.map(project_card))
  shadow.prepend(cover_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // projects mini protocol
  function projects_mini_protocol (message, send) {
    return listen
  }
  // Listening to toggle event 
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;( active_state === 'active') ? el.style.display = 'none': ''
  }
}
function get_theme () {
  return`
    .main_wrapper {
      container-type: inline-size;
      width: 100%;
      height: 100%;
      * {
        box-sizing: border-box;
      }

      .project_wrapper {
        --s: 20px; /* control the size */
        --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
        background:
          repeating-conic-gradient(at 66% 66%,var(--_g)),
          repeating-conic-gradient(at 33% 33%,var(--_g)),
          var(--primary_color);  /* second color */ 
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
    }
    @container (min-width: 768px) {
      .main_wrapper {
        .project_wrapper {
          grid-template-columns: repeat(2, 6fr);
        }
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper {
        .project_wrapper {
          grid-template-columns: repeat(3, 4fr);
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_projects_mini")
},{"_process":2,"buttons/sm_icon_button":18,"buttons/sm_text_button":20,"path":1,"project_card":34,"window_bar":49}],12:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const timeline_card = require('timeline_card')
const timeline_filter = require('timeline_filter')
const year_filter = require('year_filter')
const month_filter = require('month_filter')
const scrollbar = require('scrollbar')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = app_timeline_mini

function app_timeline_mini (opts, protocol) {
  const name = `app_timeline_mini-${id++}`
  const {data} = opts
  const PROTOCOL = {
    YEAR: '',
    MONTH: '',
    DATE: '',
    updateCalendar,
  }
  // Assigning all the icons
  const { img_src: {
      icon_folder= `${prefix}/icon_folder.svg`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="filter_wrapper">
        <div class="month_wrapper">
          <div class="scrollbar_wrapper">
            <div class="timeline_wrapper"></div>
          </div>
        </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  // Adding Applicatin window Bar
  const cover_window = window_bar({
    name:'TIMELINE', 
    src: icon_folder,
    data: data
  }, app_timeline_protocol)
  // Adding timeline cards
  const cards_data = [{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'ACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'May 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'ACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'March 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'ACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'March 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'UNACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'March 11, 2021', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'UNACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2021', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'UNACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'April 11, 2021', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'UNACTIVE'
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'PAUSED'
  },{
    title: 'Official starting of the web course.', date: 'April 11, 2023', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'PAUSED'
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2023', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data, active_state: 'PAUSED'
  }]
  const convert_time_format = (time) => {
    let temp = time.slice(0,2)
    if (time.includes('PM')) { temp = parseInt(temp) + 12 }
    return temp + time.slice(2, -2)
  }
  const tags = new Set()
  const new_cards_data = []
  cards_data.forEach((card_data, i) => {
    card_data.tags.forEach(tag => tags.add(tag))
    const date = new Date(card_data.date + ' ' + convert_time_format(card_data.time))
    card_data = {...card_data, date_raw: date.getTime()}
    cards_data[i] = card_data
  })
  cards_data.sort(function (a, b) { return  b.date_raw - a.date_raw })
  PROTOCOL.YEAR = new Date(cards_data[0].date_raw).getFullYear()
  const card_groups = []
  let year_cache, card_group
  const timeline_cards = cards_data.map((card_data) => {
    const card = timeline_card(card_data)
    const slice = cards_data[card.id.slice(-1)].date.slice(-4)
    if (year_cache !== slice) {
      card_group = document.createElement('div')
      card_group.classList.add('card_group')
      card_groups.push(card_group)
      year_cache = slice
    }
    card_group.append(card)
    return card
  })
  const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
  timeline_wrapper.append(...card_groups)
  const main_wrapper = shadow.querySelector('.main_wrapper')
  main_wrapper.append(timeline_filter({
    data, tags: Array.from(tags),
    latest_date: cards_data[0].date_raw
  }, app_timeline_protocol))
  const filter_wrapper = shadow.querySelector('.filter_wrapper')
  const year_filter_wrapper = year_filter({
    data, latest_date: cards_data[0].date_raw
  }, app_timeline_protocol)
  const month_wrapper = shadow.querySelector('.month_wrapper')
  const month_filter_wrapper = month_filter({ data }, app_timeline_protocol)
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  scrollbar_wrapper.append(scrollbar({ data }, app_timeline_protocol))
  updateCalendar()
  timeline_wrapper.onscroll = () => {
    PROTOCOL['handleScroll']()
    const parent_top = timeline_wrapper.getBoundingClientRect().top
    timeline_cards.some(card => {
      const child_top = card.getBoundingClientRect().top
      if (child_top >= parent_top -100 && child_top < parent_top + 200) {
        const year = cards_data[card.id.slice(-1)].date.slice(-4)
        PROTOCOL.YEAR = year
        PROTOCOL.updateCalendar()
        PROTOCOL['year_filter']({
          head: { by: name, to: 'year_filter', mid: 0 },
          type: null,
          data: year
        })
        return true
      }
    })
    PROTOCOL['get_date']({
      head: { by:name, to: 'timeline_filter', mid: 0 },
      type: null,
      data: { month: PROTOCOL.MONTH , year: PROTOCOL.YEAR }
    })
  }
  shadow.prepend(cover_window)
  shadow.adoptedStyleSheets = [sheet]
  
  return el
    
  //Setting protocols
  function app_timeline_protocol (handshake, send) {
    if (handshake.from.includes('scrollbar')) {
      const ro = new ResizeObserver(entries => send[0]())
      ro.observe(scrollbar_wrapper)
      PROTOCOL['handleScroll'] = send[0]
      PROTOCOL['getScrollInfo'] = send[1]
      return [listen, setScrollTop]
    }
    else if (handshake.from.includes('window_bar')) {
      PROTOCOL['toggle_active_state'] = toggle_active_state
    }
    else if (handshake.from.includes('timeline_filter')) {
      PROTOCOL['setFilter'] = setFilter
      PROTOCOL['toggle_month_filter'] = toggle_month_filter
      PROTOCOL['toggle_year_filter'] = toggle_year_filter
      PROTOCOL['get_date'] = send
    }
    else if (handshake.from.includes('year_filter')) {
      PROTOCOL['setScroll'] = setScroll
      PROTOCOL['year_filter'] = send
    }
    else if (handshake.from.includes('month_filter')) {
      PROTOCOL['setFilter'] = setFilter
      PROTOCOL['month_filter'] = send
    }

    return listen

    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, mid } = head
      // if( to !== name) return console.error('address unknown', message)
      if (by.includes('scrollbar')) {
          message.data = {sh: timeline_wrapper.scrollHeight, ch: timeline_wrapper.clientHeight, st: timeline_wrapper.scrollTop}
          PROTOCOL.getScrollInfo(message)
      }
      else if (by.includes('timeline_filter') || by.includes('month_filter')) {
        PROTOCOL[type](data)
      }
      else if (by.includes('year_filter')) {
        PROTOCOL[type](data)
        PROTOCOL.updateCalendar()
      }
      else if (by.includes('window_bar')) {
        PROTOCOL[type](message)
      }
    }
    async function setScroll (data) {
      PROTOCOL[data.filter] = data.value
      timeline_cards.some(card => {
        const card_date = cards_data[card.id.slice(-1)].date
        if( card_date.includes(data.value) && card_date.includes(PROTOCOL.YEAR)) {
          setScrollTop(card.getBoundingClientRect().top - timeline_wrapper.getBoundingClientRect().top + timeline_wrapper.scrollTop)
          return true
        }
      })
      PROTOCOL['get_date']({
        head: { by: name, to: 'timeline_filter', mid: 0 },
        type: null,
        data: { month: PROTOCOL.MONTH , year: PROTOCOL.YEAR }
      })
      PROTOCOL['year_filter']({
        head:  {by: name, to: 'year_filter', mid: 0 },
        type: null,
        data: PROTOCOL.YEAR
      })
    }
    async function setScrollTop (value) {
      timeline_wrapper.scrollTop = value
    }
    async function setFilter(data){
      PROTOCOL[data.filter] = data.value
      timeline_wrapper.innerHTML = ''
      let cardfilter = [...cards_data]
      if (PROTOCOL.SEARCH) cardfilter = cardfilter.filter((card_data) => {
        return card_data.title.toLowerCase().match(PROTOCOL.SEARCH.toLowerCase())
      })
      if (PROTOCOL.STATUS && PROTOCOL.STATUS !== 'NULL') cardfilter = cardfilter.filter((card_data) => {
        return card_data.active_state === PROTOCOL.STATUS && card_data
      })
      if (PROTOCOL.TAGS && PROTOCOL.TAGS !== 'NULL') {
        cardfilter = cardfilter.filter((card_data) => {
          return card_data.tags.includes(PROTOCOL.TAGS) && card_data
        })
      }
      const card_groups = []
      let year_cache
      let card_group
      timeline_cards.forEach((card) => {
        const card_data = cards_data[card.id.slice(-1)]
        if (cardfilter.includes(card_data)) {
          const slice = card_data.date.slice(-4)
          if (year_cache !== slice) {
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
      PROTOCOL['handleScroll']()
      PROTOCOL.setScroll({
        filter: 'YEAR',
        value: String(new Date(cardfilter[0].date_raw).getFullYear())
      })
    }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const { active_state } = data
      ;( active_state === 'active') ? el.style.display = 'none' : ''
    }
    async function toggle_month_filter (message) {
      if (month_wrapper.contains(month_filter_wrapper))
        month_wrapper.removeChild(month_filter_wrapper)
      else
        month_wrapper.append(month_filter_wrapper)
    }
    async function toggle_year_filter (message) {
      if (filter_wrapper.contains(year_filter_wrapper))
        filter_wrapper.removeChild(year_filter_wrapper)
      else
        filter_wrapper.append(year_filter_wrapper)
    }
  }
  async function updateCalendar () {
    let dates = []
    if (PROTOCOL.YEAR) cards_data.forEach(card_data => {
      if (card_data.date.includes(PROTOCOL.YEAR)) dates.push(card_data.date)
    })
    PROTOCOL.month_filter({
      head: { by: name, to: 'month_filter', mid: 0 },
      type: null,
      data: dates
    })
  }
}
function get_theme () {
  return`
    .main_wrapper {
      display: flex;
      flex-direction: column;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;

      * {
        box-sizing: border-box;
      }
      .filter_wrapper {
        display: flex;
        width: 100%;
        height: 100%;
        .month_wrapper {
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 1px solid var(--primary_color);
          .scrollbar_wrapper {
            display: flex;
            width: 100%;
            height: 100%;
            .timeline_wrapper {
              --s: 20px; /* control the size */
              --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
              background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                var(--primary_color);  /* second color */ 
              background-size: var(--s) var(--s);  
              border :1px solid var(--primary_color);
              display: flex;
              flex-direction: column;
              width: 100%;
              height: 400px;
              overflow: scroll;
              gap: 20px;
              scrollbar-width: none; /* For Firefox */
              .card_group {
                width: 100%;
                padding: 0px;
                display: grid;
                gap: 20px;
                grid-template-columns: 12fr;
              }
              &::-webkit-scrollbar {
                display: none;
              }
            }
          }
        }
      }
    }
    @container(min-width: 768px) {
      .main_wrapper {
        .filter_wrapper {
          .month_wrapper {
            .scrollbar_wrapper {
              .timeline_wrapper {
                .card_group {
                  grid-template-columns: repeat(2, 6fr);
                }
              }
            }
          }
        }
      }
    }
    @container(min-width: 1200px) {
      .main_wrapper {
        .filter_wrapper {
          .month_wrapper {
            .scrollbar_wrapper {
              .timeline_wrapper {
                .card_group {
                  grid-template-columns: repeat(3, 4fr);
                }
              }
            }
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_timeline")
},{"_process":2,"month_filter":31,"path":1,"scrollbar":37,"timeline_card":45,"timeline_filter":46,"window_bar":49,"year_filter":50}],13:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const window_bar = require('window_bar')
const timeline_card = require('timeline_card')
const sm_text_button = require('buttons/sm_text_button')
const scrollbar = require('scrollbar')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = app_timeline_mini

function app_timeline_mini (opts, protocol) {
  const name = `app_timeline_mini-${id++}`
  const { data } = opts
  const PROTOCOL = {}
  // Assigning all the icons
  const { img_src: {
    icon_folder= `${prefix}/icon_folder.svg`,
  } } = data
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="timeline_wrapper"></div>
    </div>
    <style> ${get_theme()} </style>
  `
  // Adding Applicatin window Bar
  const cover_window = window_bar({
    name:'TIMELINE', 
    src: icon_folder,
    action_buttons: ['View more (12)'],
    data: data
  }, timeline_mini_protocol)
  // Adding timeline cards
  const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
  const cards_data = [{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  },{
    title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data,
  }]
  timeline_wrapper.append(...cards_data.map(timeline_card))
  const main_wrapper = shadow.querySelector('.main_wrapper')
  main_wrapper.append(scrollbar({data: data}, timeline_mini_protocol))
  shadow.prepend(cover_window)
  shadow.adoptedStyleSheets = [ sheet ]

  return el

  function timeline_mini_protocol (handshake, send) {
    if (handshake.from.includes('scrollbar')) {
      timeline_wrapper.onscroll = send[0]
      const ro = new ResizeObserver(entries => send[0]())
      ro.observe(main_wrapper)
      PROTOCOL['getScrollInfo'] = send[1]
      return [listen, setScrollTop]
    }
    else if (handshake.from.includes('window_bar')) {
      PROTOCOL['toggle_active_state'] = toggle_active_state;
      return listen;
    }
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, id } = head
      // if( to !== name) return console.error('address unknown', message)
      if (by.includes('scrollbar')) {
        message.data = {sh: timeline_wrapper.scrollHeight, ch: timeline_wrapper.clientHeight, st: timeline_wrapper.scrollTop}
        PROTOCOL.getScrollInfo(message)
      }
      else if (by.includes('window_bar')) {
        PROTOCOL[type](message)
      }
    }
    function setScrollTop (value) {
      timeline_wrapper.scrollTop = value
    }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const { active_state } = data
      ;( active_state === 'active')?el.style.display = 'none':''
    }
  }
}
function get_theme () {
  return`
    .main_wrapper {
      display: flex;
      container-type: inline-size;
      width: 100%;
      height: 100%;
      margin-bottom: 30px;
      border: 1px solid var(--primary_color);
      * { box-sizing: border-box; }
      .timeline_wrapper {
        --s: 20px; /* control the size */
        --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
        background:
          repeating-conic-gradient(at 66% 66%,var(--_g)),
          repeating-conic-gradient(at 33% 33%,var(--_g)),
          var(--primary_color);  /* second color */ 
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
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
    @container (min-width: 768px) {
      .main_wrapper {
        .timeline_wrapper {
          grid-template-columns: repeat(2, 6fr);
        }
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper {
        .timeline_wrapper {
          grid-template-columns: repeat(3, 4fr);
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_timeline_mini")
},{"_process":2,"buttons/sm_text_button":20,"path":1,"scrollbar":37,"timeline_card":45,"window_bar":49}],14:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = day_button

// Props - icon/img src
function day_button (protocol) {
  const name = `day_button`
  const notify = protocol({ from: name }, listen)
  const PROTOCOL = {
    toggle_active,
    add_highlight,
    remove_highlight
  }
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `<div class="day_button"></div>`
  const day_button = shadow.querySelector(".day_button")
  // Toggle Icon
  day_button.onclick = (e) => {
    toggle_active()
    notify({
      head: { by: name, to: 'month_card', mid: 0 },
      type: 'toggle_day_button',
      data: el.id
    })
  }
  const style = document.createElement('style')
  style.textContent = get_theme()
  shadow.append(day_button, style)
  shadow.adoptedStyleSheets = [sheet]

  return el

  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, mid } = head
    PROTOCOL[type]()
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
}
function get_theme () {
  return`
    .day_button {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      box-sizing: border-box;
      aspect-ratio: 1/1;
      cursor: pointer;
      border: 1px solid var(--primary_color);
      background-color: var(--bg_color);
      &.active {
        background-color: var(--ac-1) !important;
      }
      &.highlight {
        background-color: var(--ac-2)
      }
    }
  `
}
},{}],15:[function(require,module,exports){
(function (__filename){(function (){

const sheet = new CSSStyleSheet

sheet.replaceSync(get_theme())
/******************************************************************************
  ICON COMPONENT
******************************************************************************/
var count = 0
const ID = __filename
const STATE = { ids: {}, hub: {} } // all state of component module
// ----------------------------------------

module.exports = icon_button

function icon_button (opts, protocol) {
  // ----------------------------------------
  // INSTANCE STATE & ID
  const id = `${ID}:${count++}` // assigns their own name
  const status = { active: true }
  const state = STATE.ids[id] = { status, wait: {}, hub: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // opts
  const { src = '', src_active = '' } = opts
  const $src = src // @TODO: make those subscribable signals
  const $src_acitve = src_active
  // ----------------------------------------
  // protocol
  const on = { 'activate': onactivate, 'inactivate': oninactivate }
  const send = protocol(Object.assign(listen, { id }))
  function invalid (message) { console.error('invalid type', message) }
  function listen (message) {
    console.log(`[${id}]`, message)
    const action = on[message.type] || invalid
    action(message)
  }
  // ----------------------------------------
  const [svg_icon, svg_active] = Object.assign(document.createElement('div'), {
    innerHTML: `${src} ${src_active}` // svg icons
  }).children
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `<div class="icon_btn"></div>`
  const [icon_button] = shadow.children
  icon_button.append(svg_icon)
  // Toggle Icon
  icon_button.onclick = onclick
  shadow.adoptedStyleSheets = [sheet]

  return el

  function oninactivate () {
    state.status.active = false
    console.log('INACTIVATE')
    icon_button.classList.toggle('active', state.status.active)
    if (svg_active) icon_button.replaceChildren(svg_icon)
  }
  function onactivate () {
    state.status.active = true
    console.log('ACTIVATE')
    icon_button.classList.toggle('active', state.status.active)
    if (svg_active) icon_button.replaceChildren(svg_active)
  }
  function onclick (e) {
    const [by, to, mid] = [id, send.id, 0]
    let message = { head: [by, to, mid], type: 'click' }
    send(message)
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
      svg {
        height: 25px;
        width: 25px;
        pointer-events: none;
      }
      &.active {
        background-color: var(--ac-2)
      }
    }
  `
}
}).call(this)}).call(this,"/src/node_modules/buttons/icon_button.js")
},{}],16:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = logo_button

function logo_button () {
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="logo_button">
      <img src="${prefix}/logo.png" />
      <span> DAT ECOSYSTEM </span>
    </div>
    <style>${get_theme()}</style>
  `
  shadow.adoptedStyleSheets = [sheet]

  return el
}
function get_theme () {
  return`
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
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons")
},{"_process":2,"path":1}],17:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = select_button

function select_button (opts, protocol) {
  const notify = protocol(null, listen)
  let message = {
    head: ['select_button', 'project_filter', 'project_filter'],
    type: 'setFilter',
  }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_arrow_down,
    icon_arrow_up
  } = img_src
  let active_option = ''
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:`closed` })
  shadow.innerHTML = `
    <div class="select_button_wrapper bottom">
      <div class="option_wrapper">
        ${opts.choices.map(choice => `<div class="option">${choice}</div>`).join('')}
      </div>
      <div class="button_wrapper">
        <span class="button_name">${opts.name}: </span>
        <span class="selected_option">${'NULL'}</span>
        <span class="arrow_icon">
          ${icon_arrow_up}
        </span>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const select_button_wrapper = shadow.querySelector('.select_button_wrapper')
  // Adding Select Toggle function
  const select_toggle_btn = shadow.querySelector('.button_wrapper')
  let active_state = true
  select_toggle_btn.onclick = (e) => {
    select_button_wrapper.classList.toggle('active');
    ;(active_state)?shadow.querySelector('.arrow_icon').innerHTML = icon_arrow_down: shadow.querySelector('.arrow_icon').innerHTML = icon_arrow_up
    active_state = !active_state
  }
  // select_toggle_btn.addEventListener('click', function() {
  //   shadow.querySelector('.select_button_wrapper').classList.toggle('active')
  // })
  // Use event delegation
  // document.addEventListener('click', (e) => {
  //   console.log(e.target.className)
  // })
  // Select all .option divs
  const options = shadow.querySelectorAll('.option')
  const selected_option = shadow.querySelector('.selected_option')
  // Attach click event listener to each .option div
  options.forEach((option) => {
    option.addEventListener('click', () => {
      if (active_option) active_option.classList.remove('active')
      if (active_option === option) {
        selected_option.innerHTML = 'NULL'
        active_option = ''
      }
      else {
        option.classList.add('active')
        selected_option.innerHTML = option.innerHTML
        active_option = option
      }
      select_button_wrapper.classList.remove('active')
      message['data'] = { filter: opts.name, value: selected_option.innerHTML }
      notify(message)
    })
  })
  // shadow.append(main, navbar(opts, protocol))
  shadow.adoptedStyleSheets = [sheet]
  
  return el

  function listen (message) {
    // const {head,  refs, type, data, meta} = message
    // const [by, to, id] = head
    // if( to !== id) return console.error('address unknown', message)
  }
}
function get_theme () {
  return`
    .select_button_wrapper {
      box-sizing: border-box;
      position: relative;
      z-index: 100;
      width: 100%;
      height: 30px;
      font-size: 0.875em;
      line-height: 1.5em;
      background-color: var(--bg_color);
      &.bottom {
        .option_wrapper {
          bottom: 30px;
          left: 0px;
        }
      }
      &top {
        .option_wrapper {
          /* top: 40px; */
          left: 0px;
        }
      }
      &.active {
        .option_wrapper{ display: block !important; }
        .button_wrapper{ border: 2px solid var(--ac-1); }
      }
      .option_wrapper {
        position: absolute;
        display: none;
        box-sizing: border-box;
        height: max-content;
        max-height: 400px;
        width: 100%;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        .option {
          box-sizing: border-box;
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 10px 5px;
          cursor: pointer;
          background-color: var(--bg_color);
          &.active {
            background-color: var(--ac-1);
            color: var(--primary_color);
          }
          &:hover {
            filter: brightness(0.8);
          }
        }
      }
      .button_wrapper {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 5px;
        cursor: pointer;
        height: 30px;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        .button_name { 
          display: flex;
          vertical-align: middle;
          font-weight: 700;
          line-height: 15px;
          letter-spacing: -1px;
        }
        .selected_option { 
          display: flex;
          vertical-align: middle;
          font-weight: 300;
          line-height: 15px;
          letter-spacing: -1px;
        }
        .arrow_icon {
          display: flex;
          align-items: center;
          margin-left: auto;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons")
},{"_process":2,"path":1}],18:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = sm_icon_button

// Props - icon/img src
function sm_icon_button (props) {
  let { src, src_active, activate } = props
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:'closed' })
  shadow.innerHTML = `
    <div class="sm_icon_button">
      ${src}
    </div>
  `
  const sm_icon_button = shadow.querySelector(".sm_icon_button")
  // Toggle Icon
  if(activate) {
    if (src_active) {
      let activeState = true
      sm_icon_button.onclick = (e) =>{
        ;(activeState)?sm_icon_button.innerHTML = src_active: sm_icon_button.innerHTML = src
        activeState = !activeState
        toggle_class(e)
      }
    } else sm_icon_button.onclick = toggle_class
  }
  const style = document.createElement('style')
  style.textContent = get_theme()
  shadow.append(sm_icon_button, style)
  shadow.adoptedStyleSheets = [sheet]
  
  return el

  function toggle_class (e) {
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
  }
}
function get_theme () {
  return`
    .sm_icon_button {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      box-sizing: border-box;
      aspect-ratio: 1/1;
      cursor: pointer;
      border: 1px solid var(--primary_color);
      // border-left: var(--bg_color);
      background-color: var(--bg_color);
      &.active {
        background-color: var(--ac-2)
      }
      svg, svg * {
        pointer-events:none !important;
      }
    }
  `
}
},{}],19:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

var id = 0

module.exports = sm_icon_button_alt

// opts - icon/img src
function sm_icon_button_alt (opts, protocol) {
    const name = `sm_icon_button_alt_${id++}`
    let { src, src_active } = opts
    const el = document.createElement('div')
    const shadow = el.attachShadow({ mode:'closed' })
    shadow.innerHTML = `
      <div class="sm_icon_button_alt"> 
        ${src}
      </div>
      <style>${get_theme()}</style>
    `
  const sm_icon_button_alt = shadow.querySelector('.sm_icon_button_alt')
  // Toggle Icon
  if (protocol) { 
    const send = protocol({ from:name }, listen) 
    function listen (message) {
      // 
    }
    let active_state = true
    sm_icon_button_alt.onclick = (e) => {
      if (src_active) {
        ;(active_state)?sm_icon_button_alt.innerHTML = src_active: sm_icon_button_alt.innerHTML = src
        active_state = !active_state
        toggle_class(e)
      } else toggle_class(e)
      send({
        head: {
          by: name,
          to: 'window_bar_0',
          mid: 0,
        },
        type: 'toggle_window_active_state', 
        data: { active_state } 
      })
    }
  }
  shadow.adoptedStyleSheets = [sheet]

  return el

  function toggle_class (e) {
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
  }
}
function get_theme () {
  return`
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
      &.active {
        background-color: var(--ac-2)
      }
      svg, svg * {
        pointer-events:none !important;
      }
    }
  `
}
},{}],20:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = sm_text_button

function sm_text_button (props) {
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:'closed' })
  shadow.innerHTML = `
    <div class="sm_text_button"> 
      ${props.text}
    </div>
    <style>${get_theme()}</style>
  `
  let sm_text_button = shadow.querySelector('.sm_text_button')
  sm_text_button.onclick = toggle_class
  shadow.adoptedStyleSheets = [sheet]
  
  return el

  function toggle_class (e) {
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
  }
}
function get_theme () {
  return`
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
      &.active{
        background-color: var(--ac-1);
        color: var(--primary_color);
      }
    }
  `
}
},{}],21:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = tab_button

function tab_button (props, protocol) {
  const name = `tab_button-${id++}`
  const notify = protocol({ from: name }, listen)
  const { data } = props
  const { img_src : {
    icon_close_dark= `${prefix}/icon_close_dark.svg`,
  }} = data

  const el = document.createElement('div')
  const shadow = el.attachShadow({mode:'closed'})
  shadow.innerHTML = `
    <div class="tab_button">
      <div class="text_wrapper"> ${props.name} </div>
      <div class="close_button"> ${icon_close_dark} </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const tab_button = shadow.querySelector('.tab_button')
  const text_wrapper = shadow.querySelector('.text_wrapper')
  text_wrapper.onclick = (e) => {
    toggle_class()
    notify({
      head: { by: name, to: 'terminal', mid: 0 },
      type: 'tab_btn_click',
      data: el.id
    })
  }
  toggle_class()
  const close_btn = shadow.querySelector('.close_button')
  close_btn.onclick = () => {
    el.remove()
    notify({
      head: { by: name, to: 'terminal', mid: 0 },
      type: 'close_tab',
      data: el.id
    })
  }
  shadow.adoptedStyleSheets = [sheet]

  return el

  function toggle_class () {
    tab_button.classList.toggle('active')
  }
  function listen (message) {
    toggle_class()
  }
}
function get_theme () {
  return`
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
      .text_wrapper {
        text-align: center;
        font-size: 0.875em;
        line-height: .5em;
        padding: 12px 0;
        height :30px;
        box-sizing: border-box;
        width: 90px;
      }
      .close_button {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      &.active {
        background-color: var(--primary_color);
        color: var(--bg_color);
        svg path {
          fill: var(--bg_color)
        }
      }
    }
  `
}
},{}],22:[function(require,module,exports){
(function (__filename){(function (){

const sheet = new CSSStyleSheet

sheet.replaceSync(get_theme())
/******************************************************************************
  TEXT COMPONENT
******************************************************************************/
var count = 0
const ID = __filename
const STATE = { ids: {}, hub: {} } // all state of component module
// ----------------------------------------

module.exports = text_button

function text_button (opts, protocol) {
  // ----------------------------------------
  // INSTANCE STATE & ID
  const id = `${ID}:${count++}` // assigns their own name
  const state = STATE.ids[id] = { status: {}, wait: {}, hub: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // opts
  const { text } = opts
  const $text = text // @TODO: make it subscribable signals
  // make it a signal: load initial + listen updates
  // ----------------------------------------
  // protocol
  const on = { 'activate': onactivate, 'inactivate': oninactivate }
  const send = protocol(Object.assign(listen, { id }))
  function invalid (message) { console.error('invalid type', message) }
  function listen (message) {
    console.log(`[${id}]`, message)
    const action = on[message.type] || invalid
    action(message)
  }
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `<div class="text_button">${$text}</div>`
  const [text_button] = shadow.children
  text_button.onclick = toggle_class
  shadow.adoptedStyleSheets = [sheet]

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
    const [by, to, mid] = [id, send.id, 0]
    let message = { head: [by, to, mid], type: 'click' }
    send(message)
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
      &.active {
        background-color: var(--ac-1);
        color: var(--bg_color);
      }
    }
  `
}
}).call(this)}).call(this,"/src/node_modules/buttons/text_button.js")
},{}],23:[function(require,module,exports){
// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = year_button

function year_button (props, protocol) {
  const name = 'year_button'
  const notify = protocol({ from: name }, listen)
  const { data, latest_date } = props
  const { img_src : {
    icon_arrow_up= `${prefix}/icon_arrow_up.svg`,
  }} = data
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:'closed' })
  const date = new Date(latest_date)
  shadow.innerHTML = `
    <div class="year_button">
      <div class="text_wrapper">${date.getFullYear()}</div>
      ${icon_arrow_up}
    </div>
    <style> ${get_theme()} </style>
  `
  const year_button = shadow.querySelector('.year_button')
  year_button.onclick = toggle_class
  const text_wrapper = shadow.querySelector('.text_wrapper')
  shadow.adoptedStyleSheets = [sheet]

  return el

  function toggle_class (e) {
    year_button.classList.toggle('active')
  }
  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, id } = head
    if (data.month || data.year) text_wrapper.innerHTML = `<b>${data.month.slice(0,3)}</b>${data.month && data.year && '/'}${data.year}`
    else text_wrapper.innerHTML = 'Select date'
  }
}
function get_theme () {
  return`
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
      &.active svg {
        rotate: 90deg;
      }
      .text_wrapper {
        text-align: center;
        font-size: 0.875em;
        line-height: .5em;
        padding: 11px 0;
        height: 30px;
        box-sizing: border-box;
        width: 100px;
        letter-spacing: -1px;
      }
    }
  `
}
},{}],24:[function(require,module,exports){
(function (process,__dirname){(function (){
const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')
const path = require('path')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = commingsoon

function commingsoon (opts, protocol) {
  const name = `commingsoon-${id++}`
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    banner_cover = `${prefix}/banner_cover.svg`,
    tree_character = `${prefix}/tree_character.png`,
    icon_pdf_reader
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="cover_wrapper">
      <div class="cover_content">
        <div class="cover_image">
          <img src="${banner_cover}" />
        </div>
        <div class="content_wrapper">
          <img src="${tree_character}" />
          Coming Soon
        </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const cover_window = window_bar({
    name: 'Coming_soon.pdf', 
    src: icon_pdf_reader,
    data: data
  }, cover_protocol)
  const cover_wrapper = shadow.querySelector('.cover_wrapper')
  cover_wrapper.prepend(cover_window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // cover protocol
  function cover_protocol (message, send) {
    return listen
  }
  // Listening to toggle event 
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;( active_state === 'active')?cover_wrapper.style.display = 'none':''
  }
}
function get_theme () {
  return`
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
      padding: 150px 0px;
      background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
      background-size: 10px 10px;
      background-color: var(--bg_color);
      border: 1px solid var(--primary_color);
      margin-bottom: 30px;
      /* This covers background-image will change to an image */
      .cover_image {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        img {
          position: absolute;
          left: 50%;
          top: 50%;
          width: auto;
          height: 100%;
          transform: translate(-50%, -50%);
        }
      }
      /* Cover image alignment */
      .content_wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        position: relative;
        z-index: 1;
        color: var(--primary_color);
        text-align: center;
        img {
          width: 300px;
          height: auto;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/comingsoon")
},{"_process":2,"buttons/sm_text_button":20,"path":1,"window_bar":49}],25:[function(require,module,exports){
const mission_statement = require('mission_statement')
const important_documents = require('important_documents')
const our_member = require('our_member')
const tools = require('tools')

const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())

module.exports = consortium_page

function consortium_page (opts, protocol) {
  // Image data
  const { data } = opts
  const { img_src } = data
  const {
    icon_pdf_reader,
    icon_folder,
  } = img_src
  // Communication data
  const PROTOCOLS = {}
  const el = document.createElement('div')
  const shadow = el.attachShadow({mode: 'closed'})
  // adding a `main_wrapper` 
  shadow.innerHTML = `
    <div class="main_wrapper">
      <div class="icon_wrapper"></div>
      <div class="popup_wrapper">
        <div class="mini_popup_wrapper"></div>
      </div>
    </div>
    <style>${get_theme()}</style>
  `
  const icons_data = [{
    name: 'mission_ statement',
    type: '.md',
    img: icon_pdf_reader,
    window: 'mission_statement'
  },{
    name: 'important_ documents',
    type: '.md',
    img: icon_pdf_reader,
    window: 'important_documents'
  },{
    name: 'our_ member',
    type: '.md',
    img: icon_pdf_reader,
    window: 'our_member'
  },{
    name: 'tools',
    type: '',
    img: icon_folder,
    window: 'tools'
  }]
  const icon_wrapper = shadow.querySelector('.icon_wrapper')
  icons_data.forEach((icon_data) => {
    const icon = document.createElement('div')
    icon.classList.add('icon')
    icon.innerHTML = `
      ${icon_data.img}
      <span>${icon_data.name}${icon_data.type}</span>
    `
    icon.ondblclick = () => {PROTOCOLS['notify_'+icon_data.window]()}
    icon.ontouchend = () => {PROTOCOLS['notify_'+icon_data.window]()}
    icon_wrapper.append(icon)
  })
  const mini_popup_wrapper = shadow.querySelector('.mini_popup_wrapper')
  mini_popup_wrapper.append(
    important_documents({ data }, consortium_protocol), 
    our_member({ data }, consortium_protocol),
    tools({ data }, consortium_protocol)
  )
  const popup_wrapper = shadow.querySelector('.popup_wrapper')
  popup_wrapper.append(mission_statement({ data }, consortium_protocol))
  shadow.adoptedStyleSheets = [sheet]

  return el

  function consortium_protocol (handshake, send, mid = 0) {
    PROTOCOLS['notify_'+handshake.from] = send
  }
}
function get_theme () {
  return `
    .main_wrapper {
      container-type: inline-size;
      display: flex;
      gap: 20px;
      justify-content: space-between;
      margin: 0;
      padding:30px 10px;
      opacity: 1;
      background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
      background-size: 16px 16px;
      .icon_wrapper {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap: 25px;
        width: fit-content;
        height: fit-content;
        align-items: center;
        user-select: none;
        .icon{
          display: flex;
          flex-direction: column;
          align-items: center;
          svg {
            height: 50px;
            width: 50px;
            margin: 5px 0;
            background-color: white;
            path{ fill: black; }
          }
          span {
            background-color: var(--bg_color);
            width: 150px;
            padding: 10px 0;
            text-align: center;
            word-wrap: break-word;
          }   
        }
        &:hover {
          cursor: default;
        }
      }
      .popup_wrapper {
        display: inline;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 20;
        .mini_popup_wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
      }
    }
    @container (min-width: 510px) {
      .main_wrapper {
        .icon_wrapper {
          flex-direction: column;
        }
        .main_wrapper {
          flex-direction: row;
        }
        .popup_wrapper {
          display: flex;
          flex-direction: column;
          position: relative;
          top: 0;
        }
      }
    }
    @container (min-width: 768px) {
      .main_wrapper {
        .popup_wrapper {
          margin-left: 100px;
        }
      }
    }
    @container (min-width: 1200px) {
      .main_wrapper {
        .popup_wrapper {
          flex-direction: row;
          gap: 20px;
          margin-left: 200px;
        }
      }
    }
  `
}
},{"important_documents":28,"mission_statement":29,"our_member":33,"tools":48}],26:[function(require,module,exports){
const comingsoon = require('comingsoon')
const app_footer = require('app_footer')

module.exports = growth_page

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

function growth_page (opts, protocol) {
  const { data } = opts
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  // adding a `main-wrapper` 
  shadow.innerHTML = `
    <div class="main-wrapper">
      <div class="main"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const components = [
    comingsoon({ data }),
    app_footer({ data }),
  ]
  const main = shadow.querySelector('.main')
  main.append(...components)
  shadow.adoptedStyleSheets = [sheet]

  return el
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
      .main {
        margin: 0;
        padding: 30px 10px;
        opacity: 1;
        background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
        background-size: 16px 16px;
      }
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
},{"app_footer":9,"comingsoon":24}],27:[function(require,module,exports){
const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())

// HOME PAGE
module.exports = home_page

function home_page (opts, protocol) {
    const { data } = opts
    const components = [
      cover_app({ data }),
      app_timeline_mini({ data }),
      app_projects_mini({ data }),
      app_about_us({ data }),
      app_footer({ data }),
    ]
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  // adding a `main-wrapper` 
  shadow.innerHTML = `
    <div class="main-wrapper">
      <div class="main"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const main = shadow.querySelector('.main')
  main.append(...components)
  // shadow.append(main)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // Placeholder code for learning purposes
  // Will be removed
  function home_protocol (handshake, send){
    listen.id  = id
    if (send) return listen
    const PROTOCOL = {
      'toggle_display' : toggle_display
    }
    send = handshake(null, listen)
    function listen (message){
      function format (new_message = {
        head: [from = 'alice', to = 'bob', message_id = 1],
        refs: { cause: message.head }, // reply to received message
        type: 'change_theme',
        data: `.foo { background-color: red; }`
      }) { return new_message }
      console.log(format())
      // const { head, type, data } = message
      // const [by, to, id] = head
      // if (to !== id) return console.error('address unknown', message)
      // const action = PROTOCOL[type] || invalid
      // action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_display ({ head: [to], data: theme }) {
      // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
      .main {
        margin: 0;
        padding: 30px 10px;
        opacity: 1;
        background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
        background-size: 16px 16px;
      }
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
},{"app_about_us":7,"app_cover":8,"app_footer":9,"app_projects_mini":11,"app_timeline_mini":13}],28:[function(require,module,exports){
const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())

let id = 0

module.exports = important_documents

function important_documents (opts, protocol) {
  const name = `important_documents`
  protocol({ from: name }, listen)
  function listen () {
    important_documents_wrapper.style.display = 'inline'
  }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="important_documents">
      <div class="documents_content">
        <h2>Visit links for more info</h2>
        <ol type="1">
          <li>Manifesto</li>
          <li>Organization github repository</li>
        </ol>  
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const window = window_bar({
    name: 'important_documents.md', 
    src: icon_pdf_reader,
    data: data
  }, important_documents_protocol)
  const important_documents_wrapper = shadow.querySelector('.important_documents')
  important_documents_wrapper.prepend(window)
  shadow.adoptedStyleSheets = [sheet]

    return el

  // cover protocol
  function important_documents_protocol (message, send) {
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const PROTOCOL = {
        'toggle_active_state': toggle_active_state
      }
      const action = PROTOCOL[type] || invalid      
      action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const { active_state } = data
      ;( active_state === 'active')?important_documents_wrapper.style.display = 'none':''
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .important_documents {
      display: none;
      .documents_content {
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
        h2 {
          margin: 0;
        }
      }
    }
    @container (min-width: 510px) {
      .important_documents {
        .documents_content {
          width: auto;
          height: auto;
        }
      }
    }
  `
}
},{"window_bar":49}],29:[function(require,module,exports){
const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = mission_statement

function mission_statement (opts, protocol) {
  const name = `mission_statement`
  protocol({ from: name }, listen)
  function listen () {
    mission_statement_wrapper.style.display = 'inline'
  }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_pdf_reader
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="mission_statement">
      <div class="mission_content">
        <h2>OUR MISSION</h2>
        <p>We aim to connect and support the dat community, promoting user rights and decentralized democracy, dat ecosystem provides resources to advance your hyprecore project.</p>
        <h2>OUR MISSION</h2>
        <p>We aim to connect and support the dat community, promoting user rights and decentralized democracy, dat ecosystem provides resources to advance your hyprecore project.</p>    
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const window = window_bar({
    name: 'Mission_statement.md', 
    src: icon_pdf_reader,
    data: data
  }, mission_statement_protocol)
  const mission_statement_wrapper = shadow.querySelector('.mission_statement')
  mission_statement_wrapper.prepend(window)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // cover protocol
  function mission_statement_protocol (message, send) {
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const PROTOCOL = {
        'toggle_active_state': toggle_active_state
      }
      const action = PROTOCOL[type] || invalid      
      action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const { active_state } = data
      ;( active_state === 'active')?mission_statement_wrapper.style.display = 'none':''
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
      color: var(--primary_color);
    }
    .mission_statement {
      display: none;
      .mission_content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        padding: 10px;
        background-size: 10px 10px;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        margin-bottom: 30px;
        h2 {
          margin: 0;
        }
      }
    } 
    @container (min-width: 510px) {
      .mission_statement {
        .mission_content {
          width: auto;
          height: auto;
        }
      }
    }
  `
}
},{"window_bar":49}],30:[function(require,module,exports){
const day_button = require('buttons/day_button')

const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())

let id = 0

module.exports = month_card

function month_card (opts, protocol) {
  const name = `month_card-${id++}`
  const notify = protocol({ from: name }, listen)
  const PROTOCOL = {
    day_toggle: [],
    toggle_day_button,
    toggle_month_button,
    toggle_all_days,
    toggle_day_highlight,
    active_day: 0,
  }
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="month_card">
      <span class="month_name"><b>${opts.name}</b></span>
      <div class="days_wrapper"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const days_wrapper = shadow.querySelector('.days_wrapper')
  for (let i=1; i<=opts.days; i++) {
    const btn = day_button(month_card_protocol)
    btn.id = i
    days_wrapper.append(btn)
  }
  const month_name = shadow.querySelector('.month_name')
  month_name.onclick = e => {
    notify({
      head: { by:name, to:'month_filter', mid: 0 },
      type: 'toggle_month_button',
      data: opts.name
    })
  }
  shadow.adoptedStyleSheets = [sheet]

  return el

  function month_card_protocol (handshake, send) {
    PROTOCOL['day_toggle'].push(send)
    return listen
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, mid } = head
      PROTOCOL[type](data)
    }
  }
  async function toggle_day_button (data) {
    notify({
      head: { by:name, to:'month_filter', mid: 0 },
      type: 'toggle_day_button',
      data: opts.name + ' ' + data
    })
  }
  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, mid } = head
    PROTOCOL[type](data)
  }
  async function toggle_month_button (data) {
    month_name.classList.toggle('active')
  }
  async function toggle_all_days (data) {
    const day = new Date(data).getDate()
    PROTOCOL.day_toggle[day-1]({
      head: { by:name, to:'day_button', mid: 0 },
      type: 'toggle_active',
      data: ''
    })
  }
  async function toggle_day_highlight (data) {
    const {mode, date} = data
    const day = new Date(date).getDate()
    PROTOCOL.day_toggle[day-1]({
      head: { by:name, to:'day_button', mid: 0 },
      type: mode,
      data: ''
    })
  }
}
function get_theme () {
  return `
    .month_card {
      width: 140px;
      height: 130px;
      border: 1px solid var(--primary_color);
      border-right-width: 4px;
      background-color: var(--bg_color);
      margin-top: -1px;
      margin-left: -1px;
      .month_name {
        display: block;
        text-align: center;
        padding: 5px 0;
        cursor: pointer;
        &.active {
          background-color: var(--ac-1)
        }
      }
      .days_wrapper {
          display: flex;
        flex-wrap: wrap;
        border-top: 1px solid var(--primary_color);
      }
    }
  `
}
},{"buttons/day_button":14}],31:[function(require,module,exports){
const month_card = require('month_card')
const scrollbar = require('scrollbar_hor')

const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = month_filter

function month_filter (opts, protocol) {
  const name = `month_filter-${id++}`
  const notify = protocol({ from: name }, listen)
  const PROTOCOL = {}
  let active_month = ''
  let active_day = ''
  let active_date_prev = []
  const month_buttons = {}
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="scrollbar_wrapper">
      <div class="month_filter_wrapper"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const month_data = [
    {name: 'January', days: 31},
    {name: 'February', days: 28},
    {name: 'March', days: 31},
    {name: 'April', days: 30},
    {name: 'May', days: 31},
    {name: 'June', days: 30},
    {name: 'July', days: 31},
    {name: 'August', days: 31},
    {name: 'September', days: 30},
    {name: 'October', days: 31},
    {name: 'November', days: 30},
    {name: 'December', days: 31},
  ]
  const month_filter_wrapper = shadow.querySelector('.month_filter_wrapper')
  month_data.forEach(month => {
    month_buttons[month.name] = month_card(month, month_filter_protocol)
    month_filter_wrapper.append(month_buttons[month.name])
  })
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  scrollbar_wrapper.append(scrollbar( opts, month_filter_protocol))
  shadow.adoptedStyleSheets = [sheet]
  
  return el

  function month_filter_protocol (handshake, send) {
    if (handshake.from.includes('scrollbar')) {
      month_filter_wrapper.onscroll = send[0]
      const ro = new ResizeObserver(entries => send[0]());
      ro.observe(scrollbar_wrapper);
      PROTOCOL['handleScroll'] = send[0]
      PROTOCOL['getScrollInfo'] = send[1]
      return [listen, setScrollLeft]
    }
    if (handshake.from.includes('month_card')) {
      PROTOCOL['toggle_month_button'] = toggle_month_button
      PROTOCOL['toggle_day_button'] = toggle_day_button
      PROTOCOL[handshake.from] = send
    }
    return listen
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, mid } = head
      // if( to !== name) return console.error('address unknown', message)
      if (by.includes('scrollbar')) {
        message.data = {
          sh: month_filter_wrapper.scrollWidth,
          ch: month_filter_wrapper.clientWidth,
          st: month_filter_wrapper.scrollLeft
        }
        PROTOCOL.getScrollInfo(message)
      }
      else if(by.includes('month_card')) PROTOCOL[type](by, data)
    }
    async function setScrollLeft (value) {
      month_filter_wrapper.scrollLeft = value
    }
    async function toggle_month_button(by, data){
      if (active_month) {
        PROTOCOL[active_month]({
          head: {by: name, to: 'month_card', mid: 0},
          type: 'toggle_month_button',
          data: ''
        })
      }
      if (active_month === by) {
        active_month = ''
        data = ''
      }
      else {
        active_month = by
        PROTOCOL[by]({
          head: { by: name, to: 'month_card', mid: 0 },
          type: 'toggle_month_button',
          data: ''
        })
      }
      notify({
        head: { by: name, to: 'app_timeline', mid: 0 },
        type: 'setScroll',
        data: { filter: 'MONTH', value: data }
      })
    }
    async function toggle_day_button (by, data) {
      toggle_month_button(active_month, '')
      if (active_day && active_day !== data) {
        PROTOCOL[`month_card-${new Date(active_day).getMonth()}`]({
          head: { by: name, to: 'month_card', mid: 0 },
          type: 'toggle_all_days',
          data: active_day
        })
      }
      if (active_day === data) {
        active_day = ''
        data = ''
      }
      else active_day = data
      notify({
        head: { by: name, to: 'app_timeline', mid: 0 },
        type: 'setScroll',
        data: { filter: 'DATE', value: data }
      })
    }
  }
  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, mid } = head
    active_date_prev.forEach(date => PROTOCOL[`month_card-${new Date(date).getMonth()}`]({
      head: { by: name, to: 'month_card', mid: 0 },
      type: 'toggle_day_highlight',
      data: { mode: 'remove_highlight', date }
    }))
    active_date_prev = data
    data.forEach(date => PROTOCOL[`month_card-${new Date(date).getMonth()}`]({
      head: { by: name, to: 'month_card', mid: 0 },
      type: 'toggle_day_highlight',
      data: { mode: 'add_highlight', date }
    }))
  }
}
function get_theme () {
  return `
    .month_filter_wrapper {
      display: flex;
      height: 131px;
      width: 100%;
      border: 1px solid var(--primary_color);
      overflow-x: scroll;
      overflow-y: hidden;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  `
}
},{"month_card":30,"scrollbar_hor":38}],32:[function(require,module,exports){
(function (process,__filename,__dirname){(function (){
const icon_button = require('buttons/icon_button')
const logo_button = require('buttons/logo_button')
const text_button = require('buttons/text_button')
const path = require('path')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sheet = new CSSStyleSheet()

sheet.replaceSync(get_theme())
/******************************************************************************
NAVBAR COMPONENT
******************************************************************************/
var count = 0
const ID = __filename
const STATE = { ids: {}, hub: {} } // all state of component module
// ----------------------------------------
const default_opts = { page: 'HOME' }

module.exports = navbar

function navbar (opts = default_opts, protocol) {
  // ----------------------------------------
  // INSTANCE STATE & ID
  const id = `${ID}:${count++}` // assigns their own name
  const state = STATE.ids[id] = { status: {}, wait: {}, hub: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  const on = { 'theme': handle_active_change }
  // ----------------------------------------
  const send = protocol(Object.assign(listen, { id }))
  state.hub[send.id] = { mid: 0, send, on } // store channel
  state.aka.up = send.id
  function invalid (message) { console.error('invalid type', message) }
  function listen (message) {
    console.log(`[${id}]`, message)
    const { on } = state.hub[state.aka.up] // @TODO: from `to`
    const action = on[message.type] || invalid
    action(message)
  }
  // @TODO: how to disconnect channel
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
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
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
  const info_sh = shadow.querySelector('.info_wrapper').attachShadow({ mode: 'closed' })
  const logo_sh = shadow.querySelector('.logo_wrapper').attachShadow({ mode: 'closed' })
  const nav_sh = shadow.querySelector('.nav_toggle').attachShadow({ mode: 'closed' })
  const text_wrapper = shadow.querySelector('.page_btns_wrapper')
  const icon_wrapper = shadow.querySelector('.icon_btn_wrapper')

  const consortium_btn = icon_button({ src: icon_consortium }, navigation_protocol('CONSORTIUM'))
  const logo_btn = logo_button()
  const nav_btn = icon_button({ src: icon_arrow_down, src_active: icon_arrow_up }, nav_protocol('navtoggle'))
  const text_btns = [
    text_button({ text: 'HOME' }, navigation_protocol('HOME')),
    text_button({ text: 'PROJECTS' }, navigation_protocol('PROJECTS')),
    text_button({ text: 'GROWTH PROGRAM' }, navigation_protocol('GROWTH PROGRAM')),
    text_button({ text: 'TIMELINE' }, navigation_protocol('TIMELINE'))
  ]
  const icon_btns = [
    icon_button({ src: icon_blogger }, socials_protocol('blog-button')),
    icon_button({ src: icon_discord }, socials_protocol('discord-button')),
    icon_button({ src: icon_twitter }, socials_protocol('twitter-button')),
    icon_button({ src: icon_github }, socials_protocol('github-button')),
    icon_button({ src: icon_terminal }, terminal_protocol('terminal-button')),
    icon_button({ src: icon_theme }, theme_button_protocol('theme-button'))
  ]
  info_sh.append(consortium_btn)
  logo_sh.append(logo_btn)
  nav_sh.append(nav_btn)
  text_wrapper.append(...text_btns.map(wrap('text_button_wrapper')))
  icon_wrapper.append(...icon_btns.map(wrap('')))

  shadow.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  initialize(page)

  return el

  function wrap (className) {
    return button => {
      const el = Object.assign(document.createElement('div'), { className })
      el.attachShadow({ mode: 'closed' }).append(button)
      return el
    }
  }
  function nav_protocol (petname) {
    return send => {
      const on = { 'click': onclick }
      const channel = state.hub[send.id] = { mid: 0, send, on }
      state.aka[petname] = send.id
      return Object.assign(listen, { id })
      function invalid (message) { console.error('invalid type', message) }
      function listen (message) {
        console.log(`[${id}]\n${petname}:`, message)
        const { on } = state.hub[state.aka[petname]]
        const action = on[message.type] || invalid
        action(message)
      }
      function onclick (message){
        state.status.dropdown_collapsed = !state.status.dropdown_collapsed
        navbar.classList.toggle('active', state.status.dropdown_collapsed)
        send({
          head: [id, send.id, channel.mid++],
          refs: { cause: message.head },
          type: state.status.dropdown_collapsed ? 'activate' : 'inactivate',
        })
      }
    }
  }
  function socials_protocol (petname) {
    return function protocol (send) {
      const on = { 'click': onclick }
      state.hub[send.id] = { mid: 0, send, on }
      state.aka[petname] = send.id
      return Object.assign(listen, { id })
      function invalid (message) { console.error('invalid type', message) }
      function listen (message) {
        console.log(`[${id}]`, message)
        const { on } = state.hub[state.aka[petname]]
        const action = on[message.type] || invalid
        action(message)
      }
      function onclick (message) {
        const up_channel = state.hub[state.aka.up]
        const [by, to, mid] = [id, petname, up_channel.mid++]
        up_channel.send({
          head: [by, to, mid],
          refs: { cause: message.head },
          type: 'social',
          data: petname
        })
      }
    }
  }
  function terminal_protocol (petname) {
    return function protocol (send) {
      const on = { 'click': onclick }
      const channel = state.hub[send.id] = { mid: 0, send, on }
      state.aka[petname] = send.id
      return Object.assign(listen, { id })
      function invalid (message) { console.error('invalid type', message) }
      function listen (message) {
        console.log(`[${id}]`, message)
        const { on } = state.hub[state.aka[petname]]
        const action = on[message.type] || invalid
        action(message)
      }
      function onclick (message) {
        state.status.terminal_collapsed = !state.status.terminal_collapsed
        const up_channel = state.hub[state.aka.up]
        const [by, to, mid] = [id, petname, up_channel.mid++]
        up_channel.send({
          head: [by, to, mid],
          refs: { cause: message.head },
          type: 'toggle_terminal',
        })
        channel.send({
          head: [id, send.id, channel.mid++],
          refs: { cause: message.head },
          type: state.status.terminal_collapsed ? 'activate' : 'inactivate',
        })
      }
    }
  }
  function theme_button_protocol (petname) {
    return function protocol (send) {
      const on = { 'click': onclick }
      const channel = state.hub[send.id] = { mid: 0, send, on }
      state.aka[petname] = send.id
      return Object.assign(listen, { id })
      function invalid (message) { console.error('invalid type', message) }
      function listen (message) {
        console.log(`[${id}]`, message)
        const { on } = state.hub[state.aka[petname]]
        const action = on[message.type] || invalid
        action(message)
      }
      function onclick (message) {
        state.status.theme_dark = !state.status.theme_dark
        const up_channel = state.hub[state.aka.up]
        const [by, to, mid] = [id, petname, up_channel.mid++]
        up_channel.send({
          head: [by, to, mid],
          refs: { cause: message.head },
          type: 'handle_theme_change',
          data: ''
        })
        channel.send({
          head: [id, send.id, channel.mid++],
          refs: { cause: message.head },
          type: state.status.theme_dark ? 'activate' : 'inactivate',
        })
      }
    }
  }
  function initialize (page) {
    // SET DEFAULTS
    state.status.active_button = state.aka[page]
    const active_id = state.status.active_button
    const be_channel = state.hub[active_id]
    const up_channel = state.hub[state.aka.up]

    // APPLY OPTS (1):
    // @TODO: issue: how to submit an `onclick` event to trigger the initial change?

    const [by, to, mid] = [id, id, 0]
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
  function navigation_protocol (petname) {
    return function protocol (send) {
      const on = { 'click': onclick }
      state.hub[send.id] = { mid: 0, send, on }
      state.aka[petname] = send.id
      return Object.assign(listen, { id })
      // APPLY OPTS (3):
      // @INFO: onclick is for later
      // @TODO: but init should set itself active -> apply OPTS
      // => (e.g. page === petname): trigger active + trigger parent to show content
      // ALSO: opts should be "asked for" instead
      // ALSO: take care of problems of order in which things get applied synchronously... test for it!       
      function invalid (message) { console.error('invalid type', message) }
      function listen (message) {
        console.log(`[${id}]`, message)
        const { on } = state.hub[state.aka[petname]]
        const action = on[message.type] || invalid
        action(message)
      }
      function onclick (message) { // receive click from a button -> that button will become active!
        const active_id = state.status.active_button
        const default_id = state.aka[page] // only exists because it got initialized first (timing issue?)
        if (active_id === send.id && active_id === default_id) return // means default is already active
        // @TODO: maybe change logic to be able to toggle an "empty desktop" too?
        const [
          next_id, data
        ] = active_id === send.id ? [default_id, page] : [send.id, petname]
        const be_channel = state.hub[next_id]
        const ex_channel = state.hub[active_id] // active button
        const up_channel = state.hub[state.aka.up] // parent element
        do_page_change(data, message.head, { be_channel, ex_channel, up_channel })
      }
    }
  }
  function do_page_change (page, head, { be_channel, ex_channel, up_channel }) {
    if (be_channel) be_channel.send({ // new active nav button
      head: [id, be_channel.send.id, be_channel.mid++],
      refs: { cause: head },
      type: 'activate',
    })
    if (ex_channel) ex_channel.send({ // old active nav button
      head: [id, ex_channel.send.id, ex_channel.mid++],
      refs: { cause: head },
      type: 'inactivate',
    })
    if (up_channel) up_channel.send({ // send parent to update page content
      head: [id, up_channel.send.id, up_channel.mid++],
      refs: { cause: head },
      type: 'handle_page_change',
      data: page
    })
    state.status.active_button = be_channel.send.id
  }
}
function get_theme () {
  return`
    .navbar_wrapper {
      container-type: inline-size;
      width: 100%;
      .navbar {
        display: block;
        width: 100%;
        height: 40px;
        overflow: hidden;
        border-bottom: 1px solid var(--primary_color);
        --s: 15px; /* control the size */
        --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
        background:
            repeating-conic-gradient(at 33% 33%,var(--_g)),
            repeating-conic-gradient(at 66% 66%,var(--_g)),
            var(--primary_color);  /* second color */
        background-size: var(--s) var(--s);
        &.active {
          height: max-content;
        }
        .nav_toggle_wrapper {
          display: flex;
          width:1 00%;
          justify-content: stretch;
          .logo_wrapper{
            width: 100% !important;
            flex-grow: 1;
          }
          .nav_toggle {
            display: block;
          }
        }
        .page_btns_wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          .text_button_wrapper {
            width: 100%;
            flex-grow: 1;
          }
        }
        .icon_btn_wrapper {
          display: flex;
          justify-content: flex-start;
        }
      }
    }
    @container(min-width: 899px) {
      .navbar_wrapper {
        .navbar {
          display: flex;
          .nav_toggle_wrapper {
            width: max-content;
            display: flex;
            .logo_wrapper {
              width: max-content !important;
            }
            .nav_toggle {
              display: none;
            }
          }
          .page_btns_wrapper {
            flex-direction: row;
            .text_button_wrapper {
              width: max-content !important;
              flex-grow: unset;
            }
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/navbar/index.js","/src/node_modules/navbar")
},{"_process":2,"buttons/icon_button":15,"buttons/logo_button":16,"buttons/text_button":22,"path":1}],33:[function(require,module,exports){
const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = our_member

function our_member (opts, protocol) {
  const name = `our_member`
  protocol({ from: name }, listen)
  function listen () {
    our_member_wrapper.style.display = 'inline'
  }
  const { data } = opts
  // Assigning all the icons
  const {img_src} = data
  const {
      icon_pdf_reader
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="our_member">
      <div class="member_content">
        <h2>## our members</h2>
        <table>
          <thead>
            <tr>
              <td> s.no </td><td> names </td><td> socials </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> 01 </td><td> alexander </td><td> cabal  </td>
            </tr>
            <tr>
              <td> 02 </td><td> alexander praetorius </td><td> geut/she </td>
            </tr>
          </tbody>
        </table>  
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const window = window_bar({
    name:'our_member.md', 
    src: icon_pdf_reader,
    data: data
  }, our_member_protocol)
  const our_member_wrapper = shadow.querySelector('.our_member')
  our_member_wrapper.prepend(window)

  shadow.adoptedStyleSheets = [sheet]
  return el

  // cover protocol
  function our_member_protocol (message, send) {
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const PROTOCOL = {
        'toggle_active_state': toggle_active_state
      }
      const action = PROTOCOL[type] || invalid      
      action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const { active_state } = data
      ;( active_state === 'active')?our_member_wrapper.style.display = 'none':''
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .our_member {
      display: none;
      .member_content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        padding: 10px;
        background-size: 10px 10px;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        margin-bottom: 30px;
        h2 {
          margin: 0;
        }
        table {
          border-collapse: collapse;
          thead {
            font-weight: bold;
          }
          td {
            border: 1px solid var(--primary_color);
            padding: 8px;
          }
        }
      }
    }
    @container (min-width: 510px) {
      .our_member {
        .member_content {
          width: auto;
          height: auto;
        }
      }
    }
  `
}
},{"window_bar":49}],34:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const sm_icon_button = require('buttons/sm_icon_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = project_card

function project_card (opts) {
  const { data } = opts
  // Assigning all the icons
  const { img_src: { 
      icon_consortium = `${prefix}/icon_consortium_page.png`,
  } } = data
  const el = document.createElement('div')
  el.style.lineHeight = '0px'
  const shadow = el.attachShadow({ mode : 'closed' })
  const { socials, project_logo, desc, tags, project } = opts
  shadow.innerHTML = `
    <div class="project_card">
      <div class="icon_wrapper">
        <div class="project_title">
          ${project}
          <img src="${project_logo}">
        </div>
        <div class="socials_wrapper"><socials></socials></div>
      </div>
      <div class="content_wrapper">
        <div class="desc"> ${desc}</div>
      </div>
      <div class="tags_wrapper">
        ${tags.map(tag => `<div class="tag">${tag}</div>`).join('')}
      </div>
    </div>
    <style>${get_theme()}</style>
  `
  shadow.querySelector('socials').replaceWith(...socials.map(x => sm_icon_button({ src: x })))
  shadow.adoptedStyleSheets = [sheet]

  return el
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .project_card {
      height: max-content;
      width: 100%;
      line-height: normal;
      background-color: var(--bg_color);
      color: var(--primary_color) !important;
      border: 1px solid var(--primary_color);
      container-type: inline-size;
      box-sizing: border-box;
      .icon_wrapper {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--primary_color);
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
      }
      .content_wrapper {
        padding: 20px;
        .desc {
          font-size: 14px;
          letter-spacing: -2px;
          line-height: 16px;
        }
      }
      .tags_wrapper {
        display: flex;
        flex-wrap: wrap;
        .tag {
          flex-grow: 1;
          min-width: max-content;
          padding:5px 10px;
          border: 1px solid var(--primary_color);
          text-align:center;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/project_card")
},{"_process":2,"buttons/sm_icon_button":18,"path":1}],35:[function(require,module,exports){
const search_input = require('search_input')
const select_button = require('buttons/select_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())

var id = 0

module.exports = project_filter

function project_filter (opts, protocol) {
  const name = 'project_filter-' + id++
  const notify = protocol({ from: name }, listen)
  const PROTOCOL = {}
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode:`closed` })
  shadow.innerHTML = `
    <div class="filter_wrapper">
      <div class="project_filter"></div>
    </div>
    <style> ${get_theme()} </style>
  `
  const search_project = search_input(opts, project_filter_protocol)
  const status_button = select_button({ data: opts.data, name: 'STATUS', choices: ['ACTIVE', 'UNACTIVE', 'PAUSED'] }, project_filter_protocol)
  const tag_button = select_button({ data: opts.data, name: 'TAGS', choices: opts.tags }, project_filter_protocol)
  const project_filter = shadow.querySelector('.project_filter')
  project_filter.append(status_button, tag_button, search_project)
  // shadow.append(project_filter)
  shadow.adoptedStyleSheets = [sheet]

  return el

  function project_filter_protocol (handshake, send, mid = 0) {
    if (send) return listen
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, id } = head
      // if( to !== id) return console.error('address unknown', message)
      message = {
        head: { by:name, to: 'app_projects', mid: 0 },
        type: type,
        data: data
      }
      notify(message)
    }
  }
  function listen (message) {
    
  }
}
function get_theme () {
  return`
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
},{"buttons/select_button":17,"search_input":39}],36:[function(require,module,exports){
const app_projects = require('app_projects')
const the_dat = require('the_dat')
const app_footer = require('app_footer')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
sheet.replaceSync(get_theme())

module.exports = projects_page

function projects_page (opts, protocol) {
  const { data } = opts

  const components = [
    the_dat({ data }, projects_protocol),
    app_projects({ data }),
    app_footer({ data })
  ]
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  // adding a `main-wrapper` 
  shadow.innerHTML = `
    <div class="main-wrapper">
      <div class="main"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const main = shadow.querySelector('.main')
  main.append(...components)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // Placeholder code for learning purposes
  // Will be removed
  function projects_protocol (handshake, send){
    if (send) return listen
    const PROTOCOL = {
      'toggle_display' : toggle_display
    }
    send = handshake(null, listen)
    function listen (message){
      function format (new_message = {
        head: [from = 'alice', to = 'bob', message_id = 1],
        refs: { cause: message.head }, // reply to received message
        type: 'change_theme',
        data: `.foo { background-color: red; }`
      }) { return new_message }
      console.log(format())
      // const { head, type, data } = message
      // const [by, to, id] = head
      // if (to !== id) return console.error('address unknown', message)
      // const action = PROTOCOL[type] || invalid
      // action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_display ({ head: [to], data: theme }) {
      // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
      .main {
        margin: 0;
        padding: 30px 10px;
        opacity: 1;
        background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
        background-size: 16px 16px;
      }
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
},{"app_footer":9,"app_projects":10,"the_dat":42}],37:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const sm_icon_button = require('buttons/sm_icon_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = scrollbar

function scrollbar (opts, protocol) {
  const name = "scrollbar-" + id++
  const { data } = opts
  let message = {
    head: { by: name, to: 'app_projects', mid: 0 },
    type: 'status',
    data: null
  }
  let content_scrollHeight, content_clientHeight, content_scrollTop
  const [notify, setScrollTop] = protocol({ from: name }, [handle_scroll, listen])
  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, id } = head
    const { sh, ch, st } = data
    content_clientHeight = ch
    content_scrollHeight = sh
    content_scrollTop = st
  }
  // Assigning all the icons
  const { img_src: { 
    icon_arrow_down = `${prefix}/icon_arrow_down.svg`,
    icon_arrow_up = `${prefix}/icon_arrow_up.svg`
  } } = data
  const el = document.createElement('div')
  el.classList.add('container')
  const shadow = el.attachShadow({ mode: 'closed'})
  shadow.innerHTML = `
    <div class="scrollbar_wrapper">
      <div class="bar_wrapper">
        <div class="bar"> </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const bar = shadow.querySelector('.bar')
  let lastPageY;
  bar.onmousedown = handle_mousedown
  const arrow_down_btn = sm_icon_button({src: icon_arrow_down, activate: false})
  arrow_down_btn.classList.add('arrow_down_btn')
  arrow_down_btn.onclick = () => {
    notify(message)
    const ratio = content_clientHeight / content_scrollHeight
    setScrollTop(content_scrollTop + 30 / ratio)
  }
  const arrow_up_btn = sm_icon_button({src: icon_arrow_up, activate: false})
  arrow_up_btn.classList.add('arrow_up_btn')
  arrow_up_btn.onclick = () => {
    notify(message)
    const ratio = content_clientHeight / content_scrollHeight
    setScrollTop(content_scrollTop - 30 / ratio)
  }
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
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
  // setTimeout(window.requestAnimationFrame(handle_scroll), 5000);
  scrollbar_wrapper.append(arrow_up_btn, arrow_down_btn)
  shadow.adoptedStyleSheets = [sheet]

  return el
  
  function handle_mousedown (e) {
    lastPageY = e.pageY
    window.onmousemove = handle_mousemove
    function handle_mousemove (e) {
      notify(message)
      const delta = e.pageY - lastPageY
      lastPageY = e.pageY
      const ratio = content_clientHeight / content_scrollHeight
      setScrollTop(content_scrollTop + delta / ratio)
    }
    window.onmouseup = handle_mouseup
    function handle_mouseup () {
      window.onmousemove = null
      window.onmouseup = null
    }
  }
  function handle_scroll () {
    notify(message)
    const ratio = content_clientHeight / content_scrollHeight
    if (ratio >= 1) el.style.cssText = 'display: none;'
    else el.style.cssText = 'display: inline;'
    bar.style.cssText = 'height:' + Math.max(ratio * 100, 10) + '%; top:' + (content_scrollTop / content_scrollHeight ) * 100 + '%;'
  }
}
function get_theme () {
  return `
    .scrollbar_wrapper {
      width: 30px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      .bar_wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        .bar {
          position: relative;
          background-color: var(--primary_color);
          width: 30px;
          cursor: pointer;
          transition: opacity 0.25s linear;
          box-shadow:inset 0px 0px 0px 1px var(--bg_color);
          &:hover {
            cursor: pointer
          }
          &:active {
            -o-user-select: none;
            -ms-user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/scrollbar")
},{"_process":2,"buttons/sm_icon_button":18,"path":1}],38:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const sm_icon_button = require('buttons/sm_icon_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = scrollbar

function scrollbar (opts, protocol) {
  const name = "scrollbar-" + id++
  const { data } = opts
  let message = {
    head: { by: name, to: 'app_projects', mid: 0 },
    type: 'status',
    data: null
  }
  let content_scrollWidth, content_clientWidth, content_scrollLeft
  const [notify, setScrollLeft] = protocol({ from: name }, [handle_scroll, listen])
  function listen(message){
    const { head,  refs, type, data, meta } = message
    const { by, to, id } = head
    const { sh, ch, st } = data
    content_clientWidth = ch
    content_scrollWidth = sh
    content_scrollLeft = st
  }
  // Assigning all the icons
  const { img_src: { 
    icon_arrow_right = `${prefix}/icon_arrow_right.svg`,
    icon_arrow_left = `${prefix}/icon_arrow_left.svg`
  } } = data
  const el = document.createElement('div')
  el.classList.add('container')
  const shadow = el.attachShadow({ mode: 'closed'})
  shadow.innerHTML = `
    <div class="scrollbar_wrapper">
      <div class="bar_wrapper">
        <div class="bar"> </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const bar = shadow.querySelector('.bar')
  let lastPageX
  bar.onmousedown = handle_mousedown
  const arrow_down_btn = sm_icon_button({ src: icon_arrow_right, activate: false })
  arrow_down_btn.classList.add('arrow_down_btn')
  arrow_down_btn.onclick = () => {
    notify(message)
    const ratio = content_clientWidth / content_scrollWidth
    setScrollLeft(content_scrollLeft + 30 / ratio)
  }
  const arrow_up_btn = sm_icon_button({ src: icon_arrow_left, activate: false })
  arrow_up_btn.classList.add('arrow_up_btn')
  arrow_up_btn.onclick = () => {
    notify(message)
    const ratio = content_clientWidth / content_scrollWidth
    setScrollLeft(content_scrollLeft - 30 / ratio)
  }
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
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
  // setTimeout(window.requestAnimationFrame(handle_scroll), 5000);
  scrollbar_wrapper.append(arrow_up_btn, arrow_down_btn)

  shadow.adoptedStyleSheets = [sheet]

  return el

  function handle_mousedown (e) {
    lastPageX = e.pageX
    window.onmousemove = handle_mousemove
    function handle_mousemove (e) {
      notify(message)
      const delta = e.pageX - lastPageX
      lastPageX = e.pageX;
      const ratio = content_clientWidth / content_scrollWidth
      setScrollLeft(content_scrollLeft + delta / ratio)
    }
    window.onmouseup = handle_mouseup
    function handle_mouseup () {
      window.onmousemove = null
      window.onmouseup = null
    }
  }
  // Observe one or multiple elements
  function handle_scroll () {
    notify(message)
    const ratio = content_clientWidth / content_scrollWidth
    if (!ratio || ratio >= 1) el.style.cssText = 'display: none;'
    else el.style.cssText = 'display: inline;'
    bar.style.cssText = 'width:' + Math.max(ratio * 100, 10) + '%; left:' + (content_scrollLeft / content_scrollWidth ) * 100 + '%;'
  }
}
function get_theme () {
  return `
    * {
      box-sizing: border-box;
    }
    .scrollbar_wrapper {
      height: 30px;
      width: 100%;
      display: flex;
      box-sizing: border-box;
      .bar_wrapper {
        display: flex;
        width: 100%;
        .bar {
          position: relative;
          background-color: var(--primary_color);
          height: 30px;
          cursor: pointer;
          transition: opacity 0.25s linear;
          box-shadow:inset 0px 0px 0px 1px var(--bg_color);
          &:hover {
            cursor: pointer
          }
          &:active {
            -o-user-select: none;
            -ms-user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
          }
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/scrollbar_hor")
},{"_process":2,"buttons/sm_icon_button":18,"path":1}],39:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()   
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

module.exports = input_search

function input_search (opts, protocol) {
  const notify = protocol(null, listen)
  const { data } = opts
  let message = {
    head: ['input_search', 'project_filter', 'project_filter'],
    type: 'setFilter',
  }
  // Assigning all the icons
  const { img_src: {
      icon_search = `${prefix}/icon_search.svg`,
  } } = data
  const el = document.createElement('div')
  // el.classList.add('input_wrapper')
  const shadow = el.attachShadow({ mode:`closed` })
  shadow.innerHTML = `
    <div class="search_input">
      <input class="input" type="text" placeholder="SEARCH...">
        ${icon_search}
      </input>
    </div>
    <style> ${get_theme()} </style>
  `
  const input = shadow.querySelector('.input')
  input.oninput = (e) => {
    message['data'] = { filter: 'SEARCH', value:e.target.value }
    notify(message)
  }
  // shadow.append(main, navbar(opts, protocol))
  shadow.adoptedStyleSheets = [sheet]

  return el

  function listen (message) {
    // const {head,  refs, type, data, meta} = message
    // const [by, to, id] = head
    // if( to !== id) return console.error('address unknown', message)
  }
}
function get_theme () {
  return`
    .search_input {
      width: 100%;
      min-width: 100% !important;
      height: 30px;
      max-height: 40px;
      position: relative;
      flex-grow: 1;
      input {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border: 3px solid var(--primary_color);
        padding: 10px 40px 10px 5px;
        outline: none;
        font-family: Silkscreen;
        font-size: 18px;
        letter-spacing: -1px;
        &:focus {
          border-color: var(--ac-1) !important;
        }
      }
      svg {
        position: absolute;
        right: 10px;
        top: 50%;
        translate: 0 -50%;
        width: 20px;
        height: auto;
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/search_input")
},{"_process":2,"path":1}],40:[function(require,module,exports){
module.exports = tab_window

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

function tab_window (opts, protocol) {
    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper">${opts.text}</div>
        <style>${get_theme()}</style>
    `
    shadow.adoptedStyleSheets = [sheet]
    return el
}

function get_theme() {
    return ``
}
},{}],41:[function(require,module,exports){
const tab_window = require('tab_window')
const tab_button = require('buttons/tab_button')
const sm_icon_button_alt = require('buttons/sm_icon_button_alt')
const scrollbar = require('scrollbar_hor')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = terminal

function terminal (opts, protocol) {
  const name = `terminal-${id++}`
  let active_tab = 0
  const tabs = {}
  const tab_buttons_id = {}
  let tab_id = 0
  const PROTOCOL = { close_tab, tab_btn_click }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_terminal,
    icon_close_light,
    icon_plus,
    icon_full_screen
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="terminal_wrapper">
      <div class="terminal">
        <div class="header">${icon_terminal}Terminal</div>
        <div class="tab_wrapper"></div>
        <div class="footer">
          <div class="scrollbar_wrapper">
            <div class="tab_buttons"></div>
          </div>
          <div class="buttons"></div>
        </div>
      </div>
    </div>
  `
  const tab = tab_window({ data: opts.data, text: 'Home' })
  tabs[tab_id] = tab
  active_tab = tab_id
  const tab_buttons = shadow.querySelector('.tab_buttons')
  const tab_btn = tab_button({data, name:'Home'}, terminal_protocol)
  tab_btn.id = tab_id
  tab_buttons.append(tab_btn)
  const tab_wrapper = shadow.querySelector('.tab_wrapper')
  tab_wrapper.append(tab)
  const terminal_wrapper = shadow.querySelector('.terminal')
  const add_btn = sm_icon_button_alt({ src: icon_plus })
  add_btn.onclick = e => {
    tab_id++
    const tab = tab_window({ data: opts.data, text: 'New Tab' + tab_id })
    tabs[tab_id] = tab
    tab_wrapper.replaceChildren(tab)
    PROTOCOL[`tab_button-${active_tab}`]()
    active_tab = tab_id
    const tab_btn = tab_button({data, name:'New Tab' + tab_id}, terminal_protocol)
    tab_btn.id = tab_id
    tab_buttons_id[tab_id] = tab_btn
    tab_buttons.append(tab_btn)
    PROTOCOL['handleScroll']()
  }
  const buttons = shadow.querySelector('.buttons')
  buttons.append(add_btn)
  if (screen.width > 510) {
    const fullscreen_btn = sm_icon_button_alt({ src: icon_full_screen })
    fullscreen_btn.onclick = e => terminal_wrapper.style.height === '100vh' ? 
      terminal_wrapper.style.height = '300px' : 
      terminal_wrapper.style.height = '100vh'
    buttons.append(fullscreen_btn)
  }
  const close_btn = sm_icon_button_alt({ src: icon_close_light })
  // add_btn.onclick = e => toggle_terminal()
  buttons.append(close_btn)
  const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
  scrollbar_wrapper.append(scrollbar( opts, terminal_protocol))

  shadow.adoptedStyleSheets = [sheet]
  return el

  // cover protocol
  function terminal_protocol (handshake, send) {
    if (handshake.from.includes('scrollbar')) {
      tab_buttons.onscroll = send[0]
      const ro = new ResizeObserver(entries => send[0]())
      ro.observe(tab_buttons)
      PROTOCOL['handleScroll'] = send[0]
      PROTOCOL['getScrollInfo'] = send[1]
      return [listen, setScrollLeft]
    }
    if(handshake.from.includes('tab_button')) {
      PROTOCOL[handshake.from] = send
    }
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const { by, to, mid } = head
      if (by.includes('scrollbar')) {
        message.data = {
          sh: tab_buttons.scrollWidth,
          ch: tab_buttons.clientWidth,
          st: tab_buttons.scrollLeft
        }
        PROTOCOL.getScrollInfo(message)
      } else PROTOCOL[type](data)
    }
  }
  async function invalid (message) { console.error('invalid type', message) }
  async function setScrollLeft (value) {
    tab_buttons.scrollLeft = value
  }
  async function close_tab (id) {
    if (Object.keys(tabs).length == 1) tab_wrapper.removeChild(tabs[id])
    delete tabs[id]
    if (active_tab == id && !Object.keys(tabs).length == 0) {
      const temp = Object.values(tabs)[0]
      tab_wrapper.replaceChildren(temp)
      active_tab = Object.keys(tabs)[0]
      PROTOCOL[`tab_button-${active_tab}`]()
    }
    PROTOCOL['handleScroll']()
  }
  async function tab_btn_click (id) {
    active_tab && PROTOCOL[`tab_button-${active_tab}`]()
    active_tab = id
    tab_wrapper.replaceChildren(tabs[active_tab])
  }
}
function get_theme () {
  return`
    :host {
      height: 100%;
    }
    * {
      box-sizing: border-box;
    }
    .terminal_wrapper {
      container-type: inline-size;
      flex-grow: 1;
      height: 100%;
      .terminal {
        display: flex;
        flex-direction: column;
        background-color: var(--bg_color);
        .header {
          display: flex;
          background-color: var(--primary_color);
          color: var(--bg_color);
          padding: 10px 5px;
          align-items: center;
          gap: 5px;
          svg path {
            fill: white;
          }
        }
        .tab_wrapper {
          background-color: var(--bg_color);
          border: 5px solid var(--primary_color);
          height: 100%;
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
          .scrollbar_wrapper {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            .tab_buttons {
              display: flex;
              overflow-x: scroll;
              overflow-y: hidden;
              &:::-webkit-scrollbar {
                display: none;
              }
            }
          }
          .buttons { 
            display: flex;
            widht: fit-content;
            div {
              height: fit-content;
            }
          }
        }
      }
    }
    @container (min-width: 510px) {
      .terminal {
        height: 100%;
      }
    }
  `
}
},{"buttons/sm_icon_button_alt":19,"buttons/tab_button":21,"scrollbar_hor":38,"tab_window":40}],42:[function(require,module,exports){
const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = the_dat

function the_dat (opts, protocol) {
  const name = `the_dat-${id++}`
  const PROTOCOL = {
    'toggle_fullscreen': toggle_fullscreen,
    'toggle_VR': toggle_VR,
    'toggle_active_state': toggle_active_state
  }
  protocol({ from: name }, listen)
  function listen () {
    the_dat_wrapper.style.display = 'inline'
  }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_the_dat,
    icon_vr,
    icon_full_screen
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="the_dat">
      <div class="dat_content">
        <iframe style="background-color: black"></iframe>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const window = window_bar({
    name:'the_dat', 
    src: icon_the_dat,
    icon_buttons: [{icon: icon_vr, action: 'toggle_VR'}, {icon:icon_full_screen, action: 'toggle_fullscreen'}],
    data: data
  }, the_dat_protocol)
  const the_dat_wrapper = shadow.querySelector('.the_dat')
  the_dat_wrapper.prepend(window)
  const dat_content = shadow.querySelector('.dat_content')

  shadow.adoptedStyleSheets = [sheet]

  return el

  // cover protocol
  function the_dat_protocol (message, send) {
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const action = PROTOCOL[type] || invalid      
      action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
  }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const { active_state } = data
    ;( active_state === 'active')?the_dat_wrapper.style.display = 'none':''
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
  return`
    * {
      box-sizing: border-box;
      color: var(--primary_color);
    }
    .the_dat {
      &.active {
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        z-index: 20;
      }
      .dat_content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background-size: 10px 10px;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        margin-bottom: 30px;
        &.active {
          height: 100vh;
        }
      }
    }
  `
}
},{"window_bar":49}],43:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const dark_theme = {
  bg_color : '#000',
  primary_color : '#2ACA4B',
  ac_1 : '#2ACA4B',
  ac_2 : '#F9A5E4',
  ac_3 : '#88559D',

  img_src:{
    // social icons
    icon_blogger: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
    icon_twitter: `<svg width="17" height="17" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
    icon_github: `<svg width="18" height="18" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // terminal
    icon_consortium: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_terminal: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
    icon_theme: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // window icons
    icon_close_dark: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
    icon_close_light: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
    icon_pdf_reader: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,
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
    img_robot_2 : `${prefix}/../assets/images/img_robot_2.png`,
    pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,
  }
}

module.exports = dark_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/theme/dark-theme")
},{"_process":2,"path":1}],44:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


const light_theme = {
  bg_color : '#fff',
  primary_color : '#293648',
  ac_1 : '#2ACA4B',
  ac_2 : '#F9A5E4',
  ac_3 : '#88559D',

  img_src:{
    // social icons
    icon_blogger: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
    icon_twitter: `<svg width="17" height="17" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
    icon_github: `<svg width="18" height="18" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // terminal
    icon_consortium: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_terminal: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
    icon_theme: `<svg width="15" height="15" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    // window icons
    icon_close_dark: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
    icon_close_light: `<svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
    icon_pdf_reader: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,
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
    img_robot_2 : `${prefix}/../assets/images/img_robot_2.png`,
    pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,

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
},{"_process":2,"path":1}],45:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = timeline_card

function timeline_card (opts) {
    const name = `timeline_card-${id++}`
    const { data } = opts
    // Assigning all the icons
    const { img_src } = data
    const {
        icon_clock,
        icon_link,
        icon_calendar,
    } = img_src
    const el = document.createElement('div')
    el.id = name;
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow({ mode : 'closed' })
    const { date, time, link, title, desc, tags} = opts
    shadow.innerHTML = `
      <div class="timeline_card">
        <div class="content_wrapper">
          <div class="icon_wrapper">
            <div> ${icon_calendar} ${date} </div>
            <div> ${icon_clock} ${time} </div>
            <div> <a href="${link}">${icon_link}</a> </div>
          </div>
          <div class="title"> ${title} </div>
          <div class="desc"> ${desc}</div>
        </div>
        <div class="tags_wrapper">
          ${tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
        </div>
      </div>
      <style>${get_theme()}</style>
    `
    shadow.adoptedStyleSheets = [sheet]
    return el
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .timeline_card {
      height: max-content;
      width: 100%;
      line-height: normal;
      background-color: var(--bg_color);
      color: var(--primary_color) !important;
      border: 1px solid var(--primary_color);
      container-type: inline-size;
      .content_wrapper {
        padding: 20px;
        .icon_wrapper {
          display: flex;
          gap: 20px;
          div {
            display: flex;
            gap: 5px;
            font-size: 16px;
            letter-spacing: -2px;
            align-items: center;
          }
          img {
            width: 20px;
            height: 20px;
          }
          div:nth-last-child(1) {
            margin-left: auto;
          }
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
      }
      .tags_wrapper {
        display: flex;
        flex-wrap: wrap;
        .tag {
          flex-grow: 1;
          min-width: max-content;
          padding: 5px 10px;
          border: 1px solid var(--primary_color);
          // line-height:0px;
          text-align: center;
        }
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline_card")
},{"_process":2,"path":1}],46:[function(require,module,exports){
const search_input = require('search_input')
const select_button = require('../buttons/select_button')
const sm_icon_button = require('buttons/sm_icon_button')
const year_button = require('buttons/year_button')

module.exports = timeline_filter

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

var id = 0

function timeline_filter (opts, protocol) {
  const name = 'timeline_filter-' + id++
  const notify = protocol({ from: name }, listen)
  const PROTOCOL = {}
  const { data } = opts
  const { img_src : { icon_arrow_up = `${prefix}/icon_arrow_up.svg` }} = data
  const el = document.createElement('div')
  const shadow = el.attachShadow( { mode:`closed` } )
  shadow.innerHTML = `
    <div class="filter_wrapper">
      <div class="timeline_filter">
        <div class="date_wrapper"></div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const search_project = search_input(opts, timeline_filter_protocol)
  const status_button = select_button({data: opts.data, name: 'STATUS', choices: ['ACTIVE', 'UNACTIVE', 'PAUSED']}, timeline_filter_protocol)
  const tag_button = select_button({data: opts.data, name: 'TAGS', choices: opts.tags}, timeline_filter_protocol)
  const month_button = sm_icon_button({src: icon_arrow_up, activate: true})
  const year_btn = year_button({data, latest_date: opts.latest_date}, timeline_filter_protocol)
  month_button.onclick = e => notify({
      head: {by:name, to:'app_timeline', mid:0},
      type: 'toggle_month_filter',
      data: null
  })
  year_btn.onclick = e => notify({
    head: { by: name, to: 'app_timeline', mid: 0 },
    type: 'toggle_year_filter',
    data: null
  })
  const timeline_filter = shadow.querySelector('.timeline_filter')
  timeline_filter.prepend(status_button, tag_button, search_project)
  const date_wrapper = shadow.querySelector('.date_wrapper')
  date_wrapper.append(month_button, year_btn)
  // shadow.append(timeline_filter)
  shadow.adoptedStyleSheets = [sheet]

  return el

  function timeline_filter_protocol (handshake, send, mid = 0) {
    if (handshake && handshake.from.includes('year_button')) PROTOCOL['get_date'] = send
    return listen
    function listen (message) {
      const { head,  refs, type, data, meta } = message
      const { by, to, id } = head
      // if( to !== id) return console.error('address unknown', message)
      message = {
        head: { by: name, to: 'app_timeline', mid: 0 },
        type: type,
        data: data
      }
      notify(message)
    }
  }
  function listen (message) {
    message.head.to = 'year_button'
    PROTOCOL['get_date'](message)
  }
}
function get_theme () {
  return`
    .filter_wrapper {
      container-type: inline-size;
      .timeline_filter {
        display: grid;
        grid-template-columns: 12fr;
        align-items: flex-end;   
        .date_wrapper {
          display: grid;
          grid-template-columns: 1fr 12fr;
        }
      }
    }
    @container (min-width: 450px) {
      .filter_wrapper {
        .timeline_filter {
          grid-template-columns: 1fr 1fr 9fr 1fr;
        }
      }
    }
  `
}
},{"../buttons/select_button":17,"buttons/sm_icon_button":18,"buttons/year_button":23,"search_input":39}],47:[function(require,module,exports){
module.exports = timeline_page

const app_timeline = require('app_timeline')
const app_footer = require('app_footer')

function timeline_page (opts, protocol) {
  const { data } = opts

  // CSS Boiler Plat
  const sheet = new CSSStyleSheet
  const theme = get_theme()

  const components = [
    app_timeline({data}),
    app_footer({data}),
  ]

  const el = document.createElement('div')
  const shadow = el.attachShadow({mode: 'closed'})

  // adding a `main-wrapper` 
  shadow.innerHTML = `
    <div class="main-wrapper">
      <div class="main"></div>
    </div>
    <style>${get_theme()}</style>
  `
  const main = shadow.querySelector('.main')
  main.append(...components)
  shadow.adoptedStyleSheets = [sheet]

  return el

  // Placeholder code for learning purposes
  // Will be removed
  function projects_protocol (handshake, send) {
    if (send) return listen
    const PROTOCOL = {
      'toggle_display' : toggle_display
    }
    send = handshake(null, listen)
    function listen (message){
      function format (new_message = {
        head: [from = 'alice', to = 'bob', message_id = 1],
        refs: { cause: message.head }, // reply to received message
        type: 'change_theme',
        data: `.foo { background-color: red; }`
      }) { return new_message }
      console.log(format())
      // const { head, type, data } = message
      // const [by, to, id] = head
      // if (to !== id) return console.error('address unknown', message)
      // const action = PROTOCOL[type] || invalid
      // action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_display ({ head: [to], data: theme }) {
      // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
    }
  }
}
function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .main-wrapper {
      container-type: inline-size;
      .main {
        margin: 0;
        padding: 30px 10px;
        opacity: 1;
        background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
        background-size: 16px 16px;
      }
    }
    @container (min-width: 856px) {
      .main {
        padding-inline: 20px !important;
      }
    }
  `
}
},{"app_footer":9,"app_timeline":12}],48:[function(require,module,exports){
module.exports = tools

const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

function tools (opts, protocol) {
  const name = `tools`
  protocol({ from: name }, listen)
  function listen () {
    tools_wrapper.style.display = 'inline'
  }
  const { data } = opts
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_folder,
    icon_discord,
    icon_github,
  } = img_src
  const el = document.createElement('div')
  const shadow = el.attachShadow ( { mode : 'closed' } )
  shadow.innerHTML = `
    <div class="tools">
      <div class="tools_content">
        <div class="icon">
          ${icon_discord}
          <span>discord link</span>
        </div>
        <div class="icon">
          ${icon_github}
          <span>github link</span>
        </div>
      </div>
    </div>
    <style> ${get_theme()} </style>
  `
  const window = window_bar({
    name:'tools.md', 
    src: icon_folder,
    data: data
  }, tools_protocol)
  const tools_wrapper = shadow.querySelector('.tools')
  tools_wrapper.prepend(window)

  shadow.adoptedStyleSheets = [sheet]
  return el

  // cover protocol
  function tools_protocol (message, send) {
    return listen
    // Listening to toggle event 
    function listen (message) {
      const { head, refs, type, data, meta } = message  
      const PROTOCOL = {
        'toggle_active_state': toggle_active_state
      }
      const action = PROTOCOL[type] || invalid      
      action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
      const { head, refs, type, data, meta } = message
      const {active_state} = data
      ;(active_state === 'active') ? tools_wrapper.style.display = 'none' : ''
    }
  }
}

function get_theme () {
  return`
    * {
      box-sizing: border-box;
    }
    .tools {
      display: none;
      .tools_content {
        position: relative;
        display: flex;
        padding: 10px;
        width: 100vw;
        height: 100vh;
        background-size: 10px 10px;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        gap: 25px;
        margin-bottom: 30px;
        .icon {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          svg {
            width: 50px;
            height: 50px;
          }
        }
      }
    }
    @container (min-width: 510px) {
      .tools {
        .tools_content {
          width: auto;
          height: auto;
        }
      }
    }
  `
}
},{"window_bar":49}],49:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const sm_icon_button_alt = require('buttons/sm_icon_button_alt')
const sm_text_button = require('buttons/sm_text_button')

const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

var id = 0

module.exports = window_bar

function window_bar (opts, protocol) {
  const name = `window_bar-${id++}`
  const { data } = opts
  const send = protocol({ from: name }, listen)
  // Assigning all the icons
  const { img_src } = data
  const {
    icon_close_light, 
    icon_arrow_down_light, 
    icon_arrow_up_light
  } = img_src
  const el = document.createElement('div')
  el.style.lineHeight = '0px'
  const shadow = el.attachShadow({ mode : 'closed' })
  shadow.innerHTML = `
    <div class="window_bar">
      <div class="application_icon_wrapper"></div>
      <div class="application_name"><span>${opts.name}</span></div>
      <div class="window_bar_actions">
        <div class="actions_wrapper"></div>
      </div>
    </div>
    <style>${get_theme()}</style>
  `
  // adding application icon
  const application_icon = sm_icon_button_alt({ src: opts.src })
  const application_icon_wrapper = shadow.querySelector('.application_icon_wrapper')
  application_icon_wrapper.append(application_icon)
  // adding close window button
  const window_bar_actions = shadow.querySelector('.window_bar_actions')
  const close_window_btn = sm_icon_button_alt({ src: icon_close_light })
  // close_window_btn.addEventListener('click', function() {
  //   send( { active_state : 'active' } )
  // })
  close_window_btn.onclick = event => send({
    head: {
      by: name,
      to: 'app_cover_0',
      mid: 0,
    },
    type: 'toggle_active_state', 
    data: { active_state : 'active' } 
  })
  const actions_wrapper = shadow.querySelector('.actions_wrapper')
  if (opts.action_buttons) {
    // adding additional actions wrapper
    opts.action_buttons.forEach((btn_name) => {
      const button = sm_text_button({ text: btn_name })
      actions_wrapper.append(button)
    })
    // adding toggle button for action wrapper
    const actions_toggle_btn = sm_icon_button_alt({
      src: icon_arrow_down_light,
      src_active: icon_arrow_up_light
    }, window_bar_protoocol)
    actions_toggle_btn.classList.add('actions_toggle_btn')
    actions_toggle_btn.addEventListener('click', function () {
      // shadow.querySelector('.window_bar_actions').classList.toggle('active');
    })
    window_bar_actions.append(actions_toggle_btn)
  }
  // Adding icon buttons
  if( opts.icon_buttons) opts.icon_buttons.forEach((btn) => {
    const button = sm_icon_button_alt({ src: btn.icon }, window_bar_protoocol)
    button.onclick = () => send({
      head: {
          by: name,
          to: 'app_cover_0',
          mid: 0,
      },
      type: btn.action, 
      data: {} 
    })
    window_bar_actions.append(button)
  })
  window_bar_actions.append(close_window_btn)
  // window_bar_protoocol
  function window_bar_protoocol (message, send) {
    return listen
  }
  function listen (message) {
    const { head, refs, type, data, meta } = message  
    const PROTOCOL = {
      'toggle_window_active_state': toggle_active_state
    }
    const action = PROTOCOL[type] || invalid      
    action(message)
  }
  function invalid (message) { console.error('invalid type', message) }
  async function toggle_active_state (message) {
    const { head, refs, type, data, meta } = message
    const  {active_state } = data
    // let actions_wrapper
    ;( active_state)?actions_wrapper.style.display = 'none':actions_wrapper.style.display = 'flex'
  }
  shadow.adoptedStyleSheets = [sheet]

  return el

}
function get_theme () {
  return `
    .window_bar {
      position: relative;
      z-index: 2;
      height: 30px;
      background-color: var(--primary_color);
      display: inline-flex;
      width: 100%;
      justify-content: flex-start;
      background-size: 5px 5px;
      background-image: repeating-linear-gradient(0deg, var(--bg_color), var(--bg_color) 2px, var(--primary_color) 2px, var(--primary_color));
      container-type: inline-size;
      border: 1px solid var(--primary_color);
      box-sizing: border-box;
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
      .window_bar_actions {
        margin-left: auto;
        display: flex;
        &.active {
          .actions_wrapper {
            display: flex;
          }
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
      }
    }
    @container (min-width: 856px) {
      .window_bar {
        .window_bar_actions {
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
      }
    }
  `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/window_bar")
},{"_process":2,"buttons/sm_icon_button_alt":19,"buttons/sm_text_button":20,"path":1}],50:[function(require,module,exports){
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0

module.exports = year_filter

function year_filter (opts, protocol) {
    const { latest_date } = opts
    const name = 'year_filter-' + id++
    const notify = protocol({ from: name }, listen)
    const el = document.createElement('div')
    const shadow = el.attachShadow({ mode: 'closed' })
    shadow.innerHTML = `
      <div class="year_wrapper"></div>
      <style>${get_theme()}</style>
    `
    let active_state = ''
    const year_buttons = {}
    const year_wrapper = shadow.querySelector('.year_wrapper')
    for (let i = 2013; i <= 2023; i++) {
      const year_button = document.createElement('span')
      year_button.classList.add('year_button')
      year_button.innerHTML = i.toString()
      year_button.onclick = toggle_active_state
      year_buttons[i.toString()] = year_button
      year_wrapper.append(year_button)
    }
  const year = new Date(latest_date).getFullYear()
  on_active_state(year)
  shadow.adoptedStyleSheets = [sheet]
  
  return el

  function toggle_active_state (e) {
    if (active_state)
      year_buttons[active_state].classList.toggle('active')
    if (active_state === e.target.innerHTML)
      active_state = ''
    else {
      active_state = e.target.innerHTML
      e.target.classList.toggle('active')
    }
    notify({
      head: { by: name, to: 'app_timeline', mid: 0 },
      type: 'setScroll',
      data: { value: active_state, filter: 'YEAR' }
    })
  }
  function on_active_state (year_button) {
    if (active_state) year_buttons[active_state].classList.remove('active')
    year_buttons[year_button].classList.add('active')
    active_state = year_button
  }
  function listen (message) {
    const { head,  refs, type, data, meta } = message
    const { by, to, mid } = head
    on_active_state(data)
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
      .year_button {
        display: block;
        text-align: center;
        background-color: var(--bg_color);
        border: 1px solid var(--primary_color);
        padding: 4px 10px;
        cursor: pointer;
        &.active {
          background-color: var(--ac-1);
          color: var(--primary_color);
        }
      }
    }
  `
}
},{}]},{},[5]);
