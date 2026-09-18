'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

/** Reads the signed-in user for forum permission checks. */
export function useForumUser() {
  const user = useSelector((s: RootState) => s.auth.user)
  const isAuthenticated = useSelector(
    (s: RootState) => s.auth.isAuthenticated,
  )
  const role = Number(user?.role ?? 0)
  return {
    userId: user ? Number(user.id) : null,
    isAuthenticated,
    isModerator: role >= 2 || Boolean(user?.isAdmin),
  }
}
