import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's2-l1',
    environment: 'node',
    globals: false,
    testTimeout: 5000,
  },
})
