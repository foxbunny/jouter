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

  // parseRoute :: String -> RegExp
  var routeRe = exports.routeRe = function routeRe(x) {
    return new RegExp('^' + x.replace(TOKEN_RE, '([^/]+)').replace(ANY_RE, '.*') + '$');
  };

  // route :: (* -> *), String -> Route -> (String -> _)
  var route = exports.route = function route(f, r) {
    var re = routeRe(r);
    return function (path) {
      var match = re.exec(path);
      if (!match) return;
      f.apply(undefined, _toConsumableArray(match.slice(1)));
    };
  };

  var createRouter = exports.createRouter = function createRouter() {
    var routes = [];

    var add = function add(f, r) {
      return routes.push(route(f, r));
    };
    var dispatch = function dispatch() {
      return routes.forEach(function (x) {
        return x(window.location.pathname);
      });
    };
    var go = function go(path, title) {
      window.history.pushState(undefined, title, path);
      dispatch();
    };
    var handleEvent = function handleEvent(e) {
      e.preventDefault();
      go(e.target.href, e.target.title);
    };
    var start = function start() {
      window.onpopstate = dispatch;
      dispatch();
    };

    return { add: add, go: go, handleEvent: handleEvent, start: start };
  };
});
