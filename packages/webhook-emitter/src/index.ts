import { createHmac, timingSafeEqual } from 'crypto'

export interface EmitWebhookOptions {
  url: string
  event: unknown
  secret: string
  timestamp?: number
  headers?: Record<string, string>
}

export interface EmitWebhookResult {
  status: number
  ok: boolean
  body: string
  signature: string
  timestamp: string
}

export function buildWebhookSignature(rawBody: string, secret: string, timestamp: string): string {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
}

export function verifyWebhookSignature(
  rawBody: string,
  secret: string,
  timestamp: string,
  headerValue: string
): boolean {
  if (!headerValue.startsWith('sha256=')) return false

  const actual = headerValue.slice('sha256='.length)
  const expected = buildWebhookSignature(rawBody, secret, timestamp)

  const actualBuf = Buffer.from(actual, 'hex')
  const expectedBuf = Buffer.from(expected, 'hex')

  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}

export async function emitWebhook(options: EmitWebhookOptions): Promise<EmitWebhookResult> {
  const rawBody = JSON.stringify(options.event)
  const timestamp = String(options.timestamp ?? Math.floor(Date.now() / 1000))
  const signature = `sha256=${buildWebhookSignature(rawBody, options.secret, timestamp)}`

  const response = await fetch(options.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-investec-timestamp': timestamp,
      'x-investec-signature': signature,
      ...(options.headers ?? {}),
    },
    body: rawBody,
  })

  return {
    status: response.status,
    ok: response.ok,
    body: await response.text(),
    signature,
    timestamp,
  }
}
