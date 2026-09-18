import { render } from '@testing-library/react'
import RegisterFields from '@/components/auth/RegisterFields'
import type { RegisterRequest } from '@/types'

export const emptyForm: RegisterRequest = {
  username: '', email: '', password: '',
  confirmPassword: '', firstName: '', lastName: '',
}

/** Renders RegisterFields with optional prop overrides. */
export function setup(
  overrides: Partial<RegisterRequest> = {},
  updateField = jest.fn(),
  errorId?: string,
) {
  const formData: RegisterRequest = { ...emptyForm, ...overrides }
  render(
    <RegisterFields
      formData={formData}
      updateField={updateField}
      errorId={errorId}
    />,
  )
  return { updateField }
}
