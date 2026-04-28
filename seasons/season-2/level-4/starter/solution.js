export function beforeTransaction(event) {
  const code = String(event?.merchant?.country?.code ?? '').toUpperCase()
  if (code === 'ZA' || code === 'NA') {
    return { approved: true }
  }

  return { approved: true }
}

