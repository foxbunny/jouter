// This object holds the routes
const ROUTES = {}

// parseRoute :: String -> RegExp
//
// Parses a route definition in string format, and returns a regexp that
// matches the definition.
//
// Route definitions look like this:
//
//    /:foo/:bar/:baz
//
// Each of the `foo`, `bar`, and `baz` are named route segments.
//
const parseRoute = x => {

}


// Utility functions

export function curry(f, currentArgs = []) {
  return function (...args) {
    const allArgs = currentArgs.concat(args)
    if (args.length + currentArgs.length >= f.length) return f(...allArgs)
    return curry(f, allArgs)
  }
}
