'use client'

import { TextField, Typography } from '@mui/material'
import type { ForumAdminState } from '@/hooks/useForumAdmin'

type Dialog = NonNullable<ForumAdminState['dialog']>

interface Props {
  d: Dialog
  noun: string
  name: string
  desc: string
  setName: (v: string) => void
  setDesc: (v: string) => void
}

export function ForumAdminFields({
  d,
  noun,
  name,
  desc,
  setName,
  setDesc,
}: Props) {
  if (d.mode === 'delete')
    return (
      <Typography data-testid="forum-admin-confirm">
        Delete {noun} &quot;{d.name}&quot;? This cannot be undone.
      </Typography>
    )
  return (
    <>
      <TextField
        label="Name"
        size="small"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        inputProps={{ 'data-testid': 'forum-admin-name' }}
      />
      {d.kind === 'forum' && (
        <TextField
          label="Description"
          size="small"
          multiline
          minRows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          inputProps={{ 'data-testid': 'forum-admin-desc' }}
        />
      )}
    </>
  )
}
