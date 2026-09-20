'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSetupStatus } from '@/hooks/useSetupStatus'

/** Sends every portal visitor to the setup splash until it is done. */
export default function SetupRedirect() {
  const router = useRouter()
  const needsSetup = useSetupStatus()
  useEffect(() => {
    if (needsSetup) router.replace('/setup')
  }, [needsSetup, router])
  return null
}
