(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var Engine = require('json-rules-engine-simplified');
//import Engine from 'json-rules-engine-simplified'

function getRulesEngine(rules, facts) {
	return Engine.default;
}
window.getRulesEngine = getRulesEngine;

},{"json-rules-engine-simplified":13}],2:[function(require,module,exports){
'use strict';

/*!
 * exports.
 */

module.exports = brackets2dots;

/*!
 * regexp patterns.
 */

var REPLACE_BRACKETS = /\[([^\[\]]+)\]/g;
var LFT_RT_TRIM_DOTS = /^[.]*|[.]*$/g;

/**
 * Convert string with bracket notation to dot property notation.
 *
 * ### Examples:
 *
 *      brackets2dots('group[0].section.a.seat[3]')
 *      //=> 'group.0.section.a.seat.3'
 *
 *      brackets2dots('[0].section.a.seat[3]')
 *      //=> '0.section.a.seat.3'
 *
 *      brackets2dots('people[*].age')
 *      //=> 'people.*.age'
 *
 * @param  {String} string
 * original string
 *
 * @return {String}
 * dot/bracket-notation string
 */

function brackets2dots(string) {
  return {}.toString.call(string) == '[object String]' ? string.replace(REPLACE_BRACKETS, '.$1').replace(LFT_RT_TRIM_DOTS, '') : '';
}

},{}],3:[function(require,module,exports){
'use strict';

/*!
 * imports.
 */

var bind = Function.prototype.bind || require('fast-bind');

/*!
 * exports.
 */

module.exports = curry2;

/**
 * Curry a binary function.
 *
 * @param {Function} fn
 * Binary function to curry.
 *
 * @param {Object} [self]
 * Function `this` context.
 *
 * @return {Function|*}
 * If partially applied, return unary function, otherwise, return result of full application.
 */

function curry2(fn, self) {
  var out = function out() {
    if (arguments.length === 0) return out;

    return arguments.length > 1 ? fn.apply(self, arguments) : bind.call(fn, self, arguments[0]);
  };

  out.uncurry = function uncurry() {
    return fn;
  };

  return out;
}

},{"fast-bind":7}],4:[function(require,module,exports){
(function (process){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();

/**
 * Colors.
 */

exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) ||
  // is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 ||
  // double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === (typeof console === 'undefined' ? 'undefined' : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch (e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch (e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":5,"_process":22}],5:[function(require,module,exports){
'use strict';

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0,
      i;

  for (i in namespace) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":16}],6:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString;

/**
 * Transform dot-delimited strings to array of strings.
 *
 * @param  {String} string
 * Dot-delimited string.
 *
 * @return {Array}
 * Array of strings.
 */

function dotsplit(string) {
  var idx = -1;
  var str = compact(normalize(string).split('.'));
  var end = str.length;
  var out = [];

  while (++idx < end) {
    out.push(todots(str[idx]));
  }

  return out;
}

/**
 * Replace escapes with a placeholder.
 *
 * @param  {String} string
 * Dot-delimited string.
 *
 * @return {String}
 * Dot-delimited string with placeholders in place of escapes.
 */

function normalize(string) {
  return (toString.call(string) === '[object String]' ? string : '').replace(/\\\./g, '\uFFFF');
}

/**
 * Drop empty values from array.
 *
 * @param  {Array} array
 * Array of strings.
 *
 * @return {Array}
 * Array of strings (empty values dropped).
 */

function compact(arr) {
  var idx = -1;
  var end = arr.length;
  var out = [];

  while (++idx < end) {
    if (arr[idx]) out.push(arr[idx]);
  }

  return out;
}

/**
 * Change placeholder to dots.
 *
 * @param  {String} string
 * Dot-delimited string with placeholders.
 *
 * @return {String}
 * Dot-delimited string without placeholders.
 */

function todots(string) {
  return string.replace(/\uffff/g, '.');
}

/*!
 * exports.
 */

module.exports = dotsplit;

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function (boundThis) {
  var f = this,
      _ret2;

  if (arguments.length < 2) _ret2 = function ret() {
    if (this instanceof _ret2) {
      var ret_ = f.apply(this, arguments);
      return Object(ret_) === ret_ ? ret_ : this;
    } else return f.apply(boundThis, arguments);
  };else {
    var boundArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      boundArgs[i - 1] = arguments[i];
    }_ret2 = function _ret() {
      var boundLen = boundArgs.length,
          args = new Array(boundLen + arguments.length),
          i;
      for (i = 0; i < boundLen; i++) {
        args[i] = boundArgs[i];
      }for (i = 0; i < arguments.length; i++) {
        args[boundLen + i] = arguments[i];
      }if (this instanceof _ret2) {
        var ret_ = f.apply(this, args);
        return Object(ret_) === ret_ ? ret_ : this;
      } else return f.apply(boundThis, args);
    };
  }

  _ret2.prototype = f.prototype;
  return _ret2;
};

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validation = require("./validation");

var _applicableActions = require("./applicableActions");

var _applicableActions2 = _interopRequireDefault(_applicableActions);

var _utils = require("./utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var validate = function validate(schema) {
  var isSchemaDefined = schema !== undefined && schema !== null;
  if ((0, _utils.isDevelopment)() && isSchemaDefined) {
    if (!(0, _utils.isObject)(schema)) {
      (0, _utils.toError)("Expected valid schema object, but got - " + schema);
    }
    return function (rule) {
      (0, _validation.validatePredicates)([rule.conditions], schema);
      (0, _validation.validateConditionFields)([rule.conditions], schema);
    };
  } else {
    return function () {};
  }
};

var Engine = function Engine(rules, schema) {
  var _this = this;

  _classCallCheck(this, Engine);

  this.addRule = function (rule) {
    _this.validate(rule);
    _this.rules.push(rule);
  };

  this.run = function (formData) {
    return Promise.resolve((0, _applicableActions2.default)(_this.rules, formData));
  };

  this.rules = [];
  this.validate = validate(schema);

  if (rules) {
    (0, _utils.toArray)(rules).forEach(function (rule) {
      return _this.addRule(rule);
    });
  }
};

exports.default = Engine;

},{"./applicableActions":9,"./utils":14,"./validation":15}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applicableActions;

var _utils = require("./utils");

var _conditionsMeet = require("./conditionsMeet");

var _conditionsMeet2 = _interopRequireDefault(_conditionsMeet);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function applicableActions(rules, formData) {
  return (0, _utils.flatMap)(rules, function (_ref) {
    var conditions = _ref.conditions,
        event = _ref.event;

    if ((0, _conditionsMeet2.default)(conditions, formData)) {
      return (0, _utils.toArray)(event);
    } else {
      return [];
    }
  });
}

},{"./conditionsMeet":11,"./utils":14}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkField;

