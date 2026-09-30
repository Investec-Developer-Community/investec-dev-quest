# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- A 14-second README hero GIF featuring the DEV QUEST logo, all 23 missions, and the Merchant Mirage fail-repair-win loop.
- An isolated demo recorder and regeneration guide in `docs/media/`, with checks for real gameplay outcomes and terminal alignment.

### Changed

- README onboarding now opens with a concise "What you'll learn in 10 minutes" preview and a direct setup link.
- Ignore local environment variants such as `.env.local` while keeping the public `.env.example` configuration publishable.
- Public setup and contributor guides now pin pnpm 9.12.3, cover strict CI validation, use the workspace mock-API command, and include complete Windows clone steps and all season boss learning outcomes.
- The validator's offline-API guidance now uses the same supported workspace startup command as the contributor docs.

## [2.0.0] - 2026-09-27

Version 2 of Investec Developer Quest focuses on the whole player journey: a faster first win, help when you're stuck, rewards along the way, a full Season 3, community touchpoints, and a bridge to the real Investec APIs.

### Upgrade notes (breaking)
- **Campaign size is now 23 levels.** Season 3 grows from 1 to 5 missions, so swag eligibility now requires **23/23**. Existing progress files keep working without migration. A finished v1 profile shows 19/23, and `pnpm game` routes it to the first new mission.
- **XP is re-scored.** Hint and attempt bonuses are graduated (see Changed). XP is derived from stored attempts and hints, so existing totals may rise. Max XP per level is unchanged.
- **Stricter authoring contract.** Level manifests must include `estimatedMinutes`, and every `debrief.md` must include `What changed`, `Why it matters`, `Production habit`, and `Try it for real`. `scripts/validate-levels.mjs` enforces both.

### Added
- **Season 3 expansion (4 new missions):**
  - `s3-l2` **Replay Rewind**: webhook freshness windows (past and future) and delivery-ID replay caches.
  - `s3-l3` **Callback Trap**: SSRF-safe callback URL validation with parsed, exact host allowlists (userinfo, look-alike domain, path-smuggling, and port attacks).
  - `s3-l4` **Ledger Lock**: tamper-evident hash-chained audit log verification (edit-and-rehash, deletion, and reordering attacks).
  - `s3-l5` **Season Boss: Settlement Sentinel**: an ordered webhook pipeline combining HMAC, freshness, deduplication, callback validation, and an audited exit for every decision.
  - The new levels join the Security Path (s3-l2, s3-l3) and the Grandmaster Run. Hint topics (`replay`, `ssrf`, `audit-log`) and `explain` coaching cover them.
- **"Try it for real" in every debrief:** each of the 23 debriefs links the matching Investec API reference, sandbox, card IDE guide, FAQ tip, or community resource. The debrief template includes the section.
- **"What to build next" panel:** when you complete a path, and on `pnpm game certificate`, the CLI suggests a real-API project with links.
- **Share moments:** one-time share and star prompts the first time you block an exploit, beat a season boss, finish a path, or complete the campaign, with GitHub star, X, and LinkedIn links. Each moment appears once per profile. Opt out with `GAME_QUIET_SOCIAL=1` (new in `.env.example`) or `--quiet-social` on `test`/`watch`.
- **Share your approach:** `pnpm game reference` ends with the five debrief questions and a pre-filled GitHub Discussions **Show and tell** link.
- Markdown links in stories and debriefs render in the terminal as `label (url)`.
- `pnpm game start`, also the default when `pnpm game` runs with no arguments. It briefs new players and loads the first Quickstart mission. Returning players resume their active mission or load the next one.
- GitHub Codespaces / dev container support (`.devcontainer/devcontainer.json`) with Node 20, pnpm 9, dependencies, and `.env` preconfigured, plus an "Open in GitHub Codespaces" README badge.
- Campaign routing helper (`resolveNextMission`) with unit coverage.
- Stuck-escape ladder. Once both written hints are used, `pnpm game hint` suggests `explain`, the new `pnpm game hint --walkthrough`, and a pre-filled GitHub Discussions **Q&A** link for the level. `pnpm game test` shows the ladder automatically after 5 attempts on a mission.
- `pnpm game hint --walkthrough` pinpoints the first failing assertion: suite, test name, failure message, intent, and the `it(...)` source block. It counts as a third hint the first time; re-running it is free. It isn't charged when nothing is failing or the runner errors.
- A progress delta on failing runs (for example `Behavior 3/5 → 4/5 ▲   Red Team 0/2 → 0/2 =`) with a one-line verdict. This works in both `test` and `watch`.
- `estimatedMinutes` on every level manifest. It's shown in `level`, `status` (incomplete levels), and `map` (time remaining per path). `create-level` accepts `--minutes`.
- Milestone rewards: badges for every completed path and season, and a rank ladder (Recruit → Analyst at 3 → Responder at 6 → Specialist at 12) before the final campaign titles. The win banner announces new badges and promotions. `status` shows your rank and badges.
- `pnpm game badge` lists earned and locked badges, with share text for each earned badge.
- Local daily streaks (consecutive days with at least one test run). A "Welcome back" panel on `pnpm game` shows when you last played, your streak, and the badge closest to completion. `status` shows the streak. Nothing is sent anywhere.
- Curated mutation and valid-alternative checks for enrolled levels, starting with token lifecycle, human approval, and trusted tool resolution.
- `pnpm test:unit` for CLI helper and quality-gate regression coverage, now covering routing, XP, ranks, badges, streaks, walkthrough extraction, social moments, and community links.

