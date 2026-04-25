import { spawnSync } from 'node:child_process'

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('Git hooks installed: core.hooksPath=.githooks')
