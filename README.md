# Jouter

Jouter is a minimalist client-side routing library. It's main advantage
compared to some of the other libraries that do similar things is its
extremely small footprint (around 1KB minified and gzipped).

[![Build Status](https://travis-ci.org/foxbunny/jouter.svg?branch=master)](https://travis-ci.org/foxbunny/jouter)
[![codecov](https://codecov.io/gh/foxbunny/jouter/branch/master/graph/badge.svg)](https://codecov.io/gh/foxbunny/jouter)
[![npm version](https://badge.fury.io/js/jouter.svg)](https://badge.fury.io/js/jouter)

## Installation and usage

Jouter is written as an ES6 module. The compiled version is available in the
`dist` directory in the source tree. The compiled version uses the
[UMD module format](https://github.com/umdjs/umd/blob/master/README.md), so
it can be used with AMD and CommonJS loaders, or as `jouter` browser global
when added to your project with a simple `<script>` tag.

You can also install Jouter using `npm`:

```shell
npm install --save jouter
```

## Basic usage

Before you can do anything with Jouter, you need to create a router object.

```javascript
var router = jouter.createRouter()
```

Once you have your router object, you can start adding route handlers.

```javascript
router.add(function (x) {
  console.log('Hello, ' + x)
}, '/hello/:name')
```

The routes can contain capturing and/or wildcard placeholders.

The capturing placeholders use the `:NAME` format where `NAME` can be any
arbitrary string that does not include a slash (including whitespace
characters). The name has no special meaning except to document the purpose
of the placeholder, and the captured strings will be passed to the handler as
positional arguments.

Wildcard placeholders are written as a single `*` character, and will swallow
any number of characters including slashes.

Alternatively, a `RegExp` object can be used directly as a route:

```javascript
router.add(function (x) {
  console.log(x)
}, /^\/user\/(?:add|remove)\/([0-9a-f]{7})$/)
```

**NOTE:** When using a `RegExp` object as a route, flags are ignored. For
instance, `/foo/gi` would be interpreted as `/foo/`.

You can also use ellipsis pattern to match *and* capture sub paths. For
instance:

```javascript
router.add(function (sub) {
  // Sub will be any portion of the path after /foo
}, '/foo/...')
```

Note that the pattern is `/...`, not just `...`. The slash after the prefix
`/foo` is included in the match. This pattern is especially useful for working
with sub routes which are discussed further below.

You can add multiple handlers for the same route.

Once you've added all the routes, you can start the router:

```javascript
router.start()
```

This will add a [`popstate`
event](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) handler
and trigger the handlers for the current path.

You can cause the browser to go to another path by using the `go()` method.

```javascript
router.go('/some/path', 'Target path title')
```

**NOTE:** The second parameter, title, is ignored in at least some of the
mainstream browsers. It is recommended that you specify the title anyway, as
the specs allow for it, and it may be supported in future.

You can also rig elements to trigger routing on events using
`router.handleEvent` function as the event handler. The target path is  derived
from the `href` attribute of the element so this technique is suitable for
anchor elements. Note that `preventDefault()` is always called on the event
object, so this technique is not usable on browsers without `preventDefault()`
or buggy `preventDefault()`.

```javascript
var a = document.getElementById('my-anchor')
a.onclick = router.handleEvent
```

That's it, we've covered all of the public APIs.

## Sub routes

The router object also doubles as a route handler. This allows several router
objects to be composed together. Here is a simple example:

```javascript
var root = createRouter()

var users = createRouter()

users.add(function () {
  // create a new user
})

users.add(function (id) {
  // do something with user id
}, '/edit/:id')

users.add(function (id) {
  // delete user
}, '/delete/:id')

root.add(users, '/users/...')
root.start()
```

The `/...` at the end of a route captures the remainder of the route after
`/users`, and calls the router on the captured part. The route handlers mapped
to the `users` router will match `/users/add`, `/users/edit/:id`, and so on.

The `users` router is otherwise a router just like any other, and the only
difference is that we don't call `start()` on it.

## Path handler

When creating a router object, we have the ability to pass a path handler
object, which customizes the way paths are physically handled.

The default path handler looks like this:

```javascript
var pathHandler = {
  get: function () { return window.location.pathname },
  set: function (path, title) {
    window.history.pushState(undefined, title, path),
  },
  listen: function (f) { window.onpopstate = f },
  decorate: function (f) { return f }
}
```

The handler object encapsulates the implementation details specific to the
environment (in this case, a browser). By implementing a new handler object,
and passing it to `createRouter()`, we can adapt the router to different
environments or use different routing implementation in the browser (e.g.,
use hashes instead of History API).

In addition to containing the environment-specific functionality, the handler
objects can also be used to customize the behavior of the route functions.

* `handler.get()`: must return the current path as a string.

* `handler.set(path, title)`: must take a path, and optionally a title, and
  cause the application to switch to the specified path.

* `handler.listen(func)`: must take a function that is to be invoked without 
  any arguments every time current path changes.

* `handler.decorate(func)`: must take a function and return a function. This 
  can be used to customize route handler functions centrally (e.g., perform
  dependency injection).

When passing a handler object to `createRouter()`, we may pass an object that
contains a subset of the properties listed above, and thus override only the
aspects of route handling that we are interested in.

## Decorating route handlers

In some situations, we may want to modify the behavior of all the route 
handler functions. Purpose of decorating route handlers may vary depending 
on your situation, but a common use case is dependency injection.

For example, let's say we are working on an application that uses some secret
token that must be available to route handlers. For some reason (e.g., to make
code easier to test), we don't want to, or cannot, import the token into 
individual modules where our route handlers are defined. In this situation, we
can give the token to a decorator function, and let it inject the token into
all our route handlers, such that they will receive it as their first argument,
followed by any arguments that were part of the URL.

```javascript
var myHandler = function (token, arg1, arg2) {
  // ....
}

var decorator = (function (token) {
  return function realDecorator(fn) { 
    return function wrapper() {
      var args = [token].concat([].slice.call(arguments))
      return fn.apply(undefined, args)
    }
  }
})(generateToken())

var router = jouter.createRouter({decorate: decorator})
router.add(myHandler, '/:x/:y')
router.start()
```

In the above example, the token is generated ad-hoc, and not importable into 
other modules. The `decorator()` function is the only piece of code that has
access to the token, and it makes it available to the route handlers by 
returning a decorated proxy handler function that takes the route arguments
and calls the actual handler with the token as the first argument.

## Examples

A working example is available in the `dist` directory. To run the example,
you will need to install the dependencies first:

```shell
cd path/to/jouter
npm install
```

Next, start the static server:

```shell
npm start
```

The default browser will open automatically.

## Getting the sources

The Jouter sources are hosted [on GitHub](https://github.com/foxbunny/jouter).
If you like it, don't forget to stop by and star it!

## Reporting issues

Jouter is a young library. It's virtually guaranteed to miss a feature or two
that you may need, or have a bug in your particular use case. If you need to
report an issue, use the
[GitHub issue tracker](https://github.com/foxbunny/jouter/issues).

## License

Jouter is licensed under the MIT license. See the `LICENSE` file for more
information.
