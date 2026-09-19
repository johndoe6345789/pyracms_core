import React from 'react'
import { render } from '@testing-library/react'
import SuperAdminGuard from '@/components/super-admin/SuperAdminGuard'

/** Render the guard with a simple text child. */
export function renderGuard(hydrated: boolean, allowed: boolean) {
  return render(
    <SuperAdminGuard hydrated={hydrated} allowed={allowed}>
      <div data-testid="guarded-child">Protected Content</div>
    </SuperAdminGuard>,
  )
}
