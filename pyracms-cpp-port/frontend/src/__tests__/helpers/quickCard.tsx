import { render } from '@testing-library/react'
import { DnsOutlined } from '@mui/icons-material'
import SuperAdminQuickCard from
  '@/components/super-admin/SuperAdminQuickCard'

/** Minimal valid props for SuperAdminQuickCard. */
export const DEFAULT_PROPS = {
  label: 'Manage Tenants',
  description: 'Create, view and delete sites',
  icon: <DnsOutlined data-testid="card-icon" />,
  href: '/super-admin/tenants',
  testId: 'quick-tenants',
}

export function renderCard(
  overrides: Partial<typeof DEFAULT_PROPS> = {},
) {
  const props = { ...DEFAULT_PROPS, ...overrides }
  return render(<SuperAdminQuickCard {...props} />)
}

/** Two cards rendered side by side. */
export function renderTwoCards() {
  return render(
    <>
      <SuperAdminQuickCard
        label="Manage Tenants"
        description="desc A"
        icon={<DnsOutlined />}
        href="/super-admin/tenants"
        testId="quick-tenants"
      />
      <SuperAdminQuickCard
        label="Global Users"
        description="desc B"
        icon={<DnsOutlined />}
        href="/super-admin/users"
        testId="quick-users"
      />
    </>,
  )
}
