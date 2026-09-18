'use client'

import { TextField } from '@mui/material'

interface Props {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  content: string
  setContent: (v: string) => void
}

export function CreateThreadFields(p: Props) {
  return (
    <>
      <TextField
        label="Thread Title"
        value={p.title}
        onChange={(e) => p.setTitle(e.target.value)}
        fullWidth
        placeholder="Enter a descriptive title for your thread..."
        data-testid="thread-title-input"
      />
      <TextField
        label="Description"
        value={p.description}
        onChange={(e) => p.setDescription(e.target.value)}
        fullWidth
        placeholder="Brief description of what this thread is about..."
        data-testid="thread-description-input"
      />
      <TextField
        label="Post Content"
        value={p.content}
        onChange={(e) => p.setContent(e.target.value)}
        fullWidth
        multiline
        minRows={8}
        maxRows={20}
        placeholder="Write the content of your first post..."
        data-testid="thread-content-input"
      />
    </>
  )
}
