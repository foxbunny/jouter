const TOKEN_RE = /:[^\/]+/g
const ANY_RE = /\*/g
const SUBPATH_RE = /\/\.\.\./g

const regexify = x =>
  x.replace(TOKEN_RE, '([^/]+)')
   .replace(ANY_RE, '.*')
   .replace(SUBPATH_RE, '(\/.*)')

// parseRoute :: String | RegExp -> RegExp
const routeRe = x =>
  x instanceof RegExp ?
    new RegExp(x.source)
  : new RegExp(`^${regexify(x)}$`)

// route ::  (* -> *), String -> (String -> _)
const route = (f, r) => {
  const re = routeRe(r)
  return (path) => {
    const match = re.exec(path)
    if (!match) return
    f(...match.slice(1))
    return true
  }
}

// Unsafe functions
const pathHandler = {
  // get :: _ -> String
  get: () => window.location.pathname,

  // set :: (String, String) -> _
  set: (path, title) =>
    window.history.pushState(undefined, title, path),

  // listen :: (* -> *) -> _
  listen: f => window.onpopstate = f,

  // decorate :: (* -> *) -> (* -> *)
  decorate: f => f,

  // onNoMatch :: (String -> _) -> _
  onNoMatch: f => undefined,
}

export const createRouter = (myPathHandler = {}) => {
  let routes = []
  const path = {
    ...pathHandler,
    ...myPathHandler
  }

  const add = (f, r) => 
    routes.push(route(path.decorate(f), r))

  const dispatch = p => {
    const hadMatch = routes.reduce((result, f) => {
      const match = f(p)
      return result || match
    }, false) 
    if (!hadMatch) path.onNoMatch(p)
    return hadMatch
  }

  const go = (p, t) => {
    path.set(p, t)
    dispatch(path.get())
  }

  const handleEvent = e => {
    e.preventDefault()
    const target = e.currentTarget
    go(target.href, target.title)
  }

  const start = () => {
    path.listen(() => dispatch(path.get()))
    dispatch(path.get())
  }

  const dispatchRoutes = subpath =>
    dispatch(subpath)

  dispatchRoutes.add = add
  dispatchRoutes.go = go
  dispatchRoutes.handleEvent = handleEvent
  dispatchRoutes.start = start

  return dispatchRoutes
}

export default createRouter
