
export enum ReactiveFlags {
  /** 判断一个值是否已经是响应式代理对象。 */
  IS_REACTIVE = '__v_isReactive',
  /** 获取响应式代理对象背后的原始对象 */
  RAW = '__v_raw',
  /** 是否为Ref对象 */
  IS_REF = '__v_isRef',
}