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
})
