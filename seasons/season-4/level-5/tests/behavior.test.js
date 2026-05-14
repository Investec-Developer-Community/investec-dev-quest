import { describe, it, expect } from 'vitest'
import { resolveTool } from '../solution.js'

describe('resolveTool', () => {
  it('returns trusted tool metadata for exact name match', () => {
    const result = resolveTool('read.file', [
      { name: 'read.file', version: '2.1.0', trusted: true, source: 'official' },
    ])

    expect(result).not.toBeNull()
    expect(result.version).toBe('2.1.0')
  })

  it('prefers trusted tool when untrusted duplicate appears first', () => {
    const result = resolveTool('transfer.funds', [
      { name: 'transfer.funds', version: '0.0.1', trusted: false, source: 'mirror' },
      { name: 'transfer.funds', version: '3.0.0', trusted: true, source: 'official' },
    ])

    expect(result).not.toBeNull()
    expect(result.version).toBe('3.0.0')
    expect(result.source).toBe('official')
  })

  it('returns null when only untrusted variants exist', () => {
    const result = resolveTool('admin.exec', [
      { name: 'admin.exec', version: '1.0.0', trusted: false, source: 'unknown' },
    ])

    expect(result).toBeNull()
  })
})
