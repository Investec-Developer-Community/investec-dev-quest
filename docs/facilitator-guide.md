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

> **Facilitator note:** While the Player Paths and session tracks below are great for learning or workshop pacing, remind participants that *to claim swag, they must complete all 19 levels* (not just a single path or track). Encourage them to use the paths for learning, but check their full progress with `pnpm game status` if they want to claim a prize.

### Junior workshop track

Use this when the room is new to Investec API, Programmable Banking, or test-driven security work.

| Time | Activity |
|------|----------|
| 0-10 min | Setup check and explanation of behavior tests versus attack tests |
| 10-35 min | Season 1 Level 1 as a guided walkthrough |
| 35-55 min | Season 1 Level 2 or Season 2 Level 1 in pairs |
| 55-75 min | Independent solve time with hints encouraged |
| 75-90 min | Run `pnpm game reference` for completed levels and discuss debriefs |

Facilitation style: encourage small edits, frequent `pnpm game test`, and early hint usage. The goal is confidence with the loop, not speed.

### Senior workshop track

Use this when the room already knows JavaScript and wants deeper security or architecture discussion.

| Time | Activity |
|------|----------|
| 0-10 min | Briefing: dual-validation mechanic and threat-model mindset |
| 10-35 min | Season 2 Level 1 as a quick calibration challenge |
| 35-65 min | Season 3 Level 1 or Season 4 Level 1 as a code-review exercise |
| 65-85 min | Compare fixes with `pnpm game reference` and debate trade-offs |
| 85-90 min | Capture production habits and follow-up level ideas |

Facilitation style: ask participants to describe the exploit before coding, then compare whether their fix blocks the attack without breaking valid behavior.

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
- Session 4: Season 4 Level 4 `Description Sanitizer` (prompt-injection defense in transaction text)
- Session 5: Season 4 Level 5 `Registry Verifier` (tool poisoning and trusted registry resolution)
- Session 6: Season 4 Level 6 `Loop Detector` (runaway agent loop detection)

---

## Level-by-level learning outcomes

| Level | Outcome | Common stuck point |
|------|---------|--------------------|
| S1 L1 First Contact | OAuth2 credentials, pagination, account balance aggregation | Hardcoding credentials or fetching only the first page |
| S1 L2 Token Trouble | Recovering once from stale OAuth tokens | Retrying forever or forgetting to update the token store |
| S1 L3 Transaction Trail | Date filtering and cursor pagination | Client-side filtering instead of sending query parameters |
| S1 L4 Beneficiary Blueprint | Validating beneficiary IDs before payment flow | Returning truthy results without checking the fetched list |
| S1 L5 Idempotency Island | Deterministic idempotency keys for payment retries | Generating a random key per retry |
| S2 L1 Merchant Mirage | Normalising external card event fields before decisions | Comparing string MCCs to numeric blocklists |
| S2 L2 Budget Guardian | Pre-approval budget checks and post-approval state updates | Updating spend in the wrong hook |
| S2 L3 Velocity Vault | Rolling-window transaction velocity limits | Counting all history instead of recent timestamps |
| S2 L4 Country Control | Exact country allowlists and default-deny logic | Building the allow path but forgetting the deny path |
| S2 L5 Limit Loop | State writes only after approved decisions | Recording declined transactions as spend |
| S3 L1 Webhook Whiplash | HMAC verification and timing-safe comparison | Accepting partial or malformed signatures |
| S4 L1 Tool Gatekeeper | Exact tool allowlists for AI agents | Prefix matching tool names |
| S4 L2 Approval Anchor | Human approval for high-risk automation | Trusting action metadata as approval evidence |
| S4 L3 Citation Checkpoint | Validating every answer claim has support | Checking only the first claim |
| S4 L4 Description Sanitizer | Treating transaction descriptions as untrusted model input | Passing instruction-like payloads straight into agent context |
| S4 L5 Registry Verifier | Preferring trusted tool entries over registry order | Executing the first duplicate tool match without trust checks |
| S4 L6 Loop Detector | Detecting consecutive repeated tool use across param churn | Only flagging exact duplicate payloads and missing runaway loops |

## Debrief prompts

Use these after participants complete a level and run `pnpm game reference`:

1. What did the behavior tests prove?
2. What did the attack script prove?
3. What real production habit does this level teach?
4. Did your fix reject anything legitimate?
5. What additional edge case would you add to the tests?

## Carry-forward visibility branches

When participants run [game reference](../README.md) on Season 2+ levels, the CLI now renders an **Incident Visibility** addendum derived from their earlier logging quality in Season 1 Level 3.

Expected branches:

| Logging maturity (`s1_logging_maturity`) | Visibility quality | Facilitation cue |
|------|------|------|
| `none` | `opaque` | Ask what incident evidence was unavailable and how that changed response speed. |
| `basic` | `partial` | Ask which fields helped and which blind spots still forced guesswork. |
| `forensic` | `forensic` | Ask how complete traceability changed triage confidence and ownership clarity. |

Use this to reinforce that observability choices are not local optimizations; they materially change downstream investigative outcomes.

## Common stuck points

| Symptom | Facilitation nudge |
|---------|--------------------|
| Player edits reference code | Remind them to edit `solution.js`, not `reference/solution.js` |
| Behavior passes but attack fails | Ask what the exploit input is proving |
| Attack passes but behavior fails | Ask whether the fix became too restrictive |
| Hints feel like failure | Frame hints as workshop pacing tools, not scoring penalties |
| Mock API confusion | Show `curl http://localhost:3001/health` and explain the CLI auto-starts it |

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
pnpm game reference --season 1 --level 1 # after completion, review reference/debrief
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
