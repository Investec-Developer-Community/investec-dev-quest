# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2026-04-28

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
