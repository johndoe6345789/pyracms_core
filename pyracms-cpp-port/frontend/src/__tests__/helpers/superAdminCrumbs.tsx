import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { asMockedFunction } from './mockFunction'
import SuperAdminBreadcrumbs from
  '@/components/super-admin/SuperAdminBreadcrumbs'

// Requires the test file to jest.mock('next/navigation').
export const mockUsePathname = asMockedFunction(usePathname)

/** Render breadcrumbs with a specific pathname. */
export function renderCrumbs(pathname: string) {
  mockUsePathname.mockReturnValue(pathname)
  return render(<SuperAdminBreadcrumbs />)
}
