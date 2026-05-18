# Debrief: Tool Gatekeeper

## What changed

The authorizer now treats allowed tools as exact names instead of accepting prefix matches.

## Why it matters

Look-alike tool names can hide very different permissions.

## Production habit

Use explicit allowlists for agent tools and treat near matches as untrusted.

