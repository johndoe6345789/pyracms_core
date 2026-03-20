'use client'

import { Box, TextField, Button } from '@mui/material'

interface EditFormProps {
  editText: string
  setEditText: (v: string) => void
  onSave: () => void
  onCancel: () => void
  submitting: boolean
}

export default function EditForm({
  editText,
  setEditText,
  onSave,
  onCancel,
  submitting,
}: EditFormProps) {
  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        value={editText}
        onChange={(e) =>
          setEditText(e.target.value)
        }
        data-testid="comment-edit-input"
      />
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 1,
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={submitting}
          data-testid="comment-save-btn"
        >
          Save
        </Button>
        <Button
          size="small"
          onClick={onCancel}
          data-testid="comment-edit-cancel-btn"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
