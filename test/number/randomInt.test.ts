import { randomInt } from '../../src/number/randomInt'
import { range } from '../../src/array/range'

/**
 * @test {randomInt}
 */
describe('测试 randomInt', () => {
  it('基本示例', () => {
    range(1, 100).forEach(v => {
      const num = randomInt(0, v)
      expect(num).toBeLessThanOrEqual(v)
      expect(num).toBeGreaterThanOrEqual(0)
    })
  })
  it('测试两个参数的', () => {
    range(1, 100).forEach(v => expect(randomInt(v)).toBeLessThan(v))
  })
})
