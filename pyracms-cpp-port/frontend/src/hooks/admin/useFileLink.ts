'use client'

import { useEffect, useState } from 'react'
import { fileLinkQuery } from '@/lib/fileLink'

const RENEW_MS = 10 * 60 * 1000

/**
 * A signed link for a file that only signed-in users may open, kept fresh
 * while shown. Public files need none: `ready` is true at once for them.
 */
export function useFileLink(uuid: string, visibility: string) {
  const [query, setQuery] = useState('')
  const signed = visibility === 'authenticated' && uuid !== ''

  useEffect(() => {
    if (!signed) {
      setQuery('')
      return
    }
    let live = true
    const load = () =>
      fileLinkQuery(uuid)
        .then((q) => live && setQuery(q))
        .catch(() => live && setQuery(''))
    load()
    const timer = setInterval(load, RENEW_MS)
    return () => {
      live = false
      clearInterval(timer)
    }
  }, [uuid, signed])

  return { query, ready: !signed || query !== '' }
}
