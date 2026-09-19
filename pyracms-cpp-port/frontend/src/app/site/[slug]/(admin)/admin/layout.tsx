'use client'

import AdminGate from '@/components/admin/layout/AdminGate'
import AdminShell from '@/components/admin/layout/AdminShell'

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  )
}
