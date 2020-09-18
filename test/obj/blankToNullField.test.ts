import { blankToNullField } from '../../src/obj/blankToNullField'

/**
 * @test {blankToNullField}
 */
describe('test blankToNullField', () => {
  it('simple example', () => {
    expect(
      blankToNullField({
        name: '',
        age: '',
        sex: false,
      }),
    ).toEqual({
      name: null,
      age: null,
      sex: false,
    })
  })
})
