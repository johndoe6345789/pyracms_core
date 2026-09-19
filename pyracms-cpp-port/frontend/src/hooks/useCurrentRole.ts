'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { getUserRole, UserRole } from '@/types'

/** Role of the signed-in account (Guest when nobody is). */
export function useCurrentRole(): UserRole {
  return useSelector((s: RootState) => getUserRole(s.auth.user))
}
