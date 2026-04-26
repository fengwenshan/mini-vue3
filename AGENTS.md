# Mini Vue 项目规则

本文档是本仓库给代码代理和协作者读取的项目规则。开启新对话或接手本项目时，先阅读本文件，再修改代码。

## 项目定位

这是一个学习版 `mini-vue` 源码工程，采用 pnpm workspace 组织多个包，构建方式参考 Vue core。

本项目不是业务应用，不使用 `.env.development`、`.env.production`、`.env.test` 这类环境文件。开发、生产和测试构建通过命令参数、包内 `buildOptions` 和构建脚本控制。

## 目录结构

```text
mini-vue
+-- packages
|   +-- reactivity
|   +-- shared
+-- scripts
|   +-- dev.ts
|   +-- build.ts
|   +-- build-utils.ts
+-- docs
+-- .githooks
+-- package.json
+-- tsconfig.json
+-- vitest.config.ts
```

关键目录说明：

- `packages/*`：子包目录。
- `packages/*/src/index.ts`：子包源码入口。
- `packages/*/package.json`：子包导出配置和构建格式配置。
- `scripts/dev.ts`：开发 watch 构建脚本。
- `scripts/build.ts`：一次性构建脚本。
- `scripts/build-utils.ts`：构建公共逻辑。
- `docs`：工程说明文档。
- `.githooks`：Git hooks。

## 包构建约定

只有带 `buildOptions` 的包才会被构建脚本识别为可构建包。

示例：

```json
{
  "buildOptions": {
    "name": "VueReactivity",
    "formats": [
      "esm-bundler",
      "esm-browser",
      "cjs",
      "global"
    ]
  }
}
```

支持的构建格式：

- `esm-bundler`：给 Vite、Rollup、Webpack 等打包器使用。
- `esm-browser`：给浏览器原生 ESM 使用。
- `cjs`：给 Node / CommonJS 使用。
- `global`：给浏览器 script 标签直接使用。

## 常用命令

开发 watch：

```bash
pnpm dev
pnpm dev reactivity
pnpm dev reactivity -f global
```

构建：

```bash
pnpm build
pnpm build:dev
pnpm build:prod
pnpm build:test
pnpm build reactivity -f cjs
```

测试和校验：

```bash
pnpm test
pnpm test:run
pnpm typecheck
pnpm verify
```

安装 Git hooks：

```bash
pnpm hooks:install
```

## 修改代码前后要求

修改源码后，至少运行：

```bash
pnpm test:run
pnpm typecheck
```

提交前必须保证：

```bash
pnpm verify
```

通过。

如果修改了构建脚本或包导出配置，也要运行：

```bash
pnpm build
```

## reactivity 代码规则

当前 `packages/reactivity` 已实现：

- `reactive`
- `ref`
- `isRef`
- `unRef`

### reactive 约定

- `reactive` 接收 `object`，不要重新引入会破坏数组类型的宽泛索引签名。
- 内部响应式标记使用 `ReactiveFlags.IS_REACTIVE`。
- 测试内部标记时，使用 `Reflect.get(value, ReactiveFlags.IS_REACTIVE)`。
- 不要在业务类型上暴露 `__v_isReactive`。
- 嵌套对象、数组元素、symbol key 对应的对象值，应在访问时懒代理。
- 重复代理同一个原始对象，应复用 `WeakMap` 中的代理对象。

### ref 约定

- `ref` 通过 `.value` 暴露值。
- `ref` 接收对象时，对象值需要转成 `reactive`。
- `.value` 被重新赋值为对象时，新对象也需要转成 `reactive`。
- `isRef` 通过内部标记判断，不要要求业务类型暴露 `__v_isRef`。
- `unRef` 遇到 ref 返回 `.value`，遇到普通值原样返回。

## 测试规则

测试文件放在：

```text
packages/*/__test__/*.spec.ts
```

当前测试使用 Vitest。

新增响应式能力时，要同步补单元测试。测试优先覆盖：

- 基础行为。
- 边界行为。
- 类型不被内部标记污染。
- 缓存复用行为。
- 对象、数组、symbol key 等结构。

测试中如果需要判断响应式内部标记，写 helper：

```ts
function isReactive(value: object): boolean {
  return Reflect.get(value, ReactiveFlags.IS_REACTIVE) === true
}
```

