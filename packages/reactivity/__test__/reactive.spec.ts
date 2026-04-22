import { reactive } from '../src/reactive'
import { describe, expect, test } from 'vitest'

/*
  toBe 断言两个对象地址是否相等
*/
describe('01_响应式 reactive', () => {
  test('1. 原始对象和代理对象引用地址不相等', () => {
    const original = { foo: 1 }
    const proxy = reactive(original)
    expect(proxy).not.toBe(original)
  })

  test('2. 重复代理同一个对象，返回同一个代理对象', () => {
    const original = { foo: 1 }
    const proxy1 = reactive(original)
    const proxy2 = reactive(original)
    const proxy3 = reactive(proxy1)

    expect(proxy1).toBe(proxy2)
    expect(proxy1).toBe(proxy3)
  })

  test('3. 类型层面只暴露原对象属性', () => {
    const original = { foo: 1 }
    const proxy = reactive(original)
    const proxy3 = reactive(proxy)

    const n1: number = proxy.foo
    const n2: number = proxy3.foo
    expect(n1).toBe(1)
    expect(n2).toBe(1)
  })
})
