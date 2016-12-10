const TOKEN_RE = /:[^\/]+/g
const ANY_RE = /\*/g

// parseRoute :: String -> RegExp
export const routeRe = x =>
  new RegExp(`^${x.replace(TOKEN_RE, '([^/]+)').replace(ANY_RE, '.*')}$`)

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

export const createRouter = (path = pathHandler) => {
  let routes = []

  const add = (f, r) => routes.push(route(f, r))
  const dispatch = () => routes.forEach(f => f(path.get()))
  const go = (p, t) => {
    path.set(p, t)
    dispatch()
  }
  const handleEvent = e => {
    e.preventDefault()
    go(e.target.href, e.target.title)
  }
  const start = () => {
    path.listen(dispatch)
    dispatch()
  }

  return {add, go, handleEvent, start}
}
