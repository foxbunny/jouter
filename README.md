# Jouter

Jouter is a minimalist client-side routing library. It's main advantage
compared to some of the other libraries that do similar things is it's
extremely small footprint (under 1KB minified and gzipped).

[![Build Status](https://travis-ci.org/foxbunny/jouter.svg?branch=master)](https://travis-ci.org/foxbunny/jouter)

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
  listen: function (f) { window.onpopstate = f }
}
```

The handle object encapsulates the implementation details specific to the
environment (in this case, a browser). By implementing a new handler object,
and passing it to `createRouter()`, we can adapt the router to different
environments or use different routing implementation in the browser (e.g.,
use hashes instead of History API).

The `handler.get()` function must return the current path as a string.

The `handler.set()` function must take a path, and optionally a title, and
cause the application to switch to the specified path.

Finally, the `handler.listen()` function will take a function that is to be
invoked without any arguments every time current path changes.

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

## License

Jouter is licensed under the MIT license. See the `LICENSE` file for more
information.
