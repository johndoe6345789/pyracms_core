'use client'

import { Paper, Typography, TextField, Button } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'

interface QuickReplyFormProps {
  value: string
  onChange: (value: string) => void
}

export function QuickReplyForm({ value, onChange }: QuickReplyFormProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 4, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>Reply</Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        placeholder="Write your reply..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" endIcon={<SendOutlined />}>Submit Reply</Button>
    </Paper>
  )
}
