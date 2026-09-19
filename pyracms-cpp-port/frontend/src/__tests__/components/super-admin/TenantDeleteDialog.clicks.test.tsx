/** Tests for TenantDeleteDialog button interactions. */
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderDialog } from '../../helpers/tenantDeleteDialogHelpers'

describe('TenantDeleteDialog', () => {
  it('cancel button calls onCancel', () => {
    const { onCancel } = renderDialog({ open: true })
    fireEvent.click(screen.getByTestId('cancel-delete-tenant'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('delete button calls onConfirm', () => {
    const { onConfirm } = renderDialog({ open: true })
    fireEvent.click(screen.getByTestId('confirm-delete-tenant'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancel button does not call onConfirm', () => {
    const { onConfirm } = renderDialog({ open: true })
    fireEvent.click(screen.getByTestId('cancel-delete-tenant'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirm button does not call onCancel', () => {
    const { onCancel } = renderDialog({ open: true })
    fireEvent.click(screen.getByTestId('confirm-delete-tenant'))
    expect(onCancel).not.toHaveBeenCalled()
  })
})
