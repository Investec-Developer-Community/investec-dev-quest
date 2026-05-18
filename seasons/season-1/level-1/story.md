# Level 1: First Contact

## Mission Brief

**The Briefing Desk:** Welcome to the Investec Developer Response Cell. Your first FinFlow simulation is deliberately small but mission-critical: prove that a client can authenticate, page through account data, and total balances without smuggling fixed credentials into the code.

Run `pnpm game test` once before editing. Let the failing tests show you the shape of the incident.

## Bug Report

The account client works only on the easiest path. It authenticates with the wrong credential source, fetches only the first account page, and reports an incomplete balance total.

## Your Task

Edit `solution.js` and implement three exports:

- `getToken(clientId, clientSecret)`: call `POST /identity/v2/oauth2/token` with Basic auth from the function arguments, `x-api-key` from `GAME_API_KEY`, and `grant_type=client_credentials`. Throw `Error('Authentication failed')` on bad credentials.
- `getAccounts(token)`: call `GET /za/pb/v1/accounts`, follow `meta.nextCursor`, and return all account objects.
- `getTotalBalance(token)`: fetch each account balance and return the sum of `currentBalance`.

## Threat

**The Red Team:** Credential Ghost checks whether the client secretly trusts embedded credentials instead of the caller and environment.

## Win Condition

Behavior tests prove authentication, pagination, and balance aggregation. The Red Team is blocked when hardcoded credentials are gone.

## Field Notes

Use `GAME_API_BASE_URL`, `GAME_API_KEY`, `GAME_API_CLIENT_ID`, and `GAME_API_CLIENT_SECRET` from the environment. The mock API auto-starts when the level needs it.