var _predicate = require("predicate");

var _predicate2 = _interopRequireDefault(_predicate);

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var doCheckField = function doCheckField(fieldVal, rule) {
  if ((0, _utils.isObject)(rule)) {
    return Object.keys(rule).every(function (p) {
      var subRule = rule[p];
      if (p === _constants.OR || p === _constants.AND) {
        if (Array.isArray(subRule)) {
          if (p === _constants.OR) {
            return subRule.some(function (rule) {
              return doCheckField(fieldVal, rule);
            });
          } else {
            return subRule.every(function (rule) {
              return doCheckField(fieldVal, rule);
            });
          }
        } else {
          return false;
        }
      } else if (p === _constants.NOT) {
        return !doCheckField(fieldVal, subRule);
      } else if (_predicate2.default[p]) {
        return _predicate2.default[p](fieldVal, subRule);
      } else {
        return false;
      }
    });
  } else {
    return _predicate2.default[rule](fieldVal);
  }
};

function checkField(fieldVal, rule) {
  return doCheckField(fieldVal, rule);
}

},{"./constants":12,"./utils":14,"predicate":17}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRelCondition = toRelCondition;
exports.default = conditionsMeet;

var _utils = require("./utils");

var _checkField = require("./checkField");

var _checkField2 = _interopRequireDefault(_checkField);

