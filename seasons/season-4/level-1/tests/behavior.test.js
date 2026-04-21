import { describe, it, expect } from 'vitest'
import { authorizeToolCall } from '../solution.js'

const POLICY = {
  allowedTools: ['read.file', 'search.code', 'run.tests'],
}

describe('authorizeToolCall', () => {
  it('allows an exact tool in the allowlist', () => {
    const result = authorizeToolCall({ tool: 'read.file' }, POLICY)
    expect(result.allowed).toBe(true)
  })

  it('denies tools that are not on the allowlist', () => {
    const result = authorizeToolCall({ tool: 'terminal.exec' }, POLICY)
    expect(result.allowed).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('denies empty tool names', () => {
    const result = authorizeToolCall({ tool: '' }, POLICY)
    expect(result.allowed).toBe(false)
  })

  it('denies look-alike tools with allowlisted prefixes', () => {
    const result = authorizeToolCall({ tool: 'read.file.delete' }, POLICY)
    expect(result.allowed).toBe(false)
  })
})
