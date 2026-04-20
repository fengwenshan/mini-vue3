import { describe, expect, test } from 'vitest'
import { isReactive, isRef, reactive, ReactiveFlags, ref, unRef } from '../src'

describe('02_响应式 ref', () => {
  test('1. ref 会把普通值包装到 value 上', () => {
    const count = ref(1)

    expect(count.value).toBe(1)

    count.value = 2

    expect(count.value).toBe(2)
  })

  test('2. isRef 可以判断 ref 对象', () => {
    const count = ref(1)
    const state = reactive({ count: 1 })

    expect(isRef(count)).toBe(true)
    expect(isRef(state)).toBe(false)
    expect(isRef(1)).toBe(false)
  })

  test('3. unRef 遇到 ref 返回 value，遇到普通值直接返回', () => {
    expect(unRef(ref(1))).toBe(1)
    expect(unRef('hello')).toBe('hello')
  })

  test('4. ref 接收对象时，会把对象值转成 reactive', () => {
    const original = {
      nested: {
        count: 1
      }
    }
    const state = ref(original)

    expect(isReactive(state.value)).toBe(true)
    expect(state.value).not.toBe(original)
    expect(isReactive(state.value.nested)).toBe(true)
  })

  test('5. ref 赋值为新对象时，新对象也会被转成 reactive', () => {
    const state = ref({
      count: 1
    })
    const next = {
      count: 2
    }

    state.value = next

    expect(state.value).not.toBe(next)
    expect(isReactive(state.value)).toBe(true)
    expect(state.value.count).toBe(2)
  })

  test('6. ref 重复赋相同原始值时，不会替换当前 value', () => {
    const state = ref({
      count: 1
    })
    const current = state.value

    state.value = current

    expect(state.value).toBe(current)
  })
})
