# Debrief: Tool Gatekeeper

## What changed

The authorizer now treats allowed tools as exact names instead of accepting prefix matches.

## Why it matters

Look-alike tool names can hide very different permissions.

## Production habit

Use explicit allowlists for agent tools and treat near matches as untrusted.

## Try it for real

- Real Investec API keys are scoped per permission (balances, transactions, transfers, beneficiary payments, card code). Give an AI assistant's key only the scopes its tools need. See the [developer guide](https://developer.investec.com/individuals).
- See how a [chat-based finance assistant](https://developer.investec.com/use-cases/chat-finance-assistant) can be built on Investec APIs.

