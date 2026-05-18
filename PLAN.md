# Release Plan: Feedback Slices

## Release Invariants
- XP behavior remains unchanged across all slices.
- Level pass/fail contract stays the same: behavior and attack suites must both pass.
- No breaking progress schema changes in v1.5.x.
- Hint unlock order remains intact unless explicitly stated.

## v1.5.1

### Objective
Reduce command noise, shorten first-run output, and hide internal signal plumbing from player-facing surfaces.

### Scope
- scripts/game.mjs
- packages/cli/src/commands/level.ts
- packages/cli/src/ui/markdown.ts
- packages/cli/src/commands/journal.ts
- packages/cli/src/services/arcEvidence.ts
- packages/cli/src/services/arcFlags.ts
- README.md

### Out of Scope
- Topic-targeted hints
- Strict validation mode
- Case file persistence
- XP changes

### Exact Acceptance Criteria
- [x] Successful game commands do not print non-actionable internal build/lifecycle noise.
- [x] Repeated game commands avoid unnecessary rebuild chatter unless shared inputs changed.
- [x] Default S1L1 output is concise with a clear option to view full details.
- [x] Player-facing journal/evidence output uses friendly labels, not raw internal signal IDs.
- [x] Actionable failures are still visible and non-zero exits are preserved.

### Completion Notes (v1.5.1)
- Reduced command noise in `scripts/game.mjs` by silencing successful internal build output.
- Added shared build mtime checks in `scripts/game.mjs` to avoid unnecessary rebuild chatter.
- Made first-run output compact by default in `packages/cli/src/commands/level.ts` and `packages/cli/src/ui/markdown.ts`, with full details via `--full`.
- Hid internal signal IDs in player-facing evidence by using friendly labels in `packages/cli/src/services/arcEvidence.ts` and exposing raw IDs only via `--raw-signals` in `packages/cli/src/commands/journal.ts`.

### Release Gates
1. pnpm lint
2. pnpm build
3. pnpm validate
4. pnpm game level 1 --season 1
5. pnpm game test --season 1 --level 1
6. pnpm game journal

## v1.5.2

### Objective
Add guided topic hints and strict validation parity so green validation implies full coverage.

### Scope
- packages/cli/src/commands/hint.ts
- packages/cli/src/db/progress.ts
- scripts/validate-levels.mjs
- .github/workflows/ci.yml
- docs/authoring-guide.md
- docs/troubleshooting.md
- README.md

### Out of Scope
- Case file UX
- XP changes
- Broad narrative rewrites

### Exact Acceptance Criteria
- [x] Hint command supports topic-targeted retrieval using manifest tags and failure-topic mapping.
- [x] Topic targeting does not bypass existing sequential unlock order.
- [x] Validator supports strict mode that fails when API-required levels cannot be validated.
- [x] CI uses strict validation path by default.
- [x] Docs explain strict mode, soft mode, and remediation when mock API is unavailable.

### Completion Notes (v1.5.2)
- Added `pnpm game hint --topic <name>` support in `packages/cli/src/commands/hint.ts`.
- Topic focus now combines `manifest.tags` with inferred failure topics from behavior/attack failures.
- Sequential hint unlock order remains enforced; topic mode does not bypass unlock progression.
- Added strict/soft validation flags in `scripts/validate-levels.mjs` and made strict mode fail API-required levels when API is offline.
- Updated CI to run strict validation by default in `.github/workflows/ci.yml`.
- Updated player/author docs for topic hints and strict-vs-soft validation behavior.

### Release Gates
1. pnpm lint
2. pnpm build
3. node scripts/validate-levels.mjs
4. node scripts/validate-levels.mjs --strict
5. pnpm game hint --season 1 --level 1 --topic auth

## v1.6.0

### Objective
Add post-solve case file payoff using existing arc scaffolding, without changing solve contracts or XP behavior.

### Scope
- packages/cli/src/commands/test.ts
- packages/cli/src/runner/feedback.ts
- packages/cli/src/db/progress.ts
- packages/cli/src/commands/status.ts
- packages/cli/src/commands/journal.ts
- packages/cli/src/commands/reference.ts
- packages/shared/src/schemas.ts
- docs/facilitator-guide.md
- README.md

### Out of Scope
- XP redesign, persistence changes, or renaming
- Leaderboards/streak economy
- Test contract changes for existing levels

### Exact Acceptance Criteria
- [x] Completing a level creates a case file summary with: adversary blocked, production habit learned, and downstream consequence change.
- [x] Case file entries persist and are visible in status/journal/reference flows.
- [x] Case file content is derived from existing arc/evidence signals, not hardcoded per level.
- [x] Existing behavior/attack pass-fail contracts are unchanged.
- [x] XP behavior remains unchanged.

### Completion Notes (v1.6.0)
- Added a persisted `CaseFileEntry` schema in `packages/shared/src/schemas.ts` and store support in `packages/cli/src/db/progress.ts`.
- Added `packages/cli/src/services/caseFiles.ts` to derive case file summaries from arc flags, evidence signals, and consequence projections.
- Updated level completion flow in `packages/cli/src/commands/test.ts` to generate and persist case files on successful completion.
- Updated `packages/cli/src/runner/feedback.ts` to show case file summaries at level completion.
- Surfaced case files in `packages/cli/src/commands/status.ts`, `packages/cli/src/commands/journal.ts`, and `packages/cli/src/commands/reference.ts`.
- Updated user and facilitator documentation for case file behavior and review flow.

### Release Gates
1. pnpm lint
2. pnpm build
3. pnpm validate
4. pnpm game test --season 1 --level 1
5. pnpm game status
6. pnpm game journal --all-evidence
7. pnpm game reference --season 1 --level 1

## Post v1.6.0 Hardening (May 2026)

### Objective
Clean up release hygiene and topic-hint UX after v1.6.0 implementation.

### Exact Acceptance Criteria
- [x] `.eslintcache` is ignored and removed from git tracking so `pnpm lint` does not dirty the working tree.
- [x] Public-facing versions are aligned with release naming (`1.6.0`) in root and CLI package manifests.
- [x] Topic hint mode avoids misleading unlock/title behavior by previewing non-sequential matches without consuming unlocks.

### Completion Notes
- Added `.eslintcache` to `.gitignore` and removed it from index tracking.
- Updated `version` in root `package.json` and `packages/cli/package.json` to `1.6.0`.
- Updated `packages/cli/src/commands/hint.ts` so out-of-sequence topic matches are shown as preview-only and do not unlock hints.
