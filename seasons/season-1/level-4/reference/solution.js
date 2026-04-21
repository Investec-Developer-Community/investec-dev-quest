const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'

export async function getBeneficiaries(token) {
  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/beneficiaries`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)

  const json = await res.json()
  return json?.data ?? []
}

export async function validateBeneficiary(token, beneficiaryId) {
  const beneficiaries = await getBeneficiaries(token)
  const exists = beneficiaries.some((b) => b.beneficiaryId === beneficiaryId)
  if (!exists) throw new Error('Beneficiary not found')
  return true
}
