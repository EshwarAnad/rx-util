import { cacheUtil } from './cacheUtil'
import { repeatedCall } from '../function/repeatedCall'
import { wait } from '../function/wait'

describe('test cacheOption', () => {
  let num = 0
  const get = id => ({ id, num: ++num })
  const id = 1
  beforeEach(() => {
    window.localStorage.clear()
    num = 0
  })
  it('simple example', () => {
    const fn = cacheUtil.onecOfSameParam(get)
    // 直接获取 10 次，num 则增加 10
    repeatedCall(10, () => get(id))
    expect(num).toBe(10)
    // 调用 fn 只会在第一次真正获取，后面全部都是从缓存中获取，所以只会加一次
    repeatedCall(10, () => fn(id))
    expect(num).toBe(11)
    // 如果更换参数则又会重新获取
    repeatedCall(10, () => fn(id + 1))
    expect(num).toBe(12)
    // 调用 get 获取到的结果仍然是最新的
    expect(get(id)).toEqual({ id, num: 13 })
    expect(fn(id)).toEqual({ id, num: 11 })
    // 当然，调用 origin 方法也一样
    expect(fn.origin(id)).toEqual({ id, num: 14 })
    // 也可以清空缓存
    fn.clear(id)
    expect(fn(id)).toEqual({ id, num: 15 })
  })
  it('test timeout', async () => {
    const fn = cacheUtil.onecOfSameParam(get, 10)
    // 在超时间内重复执行获取的都是缓存值，所以计数器只加了一次
    repeatedCall(10, () => fn(id))
    expect(num).toBe(1)
    repeatedCall(10, async () => {
      // 进行等待过了超时时间后会重新获取，导致计数器的值不断加 1
      await wait(20)
      const i = num
      fn(id)
      expect(i).toBe(i + 1)
    })
  })
})
