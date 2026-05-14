const INJECTION_PATTERN = /\[(IGNORE|SKIP|PAY|CANCEL|OVERRIDE|EXECUTE)/i

export function summarizeTransactions(transactions) {
  const txns = Array.isArray(transactions) ? transactions : []

  return txns.map((tx) => {
    const id = String(tx?.id ?? '')
    const amount = Number(tx?.amount ?? 0)
    const description = String(tx?.description ?? '')
    const safe = !INJECTION_PATTERN.test(description)

    return {
      id,
      text: safe
        ? `Transaction ${id}: ${amount} - ${description}`
        : `Transaction ${id}: ${amount} - [description flagged as suspicious]`,
      safe,
    }
  })
}