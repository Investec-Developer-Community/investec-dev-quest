const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'

export async function submitPayment(token, accountId, payment) {
  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${accountId}/paymultiple`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentList: [payment] }),
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

