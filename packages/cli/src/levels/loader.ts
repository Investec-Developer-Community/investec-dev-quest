import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import type { LevelManifest } from '@investec-game/shared'
import { LevelManifestSchema } from '@investec-game/shared'

// Seasons directory relative to the repo root (2 levels up from packages/cli)
const REPO_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))
export const SEASONS_DIR = join(REPO_ROOT, 'seasons')

export interface ResolvedLevel {
  manifest: LevelManifest
  dir: string
  solutionPath: string
  starterPath: string
  storyPath: string
  hintsDir: string
  testsDir: string
  attackDir: string
  referencePath: string
}

export function findLevelDir(seasonNum: number, levelNum: number): string | null {
  const dir = join(SEASONS_DIR, `season-${seasonNum}`, `level-${levelNum}`)
  if (!existsSync(dir)) return null
  return dir
}

export function loadLevel(levelDir: string): ResolvedLevel {
  const manifestPath = join(levelDir, 'manifest.json')

  if (!existsSync(manifestPath)) {
    throw new Error(`No manifest.json found in ${levelDir}`)
  }

  const raw = JSON.parse(readFileSync(manifestPath, 'utf-8')) as unknown
  const manifest = LevelManifestSchema.parse(raw)

  return {
    manifest,
    dir: levelDir,
    solutionPath: join(levelDir, 'solution.js'),
    starterPath: join(levelDir, 'starter', 'solution.js'),
    storyPath: join(levelDir, 'story.md'),
    hintsDir: join(levelDir, 'hints'),
    testsDir: join(levelDir, 'tests'),
    attackDir: join(levelDir, 'attack'),
    referencePath: join(levelDir, 'reference', 'solution.js'),
  }
}

export function loadAllLevels(): ResolvedLevel[] {
  const levels: ResolvedLevel[] = []

  if (!existsSync(SEASONS_DIR)) return levels

  for (const seasonEntry of readdirSync(SEASONS_DIR).sort()) {
    const seasonDir = join(SEASONS_DIR, seasonEntry)
    for (const levelEntry of readdirSync(seasonDir).sort()) {
      const levelDir = join(seasonDir, levelEntry)
      try {
        levels.push(loadLevel(levelDir))
      } catch {
        // skip malformed levels silently
      }
    }
  }

  return levels
}
