const TOKEN_RE = /:[^\/]+/g
const ANY_RE = /\*/g
const SUBPATH_RE = /\/\.\.\./g

export const regexify = x =>
  x.replace(TOKEN_RE, '([^/]+)')
   .replace(ANY_RE, '.*')
   .replace(SUBPATH_RE, '(\/.*)')

// parseRoute :: String | RegExp -> RegExp
export const routeRe = x =>
  x instanceof RegExp ?
    new RegExp(x.source)
  : new RegExp(`^${regexify(x)}$`)

// route :: (* -> *), String -> Route -> (String -> _)
export const route = (f, r) => {
  const re = routeRe(r)
  return path => {
    const match = re.exec(path)
    if (!match) return
    f(...match.slice(1))
  }
}

// Unsafe functions
export const pathHandler = {
  // get :: _ -> String
  get: () => window.location.pathname,

  // set :: (path, title) -> _
  set: (path, title) =>
    window.history.pushState(undefined, title, path),

  // listen :: Function -> _
  listen: f => window.onpopstate = f,
}

export const createRouter = (myPathHandler = {}) => {
  let routes = []
  const path = {
    ...pathHandler,
    ...myPathHandler
  }

  const add = (f, r) => routes.push(route(f, r))
  const dispatch = p => routes.forEach(f => f(p))
  const go = (p, t) => {
    path.set(p, t)
    dispatch(path.get())
  }
  const handleEvent = e => {
    e.preventDefault()
    go(e.target.href, e.target.title)
  }
  const start = () => {
    path.listen(dispatch)
    dispatch(path.get())
  }

  const dispatchRoutes = subpath => dispatch(subpath)
  dispatchRoutes.add = add
  dispatchRoutes.go = go
  dispatchRoutes.handleEvent = handleEvent
  dispatchRoutes.start = start
  return dispatchRoutes
}
