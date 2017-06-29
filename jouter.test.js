import {routeRe, route, createRouter} from './jouter'

describe('createRouter', () => {
  let currentPath = '/foo'
  let listeners = []

  beforeEach(() => {
    currentPath = '/foo'
    listeners = []
  })

  const fakePathHandler = {
    get: jest.fn(() => currentPath),
    set: jest.fn((path, title) => {
      currentPath = path
      listeners.forEach(f => f())
    }),
    listen: jest.fn(f => listeners.push(f))
  }

  test('will return a router object', () => {
    const router = createRouter()
    expect(router.add).toBeInstanceOf(Function)
    expect(router.start).toBeInstanceOf(Function)
    expect(router.handleEvent).toBeInstanceOf(Function)
    expect(router.go).toBeInstanceOf(Function)
  })

  test('switching paths', () => {
    const router = createRouter(fakePathHandler)
    router.go('/test')
    expect(currentPath).toBe('/test')
  })

  test('adding and handling routes', () => {
    const router = createRouter(fakePathHandler)
    const fn = jest.fn()
    router.add(fn, '/:x')
    router.go('/bar')
    expect(fn).toHaveBeenCalledWith('bar')
  })

  test('start routing', () => {
    const router = createRouter(fakePathHandler)
    const fn = jest.fn()
    router.add(fn, '/:x')
    router.start()
    expect(listeners.length).toBe(1)
    listeners[0]()
    expect(fn).toHaveBeenCalledWith('foo')
  })

  test('handing events', () => {
    const router = createRouter(fakePathHandler)
    const fn = jest.fn()
    const elem = document.createElement('a')
    elem.href = '/baz'
    router.add(fn, '/:x')
    elem.addEventListener('click', router.handleEvent)
    elem.dispatchEvent(new Event('click'));
    expect(fn).toHaveBeenCalledWith('baz')
    expect(currentPath).toBe('/baz')
  })

  test('router object is a function', () => {
    const router = createRouter(fakePathHandler)
    expect(router).toBeInstanceOf(Function)
  })

  test('router objects can be used as route handlers', () => {
    const router = createRouter(fakePathHandler)
    const subrouter = createRouter(fakePathHandler)
    const fn = jest.fn()
    router.add(subrouter, '/sub/...')
    subrouter.add(fn, '/foo/:x')
    router.go('/sub/foo/2')
    expect(fn).toHaveBeenCalledWith('2')
  })

  test('router object can be created with a decorator function', () => {
    const injectedDependency = {foo: 'bar'}
    const fn = jest.fn()
    const router = createRouter({
      ...fakePathHandler, 
      decorate: fn => (...args) => fn(injectedDependency, ...args)
    })
    router.add(fn, '/:x')
    router.go('/12')
    expect(fn).toHaveBeenCalledWith(injectedDependency, '12')
  })

  test('unmatched route will invoke the error handler', () => {
    const errorHandler = jest.fn()
    const router = createRouter({
      ...fakePathHandler,
      onNoMatch: errorHandler,
    })
    router.add(jest.fn(), '/:x')
    router.go('/')
    expect(errorHandler).toHaveBeenCalledWith("/")
  });

  test('error handler is not invoked if subroute matches', () => {
    const errorHandler = jest.fn();
    const router = createRouter({
      ...fakePathHandler,
      onNoMatch: errorHandler
    })
    const subrouter = createRouter(fakePathHandler)
    router.add(subrouter, '/sub/...')
    subrouter.add(jest.fn(), '/foo/:x')
    router.go('/sub/foo/2')
    expect(errorHandler).not.toHaveBeenCalled()
  });

  test('if subroute is unmatched, error handler is invoked', () => {
    const errorHandler = jest.fn();
    const router = createRouter({
      ...fakePathHandler,
      onNoMatch: errorHandler
    })
    const subrouter = createRouter(fakePathHandler)
    router.add(subrouter, '/sub/...')
    subrouter.add(jest.fn(), '/foo/:x')
    router.go('/bogus')
    expect(errorHandler).toHaveBeenCalledWith('/bogus')
  })
})
