export function resolveTool(toolName, registry) {
  const name = String(toolName ?? '')
  const tools = Array.isArray(registry) ? registry : []

  const matches = tools.filter((tool) => tool?.name === name)
  if (matches.length === 0) return null

  const trusted = matches.find((tool) => tool?.trusted === true)
  if (!trusted) return null

  return {
    name: trusted.name,
    version: trusted.version,
    source: trusted.source,
    trusted: true,
  }
}
