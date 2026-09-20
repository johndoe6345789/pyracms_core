'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import SetupForm from '@/components/setup/SetupForm'
import { useSetupStatus } from '@/hooks/useSetupStatus'

/** First-run splash. Once the platform has an owner it leads home. */
export default function SetupPage() {
  const router = useRouter()
  const needsSetup = useSetupStatus()

  useEffect(() => {
    if (needsSetup === false) router.replace('/')
  }, [needsSetup, router])

  return <AuthPageShell>{needsSetup ? <SetupForm /> : null}</AuthPageShell>
}
