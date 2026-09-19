import { pickRelease, type LauncherRelease } from './release'
import { releasesApiUrl } from './repo'

const KEY = 'pyracms.launcherRelease.v1'
const TTL_MS = 10 * 60 * 1000

interface Entry {
  at: number
  release: LauncherRelease | null
}
let memory: Entry | null = null

/** Test hook: forget the in-memory copy. */
export function resetReleaseCache() {
  memory = null
}

function readSession(): Entry | null {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Entry) : null
  } catch {
    return null
  }
}

function writeSession(e: Entry) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(e))
  } catch {
    /* */
  }
}

const fresh = (e: Entry | null): e is Entry => !!e && Date.now() - e.at < TTL_MS

/**
 * Latest launcher release, cached in memory and sessionStorage. Resolves
 * null (never rejects) when the API is unreachable, rate-limited or no
 * release exists yet; failures are not cached.
 */
export async function fetchLatestRelease(): Promise<LauncherRelease | null> {
  if (fresh(memory)) return memory.release
  const saved = readSession()
  if (fresh(saved)) {
    memory = saved
    return saved.release
  }
  try {
    const res = await fetch(releasesApiUrl(), {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const release = pickRelease(await res.json())
    memory = { at: Date.now(), release }
    writeSession(memory)
    return release
  } catch {
    return null
  }
}
