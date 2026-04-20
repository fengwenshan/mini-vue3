/**
 * 返回对象的响应数据
 * @param obj 
 * 
 */
export function reactive(target: object): object {
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop,  newValue, receiver): boolean {
      return Reflect.set(target, prop,  newValue, receiver)
    }
  })
  return proxy
}

const obj = {
  name: "张三",
  attrs: {
    rise: '170cm'
  }
};


const state = reactive(obj)
const state1 = reactive(obj)

console.log(state === state1) // false

// 2. 