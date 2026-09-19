'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseTurbologin, CLIPBOARD_DENIED } from '@/lib/turbologin'

type LoginDirect = (user: string, pass: string) => Promise<boolean>

/** Sign in with a Turbologin read from the clipboard. */
export function useTurboLogin(loginDirect: LoginDirect, redirectTo?: string) {
  const router = useRouter()
  const [turboError, setTurboError] = useState<string | null>(null)

  const handleTurboLogin = async () => {
    try {
      const parsed = parseTurbologin(await navigator.clipboard.readText())
      if (!parsed.ok) {
        setTurboError(parsed.error)
        return
      }
      const ok = await loginDirect(parsed.user, parsed.pass)
      if (ok) router.push(redirectTo ?? '/')
    } catch {
      setTurboError(CLIPBOARD_DENIED)
    }
  }

  return {
    turboError,
    handleTurboLogin,
    clearTurboError: () => setTurboError(null),
  }
}
