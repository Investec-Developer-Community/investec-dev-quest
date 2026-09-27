# Architecture Overview

This document explains how the Dev Quest codebase is organized and how runtime state and validation flows work.

## Package Boundaries

- `packages/cli`: game UX, commands, progression, and consequence rendering.
- `packages/shared`: shared schemas, types, and exit codes consumed by other packages.
- `packages/mock-api`: local Investec-like API used by API-required levels.
- `packages/webhook-emitter`: helper utilities for webhook/signature-oriented level tooling.

Design intent:

- Keep domain contracts centralized in `shared`.
- Keep runtime orchestration and player-facing behavior in `cli`.
- Keep HTTP simulation concerns in `mock-api`.

## Progress Storage

The CLI persists state in a local JSON store:

- Path: `~/.investec-game/progress.json`
- Managed by: `packages/cli/src/db/progress.ts`

Stored domains include:

- level progress (`locked/active/complete`, attempts, hints)
- current level pointer
- hint unlock indexes (index `2` = the generated walkthrough, counted as a third hint)
- last-run pass counts per level (for the progress delta on failing runs)
- local activity state (last played date, daily streak, best streak)
- share-prompt keys already shown (`first-win`, `first-boss`, `path:<id>`, `campaign-complete`)
- arc flags and evidence trail
- case file entries generated on level completion

This keeps progress local-first and resettable without backend dependencies.

## Validation Flow

Main validation path:

- `node scripts/validate-levels.mjs [<level-id>] [--strict|--soft]`

What it checks:

- required level files and manifest structure
- story/hint/debrief authoring constraints
- starter contract: behavior fails and attack fails (exploit succeeds pre-fix)
- reference contract: behavior passes and attack passes (exploit blocked post-fix)
- curated quality cases for enrolled levels: insecure variants fail a named assertion, while valid alternatives pass both suites

Modes:

- soft (default): API-required levels may be skipped if mock API is offline
- strict: API-required levels must validate (used by CI)

Quality cases live in `scripts/level-quality.mjs`. Initial coverage is S1L2, S4L2,
and S4L5; passing validation does not imply mutation coverage for every level.
`pnpm test:unit` tests the quality gate and CLI helpers without running player solutions.

## Arc and Case-File Consequences

Signal pipeline:

1. Behavior and attack tests emit explicit signal IDs.
2. CLI maps signal IDs to deterministic arc flag updates.
3. Evidence rows are stored with timestamp, flag/value, level, and signals.
4. Consequence services project narrative posture from arc flags. When no evidence exists yet for a flag (its source mission hasn't been played), projections report `not assessed yet` instead of assuming the default posture.
5. On level completion, a case file summary is generated and persisted.

Case file output includes:

- adversary blocked
- production habit learned
- downstream consequence change

Where consequences are surfaced:

- `pnpm game status`
- `pnpm game journal`
- `pnpm game reference`

## Campaign Routing

- Paths are defined in `packages/cli/src/services/paths.ts` (`GAME_PATHS`).
- `resolveNextMission()` picks the next mission: the Quickstart Path first (S2L1 → S1L1 → S4L1), then the Grandmaster Run in campaign order.
- The same routing drives bare `pnpm game` / `pnpm game start`, the win banner, `status`, and `certificate`.

## Rewards and Retention

- XP is derived, never stored: `calculateLevelXpBreakdown()` in `packages/cli/src/services/certificate.ts` (graduated hint/attempt bonuses).
- Ranks (`RANK_LADDER`) and badges (`packages/cli/src/services/milestones.ts`) are derived from progress; `detectMilestones()` diffs progress before/after a win to announce new badges and promotions.
- Streaks are computed in `packages/cli/src/services/activity.ts` using local calendar dates and updated on every test/watch evaluation.
- Share moments come from `packages/cli/src/services/social.ts` (`collectSocialMoments()`). Each appears at most once per profile, and `GAME_QUIET_SOCIAL` / `--quiet-social` disable them.
- Community URLs (Discussions Q&A for stuck players, Show and tell for approaches, X/LinkedIn share) live in `packages/cli/src/services/community.ts`. Real Investec resources and "What to build next" suggestions per path live in `packages/cli/src/services/realWorld.ts`.
- The validator requires `estimatedMinutes` in manifests and the `What changed` / `Why it matters` / `Production habit` / `Try it for real` sections in every debrief.

## Operational Notes

- `scripts/game.mjs` handles CLI bootstrap/build behavior.
- `.devcontainer/devcontainer.json` provides the zero-install Codespaces setup (Node 20, pnpm 9, dependencies, `.env`).
- Lint/build/validate gates are expected before release shipping.
- `.eslintcache` is intentionally local-only and gitignored.
