# Hint 1 — Authentication Diagnostic

Before changing implementation details, inspect how credentials are chosen when auth fails.

Ask yourself:

- What credentials are used when invalid credentials are passed?
- Are you always using the function inputs, or silently falling back to environment values?
- If token retrieval fails, does your code surface that failure clearly?

Focus on identifying the credential source bug first. Hint 2 covers concrete implementation shape.
