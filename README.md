## ⚠️ Playground Project

This is **not an official Investec product**.

It's a community experiment --- a playground to test a fun, API game idea for developers in the [Investec Developer community](https://investec.gitbook.io/programmable-banking-community-wiki).

If you'd like to improve it, simplify it, or make it more ridiculous (in
a good way):

PRs welcome.

------------------------------------------------------------------------

# 🛡️ Investec Developer Quest

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

Your editable file for this first level is:

```text
seasons/season-1/level-1/solution.js
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
pnpm game level <n>               # Load a level (copies starter code, prints story)
pnpm game level <n> --season 2    # Load from a specific season (default: 1)

pnpm game test                     # Run tests + attack script on active level
pnpm game test --season 2 --level 1

pnpm game watch                    # Re-run test + attack on file changes
pnpm game watch --season 2 --level 3 --debounce 300

pnpm game hint                     # Reveal next hint
pnpm game hint --all               # Show all unlocked hints

pnpm game reset                    # Restore starter code (with confirmation)
pnpm game reset --yes              # Skip confirmation

pnpm game status                   # Show progress across all levels
```

Your progress is saved to `~/.investec-game/progress.json`. To reset all progress and start fresh, delete that file:

```bash
rm ~/.investec-game/progress.json
```

## Finished The Quest? Claim Your Prize

If you complete all 14 levels, you can claim Investec Developer Game swag.

To reduce spam and bot submissions, the claim form link is not posted publicly in this repo.

Claim flow:
1. Run `pnpm game status` and confirm it shows `14/14 levels complete`.
2. Open a GitHub issue in this repository with title `Swag claim request`.
3. Include your `pnpm game status` screenshot in the issue.
4. A maintainer will share the claim form link with you directly.

We still run this on a community honor system and review claims in good faith.

## How it works

### Level structure

Each level lives in `seasons/season-N/level-N/` and contains:

| File | Purpose |
|---|---|
| `story.md` | The scenario — read this first |
| `starter/solution.js` | Starter template (copied into `solution.js` on first load) |
| `solution.js` | Your working solution — **you edit this** |
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

## Inspired By

Inspired by GitHub's [Secure Code Game](https://securitylab.github.com/secure-code-game/): "Learn to code securely while having fun through our popular open source in-editor experience. Get started in under 2 minutes" 
