# Facilitator Guide

This guide is for Investec engineers and developer advocates running the game as a structured workshop, hackathon event, or onboarding session.

---

## Before the session

### Prerequisites to verify

Participants need:
- **Node.js ≥ 20** — the CLI checks and blocks on startup if missing
- **pnpm ≥ 9** — `npm install -g pnpm` if absent
- A **code editor** (VS Code recommended)
- A working **internet connection** is NOT required — the mock API runs fully locally

### Pre-clone the repo

Save setup time by having participants clone and install before the session:

```bash
git clone https://github.com/Investec-Developer-Community/investec-dev-quest.git
cd investec-dev-quest
pnpm install
cp .env.example .env
pnpm game status
```

If `status` shows available levels and no errors, they're ready.

---

## Suggested session formats

### 90-minute intro workshop

| Time | Activity |
|------|----------|
| 0–10 min | Introduction to the game, concept of dual-validation testing |
| 10–20 min | Setup verification (everyone runs `pnpm game status`) |
| 20–50 min | Season 1, Level 1 "First Contact" — pair programming recommended |
| 50–80 min | Season 2, Level 1 "Merchant Mirage" — solo attempt |
| 80–90 min | Debrief: what patterns did you notice? |

### Hackathon track (half day)

- Morning: All Season 1 levels
- Afternoon: Season 2 (security/defensive focus)
- Close: Leaderboard via `pnpm game status` screenshots or a shared spreadsheet

### Security-focused track (half day)

- Session 1: Season 2 level recap (defensive card code)
- Session 2: Season 3 Level 1 `Webhook Whiplash` (HMAC verification)
- Session 3: Threat modeling exercise (replay, SSRF, tamper-evident logs)

### AI-automation track (half day)

- Session 1: Season 4 Level 1 `Tool Gatekeeper` (tool allowlist boundaries)
- Session 2: Season 4 Level 2 `Approval Anchor` (high-risk human approval gate)
- Session 3: Season 4 Level 3 `Citation Checkpoint` (hallucination-resistant answer validation)

---

## How the game works

Each level has two validation layers:

1. **Behavior tests** (`tests/`) — unit/integration tests that check the player's `solution.js` implements the expected functionality correctly
2. **Attack tests** (`attack/`) — adversarial tests that check the player's solution BLOCKS a known exploit

Players win a level only when **both suites pass**. This is the dual-validation mechanic that teaches defensive programming.

### The flow

```
pnpm game level 1 --season 1          # read the brief and story
pnpm game hint --season 1 --level 1   # optional: unlock a hint
pnpm game test --season 1 --level 1   # run tests (real-time feedback)
```

The game auto-starts the mock API if it isn't running.

---

## Resetting player progress

If a participant wants to reset a level:

```bash
pnpm game reset --season 1 --level 1
```

To reset all progress for a participant, delete the progress file:

```bash
rm ~/.investec-game/progress.json
```

Progress is stored in `~/.investec-game/progress.json` — safe to delete manually too.

---

## Running the mock API manually

The CLI starts it automatically, but you can also run it directly for debugging:

```bash
npx tsx packages/mock-api/src/index.ts
```

Health check: `curl http://localhost:3001/health`

---

## Common issues during sessions

See [docs/troubleshooting.md](troubleshooting.md) for the full list. Quick reference:

| Symptom | Fix |
|---------|-----|
| `Node version too old` | Install Node ≥ 20 via `nvm use --lts` or [nodejs.org](https://nodejs.org) |
| `Missing .env file` | `cp .env.example .env` |
| `Cannot find module` | `pnpm install` from repo root |
| Tests all skip/0 collected | Check `vitest.config.js` path in level directory |
| Mock API port 3001 in use | `lsof -ti:3001 | xargs kill` |

---

## Customising for your audience

### Adding a company-specific level

Use the scaffold generator and follow the authoring guide:

```bash
pnpm create-level -- --season 4 --level 1 --name "Investec-specific scenario" --difficulty intermediate
```

### Adjusting mock API fixture data

Edit `packages/mock-api/src/data/fixtures.ts`. All values are synthetic — add merchants, transactions, or accounts relevant to the scenario.

### Running a branded intro

The `pnpm game level <number> --season <number>` output reads from `story.md`. Edit the story for context-specific framing without touching any test code.
