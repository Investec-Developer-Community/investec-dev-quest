import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 's1-l3',
    environment: 'node',
    globals: false,
    testTimeout: 15000,
  },
})
