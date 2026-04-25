import { isObject } from '@vue/shared'

// WeakMap 的 key 是弱引用，不再被使用时可被垃圾回收。
const proxyMap = new WeakMap<object, object>()

export enum ReactiveFlags {
  /** 用于判断一个值是否已经是响应式代理对象。 */
  IS_REACTIVE = '__v_isReactive'
}

// 业务侧只暴露原对象属性，不暴露内部标记。
export type Reactive<T extends object> = T

function isTarget(value: unknown): value is object {
  return isObject(value)
}

function createReactiveObject<T extends object>(target: T): Reactive<T>
function createReactiveObject(target: object): object {
  if (!isTarget(target)) {
    return target
  }

  // 如果本身已经是代理对象，直接返回。
  if (Reflect.get(target, ReactiveFlags.IS_REACTIVE)) {
    return target
  }

  // 如果原始对象已经代理过，返回缓存的代理对象。
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      // 响应式标记通过 get 虚拟返回，避免污染原始对象。
      if (prop === ReactiveFlags.IS_REACTIVE) {
        return true
      }

      const value = Reflect.get(target, prop, receiver)
      return isObject(value) ? reactive(value) : value
    },
    set(target, prop, newValue, receiver): boolean {
      return Reflect.set(target, prop, newValue, receiver)
    }
  })

  proxyMap.set(target, proxy)
  return proxy
}

export function reactive<T extends object>(target: T): Reactive<T> {
  return createReactiveObject(target)
}
