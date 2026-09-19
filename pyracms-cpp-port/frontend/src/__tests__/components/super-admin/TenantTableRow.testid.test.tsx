/** Tests for TenantTableRow test ids. */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantTableRow from '@/components/super-admin/TenantTableRow'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'
import { TENANT_A } from '../../helpers/tenantTableHelpers'

jest.mock(
  'next/link',
  () => require('@/__tests__/helpers/tenantTableHelpers').MockLink,
)

describe('TenantTableRow', () => {
  /** Wraps TenantTableRow in the required table context. */
  function renderRow(tenant: TenantRow, onDelete: jest.Mock = jest.fn()) {
    return render(
      <table>
        <tbody>
          <TenantTableRow tenant={tenant} onDelete={onDelete} />
        </tbody>
      </table>,
    )
  }
  it('row has data-testid="tenant-row-{slug}"', () => {
    renderRow(TENANT_A)
    const row = screen.getByTestId(`tenant-row-${TENANT_A.slug}`)
    // Must be a table row element
    expect(row.tagName.toLowerCase()).toBe('tr')
  })

  it('row data-testid uses the slug, not the name', () => {
    const custom: TenantRow = {
      ...TENANT_A,
      slug: 'custom-slug',
      name: 'Different Name',
    }
    renderRow(custom)
    expect(screen.getByTestId('tenant-row-custom-slug')).toBeInTheDocument()
  })
})