var _constants = require("./constants");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function toRelCondition(refCondition, formData) {
  if (Array.isArray(refCondition)) {
    return refCondition.map(function (cond) {
      return toRelCondition(cond, formData);
    });
  } else if ((0, _utils.isObject)(refCondition)) {
    return Object.keys(refCondition).reduce(function (agg, field) {
      agg[field] = toRelCondition(refCondition[field], formData);
      return agg;
    }, {});
  } else if (typeof refCondition === "string" && refCondition.startsWith("$")) {
    return (0, _utils.selectRef)(refCondition.substr(1), formData);
  } else {
    return refCondition;
  }
}

function conditionsMeet(condition, formData) {
  if (!(0, _utils.isObject)(condition) || !(0, _utils.isObject)(formData)) {
    (0, _utils.toError)("Rule " + JSON.stringify(condition) + " with " + formData + " can't be processed");
    return false;
  }
  return Object.keys(condition).every(function (ref) {
    var refCondition = condition[ref];
    if (ref === _constants.OR) {
      return refCondition.some(function (rule) {
        return conditionsMeet(rule, formData);
      });
    } else if (ref === _constants.AND) {
      return refCondition.every(function (rule) {
        return conditionsMeet(rule, formData);
      });
    } else if (ref === _constants.NOT) {
      return !conditionsMeet(refCondition, formData);
    } else {
      var refVal = (0, _utils.selectRef)(ref, formData);
      if (Array.isArray(refVal)) {
        var condMeatOnce = refVal.some(function (val) {
          return (0, _utils.isObject)(val) ? conditionsMeet(refCondition, val) : false;
        });
        // It's either true for an element in an array or for the whole array
        return condMeatOnce || (0, _checkField2.default)(refVal, toRelCondition(refCondition, formData));
      } else {
        return (0, _checkField2.default)(refVal, toRelCondition(refCondition, formData));
      }
    }
  });
}

},{"./checkField":10,"./constants":12,"./utils":14}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var OR = exports.OR = "or";
var AND = exports.AND = "and";
var NOT = exports.NOT = "not";

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Engine = require("./Engine");

