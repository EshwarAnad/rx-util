import { getObjectValues } from '../../src/obj/getObjectValues'

/**
 * @test {getObjectValues}
 */
describe('test getObjectValues', () => {
  it('simple example', () => {
    const symbol = Symbol('name')
    const name = 'name'
    expect(
      getObjectValues({
        [symbol]: name,
        [name]: symbol,
      }),
    ).toIncludeAllMembers([name, symbol])
  })
})
