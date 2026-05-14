export function resolveTool(toolName, registry) {
  const name = String(toolName ?? '')
  const tools = Array.isArray(registry) ? registry : []

  const match = tools.find((tool) => tool?.name === name)
  if (!match) return null

  return {
    name: match.name,
    version: match.version,
    source: match.source,
  }
}
