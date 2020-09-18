import { isNumber } from '../../src/string/isNumber'

/**
 * @test {isNumber}
 */
describe('test isNumber', () => {
  it('test isNumber', () => {
    expect(isNumber('7')).toBe(true)
    expect(isNumber('7.5')).toBe(false)
    expect(isNumber('7.a')).toBe(false)
  })
})
