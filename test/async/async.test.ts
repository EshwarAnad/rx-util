import { async } from '../../src/async/async'

describe('test async', () => {
  it('simple example', () => {
    expect(async(i => i)(1)).toBeInstanceOf(Promise)
    expect(async(async i => i)(1)).toBeInstanceOf(Promise)
  })
})
