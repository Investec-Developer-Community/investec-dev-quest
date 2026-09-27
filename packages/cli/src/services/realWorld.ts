export const INVESTEC_LINKS = {
  privateBankApi: 'https://developer.investec.com/api-reference/SA%20PB%20Account%20Information',
  sandbox: 'https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox',
  authApi: 'https://developer.investec.com/api-reference/SA%20Open%20API%20-%20Authorization',
  cardApi: 'https://developer.investec.com/api-reference/SA%20Card%20Code',
  guides: 'https://developer.investec.com/individuals',
  useCases: 'https://developer.investec.com/use-cases',
  community: 'https://developer.investec.com/community',
  communityProjects: 'https://github.com/Investec-Developer-Community/Community-Projects',
} as const

export interface BuildNextSuggestion {
  idea: string
  links: Array<{ label: string; url: string }>
}

const PATH_SUGGESTIONS: Record<string, BuildNextSuggestion> = {
  quickstart: {
    idea: 'Make your first real call: get a sandbox token and list accounts.',
    links: [
      { label: 'Sandbox credentials', url: INVESTEC_LINKS.sandbox },
      { label: 'OAuth quickstart', url: INVESTEC_LINKS.authApi },
    ],
  },
  'api-foundations': {
    idea: 'Build a read-only dashboard: token cache, paginated transactions, and balance totals against the sandbox.',
    links: [
      { label: 'Private Bank API', url: INVESTEC_LINKS.privateBankApi },
      { label: 'Community projects', url: INVESTEC_LINKS.communityProjects },
    ],
  },
  'card-code': {
    idea: 'Write a real card rule in the Investec Online card IDE, run it in the simulator, then deploy it.',
    links: [
      { label: 'Card IDE guide', url: INVESTEC_LINKS.guides },
      { label: 'Card API', url: INVESTEC_LINKS.cardApi },
    ],
  },
  security: {
    idea: 'Put a signed, replay-safe receiver in front of anything your card code calls from afterTransaction.',
    links: [
      { label: 'Card API', url: INVESTEC_LINKS.cardApi },
      { label: 'Community projects', url: INVESTEC_LINKS.communityProjects },
    ],
  },
  grandmaster: {
    idea: 'Ship something real on Investec APIs, then demo it to the community.',
    links: [
      { label: 'Use cases', url: INVESTEC_LINKS.useCases },
      { label: 'Join the Investec Developer Community', url: INVESTEC_LINKS.community },
    ],
  },
}

export function buildNextForPath(pathId: string): BuildNextSuggestion | null {
  return PATH_SUGGESTIONS[pathId] ?? null
}
