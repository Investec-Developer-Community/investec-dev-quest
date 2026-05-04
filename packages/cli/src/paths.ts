/**
 * Canonical repo-root path — single source of truth.
 *
 * Every other module that needs REPO_ROOT should import from here
 * rather than computing its own relative `fileURLToPath(new URL(…))`.
 */
import { fileURLToPath } from 'url'

export const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url))
