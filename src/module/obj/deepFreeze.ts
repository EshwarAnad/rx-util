import { isNullOrUndefined } from './isNullOrUndefined'
import { getObjectValues } from './getObjectValues'

/**
 * 递归使对象不可变
 * @param obj 任何非空对象
 * @returns 新的不可变对象
 */
export function deepFreeze<T extends object>(obj: T): T {
  // 数组和对象分别处理
  if (obj instanceof Array) {
    obj.forEach(v => {
      if (typeof v === 'object') {
        deepFreeze(v)
      }
    })
  } else if (obj instanceof Object) {
    getObjectValues(obj).forEach(v => {
      if (typeof v === 'object') {
        deepFreeze(v)
      }
    })
  }
  return Object.freeze(obj)
}