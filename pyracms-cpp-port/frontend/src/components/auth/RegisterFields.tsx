import { TextField } from '@mui/material'
import type { RegisterRequest } from '@/types'
import PasswordStrengthBar from './PasswordStrengthBar'
import { FIELDS, type FieldDef } from './registerFieldDefs'

export { passwordStrength } from './passwordStrength'
export type { StrengthScore } from './passwordStrength'

interface Props {
  formData: RegisterRequest
  updateField: (field: keyof RegisterRequest, value: string) => void
  errorId?: string | undefined
}

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
