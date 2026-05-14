import { z } from 'zod'

// ─── Level manifest ─────────────────────────────────────────────────────────

export const LevelManifestSchema = z.object({
  id: z.string(),              // e.g. "s1-l1"
  name: z.string(),            // e.g. "First Contact"
  season: z.number().int().min(1),
  level: z.number().int().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  boss: z.boolean().default(false),
  apiRequired: z.boolean(),    // whether mock-api must be running
  tags: z.array(z.string()).default([]),
})

export type LevelManifest = z.infer<typeof LevelManifestSchema>

// ─── Test runner result ──────────────────────────────────────────────────────

export const TestResultSchema = z.object({
  name: z.string(),
  status: z.enum(['pass', 'fail', 'skip']),
  message: z.string().optional(),
  testCode: z.string().optional(),
  duration: z.number().optional(),
})

export const TestRunResultSchema = z.object({
  passed: z.boolean(),
  total: z.number(),
  failed: z.number(),
  tests: z.array(TestResultSchema),
  error: z.string().optional(),   // top-level runner error (parse fail etc.)
})

export type TestResult = z.infer<typeof TestResultSchema>
export type TestRunResult = z.infer<typeof TestRunResultSchema>

// ─── Game progress ───────────────────────────────────────────────────────────

export const LevelStatusSchema = z.enum(['locked', 'active', 'complete'])
export type LevelStatus = z.infer<typeof LevelStatusSchema>

export const LevelProgressSchema = z.object({
  levelId: z.string(),
  status: LevelStatusSchema,
  attempts: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
})

export type LevelProgress = z.infer<typeof LevelProgressSchema>

// ─── Mock Investec API types ─────────────────────────────────────────────────

export const AccountTypeSchema = z.enum(['CURRENT', 'SAVINGS'])

export const AccountSchema = z.object({
  accountId: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  referenceName: z.string(),
  productName: z.string(),
  accountType: AccountTypeSchema,
  kycCompliant: z.boolean(),
})

export const BalanceSchema = z.object({
  accountId: z.string(),
  currentBalance: z.number(),
  availableBalance: z.number(),
  currency: z.literal('ZAR'),
})

export const TransactionTypeSchema = z.enum([
  'DebitOrder',
  'PointOfSale',
  'ATM',
  'FeeOrInterest',
  'Transfer',
  'CardPayment',
])

export const TransactionSchema = z.object({
  transactionId: z.string().optional(),
  accountId: z.string(),
  type: z.string(),
  transactionType: z.string(),
  status: z.enum(['POSTED', 'PENDING']),
  description: z.string(),
  cardNumber: z.string(),
  postedOrder: z.number(),
  postingDate: z.string(),
  valueDate: z.string(),
  actionDate: z.string(),
  transactionDate: z.string(),
  amount: z.number(),
  runningBalance: z.number(),
})

export type Account = z.infer<typeof AccountSchema>
export type Balance = z.infer<typeof BalanceSchema>
export type Transaction = z.infer<typeof TransactionSchema>

// ─── Beneficiary ─────────────────────────────────────────────────────────────

export const BeneficiarySchema = z.object({
  beneficiaryId: z.string(),
  accountNumber: z.string(),
  code: z.string(),
  bank: z.string(),
  beneficiaryName: z.string(),
  lastPaymentAmount: z.number().nullable(),
  lastPaymentDate: z.string().nullable(),
  cellNo: z.string().nullable(),
  emailAddress: z.string().nullable(),
  name: z.string(),
  referenceAccountNumber: z.string(),
  referenceName: z.string(),
  categoryId: z.string().nullable(),
  profileId: z.string().nullable(),
  fasterPaymentAllowed: z.boolean(),
  beneficiaryType: z.string().nullable(),
  approvedBeneficiaryCategory: z.string().nullable(),
})

export type Beneficiary = z.infer<typeof BeneficiarySchema>

// ─── Payment ──────────────────────────────────────────────────────────────────

export const PaymentRequestSchema = z.object({
  paymentList: z.array(
    z.object({
      beneficiaryId: z.string(),
      amount: z.union([z.string(), z.number()]),
      myReference: z.string().optional(),
      theirReference: z.string().optional(),
    })
  ),
})

export const PaymentResponseSchema = z.object({
  data: z.object({
    TransferResponses: z.array(
      z.object({
        PaymentReferenceNumber: z.string(),
        beneficiaryId: z.string(),
        amount: z.number(),
        status: z.enum(['ACCEPTED', 'REJECTED']),
      })
    ),
  }),
})

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>

// ─── Card auth event ─────────────────────────────────────────────────────────

export const CurrencyCodeSchema = z.string()

export const CardAuthEventSchema = z.object({
  accountNumber: z.string(),
  dateTime: z.string(),
  centsAmount: z.number().int(),
  currencyCode: CurrencyCodeSchema,
  type: z.enum(['card', 'atm']),
  reference: z.string(),
  card: z.object({
    id: z.string(),
  }),
  merchant: z.object({
    name: z.string(),
    city: z.string(),
    country: z.object({
      code: z.string(),
      alpha3: z.string(),
      name: z.string(),
    }),
    category: z.object({
      code: z.string(),        // MCC as string — this is intentional for the level
      key: z.string().optional(),
      name: z.string(),
    }),
  }),
})

export type CardAuthEvent = z.infer<typeof CardAuthEventSchema>

// ─── beforeTransaction contract ──────────────────────────────────────────────

export const CardDecisionSchema = z.object({
  approved: z.boolean(),
  message: z.string().optional(),
})

export type CardDecision = z.infer<typeof CardDecisionSchema>
