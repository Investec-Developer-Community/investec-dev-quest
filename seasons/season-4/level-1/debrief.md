# Debrief: Tool Gatekeeper

## What changed

The fixed implementation treats allowed tools as exact names instead of trusting prefix matches.

## Why it matters

Agent tools often have very different risk levels even when their names look similar. Prefix authorization can accidentally allow a more powerful tool than the policy intended.

## Production habit

Use explicit allowlists for tool execution, keep permissions narrow, and treat look-alike names as untrusted until proven exact.