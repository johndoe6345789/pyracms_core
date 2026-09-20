import TenantAppBar from '@/components/layout/TenantAppBar'
import { renderWithStore } from './renderWithStore'

/** The site top bar for slug `d`, in a fresh store. */
export const renderSiteBar = () =>
  renderWithStore(
    <TenantAppBar
      slug="d"
      siteName="Demo"
      drawerOpen={false}
      onMenuClick={jest.fn()}
    />,
  )
