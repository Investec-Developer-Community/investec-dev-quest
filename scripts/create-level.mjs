#!/usr/bin/env node
/**
 * create-level.mjs
 *
 * Scaffold a new level from the template.
 *
 * Usage:
 *   node scripts/create-level.mjs --season 3 --level 1 --name "Webhook Whiplash" --difficulty intermediate
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : null
  }
  return {
    season: get('--season'),
    level: get('--level'),
    name: get('--name'),
    difficulty: get('--difficulty') ?? 'beginner',
  }
}

const { season, level, name, difficulty } = parseArgs()

if (!season || !level || !name) {
  console.error('Usage: node scripts/create-level.mjs --season <n> --level <n> --name "<name>" [--difficulty beginner|intermediate|advanced]')
  process.exit(1)
}

const validDifficulties = ['beginner', 'intermediate', 'advanced']
if (!validDifficulties.includes(difficulty)) {
  console.error(`--difficulty must be one of: ${validDifficulties.join(', ')}`)
  process.exit(1)
}

const levelId = `s${season}-l${level}`
const levelDir = join(REPO_ROOT, 'seasons', `season-${season}`, `level-${level}`)
const templateDir = join(REPO_ROOT, 'templates', 'level-template')

if (existsSync(levelDir)) {
  console.error(`Level directory already exists: ${levelDir}`)
  process.exit(1)
}

if (!existsSync(templateDir)) {
  console.error(`Template not found: ${templateDir}`)
  process.exit(1)
}

// Copy template
cpSync(templateDir, levelDir, { recursive: true })

// Write manifest
const manifest = {
  id: levelId,
  name,
  season: parseInt(season, 10),
  level: parseInt(level, 10),
  difficulty,
  apiRequired: false,
  tags: [],
}

writeFileSync(join(levelDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

// Update vitest config name
const vitestConfigPath = join(levelDir, 'vitest.config.js')
const vitestConfig = readFileSync(vitestConfigPath, 'utf-8').replace(
  "name: 'sX-lY'",
  `name: '${levelId}'`
)
writeFileSync(vitestConfigPath, vitestConfig)

console.log(`
  ✓ Level scaffolded at: seasons/season-${season}/level-${level}/

  Next steps:
    1. Write the scenario in story.md
    2. Implement the buggy/incomplete starter/solution.js
    3. Write tests/behavior.test.js
    4. Write attack/exploit.test.js (assertions that pass when exploit is BLOCKED)
    5. Implement the correct reference/solution.js
    6. Add hints in hints/hint-1.md and hints/hint-2.md
    7. Validate: node scripts/validate-levels.mjs ${levelId}
`)
