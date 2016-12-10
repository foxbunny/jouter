import {routeRe, route, createRouter} from './jouter'

describe('routeRe', () => {
  test('will convert tokens to regexp', () => {
    expect(routeRe('/:foo/drink-:bar')).toEqual(/^\/([^\/]+)\/drink-([^\/]+)$/)
  })

  test('will match route as is if no tokens', () => {
    expect(routeRe('/about')).toEqual(/^\/about$/)
  })

  test('will match wildcard', () => {
    expect(routeRe('/foo/*')).toEqual(/^\/foo\/.*$/)
  })

  test('will return regexp as is if passed one', () => {
    const rx = /\/foo/
    expect(routeRe(rx)).toEqual(rx)
  })

  test('when passed a regexp, it will strip any flags', () => {
    const rx = /\/foo/gi
    expect(routeRe(rx)).toEqual(/\/foo/)
  })

  test('will match prefix wildcards', () => {
    expect(routeRe('/foo/...')).toEqual(/^\/foo(\/.*)$/)
  })
})

describe('route', () => {
  test('route takes function and route, and returns a function', () => {
    expect(route(x => x, '/:foo')).toBeInstanceOf(Function)
  })

  test('passed function will be invoked if path matches the route', () => {
    const f = jest.fn()
    const r = route(f, '/:foo')
    r('/bar')
    expect(f).toHaveBeenCalledWith('bar')
  })

  test('passed function will not be invoked on mismatch', () => {
    const f = jest.fn()
    const r = route(f, '/:foo')
    r('/foo/bar')
    expect(f).not.toHaveBeenCalled()
  })

  test('can use regexp as route', () => {
    const f = jest.fn()
    const r = route(f, /^\/foo-(\d+)/)
    r('/foo-2')
    expect(f).toHaveBeenCalledWith('2')
  })
})

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
})
