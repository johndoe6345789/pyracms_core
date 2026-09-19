/** Tests for TenantTableRow content and actions. */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantTableRow from
  '@/components/super-admin/TenantTableRow'
import type { TenantRow } from
  '@/hooks/useSuperAdminTenants'
import {
  TENANT_A,
  TENANT_B,
} from '../../helpers/tenantTableHelpers'

jest.mock('next/link', () =>
  require('@/__tests__/helpers/tenantTableHelpers').MockLink)

describe('TenantTableRow', () => {
  /** Wraps TenantTableRow in the required table context. */
  function renderRow(
    tenant: TenantRow,
    onDelete: jest.Mock = jest.fn(),
  ) {
    return render(
      <table>
        <tbody>
          <TenantTableRow tenant={tenant} onDelete={onDelete} />
        </tbody>
      </table>,
    )
  }
  it('renders name, slug, owner and createdAt', () => {
    renderRow(TENANT_A)
    expect(screen.getByText(TENANT_A.name)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.slug)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.owner)).toBeInTheDocument()
    expect(
      screen.getByText(TENANT_A.createdAt),
    ).toBeInTheDocument()
  })

  it('active chip shows "Active" with success color', () => {
    renderRow(TENANT_A) // isActive: true
    const chip = screen.getByText('Active')
    expect(chip).toBeInTheDocument()
    // MUI renders color as a class; check the parent element
    expect(chip.closest('.MuiChip-root')).toHaveClass(
      'MuiChip-colorSuccess',
    )
  })

  it('inactive chip shows "Inactive" with default color', () => {
    renderRow(TENANT_B) // isActive: false
    const chip = screen.getByText('Inactive')
    expect(chip).toBeInTheDocument()
    expect(chip.closest('.MuiChip-root')).not.toHaveClass(
      'MuiChip-colorSuccess',
    )
  })

  it('open icon button has correct aria-label and href', () => {
    renderRow(TENANT_A)
    const btn = screen.getByTestId('open-tenant-alpha')
    expect(btn).toHaveAttribute(
      'aria-label',
      `Open ${TENANT_A.name}`,
    )
    expect(btn).toHaveAttribute('href', `/site/${TENANT_A.slug}`)
  })

  it('delete icon button calls onDelete with tenant id', () => {
    const onDelete = jest.fn()
    renderRow(TENANT_A, onDelete)
    fireEvent.click(
      screen.getByTestId('delete-tenant-alpha'),
    )
    expect(onDelete).toHaveBeenCalledWith(TENANT_A.id)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
