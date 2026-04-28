export function beforeTransaction(event, kv) {
  const history = Array.isArray(kv.get('velocity_timestamps')) ? kv.get('velocity_timestamps') : []
  history.push(new Date(event?.dateTime ?? Date.now()).getTime())
  kv.set('velocity_timestamps', history)
  return { approved: true }
}

