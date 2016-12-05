import {curry} from './jouter'

// Utility functions

test('curried function returns a function when not enough args', () => {
  const curried = curry((x, y) => x + y)
  expect(curried(2)).toBeInstanceOf(Function)
})

test('curried functions can be partially applied', () => {
  const curried = curry((x, y) => x + y)
  const curried4 = curried(4)
  expect(curried4(2)).toBe(6)
})

test('curried function take arguments as long as there are not enough', () => {
  const curried = curry((x, y) => x + y)
  expect(curried()()(1)()(2)).toBe(3)
})