var _Engine2 = _interopRequireDefault(_Engine);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.default = _Engine2.default;

},{"./Engine":8}],14:[function(require,module,exports){
(function (process){
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatMap = undefined;

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

exports.normRef = normRef;
exports.selectRef = selectRef;
exports.isObject = isObject;
exports.isDevelopment = isDevelopment;
exports.toArray = toArray;
exports.toError = toError;
exports.isRefArray = isRefArray;
exports.extractRefSchema = extractRefSchema;

var _selectn = require("selectn");

var _selectn2 = _interopRequireDefault(_selectn);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function normRef(ref) {
  return ref.replace(/\$/g, ".");
}

function selectRef(field, formData) {
  var ref = normRef(field);
  return (0, _selectn2.default)(ref, formData);
}

function isObject(obj) {
  return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null;
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function toArray(event) {
  if (Array.isArray(event)) {
    return event;
  } else {
    return [event];
  }
}

function toError(message) {
  if (isDevelopment()) {
    throw new ReferenceError(message);
  } else {
    console.error(message);
  }
}

function isRefArray(field, schema) {
  return schema.properties[field] && schema.properties[field].type === "array" && schema.properties[field].items && schema.properties[field].items["$ref"];
}

function fetchSchema(ref, schema) {
  if (ref.startsWith("#/")) {
    return ref.substr(2).split("/").reduce(function (schema, field) {
      return schema[field];
    }, schema);
  } else {
    toError("Only local references supported at this point use json-schema-deref");
    return undefined;
  }
}

function extractRefSchema(field, schema) {
  var properties = schema.properties;

  if (!properties || !properties[field]) {
    toError(field + " not defined in properties");
    return undefined;
  } else if (properties[field].type === "array") {
    if (isRefArray(field, schema)) {
      return fetchSchema(properties[field].items["$ref"], schema);
    } else {
      return properties[field].items;
    }
  } else if (properties[field] && properties[field]["$ref"]) {
    return fetchSchema(properties[field]["$ref"], schema);
  } else if (properties[field] && properties[field].type === "object") {
    return properties[field];
  } else {
    toError(field + " has no $ref field ref schema extraction is impossible");
    return undefined;
  }
}

var concat = function concat(x, y) {
  return x.concat(y);
};
var flatMap = exports.flatMap = function flatMap(xs, f) {
  return xs.map(f).reduce(concat, []);
};

}).call(this,require('_process'))
},{"_process":22,"selectn":23}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.predicatesFromRule = predicatesFromRule;
exports.predicatesFromCondition = predicatesFromCondition;
exports.listAllPredicates = listAllPredicates;
exports.listInvalidPredicates = listInvalidPredicates;
exports.validatePredicates = validatePredicates;
exports.fieldsFromPredicates = fieldsFromPredicates;
exports.fieldsFromCondition = fieldsFromCondition;
exports.listAllFields = listAllFields;
exports.listInvalidFields = listInvalidFields;
exports.validateConditionFields = validateConditionFields;

var _predicate = require("predicate");

var _predicate2 = _interopRequireDefault(_predicate);

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

var UNSUPPORTED_PREDICATES = ["and", "or", "ternary", "every", "some", "curry", "partial", "complement", "mod"];

function predicatesFromRule(rule, schema) {
  if ((0, _utils.isObject)(rule)) {
    return (0, _utils.flatMap)(Object.keys(rule), function (p) {
      var comparable = rule[p];
      if ((0, _utils.isObject)(comparable) || p === _constants.NOT) {
        if (p === _constants.OR || p === _constants.AND) {
          if (Array.isArray(comparable)) {
            return (0, _utils.flatMap)(comparable, function (condition) {
              return predicatesFromRule(condition, schema);
            });
          } else {
            (0, _utils.toError)("\"" + p + "\" must be an array");
            return [];
          }
        } else {
          var predicates = predicatesFromRule(comparable, schema);
          predicates.push(p);
          return predicates;
        }
      } else {
        return predicatesFromRule(p, schema);
      }
    });
  } else {
    return [rule];
  }
}

function predicatesFromCondition(condition, schema) {
  return (0, _utils.flatMap)(Object.keys(condition), function (ref) {
    var refVal = condition[ref];
    ref = (0, _utils.normRef)(ref);
    if (ref === _constants.OR || ref === _constants.AND) {
      if (Array.isArray(refVal)) {
        return (0, _utils.flatMap)(refVal, function (c) {
          return predicatesFromCondition(c, schema);
        });
      } else {
        (0, _utils.toError)(ref + " with " + JSON.stringify(refVal) + " must be an Array");
        return [];
      }
    } else if (ref === _constants.NOT) {
      return predicatesFromCondition(refVal, schema);
    } else if (ref.indexOf(".") !== -1) {
      var separator = ref.indexOf(".");
      var schemaField = ref.substr(0, separator);
      var subSchema = (0, _utils.extractRefSchema)(schemaField, schema);

      if (subSchema) {
        var subSchemaField = ref.substr(separator + 1);
        var newCondition = _defineProperty({}, subSchemaField, refVal);
        return predicatesFromCondition(newCondition, subSchema);
      } else {
        (0, _utils.toError)("Can't find schema for " + schemaField);
        return [];
      }
    } else if ((0, _utils.isRefArray)(ref, schema)) {
      var refSchema = (0, _utils.extractRefSchema)(ref, schema);
      return refSchema ? predicatesFromCondition(refVal, refSchema) : [];
    } else if (schema.properties[ref]) {
      return predicatesFromRule(refVal, schema);
    } else {
      (0, _utils.toError)("Can't validate " + ref);
      return [];
    }
  });
}

function listAllPredicates(conditions, schema) {
  var allPredicates = (0, _utils.flatMap)(conditions, function (condition) {
    return predicatesFromCondition(condition, schema);
  });
  return allPredicates.filter(function (v, i, a) {
    return allPredicates.indexOf(v) === i;
  });
}

function listInvalidPredicates(conditions, schema) {
  var refPredicates = listAllPredicates(conditions, schema);
  return refPredicates.filter(function (p) {
    return UNSUPPORTED_PREDICATES.includes(p) || _predicate2.default[p] === undefined;
  });
}

function validatePredicates(conditions, schema) {
  var invalidPredicates = listInvalidPredicates(conditions, schema);
  if (invalidPredicates.length !== 0) {
    (0, _utils.toError)("Rule contains invalid predicates " + invalidPredicates);
  }
}

function fieldsFromPredicates(predicate) {
  if (Array.isArray(predicate)) {
    return (0, _utils.flatMap)(predicate, fieldsFromPredicates);
  } else if ((0, _utils.isObject)(predicate)) {
    return (0, _utils.flatMap)(Object.keys(predicate), function (field) {
      var predicateValue = predicate[field];
      return fieldsFromPredicates(predicateValue);
    });
  } else if (typeof predicate === "string" && predicate.startsWith("$")) {
    return [predicate.substr(1)];
  } else {
    return [];
  }
}

function fieldsFromCondition(condition) {
  return (0, _utils.flatMap)(Object.keys(condition), function (ref) {
    var refCondition = condition[ref];
    if (ref === _constants.OR || ref === _constants.AND) {
      return (0, _utils.flatMap)(refCondition, fieldsFromCondition);
    } else if (ref === _constants.NOT) {
      return fieldsFromCondition(refCondition);
    } else {
      return [(0, _utils.normRef)(ref)].concat(fieldsFromPredicates(refCondition));
    }
  });
}

function listAllFields(conditions) {
  var allFields = (0, _utils.flatMap)(conditions, fieldsFromCondition);
  return allFields.filter(function (field) {
    return field.indexOf(".") === -1;
  }).filter(function (v, i, a) {
    return allFields.indexOf(v) === i;
  });
}

function listInvalidFields(conditions, schema) {
  var allFields = listAllFields(conditions);
  return allFields.filter(function (field) {
    return schema.properties[field] === undefined;
  });
}

function validateConditionFields(conditions, schema) {
  var invalidFields = listInvalidFields(conditions, schema);
  if (invalidFields.length !== 0) {
    (0, _utils.toError)("Rule contains invalid fields " + invalidFields);
  }
}

},{"./constants":12,"./utils":14,"predicate":17}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],17:[function(require,module,exports){
'use strict';

var utils = require('./lib/utils');
var predicate = {};
predicate.VERSION = '1.0.0';

[utils, require('./lib/predicates'), require('./lib/chain'), require('./lib/other')].reduce(utils.assign, predicate);

module.exports = predicate;

},{"./lib/chain":18,"./lib/other":19,"./lib/predicates":20,"./lib/utils":21}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var predicates = require('./predicates');
var predicate = module.exports;

// chaining mixin

var Lazy = function () {
  function Lazy() {
    _classCallCheck(this, Lazy);

    this.lazy = [];
  }

  _createClass(Lazy, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.val();
    }
  }, {
    key: 'val',
    value: function val() {
      return this.lazy[this.method](function (args) {
        return args[0].apply(null, args[1]);
      });
    }
  }]);

  return Lazy;
}();

