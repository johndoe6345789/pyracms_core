import { UserRole } from '@/types'
import type { GlobalUserRow } from '@/hooks/useSuperAdminUsers'

export const RAW_USERS = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    role: UserRole.SiteAdmin,
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    role: UserRole.User,
    isActive: false,
    createdAt: '2024-03-05T12:00:00Z',
  },
]

export const MAPPED_USERS: GlobalUserRow[] = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    role: UserRole.SiteAdmin,
    roleLabel: 'Site Admin',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    role: UserRole.User,
    roleLabel: 'User',
    isActive: false,
    createdAt: '2024-03-05',
  },
]

