'use client'

import { useEffect, useState } from 'react'
import { fetchLatestRelease } from '@/lib/releaseFetch'
import type { LauncherRelease } from '@/lib/release'
import {
  detectPlatform, refinePlatform, type Platform,
} from '@/lib/platform'

export type ReleaseState =
  | { status: 'loading' }
  | { status: 'ready'; release: LauncherRelease }
  | { status: 'fallback' }

/** Latest launcher release; 'fallback' means link to the Releases page. */
export function useLauncherRelease(): ReleaseState {
  const [state, setState] = useState<ReleaseState>({ status: 'loading' })
  useEffect(() => {
    let live = true
    fetchLatestRelease().then((release) => {
      if (live) setState(release
        ? { status: 'ready', release } : { status: 'fallback' })
    })
    return () => { live = false }
  }, [])
  return state
}

/** Visitor OS/arch: UA guess first, refined asynchronously. */
export function usePlatform(): Platform {
  const [p, setP] = useState<Platform>({ os: null, arch: 'x86_64' })
  useEffect(() => {
    let live = true
    const base = detectPlatform()
    setP(base)
    refinePlatform(base).then((r) => { if (live) setP(r) })
    return () => { live = false }
  }, [])
  return p
}
