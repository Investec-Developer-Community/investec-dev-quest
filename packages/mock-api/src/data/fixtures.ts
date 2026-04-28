import type { Account, Balance, Transaction, Beneficiary } from '@investec-game/shared'

// Synthetic, deterministic data — no real PII, no real credentials
export const ACCOUNTS: Account[] = [
  {
    accountId: 'acc-001',
    accountNumber: '10011021132',
    accountName: 'Mr J Soap',
    referenceName: 'Savings Account',
    productName: 'Private Bank Account',
    accountType: 'SAVINGS',
    kycCompliant: true,
  },
  {
    accountId: 'acc-002',
    accountNumber: '10011021456',
    accountName: 'Mr J Soap',
    referenceName: 'Cheque Account',
    productName: 'Private Bank Account',
    accountType: 'CURRENT',
    kycCompliant: true,
  },
]

export const BALANCES: Record<string, Balance> = {
  'acc-001': {
    accountId: 'acc-001',
    currentBalance: 50000.0,
    availableBalance: 49500.0,
    currency: 'ZAR',
  },
  'acc-002': {
    accountId: 'acc-002',
    currentBalance: 25000.5,
    availableBalance: 24800.0,
    currency: 'ZAR',
  },
}

export const TRANSACTIONS: Record<string, Transaction[]> = {
  'acc-001': [
    {
      accountId: 'acc-001',
      type: 'PointOfSale',
      transactionType: 'PointOfSale',
      status: 'POSTED',
      description: 'WOOLWORTHS FOOD CAPE TOWN',
      cardNumber: '400000xxxxxx0001',
      postedOrder: 1,
      postingDate: '2026-04-10',
      valueDate: '2026-04-10',
      actionDate: '2026-04-10',
      transactionDate: '2026-04-10',
      amount: -523.0,
      runningBalance: 49477.0,
    },
    {
      accountId: 'acc-001',
      type: 'CardPayment',
      transactionType: 'CardPayment',
      status: 'PENDING',
      description: 'UBER TRIP CAPE TOWN',
      cardNumber: '400000xxxxxx0001',
      postedOrder: 6,
      postingDate: '2026-04-22',
      valueDate: '2026-04-22',
      actionDate: '2026-04-22',
      transactionDate: '2026-04-22',
      amount: -120.0,
      runningBalance: 49357.0,
    },
    {
      accountId: 'acc-001',
      type: 'Transfer',
      transactionType: 'Transfer',
      status: 'POSTED',
      description: 'SALARY APRIL',
      cardNumber: '',
      postedOrder: 2,
      postingDate: '2026-04-01',
      valueDate: '2026-04-01',
      actionDate: '2026-04-01',
      transactionDate: '2026-04-01',
      amount: 45000.0,
      runningBalance: 50000.0,
    },
    {
      accountId: 'acc-001',
      type: 'DebitOrder',
      transactionType: 'DebitOrder',
      status: 'POSTED',
      description: 'DISCOVERY HEALTH',
      cardNumber: '',
      postedOrder: 3,
      postingDate: '2026-03-31',
      valueDate: '2026-03-31',
      actionDate: '2026-03-31',
      transactionDate: '2026-03-31',
      amount: -3500.0,
      runningBalance: 5000.0,
    },
    // Extra transactions for date-range filtering (S1L3)
    {
      accountId: 'acc-001',
      type: 'PointOfSale',
      transactionType: 'PointOfSale',
      status: 'POSTED',
      description: 'PICK N PAY STELLENBOSCH',
      cardNumber: '400000xxxxxx0001',
      postedOrder: 4,
      postingDate: '2026-03-15',
      valueDate: '2026-03-15',
      actionDate: '2026-03-15',
      transactionDate: '2026-03-15',
      amount: -340.0,
      runningBalance: 8500.0,
    },
    {
      accountId: 'acc-001',
      type: 'FeeOrInterest',
      transactionType: 'FeeOrInterest',
      status: 'POSTED',
      description: 'MONTHLY SERVICE FEE',
      cardNumber: '',
      postedOrder: 5,
      postingDate: '2026-02-28',
      valueDate: '2026-02-28',
      actionDate: '2026-02-28',
      transactionDate: '2026-02-28',
      amount: -65.0,
      runningBalance: 8840.0,
    },
  ],
  'acc-002': [
    {
      accountId: 'acc-002',
      type: 'CardPayment',
      transactionType: 'CardPayment',
      status: 'POSTED',
      description: 'NETFLIX.COM',
      cardNumber: '400000xxxxxx0002',
      postedOrder: 1,
      postingDate: '2026-04-15',
      valueDate: '2026-04-15',
      actionDate: '2026-04-15',
      transactionDate: '2026-04-15',
      amount: -199.0,
      runningBalance: 24801.0,
    },
    {
      accountId: 'acc-002',
      type: 'ATM',
      transactionType: 'ATM',
      status: 'POSTED',
      description: 'INVESTEC ATM SANDTON',
      cardNumber: '400000xxxxxx0002',
      postedOrder: 2,
      postingDate: '2026-04-12',
      valueDate: '2026-04-12',
      actionDate: '2026-04-12',
      transactionDate: '2026-04-12',
      amount: -1000.0,
      runningBalance: 25000.0,
    },
    // Extra transactions for date-range filtering (S1L3)
    {
      accountId: 'acc-002',
      type: 'Transfer',
      transactionType: 'Transfer',
      status: 'POSTED',
      description: 'RENTAL INCOME',
      cardNumber: '',
      postedOrder: 3,
      postingDate: '2026-03-01',
      valueDate: '2026-03-01',
      actionDate: '2026-03-01',
      transactionDate: '2026-03-01',
      amount: 8000.0,
      runningBalance: 26000.0,
    },
  ],
}

