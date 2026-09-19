import {
  DashboardOutlined, SettingsOutlined,
  AddCircleOutlineOutlined, ShieldOutlined, ManageAccountsOutlined,
} from '@mui/icons-material'
import MenuLink from './MenuLink'

/** Site-scoped menu links (Admin, Settings). */
export function siteMenuItems(slug: string, close: () => void) {
  return [
    <MenuLink key="account" href={`/site/${slug}/account`}
      label="Account settings" testId="account-link" onClick={close}
      icon={<ManageAccountsOutlined fontSize="small" />} />,
    <MenuLink key="admin" href={`/site/${slug}/admin`} label="Admin"
      testId="admin-link" onClick={close}
      icon={<DashboardOutlined fontSize="small" />} />,
    <MenuLink key="settings" href={`/site/${slug}/admin/settings`}
      label="Settings" testId="settings-link" onClick={close}
      icon={<SettingsOutlined fontSize="small" />} />,
  ]
}

/** Portal menu links (Create a site, Super admin for super admins). */
export function portalMenuItems(isSuper: boolean, close: () => void) {
  const items = [
    <MenuLink key="account" href="/account" label="Account settings"
      testId="account-link" onClick={close}
      icon={<ManageAccountsOutlined fontSize="small" />} />,
    <MenuLink key="create" href="/create-site" label="Create a site"
      testId="create-site-link" onClick={close}
      icon={<AddCircleOutlineOutlined fontSize="small" />} />,
  ]
  if (isSuper) {
    items.push(
      <MenuLink key="super" href="/super-admin" label="Platform owner"
        testId="super-admin-link" onClick={close}
        icon={<ShieldOutlined fontSize="small" />} />,
    )
  }
  return items
}
