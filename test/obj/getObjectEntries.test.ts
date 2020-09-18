import { getObjectEntries } from '../../src/obj/getObjectEntries'

/**
 * @test {getObjectEntries}
 */
describe('test getObjectEntries', () => {
  it('simple example', () => {
    const symbol = Symbol('name')
    const name = 'name'
    Array.from(
      Object.entries({
        [symbol]: name,
        [name]: symbol,
      }),
    )
    expect(
      getObjectEntries({
        [symbol]: name,
        [name]: symbol,
      }),
    ).toIncludeAllMembers([
      [symbol, name],
      [name, symbol],
    ])
  })
})
