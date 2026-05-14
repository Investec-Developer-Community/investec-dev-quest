import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's4-l6',
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
