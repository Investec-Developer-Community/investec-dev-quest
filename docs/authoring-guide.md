# Level Authoring Guide

This guide explains how to write a new level for the Investec Developer Game.

---

## Philosophy

Every level must teach **one thing clearly**.

The best levels are:
- **Realistic**: the scenario could happen on a real Investec integration
- **Fast**: solvable in 10–25 minutes
- **Observable**: the player can run the code and see what happens
- **Multi-solution**: tests check outcomes, not exact code style

---

## Directory structure

Copy `templates/level-template/` into the right season folder:

```
seasons/
└── season-N/
    └── level-N/
        ├── manifest.json
        ├── story.md
        ├── starter/
        │   └── solution.js   ← intentionally broken/incomplete
        ├── tests/
        │   └── behavior.test.js
        ├── attack/
        │   └── exploit.test.js
        ├── hints/
        │   ├── hint-1.md
        │   └── hint-2.md
        ├── reference/
        │   └── solution.js   ← correct solution (not shown until complete)
        └── vitest.config.js
```

---

## The dual-validation mechanic

This is the core of the game. Every level has two test suites:

### `tests/behavior.test.js`
- Tests **correct behaviour**: the right outputs for the right inputs
- Must **fail** on the unmodified starter code (so there's something to fix)
- Must **pass** after the player implements a correct solution

### `attack/exploit.test.js`
- Tests **security**: demonstrates the exploit scenario
- **Critical**: the assertions must confirm "the exploit was BLOCKED"
- Must **fail** on the buggy starter code (exploit succeeds = test fails)
- Must **pass** after the fix (exploit blocked = test passes)

#### Attack script template

```js
describe('Attack: type-coercion bypass', () => {
  it('gambling transaction with string MCC is DECLINED (exploit blocked)', () => {
    // Before fix: approved = true  → test FAILS (bad — exploit works)
    // After fix:  approved = false → test PASSES (good — exploit blocked)
    const result = beforeTransaction(makeEvent('7995'))
    expect(result.approved).toBe(false)  // ← assert the BLOCKED state
  })
})
```

**Win condition**: `tests/` all pass AND `attack/` all pass.

---

## manifest.json fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✅ | `"s1-l1"`, `"s2-l3"` etc. Must be unique. |
| `name` | string | ✅ | Short, catchy name |
| `season` | number | ✅ | 1–4 |
| `level` | number | ✅ | 1-N within the season |
| `difficulty` | string | ✅ | `"beginner"`, `"intermediate"`, or `"advanced"` |
| `apiRequired` | boolean | ✅ | `true` if the mock API must run (Season 1) |
| `tags` | string[] | ✅ | Searchable tags, e.g. `["oauth2", "pagination"]` |

---

## starter/solution.js rules

The starter code is the file the player edits. It must:

1. **Compile/parse successfully** (no syntax errors)
2. **Fail the behavior tests** (so there's something to fix)
3. **Allow the attack to succeed** (so there's a vulnerability to address)
4. Feel like realistic code under investigation, not a blank kata
5. Contain clear JSDoc on every export where the contract is not obvious

Common patterns:
- Introduce a subtle bug (type coercion, off-by-one, missing check)
- Leave a `// TODO: handle pagination` comment with just the first page implemented
- Implement the happy path but skip the edge case the attack script exploits
- Trust one unsafe field, such as `requestedBy`, `country.code`, or a partial signature

Avoid blank `throw new Error('Not implemented')` starters unless the level is intentionally an onboarding exercise. The best levels feel like fixing a real incident: the code runs, some behavior appears correct, and the player has to discover the flawed assumption.

### Starter examples

Good starter: realistic, runnable, and flawed in the way the level teaches.

```js
const BLOCKED_MCCS = [5816, 7995]

export function beforeTransaction(event) {
  const mcc = event?.merchant?.category?.code
  if (BLOCKED_MCCS.includes(mcc)) {
    return { approved: false, message: 'Restricted merchant category' }
  }
  return { approved: true }
}
```

Bad starter: it gives the player no incident to investigate.

```js
export function beforeTransaction(event) {
  throw new Error('Not implemented')
}
```

Bad starter: it is so broken that the intended lesson disappears.

```js
export function beforeTransaction() {
  return null
}
```

### Story structure

Use this structure for new levels:

1. **Mission Brief** — a short scenario with a concrete user or operational problem.
2. **Bug Report** — what is failing or risky, without naming the exact fix.
3. **Background** — only the domain context needed to start.
4. **Your Task** — required exports and expected contract.
5. **Threat** — what the attack proves, without giving away the implementation.
6. **Win Condition** — behavior tests pass and the attack is blocked.

Move root-cause explanations into hints or post-solve debriefs. Players should read the story and know what to investigate; they should not read the story and already know the exact line to change.

Good story copy:

> A QA tester noticed that some blocked merchant transactions are still being approved. The event payload comes from a platform boundary, so inspect the input shape before making authorization decisions.

Bad story copy:

> The bug is that `Array.includes` uses strict equality and the MCC is a string, so convert it to a number.

---

## reference/solution.js rules

This is the gold standard. It:
- Passes all behavior tests
- Blocks all attacks (attack script passes)
- Is clean, idiomatic JavaScript
- Is **not shown to the player** until the level is complete

---

## Hints

Write exactly 2 hints per level, in increasing specificity:

- **Hint 1**: Points at the right concept without giving it away. `"What type does Array.includes use for equality?"` 
- **Hint 2**: Shows the pattern. Code snippet allowed, but not the complete solution.

Hint 1 should help the player choose what to inspect. Hint 2 can show a small implementation pattern, but should still leave the final integration to the player.

---

## Debriefs

Debriefs are optional per level, but recommended for levels with security or production engineering lessons. If present, `pnpm game reference` shows them after completion.

Use this structure:

1. **What changed** — the essential implementation difference.
2. **Why it matters** — the risk or failure mode this prevents.
3. **Production habit** — the durable engineering practice players should remember.

Keep each section short. The debrief should explain the lesson, not duplicate the reference solution line by line.

---

## Validation checklist

Before submitting a new level, verify:

- [ ] `manifest.json` is valid (run `npx zod-cli validate manifest.json` against the schema)
- [ ] Starter code fails `tests/` (run `vitest run tests/`)
- [ ] Starter code causes `attack/` to fail (run `vitest run attack/`) — exploit succeeds
- [ ] Reference code passes `tests/` (copy reference to solution.js, run `vitest run tests/`)
- [ ] Reference code causes `attack/` to pass (run `vitest run attack/`) — exploit blocked
- [ ] `story.md` introduces the scenario without giving away the answer
- [ ] `story.md` includes `Mission Brief`, `Bug Report`, `Your Task`, `Threat`, and `Win Condition`
- [ ] Exactly two hints exist under `hints/`
- [ ] Level is completable in ≤ 25 minutes (test on a fresh player)

---

## Season guidelines

| Season | Focus | Player learns |
|---|---|---|
| 1 | API Foundations | Auth, accounts, transactions, pagination, retries |
| 2 | Card Code & Rules Engine | `beforeTransaction`, MCC filters, velocity limits |
| 3 | Secure Fintech Workflows | Webhook HMAC, replay protection, secrets management |
| 4 | Intelligent Banking Automation | Agent tool boundaries, approval gates |

### Season 3 authoring note

For webhook-focused levels, prefer reusable helpers from `packages/webhook-emitter` for:

- Building signatures from `timestamp.rawBody`
- Header format consistency (`x-investec-signature`, `x-investec-timestamp`)
- Timing-safe digest comparison patterns

When writing tests, always sign the exact raw request body string. Avoid signing parsed/re-serialised JSON, since that can hide canonicalization bugs.
