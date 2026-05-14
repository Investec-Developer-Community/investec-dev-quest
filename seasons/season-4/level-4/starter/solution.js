export function summarizeTransactions(transactions) {
  const txns = Array.isArray(transactions) ? transactions : []

  return txns.map((tx) => {
    const id = String(tx?.id ?? '')
    const amount = Number(tx?.amount ?? 0)
    const description = String(tx?.description ?? '')

    return {
      id,
      text: `Transaction ${id}: ${amount} - ${description}`,
      safe: true,
    }
  })
}
