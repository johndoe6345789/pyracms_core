'use client'

import { useState } from 'react'
import type { Binary } from '@/hooks/useGameDepDetail'
import { deepLink, detectOs, pickBinary } from '@/lib/launcher'
import { MSG_WITH_BINARY, MSG_NO_BINARY } from './gameActionState'
import { safeHref } from '@/lib/safeUrl'

interface Opts {
  slug: string
  name: string
  binaries: Binary[]
  launch: boolean
  version: string
  onInstalled: (version: string) => void
}

/** Deep link first; binary download as the fallback. */
export function useGamePlay(o: Opts) {
  const [msg, setMsg] = useState('')
  const bin = pickBinary(o.binaries, detectOs())

  const run = () => {
    const kind = o.launch ? 'launch' : 'install'
    window.location.href = deepLink(kind, o.slug, o.name)
    const dl = bin && safeHref(bin.url)
    if (dl)
      window.setTimeout(() => {
        window.location.href = dl
      }, 1500)
    o.onInstalled(o.version)
    setMsg(bin ? MSG_WITH_BINARY : MSG_NO_BINARY)
  }
  return { run, msg, setMsg }
}
