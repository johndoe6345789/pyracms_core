import { useState, useEffect } from 'react'
import {
  PeopleOutlined, ArticleOutlined,
  DashboardOutlined, SettingsOutlined,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import api from '@/lib/api'

export interface Stat {
  title: string
  value: string
  icon: SvgIconComponent
  color: string
}

export function buildStats(
  users: string, items: string, tenants: string, settings: string,
): Stat[] {
  return [
    { title: 'Total Users', value: users,
      icon: PeopleOutlined, color: '#667eea' },
    { title: 'Content Items', value: items,
      icon: ArticleOutlined, color: '#f093fb' },
    { title: 'Tenants', value: tenants,
      icon: DashboardOutlined, color: '#4facfe' },
    { title: 'Settings', value: settings,
      icon: SettingsOutlined, color: '#43e97b' },
  ]
}

const count = (path: string) =>
  api.get(path).then((r) => (r.data || []).length).catch(() => 0)

export function useDashboardStats() {
  const [stats, setStats] = useState<Stat[]>(
    buildStats('...', '...', '...', '...'))

  useEffect(() => {
    Promise.all([
      count('/api/users'),
      api.get('/api/tenants').then((r) => {
        const tenants = r.data || []
        return { n: tenants.length, id: tenants[0]?.id }
      }).catch(() => ({ n: 0, id: null })),
    ]).then(async ([users, { n, id }]) => {
      let articles = 0
      let settings = 0
      if (id) {
        articles = await count(`/api/articles?tenant_id=${id}`)
        settings = await count(`/api/settings?tenant_id=${id}`)
      }
      setStats(buildStats(
        String(users), String(articles), String(n), String(settings)))
    })
  }, [])

  return stats
}
