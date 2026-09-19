import { replaceToken, scopeFromPath } from '@/lib/session'
import { setCredentials } from '../slices/authSlice'
import type { User } from '@/types'

export interface PasswordChangeReply {
  success: boolean
  /** Changing the password ends old sessions; this one replaces yours. */
  token?: string
}

/** Keep the caller signed in after their old token was revoked. */
export function adoptFreshToken(
  reply: PasswordChangeReply | undefined,
  user: User | null,
  dispatch: (action: ReturnType<typeof setCredentials>) => unknown,
): void {
  const token = reply?.token
  if (!token) return
  replaceToken(scopeFromPath(window.location.pathname), token)
  if (user) dispatch(setCredentials({ user, token }))
}
