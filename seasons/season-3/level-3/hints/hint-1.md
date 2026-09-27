# Hint 1 — Which host would really be called?

Take each Red Team URL and ask: if a server made an HTTP request to this exact string, which machine would it connect to?

- What does the `@` do inside a URL's authority section?
- Does "contains the allowlisted host" mean the same thing as "the host *is* the allowlisted host"?
- Which parts of a URL besides the hostname can change where a request lands?

Let a real URL parser answer these questions instead of string matching.
