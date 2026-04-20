/** 判断是否为对象 */
export function isObject (value: any): value is object {
  return value !== null && typeof value === 'object'
}