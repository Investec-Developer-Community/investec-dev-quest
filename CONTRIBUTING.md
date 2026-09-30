# Contributing to Investec Developer Quest

Thanks for contributing! This guide covers how to add levels, fix bugs, and run CI locally.

---

## Quick start for contributors

```bash
git clone https://github.com/Investec-Developer-Community/investec-dev-quest.git
cd investec-dev-quest
npm install -g pnpm@9.12.3
pnpm install
cp .env.example .env
```

Verify everything works:

```bash
pnpm build                         # build and type-check every package
pnpm test:unit                     # CLI helpers and level quality checks
node scripts/validate-levels.mjs   # API levels may skip if the mock API is not running
pnpm game status                   # should show available levels
```

---

## Adding a new level

Use the scaffold generator — don't copy-paste manually:

```bash
pnpm create-level -- --season 3 --level 6 --name "Your Level Name" --difficulty intermediate --attackName "Your Attack Name" --minutes 25
```

This creates the full directory structure from the template. Then:

1. Write the scenario in `story.md`
2. Introduce a realistic bug or gap in `starter/solution.js`
3. Write `tests/behavior.test.js` — these must **fail** on the starter
4. Write `attack/exploit.test.js` — assertions that **pass** when the exploit is blocked
5. Implement the correct `reference/solution.js`
6. Add `hints/hint-1.md` and `hints/hint-2.md`, and set a realistic `estimatedMinutes` in `manifest.json`
7. Write `debrief.md` with `What changed`, `Why it matters`, `Production habit`, and `Try it for real` (links to the matching Investec API docs, sandbox, card IDE guide, or community resources)
8. Add the level id to the relevant paths in `packages/cli/src/services/paths.ts` (always the Grandmaster Run)

Validate before opening a PR:

```bash
node scripts/validate-levels.mjs s4-l1
```

If your level uses webhook cryptography helpers, ensure emitter package changes still compile:

```bash
pnpm --filter @investec-game/webhook-emitter build
```

See [docs/authoring-guide.md](docs/authoring-guide.md) for the full dual-validation mechanic.

---

## Content policy

- **No real credentials or PII** in any level file, fixture, or test
- All fixture data must be synthetic and deterministic
- MCC codes, amounts, and merchant names must be fictional or generic
- Secrets must come from `process.env` — never hardcoded

PRs with hardcoded credentials will be rejected by the secret scanning CI job.

---

## Running CI locally

```bash
# Build and type-check all packages
pnpm build

# In a separate terminal, start the mock API for strict validation
pnpm --filter @investec-game/mock-api exec tsx src/index.ts
```

In your original terminal:

```bash
# Validate every level, including API-dependent missions (no skipped levels)
node scripts/validate-levels.mjs --strict

# Test CLI helpers and the mutation quality gate
pnpm test:unit

# Validate a specific level
node scripts/validate-levels.mjs s1-l1 --strict

# Lint production code and the README demo recorder
pnpm lint
pnpm exec eslint --no-ignore docs/media/record-hero.mjs
```

Stop the mock API with `Ctrl+C` when validation finishes. API credentials must
match the synthetic defaults in `.env.example`. The validator restores your
working solution files after its checks.

---

## Pull request checklist

- [ ] `node scripts/validate-levels.mjs --strict` passes for all levels with the mock API running
- [ ] `pnpm build`, `pnpm test:unit`, and `pnpm lint` pass
- [ ] No real credentials or PII in any file
- [ ] New level follows the single-objective-per-level principle
- [ ] Starter code fails tests, reference passes everything
- [ ] Enrolled mutation cases fail the intended assertion and valid alternatives pass both suites
- [ ] Before a public push/release, run one fresh-install Windows smoke test (`pnpm install`, `cp .env.example .env`, `pnpm game`, `pnpm game test`, then `pnpm game level 1 --season 1` and `pnpm game test` to cover mock API startup)

## Public release checklist

- [ ] Add the player-facing changes to the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md); set a release version and date only when cutting a release
- [ ] Check README setup, all public documentation links, and the 23-level completion requirement
- [ ] Keep `.env`, environment variants, player solutions, progress, raw recordings, and internal authoring artifacts out of the commit; `.env.example` and final demo assets should be included
- [ ] Review `git status` and `git diff --cached` before pushing; ignore rules do not remove files already tracked by Git
- [ ] Run the secret-scanning CI check before merging; never publish real credentials or player data
- [ ] For demo changes, follow [docs/media/README.md](docs/media/README.md) and inspect opening and completion frames

Only push a `v*` tag when publishing a release: the release workflow builds,
tests, strictly validates the campaign, and creates a GitHub Release automatically.

---

## Commit message convention

```
type(scope): short description

feat(season-2): add Level 2 Velocity Veil
fix(cli): handle missing .env on first run
test(s1-l1): add edge case for empty accounts list
docs: update authoring guide with replay protection pattern
```

Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

---

## Getting help

Ask in [GitHub Discussions](https://github.com/Investec-Developer-Community/investec-dev-quest/discussions), or use the bug-report issue template for reproducible problems.
