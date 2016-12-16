(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.jouter = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var TOKEN_RE = /:[^\/]+/g;
  var ANY_RE = /\*/g;
  var SUBPATH_RE = /\/\.\.\./g;

  var regexify = exports.regexify = function regexify(x) {
    return x.replace(TOKEN_RE, '([^/]+)').replace(ANY_RE, '.*').replace(SUBPATH_RE, '(\/.*)');
  };

  // parseRoute :: String | RegExp -> RegExp
  var routeRe = exports.routeRe = function routeRe(x) {
    return x instanceof RegExp ? new RegExp(x.source) : new RegExp('^' + regexify(x) + '$');
  };

  // route ::  (* -> *), String -> (String -> _)
  var route = exports.route = function route(f, r) {
    var re = routeRe(r);
    return function (path) {
      var match = re.exec(path);
      if (!match) return;
      f.apply(undefined, _toConsumableArray(match.slice(1)));
    };
  };

  // Unsafe functions
  var pathHandler = exports.pathHandler = {
    // get :: _ -> String
    get: function get() {
      return window.location.pathname;
    },

    // set :: (path, title) -> _
    set: function set(path, title) {
      return window.history.pushState(undefined, title, path);
    },

    // listen :: (* -> *) -> _
    listen: function listen(f) {
      return window.onpopstate = f;
    },

    // decorate :: (* -> *) -> (* -> *)
    decorate: function decorate(f) {
      return f;
    }
  };

  var createRouter = exports.createRouter = function createRouter() {
    var myPathHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var routes = [];
    var path = _extends({}, pathHandler, myPathHandler);

    var add = function add(f, r) {
      return routes.push(route(path.decorate(f), r));
    };

    var dispatch = function dispatch(p) {
      return routes.forEach(function (f) {
        return f(p);
      });
    };

    var go = function go(p, t) {
      path.set(p, t);
      dispatch(path.get());
    };

    var handleEvent = function handleEvent(e) {
      e.preventDefault();
      go(e.target.href, e.target.title);
    };

    var start = function start() {
      path.listen(dispatch);
      dispatch(path.get());
    };

    var dispatchRoutes = function dispatchRoutes(subpath) {
      return dispatch(subpath);
    };

    dispatchRoutes.add = add;
    dispatchRoutes.go = go;
    dispatchRoutes.handleEvent = handleEvent;
    dispatchRoutes.start = start;

    return dispatchRoutes;
  };
});
