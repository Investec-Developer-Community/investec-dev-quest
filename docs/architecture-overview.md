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
- hint unlock indexes
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

Modes:

- soft (default): API-required levels may be skipped if mock API is offline
- strict: API-required levels must validate (used by CI)

## Arc and Case-File Consequences

Signal pipeline:

1. Behavior and attack tests emit explicit signal IDs.
2. CLI maps signal IDs to deterministic arc flag updates.
3. Evidence rows are stored with timestamp, flag/value, level, and signals.
4. Consequence services project narrative posture from arc flags.
5. On level completion, a case file summary is generated and persisted.

Case file output includes:

- adversary blocked
- production habit learned
- downstream consequence change

Where consequences are surfaced:

- `pnpm game status`
- `pnpm game journal`
- `pnpm game reference`

## Operational Notes

- `scripts/game.mjs` handles CLI bootstrap/build behavior.
- Lint/build/validate gates are expected before release shipping.
- `.eslintcache` is intentionally local-only and gitignored.
