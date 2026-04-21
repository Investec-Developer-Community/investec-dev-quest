// Lightweight in-memory key-value store for card rule state.
// Shared between beforeTransaction and afterTransaction within a test sequence.
export function createKv() {
  const store = new Map()
  return {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
  }
}
