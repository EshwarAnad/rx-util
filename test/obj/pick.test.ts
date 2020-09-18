import { pick } from '../../src/obj/pick'

describe('测试 pick', () => {
  it('基本示例', () => {
    const user = {
      name: 'rx',
      age: 1,
    }
    expect(pick(user, 'name')).toEqual({
      name: user.name,
    })
  })
})
