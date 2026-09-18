import type { TenantRow } from '@/hooks/useSuperAdminTenants'

export const RAW_TENANTS = [
  {
    id: 1,
    slug: 'acme',
    displayName: 'Acme Corp',
    ownerUsername: 'alice',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    slug: 'beta',
    displayName: 'Beta Inc',
    ownerUsername: 'bob',
    isActive: false,
    createdAt: '2024-02-20T09:30:00Z',
  },
]

export const MAPPED_TENANTS: TenantRow[] = [
  {
    id: 1,
    slug: 'acme',
    name: 'Acme Corp',
    owner: 'alice',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    slug: 'beta',
    name: 'Beta Inc',
    owner: 'bob',
    isActive: false,
    createdAt: '2024-02-20',
  },
]

