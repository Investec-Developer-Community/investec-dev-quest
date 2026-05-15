# Troubleshooting

Common issues and how to fix them.

---

## Setup

### `Node version too old — need ≥ 20, got X.Y.Z`

The CLI checks Node on startup. Fix:

```bash
# Using nvm
nvm install 20
nvm use 20

# Or download from nodejs.org
```

Verify: `node -v` should print `v20.x.x` or higher.

---

### `Missing .env file — copy .env.example to .env`

The `.env` file is gitignored. Create it from the template:

```bash
cp .env.example .env
```

The example values work with the local mock API out of the box.

---

### `Cannot find module` / `ERR_MODULE_NOT_FOUND`

Dependencies aren't installed, or shared package isn't built:

```bash
pnpm install
pnpm --filter @investec-game/shared build
```

---

### `pnpm: command not found`

```bash
npm install -g pnpm
```

### `File ... cannot be loaded because running scripts is disabled on this system` (Windows)

PowerShell execution policy is blocking npm/pnpm scripts.

Open PowerShell and run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then restart the terminal and retry your game command.

Full Windows setup guide: [docs/windows-setup.md](windows-setup.md)

---

## Running levels

### Tests show `0 tests collected` or skip immediately

This usually means the vitest include pattern doesn't match any files. Check:

1. You're running from the repo root, not inside a package
2. The level directory exists: `ls seasons/season-1/level-1/tests/`
3. Test files end in `.test.js` or `.test.ts`

---

### Mock API fails to start (port 3001 in use)

```bash
# Find and kill the process using port 3001
lsof -ti TCP:3001 | xargs kill

# Then re-run your game command
pnpm game test --season 1 --level 1
```

---

### Mock API starts but returns 401 / 403

Your `.env` file credentials don't match the mock API's expected values. Reset to defaults:

```bash
cp .env.example .env
```

---

### `solution.js not found`

You haven't created a solution yet. The level brief shows the path:

```bash
# For s1-l1
cat seasons/season-1/level-1/starter/solution.js  # read the starter
cp seasons/season-1/level-1/starter/solution.js seasons/season-1/level-1/solution.js
# Now edit solution.js
```

---

### Tests pass but the game doesn't mark the level complete

Make sure you're running via the CLI, not vitest directly:

```bash
pnpm game test --season 1 --level 1   # ✓ records completion
npx vitest run ...     # ✗ doesn't update progress
```

### Failing tests are still unclear

Use the coaching and visibility commands:

```bash
pnpm game explain   # next-step coaching based on failing tests (non-spoiler)
pnpm game journal   # recorded choices, evidence trail, downstream consequences
```

If you need full raw traces:

```bash
pnpm game test --verbose
```

### Carry-forward consequence sections are missing from `pnpm game reference`

Possible causes:

1. The level/season doesn't render that section yet (for example some sections appear only on later seasons).
2. Relevant rubric signals were never written because tests were run outside the CLI flow.
3. Your progress file predates the latest arc flag schema.

Fix:

```bash
pnpm game test --season <n> --level <n>
pnpm game reference --season <n> --level <n>
```

If the section is still missing and you want a clean slate:

```bash
rm ~/.investec-game/progress.json
pnpm game status
```

### `pnpm game status` shows an unexpected operational risk band

The risk band is derived from two carry-forward flags:

- `s1_token_fix_depth`
- `s2_state_discipline`

On a fresh profile (before both flags have evidence), status shows:

```text
Carry-forward operational risk: not assessed yet
```

Re-run the source levels via CLI (`pnpm game test ...`) so fresh evidence writes update the profile.

### Season 3 webhook tests failing with signature mismatch

Common causes:

1. You signed parsed JSON instead of the original raw body string
2. You forgot to prepend the timestamp (`${timestamp}.${rawBody}`)
3. You used non-exact comparison (`startsWith`, substring compare)

Use this approach:

```bash
# Ensure the exact header format
x-investec-signature: sha256=<hex>
```

And verify with equal-length buffers + timing-safe compare.

---

## Progress and state

### Reset progress for a specific level

```bash
pnpm game reset --season 1 --level 1
```

### Reset all progress

```bash
rm ~/.investec-game/progress.json
```

### Progress file location

```bash
cat ~/.investec-game/progress.json
```

You can delete this file manually to start completely fresh.

---

## CI / validate-levels

### `validate-levels.mjs` fails with `No levels found`

Check the `seasons/` directory exists and has the right structure:
```
seasons/
  season-1/
    level-1/
      manifest.json   ← required
```

### A level fails: `Starter: behavior tests all pass`

The starter code is too correct — it doesn't leave anything to fix. Edit `starter/solution.js` to introduce the intended bug or gap.

### A level fails: `Reference: attack script fails`

The reference solution doesn't actually block the exploit. Review `attack/exploit.test.js` and `reference/solution.js` together.

### Validator skips API-required levels

`scripts/validate-levels.mjs` skips API levels when the mock API health endpoint is offline.

For full validation:

```bash
npx tsx packages/mock-api/src/index.ts
node scripts/validate-levels.mjs
```

---

## Getting more help

Open a [bug report](https://github.com/Investec-Developer-Community/investec-dev-quest/issues/new?template=bug_report.yml) with:
- Output of `node -v && pnpm -v`
- The full error message
- The level ID (if applicable)
