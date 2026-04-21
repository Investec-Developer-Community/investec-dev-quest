const ALLOWED_COUNTRIES = new Set(['ZA', 'NA'])

export function beforeTransaction(event) {
  const code = String(event?.merchant?.country?.code ?? '').trim().toUpperCase()

  if (!code || !ALLOWED_COUNTRIES.has(code)) {
    return { approved: false, message: 'Country not allowed' }
  }

  return { approved: true }
}

