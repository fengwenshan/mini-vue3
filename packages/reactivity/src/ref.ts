import { isObject } from '@vue/shared'
import { reactive } from './reactive'

export interface Ref<T = any> {
  value: T
}

export enum RefFlags {
  IS_REF = '__v_isRef'
}

class RefImpl<T> {
  public readonly [RefFlags.IS_REF] = true
  private _value: T
  private _rawValue: T

  constructor(value: T) {
    this._rawValue = value
    this._value = toReactive(value)
  }

  get value(): T {
    return this._value
  }

  set value(newValue: T) {
    if (Object.is(newValue, this._rawValue)) {
      return
    }

    this._rawValue = newValue
    this._value = toReactive(newValue)
  }
}

export function ref<T>(value: T): Ref<T> {
  return new RefImpl(value)
}

export function isRef(value: unknown): value is Ref {
  return isObject(value) && Reflect.get(value, RefFlags.IS_REF) === true
}

export function unRef<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value
}

function toReactive<T>(value: T): T {
  return isObject(value) ? reactive(value) as T : value
}
