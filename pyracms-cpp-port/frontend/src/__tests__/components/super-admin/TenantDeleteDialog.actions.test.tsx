import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderDialog }
  from '@/__tests__/helpers/tenantDeleteDialogHelpers'

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
})
