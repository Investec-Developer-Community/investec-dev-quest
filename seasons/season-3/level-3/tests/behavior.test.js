import { describe, it, expect } from 'vitest'
import { validateCallbackUrl } from '../solution.js'

const ALLOWED = ['hooks.finflow.co.za', 'status.karoo-coffee.co.za']

describe('validateCallbackUrl — allowed callbacks', () => {
  it('allows an https callback on an allowlisted host', () => {
    expect(validateCallbackUrl('https://hooks.finflow.co.za/payments/status', ALLOWED).allowed).toBe(true)
  })

  it('treats hostnames case-insensitively', () => {
    expect(validateCallbackUrl('https://HOOKS.FinFlow.co.za/payments/status', ALLOWED).allowed).toBe(true)
  })

  it('allows an explicit default https port', () => {
    expect(validateCallbackUrl('https://status.karoo-coffee.co.za:443/cb', ALLOWED).allowed).toBe(true)
  })
})

describe('validateCallbackUrl — rejected callbacks', () => {
  it('rejects plain http callbacks', () => {
    const result = validateCallbackUrl('http://hooks.finflow.co.za/payments/status', ALLOWED)
    expect(result.allowed).toBe(false)
    expect(typeof result.reason).toBe('string')
  })

  it('rejects hosts that are not allowlisted', () => {
    expect(validateCallbackUrl('https://example.org/cb', ALLOWED).allowed).toBe(false)
  })

  it('rejects malformed input without throwing', () => {
    expect(() => validateCallbackUrl('not a url', ALLOWED)).not.toThrow()
    expect(validateCallbackUrl('not a url', ALLOWED).allowed).toBe(false)
    expect(validateCallbackUrl(undefined, ALLOWED).allowed).toBe(false)
  })
})
