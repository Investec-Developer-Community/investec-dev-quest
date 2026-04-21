import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's2-l4',
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
