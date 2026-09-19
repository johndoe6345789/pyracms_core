import { TextField } from '@mui/material'

interface Props {
  fullName: string
  email: string
  onFullName: (v: string) => void
  onEmail: (v: string) => void
}

export default function EditUserFields({
  fullName, email, onFullName, onEmail,
}: Props) {
  return (
    <>
      <TextField
        label="Full Name"
        size="small"
        value={fullName}
        onChange={(e) => onFullName(e.target.value)}
        data-testid="edit-fullname-input"
      />
      <TextField
        label="Email"
        type="email"
        size="small"
        value={email}
        onChange={(e) => onEmail(e.target.value)}
        data-testid="edit-email-input"
      />
    </>
  )
}
