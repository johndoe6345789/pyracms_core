import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { TenantRow } from '@/hooks/useSuperAdminTenants'
import {
  TENANT_A, TENANT_B, renderRow,
} from '@/__tests__/helpers/tenantTable'

jest.mock('next/link', () =>
  require('@/__tests__/helpers/mockNextLink').linkMock)

describe('TenantTableRow', () => {
  it('renders name, slug, owner and createdAt', () => {
    renderRow(TENANT_A)
    expect(screen.getByText(TENANT_A.name)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.slug)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.owner)).toBeInTheDocument()
    expect(screen.getByText(TENANT_A.createdAt)).toBeInTheDocument()
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
    expect(btn).toHaveAttribute('aria-label', `Open ${TENANT_A.name}`)
    expect(btn).toHaveAttribute('href', `/site/${TENANT_A.slug}`)
  })

  it('delete icon button calls onDelete with tenant id', () => {
    const onDelete = jest.fn()
    renderRow(TENANT_A, onDelete)
    fireEvent.click(screen.getByTestId('delete-tenant-alpha'))
    expect(onDelete).toHaveBeenCalledWith(TENANT_A.id)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('row has data-testid="tenant-row-{slug}"', () => {
    renderRow(TENANT_A)
    const row = screen.getByTestId(`tenant-row-${TENANT_A.slug}`)
    // Must be a table row element
    expect(row.tagName.toLowerCase()).toBe('tr')
  })

  it('row data-testid uses the slug, not the name', () => {
    const custom: TenantRow = {
      ...TENANT_A, slug: 'custom-slug', name: 'Different Name',
    }
    renderRow(custom)
    expect(
      screen.getByTestId('tenant-row-custom-slug'),
    ).toBeInTheDocument()
  })
})
