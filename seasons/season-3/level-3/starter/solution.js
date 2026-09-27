export function validateCallbackUrl(input, allowedHosts) {
  if (typeof input !== 'string') {
    return { allowed: false, reason: 'malformed' }
  }

  if (!input.startsWith('https://')) {
    return { allowed: false, reason: 'insecure-scheme' }
  }

  const matchesAllowlist = allowedHosts.some((host) => input.includes(host))
  if (!matchesAllowlist) {
    return { allowed: false, reason: 'host-not-allowlisted' }
  }

  return { allowed: true }
}