### Changed
- The Quickstart Path now starts with the offline induction mission: Season 2 Level 1 `Merchant Mirage` → Season 1 Level 1 `First Contact` → Season 4 Level 1 `Tool Gatekeeper`.
- **XP is now graduated.** The hint bonus is +50/+25/+10/+0 for 0/1/2/3+ hints (previously +50 only for 0 hints). The attempt bonus is +25 for 1–2 attempts, +10 for 3–4, and +0 for 5+ (previously +25 only for ≤2). Max XP is unchanged.
- The win banner shows an XP breakdown (base, hints, attempts, boss), and unlocking a hint shows the level's new hint bonus.
- The win banner, `status`, and `certificate` now name the next mission on the Quickstart Path, then the Grandmaster Run, instead of the next level in season order.
- Rewrote the `Merchant Mirage` and `First Contact` mission briefs so the Response Cell induction reads naturally in either play order.
- Carry-forward case files and reference/journal addenda now show `not assessed yet` until the source Season 1 mission has been played, instead of projecting default posture.
- The Security Path now includes replay protection and SSRF-safe callbacks (7 missions).
- Updated README, facilitator guide, authoring guide, Windows setup, troubleshooting, architecture overview, demo guide, and CONTRIBUTING for v2.
- Strict level validation now reports curated quality coverage alongside the normal starter/reference checks.
- CLI and workspace version bumped to `2.0.0`.

### Fixed
- Strengthened token-refresh, approval, and registry assertions to reject stale-token reuse, truthy non-boolean policy values, and prefix-based bypasses.
- Kept working solutions restored during validation so contributor work is not clobbered during checks.

## [1.7.0] - 2026-05-19

Focused on token-lifecycle correctness in Season 1 and clearer XP scoring feedback.

### Added
- Added total XP tracking to `pnpm game status` output (derived from existing progress), displayed as `XP: <earned> / <max>`.
- Added total XP, no-hint solves, and low-attempt solves to `pnpm game certificate`.

### Changed
- Reworked Season 1 Level 2 `Token Trouble` to teach token lifetime management: reuse valid tokens, respect `expires_in`, refresh on expiry or first `401`, and avoid per-request token fetches.
- Updated level win banner copy from `XP: +<n>` to `XP earned: +<n>` for clarity.
- Clarified docs and player messaging that campaign completion remains `19/19` levels complete, while XP is a secondary quality/bragging layer.
- Updated campaign-complete status messaging to use dynamic `<complete>/<total>` mission counts instead of a hardcoded `19/19` string.

### Fixed
- Ensured XP remains derived from existing progress state instead of introducing a separate persisted XP field, preserving compatibility with existing player profiles.
- Standardized completed-level date rendering in `pnpm game status` for consistent output across environments.

## [1.6.0] - 2026-05-18

Focused on campaign usability, contributor authoring quality, and clearer progression feedback across all 19 levels.

