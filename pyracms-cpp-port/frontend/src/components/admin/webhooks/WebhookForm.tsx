'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import WebhookFields from './WebhookFields'
import type { Webhook, WebhookDraft } from '@/hooks/admin/webhookApi'

interface Props {
  open: boolean
  webhook: Webhook | null
  onClose: () => void
  onSave: (d: WebhookDraft, id?: number) => Promise<boolean>
}

const blank = (w: Webhook | null): WebhookDraft => ({
  url: w?.url ?? '',
  secret: '',
  events: w?.events ?? [],
  active: w?.active ?? true,
})

export default function WebhookForm(p: Props) {
  const [d, setD] = useState(() => blank(p.webhook))
  const toggle = (e: string) =>
    setD((s) => ({
      ...s,
      events: s.events.includes(e)
        ? s.events.filter((x) => x !== e)
        : [...s.events, e],
    }))
  const submit = async () => {
    if (await p.onSave(d, p.webhook?.id)) p.onClose()
  }
  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      fullWidth
      data-testid="webhook-form"
    >
      <DialogTitle>{p.webhook ? 'Edit webhook' : 'New webhook'}</DialogTitle>
      <DialogContent>
        <WebhookFields
          d={d}
          setD={setD}
          editing={!!p.webhook}
          toggle={toggle}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!d.url.trim() || d.events.length === 0}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
