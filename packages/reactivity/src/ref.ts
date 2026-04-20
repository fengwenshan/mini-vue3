import { isReactive, toRaw, toReactive } from './reactive'
import { ReactiveFlags } from './constants'

export const IS_REF: '__v_isRef' = '__v_isRef'

export interface Ref<T = any, S = T> {
  get value(): T
  set value(_: S)
}

class RefImpl<T = any> {
  // 解包类型
  private _rawValue: T
  // 响应类型
  private _value: T

  public readonly [ReactiveFlags.IS_REF]: true = true

  constructor(rawValue: T) {
    this._rawValue = toRaw(rawValue)
    this._value = toReactive(rawValue)
  }

  get value(): T {
    return this._value
  }

  set value(newVal: T) {
    const oldValue = this._rawValue
    if (isReactive(newVal) || isRef(newVal)) {
      this._rawValue = toRaw(newVal)
      this._value = newVal
    } else if (!Object.is(newVal, oldValue)) {
      this._rawValue = toRaw(newVal)
      this._value = toReactive(newVal)
    }
  }
}

export function ref<T>(value: T): Ref<T> {
  if (isRef(value)) {
    return value
  }
  return new RefImpl(value)
}

export function isRef(value: any): value is Ref {
  return value ? value[IS_REF] === true : false
}

export function unRef<T = any>(ref: T | Ref<T>): T {
  return isRef(ref) ? ref.value : ref
}
