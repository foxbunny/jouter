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
    const fakeEvent = {
      preventDefault: jest.fn(),
      target: {
        href: '/baz',
        title: 'Baz'
      }
    }
    router.add(fn, '/:x')
    router.handleEvent(fakeEvent)
    expect(fakeEvent.preventDefault).toHaveBeenCalled()
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
})
