export function validateCallbackUrl(input, allowedHosts) {
  let url
  try {
    url = new URL(String(input))
  } catch {
    return { allowed: false, reason: 'malformed' }
  }

  if (url.protocol !== 'https:') {
    return { allowed: false, reason: 'insecure-scheme' }
  }

  if (url.username || url.password) {
    return { allowed: false, reason: 'credentials-in-url' }
  }

  if (url.port !== '' && url.port !== '443') {
    return { allowed: false, reason: 'port-not-allowed' }
  }

  const hostname = url.hostname.toLowerCase()
  const allowlist = allowedHosts.map((host) => host.toLowerCase())
  if (!allowlist.includes(hostname)) {
    return { allowed: false, reason: 'host-not-allowlisted' }
  }

  return { allowed: true }
}
