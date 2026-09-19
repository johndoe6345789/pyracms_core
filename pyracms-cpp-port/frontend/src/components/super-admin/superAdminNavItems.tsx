import {
  DashboardOutlined, DnsOutlined, PeopleOutlined, TuneOutlined,
} from '@mui/icons-material'

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/super-admin' },
  { label: 'Tenants', icon: <DnsOutlined />, path: '/super-admin/tenants' },
  { label: 'Users', icon: <PeopleOutlined />, path: '/super-admin/users' },
  { label: 'Settings', icon: <TuneOutlined />, path: '/super-admin/settings' },
]
