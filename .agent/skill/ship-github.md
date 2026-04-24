# /ship-github

Use this to safely validate, commit, and push the latest local changes to GitHub.

Commit message rule baked into this flow:
- Format: `type(scope): short description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Scope is optional but preferred (e.g. `season-2`, `cli`, `mock-api`, `shared`)
- Keep under 72 characters, no trailing period

## Pre-Commit (Safety + Validation)

```bash
cd /Users/nickbenson/Documents/Dev/id-code-game
```

1. Ensure remote URL does not include a token:
```bash
git remote set-url origin https://github.com/Investec-Developer-Community/investec-dev-quest.git
git remote -v
```

2. Sync branch:
```bash
git fetch origin
git pull --rebase origin main
```

3. Build (shared must build first — other packages depend on it):
```bash
pnpm --filter @investec-game/shared build
pnpm -r build
```

4. Type-check (mirrors CI):
```bash
npx tsc -p packages/cli/tsconfig.json --noEmit
npx tsc -p packages/mock-api/tsconfig.json --noEmit
```

5. Validate level content (starts mock API, runs level validation):
```bash
node scripts/validate-levels.mjs
```

6. Docs gate (required before commit):
- Ensure `CHANGELOG.md` includes the latest changes under `[Unreleased]`
- Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
- Subsections: `### Added`, `### Changed`, `### Fixed`, `### Removed`

Quick check commands:
```bash
git log --oneline -n 5
git diff --name-only
head -30 CHANGELOG.md
```

7. Content policy check:
- No real credentials or PII in any committed file
- Synthetic fixture data only
- Secrets from `process.env` only
- `seasons/**/solution.js` must remain gitignored

## During Commit (Stage + Commit + Push)

1. Review changes:
```bash
git status --short --branch
git diff --stat
```

2. Stage all intended tracked changes:
```bash
git add -A
```

3. Verify staged set — exclude local-only files (`.agent/` is gitignored):
```bash
git status
git diff --staged --stat
```

4. Build commit message from staged changes:
```bash
git diff --staged --name-only
```

Choose type + scope based on the staged diff:
- `feat(season-N)`: new level or game content
- `feat(cli)`: user-visible CLI behavior added
- `fix(mock-api)`: bug in mock API fixed
- `refactor(shared)`: internal code improvement
- `docs`: documentation-only changes
- `test`: test-only updates
- `chore`: maintenance/tooling/config updates

Examples:
- `feat(season-2): add Level 3 Phantom Ledger`
- `fix(cli): handle missing manifest gracefully`
- `refactor(shared): simplify schema validation`
- `docs: update facilitator guide for season 2`
- `chore: bump typescript to 5.5`

5. Commit:
```bash
git commit -m "<type>(scope): <short summary>"
```

6. Push:
```bash
git push origin main
```

## Post-Push (Verification + Hygiene)

1. Confirm pushed commit locally:
```bash
git log --oneline -n 3
```

2. Verify on GitHub:
- Commit appears on target branch
- CI checks are green (build + type-check, validate levels, gitleaks secret scan)
- No local-only files were included

3. Security hygiene:
- If a PAT was ever exposed in remote URL or history, rotate/revoke immediately
- Gitleaks in CI will block commits with detected secrets

## If Push Is Rejected

```bash
git fetch origin
git pull --rebase origin main
# resolve conflicts if any
pnpm --filter @investec-game/shared build
npx tsc -p packages/cli/tsconfig.json --noEmit
npx tsc -p packages/mock-api/tsconfig.json --noEmit
node scripts/validate-levels.mjs
git push origin main
```

## Quick Reference: Full CI Mirror

Run this locally to mirror exactly what GitHub Actions CI does:

```bash
pnpm --filter @investec-game/shared build
npx tsc -p packages/cli/tsconfig.json --noEmit
npx tsc -p packages/mock-api/tsconfig.json --noEmit
node scripts/validate-levels.mjs
```
