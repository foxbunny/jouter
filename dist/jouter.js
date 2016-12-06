(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var TOKEN_RE = /:[^\/]+/g;

// parseRoute :: String -> RegExp
var routeRe = exports.routeRe = function routeRe(x) {
  return new RegExp('^' + x.replace(TOKEN_RE, '([^/]+)') + '$');
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
      return x(window.location.path);
    });
  };
  var go = function go(path, title) {
    window.history.pushState(path, undefined, title);
    dispatch();
  };
  var handleEvent = function handleEvent(e) {
    e.preventDefault();
    go(e.target.href, e.target.title);
  };

  window.onpopstate = dispatch;
  dispatch();

  return { add: add, go: go, handleEvent: handleEvent };
};

},{}]},{},[1]);
