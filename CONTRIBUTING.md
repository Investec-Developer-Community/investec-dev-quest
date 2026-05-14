# Contributing to the Investec Developer Game

Thanks for contributing! This guide covers how to add levels, fix bugs, and run CI locally.

---

## Quick start for contributors

```bash
git clone https://github.com/Investec-Developer-Community/investec-dev-quest.git
cd investec-dev-quest
pnpm install
cp .env.example .env
```

Verify everything works:
```bash
node scripts/validate-levels.mjs   # all levels should pass
pnpm game status                   # should show available levels
pnpm --filter @investec-game/webhook-emitter build
```

---

## Adding a new level

Use the scaffold generator — don't copy-paste manually:

```bash
pnpm create-level -- --season 3 --level 1 --name "Webhook Whiplash" --difficulty intermediate
```

This creates the full directory structure from the template. Then:

1. Write the scenario in `story.md`
2. Introduce a realistic bug or gap in `starter/solution.js`
3. Write `tests/behavior.test.js` — these must **fail** on the starter
4. Write `attack/exploit.test.js` — assertions that **pass** when the exploit is blocked
5. Implement the correct `reference/solution.js`
6. Add `hints/hint-1.md` and `hints/hint-2.md`

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
# Type-check all packages
npx tsc -p packages/cli/tsconfig.json --noEmit
npx tsc -p packages/mock-api/tsconfig.json --noEmit

# Validate all levels
node scripts/validate-levels.mjs

# Validate a specific level
node scripts/validate-levels.mjs s1-l1
```

---

## Pull request checklist

- [ ] `node scripts/validate-levels.mjs` passes for any new/modified level
- [ ] Type-check passes with `npx tsc --noEmit`
- [ ] No real credentials or PII in any file
- [ ] New level follows the single-objective-per-level principle
- [ ] Starter code fails tests, reference passes everything
- [ ] Before a public push/release, run one fresh-install Windows smoke test (`pnpm install`, `cp .env.example .env`, `pnpm game level 1 --season 1`, `pnpm game test`)

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

Open an issue using the `Question / Discussion` template for anything unclear.
