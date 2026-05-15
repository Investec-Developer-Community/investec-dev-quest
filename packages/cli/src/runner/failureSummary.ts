function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '')
}

export function summarizeFailureMessage(message: string): string {
  const cleaned = stripAnsi(message)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (const line of cleaned) {
    if (/^(at\s|❯\s|node:|vitest\/|file:\/\/|This error originated)/i.test(line)) {
      continue
    }
    return line
  }

  return cleaned[0] ?? 'Assertion failed'
}