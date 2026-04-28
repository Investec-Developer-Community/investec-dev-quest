const BLOCKED_MCCS = [5816, 7995]

export function beforeTransaction(event) {
  const mcc = event?.merchant?.category?.code
  if (BLOCKED_MCCS.includes(mcc)) {
    return { approved: false, message: 'Transaction declined: restricted merchant category' }
  }
  return { approved: true }
}

