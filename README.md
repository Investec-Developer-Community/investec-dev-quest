# Investec Developer Game

A **local-first, level-based developer game** for the Investec developer community.

Learn real-world Investec API patterns, Programmable Banking card logic, and secure fintech engineering — by solving problems in code, not reading slides.

Current content: **14 playable levels** across Seasons 1–4.

---

## Quickstart

```bash
git clone https://github.com/Investec-Developer-Community/investec-dev-quest.git
cd investec-dev-quest
pnpm install
cp .env.example .env
pnpm game level 1 --season 1
```

Then to test your solution:

```bash
pnpm game test
```

---

## First Run (Beginner Path)

1. Load level: run `pnpm game level 1 --season 1` to read the story and copy starter code.
2. Run test: execute `pnpm game test` to see the first failing checks.
3. Use hint: if stuck, run `pnpm game hint` to reveal guidance.
4. Check status: run `pnpm game status` to track your progress.

---

## CLI Commands

```bash
investec-game level <n>               # Load a level (copies starter code, prints story)
investec-game level <n> --season 2    # Load from a specific season (default: 1)

investec-game test                     # Run tests + attack script on active level
investec-game test --season 2 --level 1

investec-game watch                    # Re-run test + attack on file changes
investec-game watch --season 2 --level 3 --debounce 300

investec-game hint                     # Reveal next hint
investec-game hint --all               # Show all unlocked hints

investec-game reset                    # Restore starter code (with confirmation)
investec-game reset --yes              # Skip confirmation

investec-game status                   # Show progress across all levels
```

---

## How it works

### Level structure

Each level lives in `seasons/season-N/level-N/` and contains:

| File | Purpose |
|---|---|
| `story.md` | The scenario — read this first |
| `starter/solution.js` | Your starting point — **you edit this** |
| `solution.js` | Your working solution (copied from starter on first load) |
| `tests/behavior.test.js` | Behavior tests — must pass |
| `attack/exploit.test.js` | Attack script — must pass after your fix |
| `hints/hint-1.md` | First hint (revealed on demand) |
| `hints/hint-2.md` | Second hint |
| `reference/solution.js` | Reference solution (revealed after completion) |

### Win condition

A level is complete when **both** test suites pass:

1. **Behavior tests** — your implementation handles all the right cases
2. **Attack script** — the vulnerability is fixed (the exploit is blocked)

The attack script is written so that it **passes** when the exploit is blocked. This is the dual-validation mechanic: you can't over-restrict (breaks behavior tests) and can't under-fix (attack script still fails).

---

## Seasons

| Season | Theme |
|---|---|
| 1 | API Foundations — OAuth2, accounts, transactions, pagination |
| 2 | Card Code & Rules Engine — `beforeTransaction`, MCC filters, velocity limits |
| 3 | Secure Fintech Workflows — Webhook signatures, replay protection, secrets |
| 4 | Intelligent Banking Automation — Agent tool boundaries, approval gates, citation integrity |

---

## Mock API

The game includes a mock Investec API that simulates:

- `POST /identity/v2/oauth2/token` — OAuth2 client credentials (`Authorization: Basic`, `x-api-key`, `grant_type=client_credentials`)
- `GET /za/pb/v1/accounts` — Paginated accounts list
- `GET /za/pb/v1/accounts/:id/balance` — Account balance
- `GET /za/pb/v1/accounts/:id/transactions` — Transaction history
- `GET /za/pb/v1/accounts/:id/pending-transactions` — Pending transactions
- `GET /za/pb/v1/accounts/beneficiaries` — Beneficiaries list
- `POST /za/pb/v1/accounts/:id/paymultiple` — Payments with idempotency support

The CLI auto-starts it when a level requires it. No Docker needed.

Base URL: `http://localhost:3001`  
Credentials (from `.env`): `game_client_id` / `game_client_secret` + `game_api_key`

---

## Contributing a level

See [docs/authoring-guide.md](docs/authoring-guide.md) for the full guide.

Quick checklist:
1. Copy `templates/level-template/` into the right season folder
2. Write a realistic scenario in `story.md`
3. Implement a buggy/incomplete `starter/solution.js`
4. Write behavior tests and an attack script
5. Verify the starter fails and your reference solution passes both suites
6. Open a PR

---

## Project structure

```
investec-developer-game/
├── packages/
│   ├── cli/          # investec-game CLI
│   ├── mock-api/     # Mock Investec API (Hono)
│   ├── webhook-emitter/ # Signed webhook sender utilities for Season 3
│   └── shared/       # Shared types and Zod schemas
├── seasons/
│   ├── season-1/     # API Foundations
│   ├── season-2/     # Card Code & Rules Engine
│   ├── season-3/     # Secure Fintech Workflows
│   └── season-4/     # Intelligent Banking Automation
├── templates/
│   └── level-template/
└── docs/
    └── authoring-guide.md
```
