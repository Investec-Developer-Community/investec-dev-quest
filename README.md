# 🛡️ Investec Developer Quest

A local-first CLI game for learning Investec API patterns, Programmable Banking card logic, and secure fintech engineering.

> This is a community playground, not an official Investec product.

[![CI](https://github.com/Investec-Developer-Community/investec-dev-quest/actions/workflows/ci.yml/badge.svg)](https://github.com/Investec-Developer-Community/investec-dev-quest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node >=20](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](https://nodejs.org)
[![pnpm 9](https://img.shields.io/badge/pnpm-9-F69220.svg)](https://pnpm.io)

You will:
- fix intentionally flawed integration code
- run behavior tests to prove the feature works
- run attack tests to prove the exploit is blocked
- unlock references, debriefs, case files, and a completion certificate

Current content: **19 playable levels** across Seasons 1 to 4.

![homepage image](docs/dev_quest_hp_v2.png)

## 🚀 Start Here (5 minutes)

### 🧰 1) Prerequisites

- Node.js 20+
- pnpm 9+

Quick check:

```bash
node -v
pnpm -v
```

Windows players should read [Windows Setup](docs/windows-setup.md) first (PowerShell policy can block scripts).

### 📦 2) Install and start the Quickstart Path

```bash
git clone https://github.com/Investec-Developer-Community/investec-dev-quest.git
cd investec-dev-quest
pnpm install
cp .env.example .env
pnpm game map
pnpm game level 1 --season 1
```

The Quickstart Path is the recommended first route:

1. Season 1 Level 1: `First Contact`
2. Season 2 Level 1: `Merchant Mirage`
3. Season 4 Level 1: `Tool Gatekeeper`

To claim swag, you still need the Grandmaster Run: **all 19 levels**.

### 🧪 3) Run once, then edit once

```bash
pnpm game test
```

Edit this file:

```text
seasons/season-1/level-1/solution.js
```

### 🔁 4) Tight feedback loop

```bash
pnpm game test
# or
pnpm game watch
```

- Stuck? Use `pnpm game hint`
- Failures unclear? Use `pnpm game explain`
- Journal and case files become richer after solved levels record evidence: `pnpm game journal`

### ✅ 5) Confirm you are on track

```bash
pnpm game status
```

Behavior tests prove the feature works. Attack tests prove the exploit is blocked. A level is complete only when both pass.

## 🧭 Player Paths

These are suggested learning tracks. To claim swag, you must complete **all 19 levels**.

| Path | Recommended levels | Best for |
|---|---|---|
| Quickstart path | Season 1 Level 1, Season 2 Level 1, Season 4 Level 1 | First-time players learning the edit-test-hint loop |
| API foundations path | Season 1 Levels 1-6 | OAuth2, pagination, token refresh, beneficiaries, idempotent payments |
| Card code path | Season 2 Levels 1-6 | `beforeTransaction` rules, MCCs, budgets, velocity limits |
| Security path | Season 2 Level 1, Season 3 Level 1, Season 4 Levels 1, 4, 5 | Validation, HMAC verification, exact allowlists, injection defense |
| Grandmaster Run | All 19 levels | Swag eligibility |

Run `pnpm game map` to see path progress and the next incomplete mission.

## ⌨️ Commands

### Most-used commands

```bash
pnpm game level 1 --season 1
pnpm game test
pnpm game watch
pnpm game hint
pnpm game explain
pnpm game status
pnpm game map
```

### More command examples

```bash
pnpm game level <n> --season <n>   # load a level
pnpm game test --verbose            # full failure traces
pnpm game hint --topic auth         # topic-focused hint mode
pnpm game reference --season 2 --level 1
pnpm game reset --yes
pnpm game journal --all-evidence
```

For complete CLI options, run:

```bash
pnpm game --help
pnpm game <command> --help
```

The CLI header auto-reflects mission count and CLI version from current repo state.

Progress is stored at `~/.investec-game/progress.json`.

Reset all progress:

```bash
rm ~/.investec-game/progress.json
```

## 🧠 How the Game Works

### Level structure

Each level lives in `seasons/season-N/level-N/`.

| File | Purpose |
|---|---|
| `story.md` | Scenario and context |
| `starter/solution.js` | Starter template copied to working file |
| `solution.js` | Your working solution |
| `tests/behavior.test.js` | Behavior checks |
| `attack/exploit.test.js` | Exploit checks |
| `hints/hint-1.md` | First hint |
| `hints/hint-2.md` | Second hint |
| `reference/solution.js` | Reference implementation after completion |
| `debrief.md` | Required post-solve explanation |

### 🏁 Win condition

Both suites must pass:

1. Behavior tests
2. Attack script

This enforces dual validation: no over-restricting and no under-fixing.

### 📓 Carry-forward consequences

Quality of earlier fixes carries into later narrative and debrief output.

On completion, each level writes a case file entry with:
- adversary blocked
- production habit learned
- downstream consequence change

Case files and consequence context are surfaced via `status`, `journal`, and `reference`.

For architecture and consequence internals, see [docs/architecture-overview.md](docs/architecture-overview.md).

## 📚 Seasons

| Season | Theme |
|---|---|
| 1 | API Foundations: OAuth2, accounts, transactions, pagination |
| 2 | Card Code and Rules Engine |
| 3 | Secure Fintech Workflows |
| 4 | Intelligent Banking Automation |

## 🔌 Mock API

The local mock API is auto-started by the CLI for API-required levels.

- Base URL: `http://localhost:3001`
- Credentials from `.env`: `game_client_id`, `game_client_secret`, `game_api_key`

Troubleshooting and health-check steps are in [docs/troubleshooting.md](docs/troubleshooting.md).

## 🎁 Claim Your Prize

Swag eligibility requires **19/19 levels complete**.

Claim flow:

1. Run `pnpm game status` and confirm `19/19 levels complete`.
2. Run `pnpm game certificate`.
3. Open the swag claim issue directly: [Swag claim template](https://github.com/Investec-Developer-Community/investec-dev-quest/issues/new?template=swag_claim.yml).
4. Include your `pnpm game status` screenshot and certificate text.
5. A maintainer shares the claim form link directly.

## 🤝 Contributing a Level

See [docs/authoring-guide.md](docs/authoring-guide.md).

Architecture guide: [docs/architecture-overview.md](docs/architecture-overview.md).

Quick checklist:

1. Scaffold a level:

```bash
pnpm create-level -- --season <n> --level <n> --name "<Level Name>" --difficulty beginner --attackName "Exploit Name"
```

2. Write scenario in `story.md`.
3. Implement buggy/incomplete `starter/solution.js`.
4. Add behavior tests and attack script.
5. Add two hints and a `debrief.md`.
6. Verify starter fails and reference passes.
7. Open a PR.

For full validation parity (including API-required levels), run:

```bash
node scripts/validate-levels.mjs --strict
```

## 🗂️ Project Structure

```text
investec-developer-game/
├── packages/
│   ├── cli/
│   ├── mock-api/
│   ├── webhook-emitter/
│   └── shared/
├── seasons/
│   ├── season-1/
│   ├── season-2/
│   ├── season-3/
│   └── season-4/
├── templates/
│   └── level-template/
└── docs/
    ├── authoring-guide.md
    └── architecture-overview.md
```

## 🙌 Inspired by

Inspired by GitHub Secure Code Game:
https://securitylab.github.com/secure-code-game/
