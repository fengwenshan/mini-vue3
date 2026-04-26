import { isObject } from '@vue/shared'
import { isRef } from './ref'
import { ReactiveFlags } from './constants'

// 缓存原始对象
const proxyMap = new WeakMap<object, object>()

export interface Target {
  // [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  // [ReactiveFlags.IS_READONLY]?: boolean
  // [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}


/** 检查一个对象是否是由 reactive() 创建的代理。 */
export const isReactive = (target: unknown): boolean => {
  // 被代理过得就是会触发get,没有代理过得不会触发
  return isObject(target) ? !!Reflect.get(target, ReactiveFlags.IS_REACTIVE)  : false
}

/** 检查一个对象是否是由 reactive() 创建的代理。 */
export const isProxy = (target: unknown): boolean => {
  return isObject(target) ? !!Reflect.get(target, ReactiveFlags.RAW) : false
}

/** 创建响应式代理的对象。 */
export const toReactive = <T> (value: T): T => {
  return isObject(value) ? reactive(value) as T : value
}
/** 返回代理的原始对象 */
export const toRaw = <T>(observed: T): T => {
  // 这里不用  Reflect.get(observed, prop), 
  // 因为当observed 为基本类型时候Reflect.get 会报错。ref的set会有基本类型过来
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) as T : observed
}

type Reactive<T> = T
function createReactiveObject<T extends object>(target: T): Reactive<T>
function createReactiveObject(target: Target): object {
  if(!isObject(target)) {
    return target
  }

  // 这个就会触发 get （判断 target 是否已经是代理，避免重复包装）
  if(target[ReactiveFlags.RAW]) {
    return target
  }

  const existingProxy = proxyMap.get(target)
  if(existingProxy) {
    return existingProxy
  }
  //  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
  const proxy =  new Proxy(target, {
    get(target, prop, receiver) {
      if(prop === ReactiveFlags.RAW) {
        // 代理对象访问属性的时候，就会触发get, target就是原始对象，然后返回原始值
        if(proxyMap.get(target)) {
          return target
        }
        return target
      } else if(prop === ReactiveFlags.IS_REACTIVE) {
        return true
      }
      const res = Reflect.get(target, prop, receiver)
      // ref 作为reactive属性的时候处理
      if(isRef(res)) {
        return res.value
      } 
      return isObject(res) ? reactive(res) : res
    },
    set(target,  prop, newVal, receiver) {
      const oldValue = Reflect.get(target, prop)
      if(isRef(oldValue)) {
        oldValue.value = newVal
      }
      return Reflect.set(target, prop, newVal, receiver)
    }
  })
  proxyMap.set(target, proxy)
  return proxy
}

export function reactive<T extends object>(target: T): T {
  return createReactiveObject(target)
}
