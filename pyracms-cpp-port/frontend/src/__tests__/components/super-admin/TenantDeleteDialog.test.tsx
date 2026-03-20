/**
 * Tests for TenantDeleteDialog.
 *
 * Covers visibility, button interactions, accessibility
 * attributes and data-testid requirements.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import TenantDeleteDialog from
  '@/components/super-admin/TenantDeleteDialog'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RenderOptions {
  open: boolean
  onConfirm?: jest.Mock
  onCancel?: jest.Mock
}

/**
 * Renders TenantDeleteDialog with the supplied props and fresh
 * mock functions unless overridden.
 */
function renderDialog({
  open,
  onConfirm = jest.fn(),
  onCancel = jest.fn(),
}: RenderOptions) {
  return {
    onConfirm,
    onCancel,
    ...render(
      <TenantDeleteDialog
        open={open}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    ),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TenantDeleteDialog', () => {
  it('dialog is not visible when open=false', () => {
    renderDialog({ open: false })
    // MUI Dialog keeps the node in the DOM but hidden
    const dialog = screen.queryByRole('dialog', { hidden: true })
    if (dialog) {
      expect(dialog).not.toBeVisible()
    } else {
      expect(dialog).toBeNull()
    }
  })

  it('dialog is visible when open=true', () => {
    renderDialog({ open: true })
    expect(
      screen.getByRole('dialog'),
    ).toBeVisible()
  })

  it('cancel button calls onCancel', () => {
    const { onCancel } = renderDialog({ open: true })
    fireEvent.click(
      screen.getByTestId('cancel-delete-tenant'),
    )
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('delete button calls onConfirm', () => {
    const { onConfirm } = renderDialog({ open: true })
    fireEvent.click(
      screen.getByTestId('confirm-delete-tenant'),
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancel button does not call onConfirm', () => {
    const { onConfirm } = renderDialog({ open: true })
    fireEvent.click(
      screen.getByTestId('cancel-delete-tenant'),
    )
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirm button does not call onCancel', () => {
    const { onCancel } = renderDialog({ open: true })
    fireEvent.click(
      screen.getByTestId('confirm-delete-tenant'),
    )
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('Dialog has aria-labelledby="confirm-delete-title"', () => {
    renderDialog({ open: true })
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'confirm-delete-title',
    )
  })

  it('DialogTitle has id="confirm-delete-title"', () => {
    renderDialog({ open: true })
    const title = screen.getByText('Delete Tenant?')
    expect(title.closest('[id="confirm-delete-title"]'))
      .toBeInTheDocument()
  })

  it('data-testid="tenant-delete-dialog" is present', () => {
    renderDialog({ open: true })
    expect(
      screen.getByTestId('tenant-delete-dialog'),
    ).toBeInTheDocument()
  })

  it('data-testid="cancel-delete-tenant" is present', () => {
    renderDialog({ open: true })
    expect(
      screen.getByTestId('cancel-delete-tenant'),
    ).toBeInTheDocument()
  })

  it('data-testid="confirm-delete-tenant" is present', () => {
    renderDialog({ open: true })
    expect(
      screen.getByTestId('confirm-delete-tenant'),
    ).toBeInTheDocument()
  })

  it('displays warning copy about permanent deletion', () => {
    renderDialog({ open: true })
    expect(
      screen.getByText(
        /permanently delete the tenant/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/cannot be undone/i),
    ).toBeInTheDocument()
  })
})
