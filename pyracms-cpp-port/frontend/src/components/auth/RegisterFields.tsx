import { TextField } from '@mui/material'
import type { RegisterRequest } from '@/types'
import PasswordStrengthBar from './PasswordStrengthBar'

export { passwordStrength } from './passwordStrength'
export type { StrengthScore } from './passwordStrength'

interface Props {
  formData: RegisterRequest
  updateField: (field: keyof RegisterRequest, value: string) => void
  errorId?: string | undefined
}

interface FieldDef {
  name: keyof RegisterRequest
  label: string
  testId: string
  aria: string
  type?: string
  required?: boolean
}

const FIELDS: FieldDef[] = [
  {
    name: 'username',
    label: 'Username',
    required: true,
    testId: 'register-username-input',
    aria: 'Username',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    testId: 'register-email-input',
    aria: 'Email address',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    testId: 'register-password-input',
    aria: 'Password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    required: true,
    testId: 'register-confirm-password-input',
    aria: 'Confirm password',
  },
  {
    name: 'firstName',
    label: 'First Name',
    testId: 'register-firstname-input',
    aria: 'First name',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    testId: 'register-lastname-input',
    aria: 'Last name',
  },
]

/** All input fields for the registration form. */
export default function RegisterFields({
  formData,
  updateField,
  errorId,
}: Props) {
  return (
    <>
      {FIELDS.map((f) => (
        <FieldWithExtras
          key={f.name}
          f={f}
          formData={formData}
          updateField={updateField}
          errorId={errorId}
        />
      ))}
    </>
  )
}

function FieldWithExtras({
  f,
  formData,
  updateField,
  errorId,
}: Props & { f: FieldDef }) {
  return (
    <>
      <TextField
        fullWidth
        label={f.label}
        {...(f.type ? { type: f.type } : {})}
        margin="normal"
        required={!!f.required}
        value={formData[f.name] ?? ''}
        onChange={(e) => updateField(f.name, e.target.value)}
        inputProps={{ 'data-testid': f.testId, 'aria-label': f.aria }}
        {...(f.name === 'username' ? { 'aria-describedby': errorId } : {})}
      />
      {f.name === 'password' && (
        <PasswordStrengthBar password={formData.password} />
      )}
    </>
  )
}