不要直接写：

```ts
proxy[ReactiveFlags.IS_REACTIVE]
```

因为 `Reactive<T>` 对外隐藏了内部标记。

## TypeScript 规则

- 保持 `strict` 通过。
- 不要为了测试方便破坏公开类型设计。
- 不要让内部响应式标记泄漏到业务对象类型上。
- 优先使用泛型保持输入和输出类型一致。
- 修改后运行 `pnpm typecheck`。

## 构建脚本规则

构建脚本位于 `scripts` 目录。

设计原则：

- 不使用 `.env.*`。
- 通过命令参数控制构建目标和格式。
- 子包格式来自 `package.json` 的 `buildOptions.formats`。
- 开发环境使用 watch 构建。
- 生产环境开启压缩，并输出 `.prod.js`。

不要随意引入 Rollup、Vite 或 Husky。当前工程保持轻量，构建使用 `esbuild`，脚本使用 `tsx` 执行。

## 文档规则

说明文档放在 `docs` 目录，使用 `.mdx`。

已有文档：

- `docs/project-build-config.mdx`：工程构建配置说明。
- `docs/reactivity-ref.mdx`：ref 实现说明。
- `docs/contributing.mdx`：提交规范和工程化说明。

新增重要能力时，同步补充文档。

## 提交规范

提交信息采用 Conventional Commits：

```text
type(scope): subject
```

或者：

```text
type: subject
```

允许的 type：

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

示例：

```text
feat(reactivity): 添加 ref 支持
test: 补充数组响应式测试
docs: 新增构建配置说明
build: 完善提交钩子和提交规范
```

提交前 hook 会执行 `pnpm verify`，提交信息 hook 会校验提交格式。

## Git 规则

- 提交信息使用中文
- 不要提交 `node_modules`。
- 不要提交 `dist`。
- 提交前查看 `git status --short`。
- 不要回滚用户已有改动，除非用户明确要求。
- 如果需要提交，先运行 `pnpm verify`。

## 风格偏好

- 代码保持简洁，优先贴近 Vue core 的源码组织思路。
- 注释只解释关键设计意图，不写空泛注释。
- 文件默认使用 UTF-8。
- 新增测试名称使用中文可以接受，但要清楚描述行为。
- 新增文档使用中文。

## 协作教学模式

当用户明确表示“不要写代码”“只提供思路”“当老师”或类似诉求时，后续回复应进入教学模式。

教学模式规则：

- 不直接修改代码。
- 不直接生成完整实现。
- 优先解释设计思路、实现顺序和测试切入点。
- 用小段伪代码或结构图帮助理解，但不要代替用户完成代码。
- 多问引导性问题，帮助用户自己判断下一步。
- 先让用户写测试，再引导实现。
- 发现用户实现方向有问题时，指出原因和修正思路。

当前响应式学习路线：

1. 已实现 `reactive`、`ref`、`isRef`、`unRef` 后，下一步优先实现 `effect`。
2. `effect` 的第一目标是让副作用函数立即执行一次。
3. 第二目标是在 `reactive` 的 `get` 中收集依赖。
4. 第三目标是在 `reactive` 的 `set` 中触发依赖。
5. `reactive + effect` 跑通后，再让 `ref.value` 接入依赖收集和触发。
6. 再继续实现 `stop`、`scheduler`、`computed`、`watch`。

`effect` 学习重点：

- `activeEffect`：记录当前正在执行的副作用。
- `targetMap`：保存 `target -> key -> effects` 的依赖关系。
- `track(target, key)`：读取属性时收集依赖。
- `trigger(target, key)`：修改属性时触发依赖。
- 没有 `activeEffect` 时不要收集依赖。
- 同一个属性多次读取时，依赖集合要去重。

建议用户优先写的测试：

```ts
test('effect 会立即执行一次', () => {
  const state = reactive({ count: 1 })
  let dummy

  effect(() => {
    dummy = state.count
  })

  expect(dummy).toBe(1)
})
```

```ts
test('响应式数据变化后会重新执行 effect', () => {
  const state = reactive({ count: 1 })
  let dummy

  effect(() => {
    dummy = state.count
  })

  state.count = 2

  expect(dummy).toBe(2)
})
```
