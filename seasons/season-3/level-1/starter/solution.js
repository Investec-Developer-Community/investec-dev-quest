import { createHmac } from 'crypto'

export function verifyWebhook(headers, rawBody, secret) {
  const timestamp = headers?.['x-investec-timestamp']
  const signatureHeader = headers?.['x-investec-signature']
  if (!timestamp || !signatureHeader) return false

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  if (!signatureHeader.startsWith('sha256=')) return false
  const received = signatureHeader.slice('sha256='.length)
  return expected.startsWith(received)
}

