'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { getUserRole } from '@/types'
import type { Actor } from '@/lib/userGuards'
import type { UserRow } from '@/hooks/admin/userRow'

/**
 * The signed-in account as an admin-rules actor. It owns the site when
 * its own row in `users` is flagged as the site owner.
 */
export function useActor(users: UserRow[] = []): Actor {
  const me = useSelector((s: RootState) => s.auth.user)
  const id = me?.id ?? -1
  const owner = users.some((u) => u.id === id && u.siteOwner === true)
  return { id, role: getUserRole(me), owner }
}
