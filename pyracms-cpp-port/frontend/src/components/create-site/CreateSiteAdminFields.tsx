'use client'

import { TextField, Typography } from '@mui/material'
import type { CreateSiteForm } from '@/hooks/useCreateSite'

interface Props {
  form: CreateSiteForm
  updateField: (field: keyof CreateSiteForm, value: string) => void
}

const FIELDS: [keyof CreateSiteForm, string, string, string][] = [
  ['adminUsername', 'Admin username', 'text', 'admin-username-input'],
  ['adminEmail', 'Admin email', 'email', 'admin-email-input'],
  ['adminPassword', 'Admin password', 'password', 'admin-password-input'],
]

/** The account that will administer the new site. */
export default function CreateSiteAdminFields({ form, updateField }: Props) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Your admin account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You become the Administrator of this site, with an account that exists
        only here.
      </Typography>
      {FIELDS.map(([name, label, type, testId]) => (
        <TextField
          key={name}
          fullWidth
          required
          label={label}
          type={type}
          value={form[name]}
          onChange={(e) => updateField(name, e.target.value)}
          inputProps={{ 'data-testid': testId }}
          sx={{ mb: 2 }}
        />
      ))}
    </>
  )
}
