import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@vue/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@vue/reactivity': path.resolve(__dirname, 'packages/reactivity/src')
    }
  },
  test: {
    environment: 'node'
  }
})
