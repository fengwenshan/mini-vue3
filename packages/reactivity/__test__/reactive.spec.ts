import { describe, expect, test } from 'vitest'
import { reactive } from '../src/reactive'
import { ReactiveFlags } from '../src/constants'

function isReactive(value: object): boolean {
  return Reflect.get(value, ReactiveFlags.IS_REACTIVE) === true
}

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

  test('3. 嵌套对象在访问时也会被代理', () => {
    const original = {
      foo: {
        bar: 1
      }
    }
    const proxy = reactive(original)

    expect(isReactive(proxy)).toBe(true)
    expect(isReactive(proxy.foo)).toBe(true)
    expect(proxy.foo).not.toBe(original.foo)
  })

  test('4. 重复访问同一个嵌套对象，返回同一个代理对象', () => {
    const original = {
      foo: {
        bar: 1
      }
    }
    const proxy = reactive(original)
    const proxy1 = reactive(original)

    expect(proxy.foo).toBe(proxy.foo)
    expect(proxy.foo).toBe(proxy1.foo)
  })

  test('5. 数组本身会被代理，并保留数组行为', () => {
    const original = [1, 2]
    const proxy = reactive(original)

    expect(Array.isArray(proxy)).toBe(true)
    expect(isReactive(proxy)).toBe(true)
    expect(proxy).not.toBe(original)
    expect(proxy.length).toBe(2)

    proxy.push(3)

    expect(proxy[2]).toBe(3)
    expect(original[2]).toBe(3)
  })

  test('6. 数组里的对象元素在访问时也会被代理', () => {
    const original = [
      {
        count: 1
      }
    ]
    const proxy = reactive(original)
    

    expect(isReactive(proxy[0])).toBe(true)
    expect(proxy[0]).not.toBe(original[0])
    expect(proxy[0]).toBe(proxy[0])
  })

  test('7. 数组新增的对象元素在访问时也会被代理', () => {
    const proxy = reactive<Array<{ count: number }>>([])
    const item = { count: 1 }

    proxy.push(item)

    expect(proxy[0]).not.toBe(item)
    expect(isReactive(proxy[0])).toBe(true)
    expect(proxy[0].count).toBe(1)
  })

  test('8. symbol key 对应的对象值在访问时也会被代理', () => {
    const key = Symbol('foo')
    const original = {
      [key]: {
        count: 1
      }
    }
    const proxy = reactive(original)

    expect(isReactive(proxy[key])).toBe(true)
    expect(proxy[key]).not.toBe(original[key])
    expect(proxy[key]).toBe(proxy[key])
    expect(proxy[key].count).toBe(1)
  })

  test('9. symbol key 可以正常读写普通值', () => {
    const key = Symbol('count')
    const proxy = reactive({
      [key]: 1
    })

    proxy[key] = 2

    expect(proxy[key]).toBe(2)
  })
})
