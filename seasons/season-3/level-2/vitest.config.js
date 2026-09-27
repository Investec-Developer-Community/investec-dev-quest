import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's3-l2',
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