var Every = function (_Lazy) {
  _inherits(Every, _Lazy);

  function Every() {
    _classCallCheck(this, Every);

    var _this = _possibleConstructorReturn(this, (Every.__proto__ || Object.getPrototypeOf(Every)).call(this));

    _this.method = 'every';
    return _this;
  }

  return Every;
}(Lazy);

var Some = function (_Lazy2) {
  _inherits(Some, _Lazy2);

  function Some() {
    _classCallCheck(this, Some);

    var _this2 = _possibleConstructorReturn(this, (Some.__proto__ || Object.getPrototypeOf(Some)).call(this));

    _this2.method = 'some';
    return _this2;
  }

  return Some;
}(Lazy);

// Extend chaining methods onto the prototypes


[Every, Some].forEach(function (cls) {
  Object.keys(predicates).reduce(function (proto, fnName) {
    if (!predicates.fn(predicates[fnName])) return proto;

    proto[fnName] = function () {
      this.lazy.push([predicates[fnName], arguments]);
      return this;
    };

    return proto;
  }, cls.prototype);
});

predicate.all = predicate.every = function () {
  return new Every();
};

predicate.any = predicate.some = function () {
  return new Some();
};

},{"./predicates":20}],19:[function(require,module,exports){
'use strict';

var predicates = require('./predicates');
var utils = require('./utils');
var predicate = module.exports;

predicate.ternary = function (pred, a, b) {
  if (predicates.bool(pred)) return pred ? a : b;
  if (predicates.undef(a)) return utils.partial(predicate.ternary, pred);
  if (predicates.undef(b)) return utils.partial(predicate.ternary, pred, a);
  return predicate.ternary(pred(a, b), a, b);
};

var _every = Array.prototype.every;
var _some = Array.prototype.some;

predicate.and = function () {
  var predicates = arguments;

  return function _and(val) {
    return _every.call(predicates, function (p) {
      return p(val);
    });
  };
};

predicate.or = function () {
  var predicates = arguments;

  return function _or(val) {
    return _some.call(predicates, function (p) {
      return p(val);
    });
  };
};

},{"./predicates":20,"./utils":21}],20:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = require('./utils');
var predicate = module.exports;

