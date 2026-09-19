'use client'

import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import type { ForumAdminState } from '@/hooks/useForumAdmin'
import { ForumAdminFields } from './ForumAdminFields'

export function ForumAdminDialog({ s }: { s: ForumAdminState }) {
  const d = s.dialog
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [seen, setSeen] = useState<unknown>(null)
  if (d !== seen) {
    setSeen(d)
    setName(d?.name ?? '')
    setDesc(d?.description ?? '')
  }
  if (!d) return null
  const del = d.mode === 'delete'
  const noun = d.kind === 'category' ? 'category' : 'forum'
  const verb = { create: 'Add', edit: 'Rename', delete: 'Delete' }[d.mode]
  return (
    <Dialog
      open
      onClose={s.close}
      maxWidth="sm"
      fullWidth
      data-testid="forum-admin-dialog"
      aria-labelledby="forum-admin-title"
    >
      <DialogTitle id="forum-admin-title">
        {verb} {noun}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '16px !important',
        }}
      >
        {s.error && (
          <Alert severity="error" data-testid="forum-admin-error">
            {s.error}
          </Alert>
        )}
        <ForumAdminFields
          d={d}
          noun={noun}
          name={name}
          desc={desc}
          setName={setName}
          setDesc={setDesc}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={s.close} data-testid="forum-admin-cancel">
          Cancel
        </Button>
        <Button
          variant="contained"
          color={del ? 'error' : 'primary'}
          disabled={s.busy || (!del && !name.trim())}
          onClick={() => s.submit(name, desc)}
          data-testid="forum-admin-submit"
        >
          {s.busy ? 'Saving...' : del ? 'Delete' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
