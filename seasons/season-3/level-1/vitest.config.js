import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's3-l1',
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
