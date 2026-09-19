'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

/** Returns why replying is unavailable, or null when it is allowed. */
export function replyNotice(
  locked: boolean,
  isAuthenticated: boolean,
): ReactNode {
  if (locked) return 'This thread is locked. New replies are disabled.'
  if (!isAuthenticated) {
    return (
      <>
        <Link href="/auth/login">Sign in</Link> to reply to this thread.
      </>
    )
  }
  return null
}
