import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'sX-lY',    // replace with your level id
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
})