var curry = utils.curry;

if (Object.is) {
  predicate.is = curry(Object.is);
} else {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
  predicate.is = curry(function (v1, v2) {
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    if (v1 !== v1) {
      return v2 !== v2;
    }
    return v1 === v2;
  });
}

predicate.exists = function (val) {
  return val != null;
};

predicate.truthy = function (val) {
  // coerce for null != null
  return !!(val && predicate.exists(val));
};

predicate.falsey = utils.complement(predicate.truthy);

//---- value comparision methods

predicate.equal = curry(function (a, b) {
  return a === b;
});

predicate.eq = curry(function (a, b) {
  return a == b;
});

predicate.null = predicate.equal(null);
predicate.undef = predicate.equal(undefined);

predicate.lt = predicate.less = curry(function (a, b) {
  return a < b;
});

predicate.ltEq = predicate.le = predicate.lessEq = curry(function (a, b) {
  return predicate.equal(a, b) || predicate.less(a, b);
});

predicate.gt = predicate.greater = curry(function (a, b) {
  return a > b;
});

predicate.gtEq = predicate.ge = predicate.greaterEq = curry(function (a, b) {
  return predicate.equal(a, b) || predicate.greater(a, b);
});

// --- Type checking predicates

// Forces objects toString called returned as [object Object] for instance
var __toString = Object.prototype.toString;
var eqToStr = curry(function (str, val) {
  return predicate.equal(str, __toString.call(val));
});

//---- Object type checks

predicate.object = predicate.obj = function (val) {
  return val === Object(val);
};

predicate.array = predicate.arr = Array.isArray || eqToStr('[object Array]');
predicate.date = eqToStr('[object Date]');
predicate.regex = predicate.regexp = predicate.rgx = predicate.RegExp = eqToStr('[object RegExp]');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
predicate.finite = Number.isFinite || function (val) {
  return predicate.number(val) && isFinite(val);
};

predicate.nan = predicate.NaN = predicate.is(NaN);

predicate.instance = curry(function (Cls, inst) {
  return inst instanceof Cls;
});

predicate.arguments = eqToStr('[object Arguments]');
predicate.error = predicate.instance(Error);

// creates fns for predicate.string, etc
var typeofBuilder = curry(function (type, val) {
  return predicate.equal(type, typeof val === 'undefined' ? 'undefined' : _typeof(val));
});

//--- Create typeof methods

// type of string and alias name
// predicate.fn, predicate.num, etc
[['function', 'fn'], ['string', 'str'], ['boolean', 'bool']].reduce(function (predicate, type) {
  predicate[type[0]] = predicate[type[1]] = typeofBuilder(type[0]);
  return predicate;
}, predicate);

predicate.number = predicate.num = function (val) {
  return typeof val === 'number' && predicate.not.NaN(val);
};

predicate.int = function (val) {
  return predicate.num(val) && predicate.zero(utils.mod(val, 1));
};

predicate.pos = function (val) {
  return predicate.num(val) && predicate.greater(val, 0);
};

predicate.neg = function (val) {
  return predicate.num(val) && predicate.less(val, 0);
};

predicate.zero = function (val) {
  return predicate.num(val) && predicate.equal(val, 0);
};

predicate.even = function (val) {
  return predicate.num(val) && predicate.not.zero(val) && predicate.zero(utils.mod(val, 2));
};

predicate.odd = function (val) {
  return predicate.num(val) && predicate.not.zero(val) && predicate.not.zero(utils.mod(val, 2));
};

