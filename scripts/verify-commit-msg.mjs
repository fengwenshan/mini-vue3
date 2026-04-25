import fs from 'node:fs'

const commitMsgFile = process.argv[2]

if (!commitMsgFile) {
  console.error('缺少提交信息文件。')
  process.exit(1)
}

const message = fs.readFileSync(commitMsgFile, 'utf-8').trim()
const firstLine = message.split(/\r?\n/)[0]

const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$/
const mergeCommitPattern = /^(Merge|Revert) /

if (mergeCommitPattern.test(firstLine) || conventionalCommitPattern.test(firstLine)) {
  process.exit(0)
}

console.error('\n提交信息格式不正确。')
console.error('\n期望格式：')
console.error('  type(scope): subject')
console.error('\n允许的 type：')
console.error('  feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert')
console.error('\n示例：')
console.error('  feat(reactivity): 添加 ref 支持')
console.error('  test: 补充数组响应式测试')
console.error('  docs: 新增构建配置说明')
console.error('\n当前提交信息：')
console.error(`  ${firstLine}\n`)

process.exit(1)
