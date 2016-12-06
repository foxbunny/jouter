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

export const createRouter = () => {
  const routes = []

  const add = (f, r) => routes.push(route(f, r))
  const dispatch = () => routes.forEach(x => x(window.location.path))
  const go = (path, title) => {
    window.history.pushState(path, undefined, title)
    dispatch()
  }
  const handleEvent = e => {
    e.preventDefault()
    go(e.target.href, e.target.title)
  }
  const start = () => {
    window.onpopstate = dispatch
    dispatch()
  }

  return {add, go, handleEvent, start}
}
