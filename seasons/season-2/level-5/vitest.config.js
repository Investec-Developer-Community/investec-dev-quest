import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's2-l5',
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
