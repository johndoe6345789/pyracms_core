import { useState, useEffect } from 'react'
import {
  PeopleOutlined,
  ArticleOutlined,
  HowToRegOutlined,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import api from '@/lib/api'

export interface Stat {
  title: string
  value: string
  icon: SvgIconComponent
  color: string
}

function buildStats(
  users: string,
  items: string,
  registration: string,
): Stat[] {
  return [
    {
      title: 'Total Users',
      value: users,
      icon: PeopleOutlined,
      color: '#667eea',
    },
    {
      title: 'Content Items',
      value: items,
      icon: ArticleOutlined,
      color: '#f093fb',
    },
    {
      title: 'Registration',
      value: registration,
      icon: HowToRegOutlined,
      color: '#43e97b',
    },
  ]
}

/** "Open" or "Closed" from the site's registration_open setting. */
const registration = (tenantId: number) =>
  api
    .get(`/api/settings/registration_open?tenant_id=${tenantId}`)
    .then((r) => (String(r.data?.value) === 'false' ? 'Closed' : 'Open'))
    .catch(() => 'Open')

/** Row count of a list route, or 'N/A' when the request fails. */
const count = (path: string) =>
  api
    .get(path)
    .then((r) => String((r.data || []).length))
    .catch(() => 'N/A')

/** Real per-tenant counts; never shows fabricated zeros. */
export function useDashboardStats(tenantId: number | null) {
  const [stats, setStats] = useState<Stat[]>(buildStats('...', '...', '...'))

  useEffect(() => {
    if (tenantId == null) return
    Promise.all([
      count('/api/users'),
      count(`/api/articles?tenant_id=${tenantId}`),
      registration(tenantId),
    ]).then(([u, a, r]) => setStats(buildStats(u, a, r)))
  }, [tenantId])

  return stats
}