predicate.contains = predicate.includes = curry(function (arrOrString, val) {
  if (!predicate.array(arrOrString) && !predicate.string(arrOrString)) {
    throw new TypeError('Expected an array or string');
  }

  if (predicate.string(arrOrString) && !predicate.string(val)) {
    return false;
  }

  if (predicate.NaN(val)) {
    return arrOrString.some(predicate.NaN);
  }

  return !!~arrOrString.indexOf(val);
});

var __has = Object.prototype.hasOwnProperty;
predicate.has = curry(function (o, key) {
  return __has.call(o, key);
});

predicate.empty = function (o) {
  if (predicate.not.exists(o)) return true;
  if (predicate.arr(o) || predicate.str(o)) return !o.length;
  if (predicate.obj(o)) {
    for (var k in o) {
      if (predicate.has(o, k)) return false;
    }return true;
  }
  throw new TypeError();
};

predicate.primitive = function (val) {
  return predicate.string(val) || predicate.num(val) || predicate.bool(val) || predicate.null(val) || predicate.undef(val) || predicate.NaN(val);
};

predicate.matches = curry(function (rgx, val) {
  return rgx.test(val);
});

// Assign inverse of each predicate
predicate.not = Object.keys(predicate).reduce(function (acc, fnName) {
  acc[fnName] = utils.complement(predicate[fnName]);
  return acc;
}, {});

},{"./utils":21}],21:[function(require,module,exports){
'use strict';

var predicate = module.exports;
var _slice = Array.prototype.slice;

// Useful for debuging curried functions
var setSrc = function setSrc(curried, src) {
  curried.toString = function () {
    return src.toString();
  };
  curried.src = src;
  return curried;
};

// Curry's fn's with arity 2
var curry = predicate.curry = function (f) {
  return setSrc(function curried(a, b) {
    switch (arguments.length) {
      case 0:
        throw new TypeError('Function called with no arguments');
      case 1:
        return setSrc(function (b) {
          return f(a, b);
        }, f);
    }

    return f(a, b);
  }, f);
};

// TODO: es6ing this breaks!
predicate.partial = function (fn) {
  var args = _slice.call(arguments, 1);
  return function () {
    return fn.apply(null, args.concat(_slice.call(arguments)));
  };
};

predicate.complement = predicate.invert = function (pred) {
  return function () {
    var ret = pred.apply(null, arguments);
    // Handle curried fns
    if (typeof ret === 'function') return predicate.complement(ret);
    return !ret;
  };
};

predicate.mod = curry(function (a, b) {
  return a % b;
});

// assign b's props to a
predicate.assign = curry(Object.assign || function (a, b) {
  // use crummy for/in for perf purposes
  for (var prop in b) {
    if (b.hasOwnProperty(prop)) {
      a[prop] = b[prop];
    }
  }

  return a;
});

},{}],22:[function(require,module,exports){
'use strict';

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
function defaultClearTimeout() {
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
})();
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
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
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
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e) {
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
    while (len) {
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

process.listeners = function (name) {
    return [];
};

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

},{}],23:[function(require,module,exports){
'use strict';

var curry2 = require('curry2');
var debug = require('debug')('selectn');
var dotted = require('brackets2dots');
var splits = require('dotsplit.js');
var string = Object.prototype.toString;

module.exports = curry2(selectn);

/**
 * Curried property accessor function that resolves deeply-nested object properties via dot/bracket-notation
 * string path while mitigating `TypeErrors` via friendly and composable API.
 *
 * @param {String|Array} path
 * Dot/bracket-notation string path or array.
 *
 * @param {Object} object
 * Object to access.
 *
 * @return {Function|*|undefined}
 * (1) returns `selectn/1` when partially applied.
 * (2) returns value at path if path exists.
 * (3) returns undefined if path does not exist.
 */
function selectn(path, object) {
  debug('arguments:', {
    path: path,
    object: object
  });

  var idx = -1;
  var seg = string.call(path) === '[object Array]' ? path : splits(dotted(path));
  var end = seg.length;
  var ref = end ? object : void 0;

  while (++idx < end) {
    if (Object(ref) !== ref) return void 0;
    ref = ref[seg[idx]];
  }

  debug('ref:', ref);
  return typeof ref === 'function' ? ref() : ref;
}

},{"brackets2dots":2,"curry2":3,"debug":4,"dotsplit.js":6}]},{},[1]);