// ─── Beneficiaries fixture (for S1L4) ─────────────────────────────────────────

export const BENEFICIARIES: Beneficiary[] = [
  {
    beneficiaryId: 'ben-001',
    accountNumber: '62712345678',
    code: '051001',
    bank: 'Standard Bank',
    beneficiaryName: 'Alice Nkosi',
    lastPaymentAmount: 2500.0,
    lastPaymentDate: '2026-03-01',
    cellNo: null,
    emailAddress: null,
    name: 'Rent',
    referenceAccountNumber: '10011021132',
    referenceName: 'Savings Account',
    categoryId: null,
    profileId: 'profile-001',
    fasterPaymentAllowed: true,
    beneficiaryType: null,
    approvedBeneficiaryCategory: null,
  },
  {
    beneficiaryId: 'ben-002',
    accountNumber: '40781234567',
    code: '250655',
    bank: 'FNB',
    beneficiaryName: 'Khumalo Electricals',
    lastPaymentAmount: 1240.0,
    lastPaymentDate: '2026-03-15',
    cellNo: null,
    emailAddress: null,
    name: 'Invoice 1042',
    referenceAccountNumber: '10011021132',
    referenceName: 'Savings Account',
    categoryId: null,
    profileId: 'profile-001',
    fasterPaymentAllowed: true,
    beneficiaryType: null,
    approvedBeneficiaryCategory: null,
  },
  {
    beneficiaryId: 'ben-003',
    accountNumber: '19876543210',
    code: '632005',
    bank: 'ABSA',
    beneficiaryName: 'City of Cape Town',
    lastPaymentAmount: 1300.0,
    lastPaymentDate: '2026-02-20',
    cellNo: null,
    emailAddress: null,
    name: 'Rates',
    referenceAccountNumber: '10011021132',
    referenceName: 'Savings Account',
    categoryId: null,
    profileId: 'profile-001',
    fasterPaymentAllowed: true,
    beneficiaryType: null,
    approvedBeneficiaryCategory: null,
  },
]

// ─── Payment idempotency cache (for S1L5) ─────────────────────────────────────

export const PAYMENT_CACHE = new Map<string, object>()

// Cursor-based pagination helper
export function paginate<T>(
  items: T[],
  cursor: string | null,
  pageSize: number
): { page: T[]; nextCursor: string | null } {
  const parsedCursor = cursor ? parseInt(cursor, 10) : 0
  const startIndex = Number.isFinite(parsedCursor) && parsedCursor >= 0 ? parsedCursor : 0
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
  const page = items.slice(startIndex, startIndex + safePageSize)
  const nextStart = startIndex + safePageSize
  const nextCursor = nextStart < items.length ? String(nextStart) : null
  return { page, nextCursor }
}
