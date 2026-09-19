import React from 'react'
import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { asMockedFunction } from './mockFunction'
import { SuperAdminBreadcrumbs } from './pages/SuperAdminBreadcrumbs'

const mockUsePathname = asMockedFunction(usePathname)

/** Render breadcrumbs with a specific pathname. */
export function renderCrumbs(pathname: string) {
  mockUsePathname.mockReturnValue(pathname)
  return render(<SuperAdminBreadcrumbs />)
}
