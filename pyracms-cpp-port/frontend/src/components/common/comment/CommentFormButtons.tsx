'use client'

import { Box, Button } from '@mui/material'

interface Props {
  small: boolean
  label: string
  disabled: boolean
  onSubmit: () => void
  onCancel?: () => void
}

export default function CommentFormButtons(p: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end',
      gap: 1, mt: 1 }}>
      {p.onCancel && (
        <Button size="small" onClick={p.onCancel}
          data-testid="comment-cancel-btn">
          Cancel
        </Button>
      )}
      <Button size={p.small ? 'small' : 'medium'} variant="contained"
        onClick={p.onSubmit} disabled={p.disabled}
        data-testid="comment-submit-btn">
        {p.label}
      </Button>
    </Box>
  )
}
