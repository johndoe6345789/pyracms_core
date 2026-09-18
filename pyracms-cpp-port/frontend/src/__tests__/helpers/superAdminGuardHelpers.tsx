import { render } from '@testing-library/react'
import SuperAdminGuard
  from '@/components/super-admin/SuperAdminGuard'

export function renderGuard(hydrated: boolean, allowed: boolean) {
  return render(
    <SuperAdminGuard hydrated={hydrated} allowed={allowed}>
      <div data-testid="guarded-child">Protected Content</div>
    </SuperAdminGuard>,
  )
}
