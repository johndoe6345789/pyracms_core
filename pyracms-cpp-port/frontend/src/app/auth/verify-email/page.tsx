'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthPageShell from '@/components/auth/AuthPageShell'
import VerifyEmailStatus from '@/components/auth/VerifyEmailStatus'

function Content() {
  const token = useSearchParams().get('token') || ''
  return <VerifyEmailStatus token={token} />
}

export default function VerifyEmailPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}><Content /></Suspense>
    </AuthPageShell>
  )
}
