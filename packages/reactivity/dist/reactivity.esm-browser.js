// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object";
}

// packages/reactivity/src/constants.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  ReactiveFlags2["RAW"] = "__v_raw";
  ReactiveFlags2["IS_REF"] = "__v_isRef";
  return ReactiveFlags2;
})(ReactiveFlags || {});

// packages/reactivity/src/ref.ts
var IS_REF = "__v_isRef";
var _a;
_a = "__v_isRef" /* IS_REF */;
var RefImpl = class {
  constructor(rawValue) {
    this[_a] = true;
    this._rawValue = toRaw(rawValue);
    this._value = toReactive(rawValue);
  }
  get value() {
    return this._value;
  }
  set value(newVal) {
    const oldValue = this._rawValue;
    if (isReactive(newVal) || isRef(newVal)) {
      this._rawValue = toRaw(newVal);
      this._value = newVal;
    } else if (!Object.is(newVal, oldValue)) {
      this._rawValue = toRaw(newVal);
      this._value = toReactive(newVal);
    }
  }
};
function ref(value) {
  if (isRef(value)) {
    return value;
  }
  return new RefImpl(value);
}
function isRef(value) {
  return value ? value[IS_REF] === true : false;
}
function unRef(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}

// packages/reactivity/src/reactive.ts
var proxyMap = /* @__PURE__ */ new WeakMap();
var isReactive = (target) => {
  return isObject(target) ? !!Reflect.get(target, "__v_isReactive" /* IS_REACTIVE */) : false;
};
var isProxy = (target) => {
  return isObject(target) ? !!Reflect.get(target, "__v_raw" /* RAW */) : false;
};
var toReactive = (value) => {
  return isObject(value) ? reactive(value) : value;
};
var toRaw = (observed) => {
  const raw = observed && observed["__v_raw" /* RAW */];
  return raw ? toRaw(raw) : observed;
};
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw" /* RAW */]) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, {
    get(target2, prop, receiver) {
      if (prop === "__v_raw" /* RAW */) {
        if (proxyMap.get(target2)) {
          return target2;
        }
        return target2;
      } else if (prop === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      const res = Reflect.get(target2, prop, receiver);
      if (isRef(res)) {
        return res.value;
      }
      return isObject(res) ? reactive(res) : res;
    },
    set(target2, prop, newVal, receiver) {
      const oldValue = Reflect.get(target2, prop);
      if (isRef(oldValue)) {
        oldValue.value = newVal;
      }
      return Reflect.set(target2, prop, newVal, receiver);
    }
  });
  proxyMap.set(target, proxy);
  return proxy;
}
function reactive(target) {
  return createReactiveObject(target);
}
export {
  IS_REF,
  ReactiveFlags,
  isProxy,
  isReactive,
  isRef,
  reactive,
  ref,
  toRaw,
  toReactive,
  unRef
};
//# sourceMappingURL=reactivity.esm-browser.js.map
