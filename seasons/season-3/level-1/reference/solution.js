import { createHmac, timingSafeEqual } from 'crypto'

export function verifyWebhook(headers, rawBody, secret) {
  const timestamp = headers?.['x-investec-timestamp']
  const signatureHeader = headers?.['x-investec-signature']

  if (!timestamp || !signatureHeader || typeof signatureHeader !== 'string') {
    return false
  }
  if (!signatureHeader.startsWith('sha256=')) return false

  const receivedHex = signatureHeader.slice('sha256='.length)
  if (!receivedHex) return false

  const expectedHex = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  const expected = Buffer.from(expectedHex, 'hex')
  const received = Buffer.from(receivedHex, 'hex')
  if (expected.length !== received.length) return false

  return timingSafeEqual(expected, received)
}

