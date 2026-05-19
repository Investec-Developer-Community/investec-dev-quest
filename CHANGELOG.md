# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
