import { formDataToArray } from '../../src/formdata/formDataToArray'
import { objToFormData } from '../../src/formdata/objToFormData'

/**
 * @test {formDataToArray}
 */
describe('test formDataToArray', () => {
  it('simple example', () => {
    const fd = objToFormData({
      name: 'rx',
      age: 17,
    })
    expect(formDataToArray(fd)).toEqual(
      expect.arrayContaining([
        ['name', 'rx'],
        ['age', '17'],
      ]),
    )
  })
})
