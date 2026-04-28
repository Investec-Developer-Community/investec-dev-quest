# Level 1: First Contact

## Mission Brief

You've just joined the team at **FinFlow**, a startup building on top of the Investec Programmable Banking API.

Your first task is to finish the account data client. This is the foundation everything else depends on: budgeting dashboards, spend tracking, and the card control features coming in Season 2.

## Bug Report

The current client only works as a sketch. It needs to authenticate with the mock API, collect every paginated account, and calculate a reliable total balance without relying on embedded credentials.

## Background

The mock API is already running. The client must:

1. **Authenticates** using OAuth 2.0 client credentials
2. **Fetches all accounts** (handling pagination correctly)
3. **Returns the total balance** across all accounts

## Your Task

Edit `solution.js` to implement three exports:

### `getToken(clientId, clientSecret)`

Request an access token from the OAuth2 endpoint.

- `POST /identity/v2/oauth2/token`
- Header: `Authorization: Basic <base64(clientId:clientSecret)>`
- Header: `x-api-key: <GAME_API_KEY>`
- Body (form-encoded): `grant_type=client_credentials`
- Returns: `{ access_token, expires_in }`
- If the credentials are wrong, throw an error with the message `"Authentication failed"`

### `getAccounts(token)`

Fetch all accounts from the API, handling pagination.

- `GET /za/pb/v1/accounts`
- Use the `Authorization: Bearer <token>` header
- Follow `meta.nextCursor` until there are no more pages
- Returns: an array of all account objects

### `getTotalBalance(token)`

Return the **sum of `currentBalance`** across all accounts.

- `GET /za/pb/v1/accounts/:accountId/balance` (one request per account)
- Returns: the total as a number

## Credentials

Read credentials from environment variables — **never hardcode them**:

```js
const clientId = process.env.GAME_API_CLIENT_ID
const clientSecret = process.env.GAME_API_CLIENT_SECRET
const apiKey = process.env.GAME_API_KEY
const baseUrl = process.env.GAME_API_BASE_URL
```

## Threat

The attack script checks whether the implementation secretly uses hardcoded credentials instead of the values supplied by the caller and environment.

## Win Condition

- All behavior tests pass: authentication, pagination, balance aggregation
- The attack script confirms credentials are not hardcoded

Run `pnpm game test` to check your progress.
