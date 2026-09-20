'use client'

import { MenuItem, TextField } from '@mui/material'
import { useTenantList } from '@/hooks/useTenantList'

interface Props {
  /** Site slug, or '' for the platform (Platform Owner) */
  value: string
  onChange: (slug: string) => void
}

/**
 * Which accounts to sign in to: the Platform Owner's, or one site's.
 * Accounts are separate on every site, so this decides who you are.
 */
export default function LoginScopeSelect({ value, onChange }: Props) {
  const { sites } = useTenantList()
  const known = value === '' || sites.some((s) => s.slug === value)
  return (
    <TextField
      select
      fullWidth
      label="Sign in as"
      margin="normal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{ htmlInput: { 'data-testid': 'login-scope-input' } }}
      data-testid="login-scope"
    >
      <MenuItem value="">Platform Owner</MenuItem>
      {!known && <MenuItem value={value}>{value}</MenuItem>}
      {sites.map((s) => (
        <MenuItem key={s.slug} value={s.slug}>
          {s.name} ({s.slug})
        </MenuItem>
      ))}
    </TextField>
  )
}
