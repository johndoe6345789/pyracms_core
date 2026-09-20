'use client'

import { Suspense, useState } from 'react'
import AuthPageShell from '@/components/auth/AuthPageShell'
import LoginForm from '@/components/auth/LoginForm'
import OAuthButtons from '@/components/auth/OAuthButtons'
import LoginScopeSelect from '@/components/auth/LoginScopeSelect'
import { useAuthParams } from '@/hooks/useAuthParams'

/**
 * Platform Owners land on the portal home; site accounts land on their
 * site, unless the link asked for a specific page.
 */
function LoginContent() {
  const { tenant, explicitRedirect } = useAuthParams()
  const [scope, setScope] = useState(tenant ?? '')
  const site = scope || undefined
  const target = explicitRedirect ?? (scope ? `/site/${scope}` : '/')
  return (
    <>
      <LoginScopeSelect value={scope} onChange={setScope} />
      <LoginForm tenant={site} redirectTo={target} />
      {!site && <OAuthButtons redirectTo={target} />}
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </AuthPageShell>
  )
}
