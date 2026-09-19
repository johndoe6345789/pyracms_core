'use client'

import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Switch,
} from '@mui/material'
import { WEBHOOK_EVENTS, type WebhookDraft } from '@/hooks/admin/webhookApi'

interface Props {
  d: WebhookDraft
  setD: (d: WebhookDraft) => void
  editing: boolean
  toggle: (event: string) => void
}

export default function WebhookFields({ d, setD, editing, toggle }: Props) {
  return (
    <>
      <TextField
        label="Payload URL"
        fullWidth
        margin="dense"
        value={d.url}
        onChange={(e) => setD({ ...d, url: e.target.value })}
      />
      <TextField
        label="Secret"
        fullWidth
        margin="dense"
        type="password"
        value={d.secret}
        helperText={editing ? 'Leave blank to keep current' : ''}
        onChange={(e) => setD({ ...d, secret: e.target.value })}
      />
      <FormGroup>
        {WEBHOOK_EVENTS.map((ev) => (
          <FormControlLabel
            key={ev}
            label={ev}
            control={
              <Checkbox
                checked={d.events.includes(ev)}
                onChange={() => toggle(ev)}
              />
            }
          />
        ))}
      </FormGroup>
      <FormControlLabel
        label="Active"
        control={
          <Switch
            checked={d.active}
            onChange={(_, v) => setD({ ...d, active: v })}
          />
        }
      />
    </>
  )
}
