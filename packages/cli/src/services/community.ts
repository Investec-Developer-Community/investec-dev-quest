import type { LevelManifest } from '@investec-game/shared'

export const REPO_URL = 'https://github.com/Investec-Developer-Community/investec-dev-quest'
export const DISCUSSIONS_URL = `${REPO_URL}/discussions`
export const SHARE_HASHTAG = '#InvestecDevQuest'

export const DEBRIEF_QUESTIONS = [
  'What did the behavior tests prove?',
  'What did the attack script prove?',
  'What real production habit does this level teach?',
  'Did your fix reject anything legitimate?',
  'What additional edge case would you add to the tests?',
]

function levelTag(manifest: LevelManifest): string {
  return `[S${manifest.season}L${manifest.level}]`
}

export function buildStuckDiscussionUrl(manifest: LevelManifest): string {
  const title = `${levelTag(manifest)} Stuck on ${manifest.name}`
  const params = new URLSearchParams({ category: 'q-a', title })
  return `${DISCUSSIONS_URL}/new?${params.toString()}`
}

export function buildShareApproachUrl(manifest: LevelManifest): string {
  const title = `${levelTag(manifest)} My approach: ${manifest.name}`
  const body = [
    'Spoiler warning: this thread discusses a solved level.',
    '',
    ...DEBRIEF_QUESTIONS.map((question) => `**${question}**\n`),
  ].join('\n')
  const params = new URLSearchParams({ category: 'show-and-tell', title, body })
  return `${DISCUSSIONS_URL}/new?${params.toString()}`
}

export function buildXShareUrl(text: string): string {
  return `https://x.com/intent/tweet?${new URLSearchParams({ text: `${text} ${SHARE_HASHTAG} ${REPO_URL}` }).toString()}`
}

export function buildLinkedInShareUrl(): string {
  return `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: REPO_URL }).toString()}`
}