### Added
- Added `pnpm game map` with guided paths (Quickstart, API Foundations, Card Code, Security, Grandmaster) and next-mission prompts.
- Added `pnpm game certificate` for shareable 19/19 completion output.
- Added display-only XP in level win banners.
- Added Red Team `attackName` metadata to all level manifests and named attack result panels in the CLI.
- Added required `debrief.md` coverage for all 19 levels.
- Added helper test coverage for path-progress and certificate-summary logic.
- Added architecture guide documentation in `docs/architecture-overview.md`.

### Changed
- Made CLI banner metadata source-driven: version is read from `packages/cli/package.json`, and mission count is derived from the live level catalog.
- Updated README quickstart ordering to the recommended campaign flow: Season 1 Level 1, Season 2 Level 1, then Season 4 Level 1.
- Improved `pnpm game status` guidance: now recommends `pnpm game map`, points new players to Season 1 Level 1, and shows a campaign-complete banner at 19/19.
- Tightened all level stories into shorter playable briefs while keeping existing solution contracts intact.
- Updated authoring guidance to require `attackName` and `debrief.md`, and to document the short-brief plus optional field-notes story pattern.
- Strengthened `scripts/validate-levels.mjs` to validate `attackName`, required debriefs, exact hint count, and story structure while preserving starter/reference contract checks.

### Fixed
- Fixed `showBanner` syntax in `packages/cli/src/ui/theme.ts` to restore stable CLI startup and output.
- Improved `pnpm game explain` routing so MCC/string/coercion attack failures prefer the card-code normalization hint before generic state-mutation advice.
- Updated scaffold generation to include `attackName` in new level manifests.
- Updated authoring guide validation instructions to the supported strict validator command.

## [1.0.0] - 2026-05-15

### Added
- New Windows onboarding guide: `docs/windows-setup.md` with prerequisites, PowerShell execution policy remediation, verification commands, and security notes.
- Contributor release checklist now requires a fresh-install Windows smoke test before public push/release (`CONTRIBUTING.md`).
- Season 1 Boss level added: `s1-l6` "Reconciliation Rift" (OAuth2 + pagination + transaction filtering + beneficiary validation + idempotent payment orchestration).
- Season 2 Boss level added: `s2-l6` "Rule Reactor" (MCC blocking + country allowlist + velocity + daily limit + fast-food budget state controls).
- Season 4 Level 4 added: `s4-l4` "Description Sanitizer" (prompt-injection detection in transaction descriptions).
- Season 4 Level 5 added: `s4-l5` "Registry Verifier" (tool poisoning defense via trusted registry resolution).
- Season 4 Level 6 added: `s4-l6` "Loop Detector" (runaway agent loop detection on repeated tool calls).
- Boss-level metadata support added with optional `boss` field in level manifests and a status UI boss badge.
- Carry-forward consequence services for dynamic debrief/reference context: arc postmortem, incident visibility, beneficiary incident chain, and operational risk summary.
- Beneficiary incident chain projection with boss-level wrap-up context in `game reference` output for later seasons.
- Operational risk matrix derived from `s1_token_fix_depth` + `s2_state_discipline`, including non-blocking review notes in later-season reference output.
- Authoring checklist for adding arc flags and rubric evidence IDs (`docs/authoring-guide.md`).
- Regression coverage for consequence projection logic in season context tests.
- New `pnpm game journal` command to surface recorded arc choices, evidence trail, and downstream consequence summaries.
- New `pnpm game explain` command to convert failing behavior/attack tests into non-spoiler next-step coaching.

### Changed
- README first-run flow now explicitly points Windows players to `docs/windows-setup.md` before running game commands.
- Troubleshooting docs now include a dedicated Windows PowerShell execution-policy fix path (`docs/troubleshooting.md`).
- Player/facilitator docs now reflect 19 total levels and updated completion targets (`README.md`, `docs/facilitator-guide.md`, `PLAN.md`).
- `pnpm game status` now surfaces `Carry-forward operational risk: not assessed yet` on fresh profiles and only shows a risk band (`elevated`/`guarded`/`resilient`) after relevant carry-forward evidence exists.
- README and troubleshooting docs now document the carry-forward consequence model, expected rendering, and recovery steps for stale progress/evidence state.
- Default failed-test feedback is now beginner-friendly (one-line failure reasons by default), with `--verbose` for fuller trace output.
- `watch` mode now supports `--verbose` failure output parity with `test` mode.
- Season 1 Level 1 Hint 1 is now diagnostic-first; implementation-shape guidance remains in Hint 2.
- README first-run guidance now points players to `pnpm game explain` and `pnpm game journal` when failures are unclear.

