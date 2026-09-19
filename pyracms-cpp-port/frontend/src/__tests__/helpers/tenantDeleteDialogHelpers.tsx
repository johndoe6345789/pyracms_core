import { render } from '@testing-library/react'
import TenantDeleteDialog from '@/components/super-admin/TenantDeleteDialog'

interface RenderOptions {
  open: boolean
  onConfirm?: jest.Mock
  onCancel?: jest.Mock
}

export function renderDialog({
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