### Fixed
- CLI mock API startup now uses `shell: true` on Windows only in `packages/cli/src/services/apiProcess.ts` to prevent platform-specific `npx` launch failures.
- CLI mock API startup now surfaces spawn/early-exit failures immediately instead of failing silently behind health-check timeouts.
- Preflight now performs a Windows-only PowerShell execution policy check and exits early with a friendly remediation command when policy blocks script execution (`packages/cli/src/preflight.ts`).
- `scripts/validate-levels.mjs` now preserves/restores existing `solution.js` files during contract checks instead of clobbering contributor work.
- Validator now prints explicit mock API startup guidance when API-required levels are skipped and summarizes skipped API levels.

## [0.9.0] - 2026-05-04

### Added
- **Terminal markdown renderer** (`packages/cli/src/ui/markdown.ts`): story files, hints, and debriefs now display with formatted headings, styled code blocks, bullet lists, blockquotes, and inline formatting instead of raw markdown.

### Changed
- **Terminal UI overhaul**: replaced `chalk`, `boxen`, and `ora` with `@clack/prompts` and `picocolors` across the entire CLI. Output now uses a connected-line diamond-bullet aesthetic with bordered note panels, integrated spinners, and styled confirm prompts.
- Added "DEV QUEST" ASCII art banner with gray gradient to `status` and `level` commands.
- Preflight errors now use the same `@clack/prompts` error styling as the rest of the CLI (previously used raw `console.error`).
- Interactive `reset` confirmation now uses a proper confirm prompt instead of raw `readline`.

### Fixed
- Extracted a single `REPO_ROOT` constant (`packages/cli/src/paths.ts`) shared across all modules — was previously computed independently in 5 files with fragile relative paths.
- Removed unused `LevelStatus` type import in `progress.ts`.
- Removed stale `better-sqlite3` from `pnpm-workspace.yaml` `allowBuilds` (no longer a dependency).
- Removed unused `@investec-game/shared` dependency and TypeScript project reference from `@investec-game/webhook-emitter` (the package only uses Node built-in `crypto`).

---

## [0.8.0] - 2026-04-28

### Added
- Season 1, Level 1 "First Contact" — OAuth2, pagination, balance validation
- Season 2, Level 1 "Merchant Mirage" — MCC type-coercion defensive coding
- Season 1 Levels 2–5 and Season 2 Levels 2–5 (Phase 1 season completion)
- Season 3, Level 1 "Webhook Whiplash" — HMAC webhook signature verification
- Season 4, Level 1 "Tool Gatekeeper" — exact allowlist enforcement for AI tool calls
- Season 4, Level 2 "Approval Anchor" — explicit human approval requirement for high-risk actions
- Season 4, Level 3 "Citation Checkpoint" — claim-by-claim citation validation for AI answers
- Dual-validation testing mechanic (behavior tests + attack tests)
- Local mock Investec API (Hono, port 3001)
- CLI with `level`, `test`, `hint`, `reset`, `status` commands
- CLI `watch` command for debounced auto-runs on save
- Preflight checks: Node version, `.env` presence, required vars
- Level validation CI script (`scripts/validate-levels.mjs`)
- Level scaffold generator (`scripts/create-level.mjs`)
- New `@investec-game/webhook-emitter` package with signature helpers and signed POST emitter
- GitHub Actions: CI pipeline + release workflow
- Dependabot weekly dependency updates
- Secret scanning via gitleaks
- Facilitator guide + troubleshooting docs

### Changed
- `scripts/validate-levels.mjs` now handles current Vitest JSON shape, loads `.env`, and supports API-aware level skips when the mock API is offline
- CLI runtime robustness improvements in command parsing, local binary execution, and file-watch handling
- Level catalog expanded to 14 validated levels across Seasons 1–4
