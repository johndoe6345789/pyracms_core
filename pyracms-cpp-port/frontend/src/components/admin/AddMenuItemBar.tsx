'use client'

import { Box, TextField, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'

interface Props {
  label: string
  url: string
  onLabelChange: (v: string) => void
  onUrlChange: (v: string) => void
  onAdd: () => void
}

export default function AddMenuItemBar({
  label, url,
  onLabelChange, onUrlChange, onAdd,
}: Props) {
  return (
    <Box sx={{
      display: 'flex',
      gap: 1, alignItems: 'center',
    }}>
      <TextField
        size="small" value={label}
        onChange={(e) =>
          onLabelChange(e.target.value)}
        label="Label"
        placeholder="Menu item label"
        data-testid="new-label-input"
      />
      <TextField
        size="small" value={url}
        onChange={(e) =>
          onUrlChange(e.target.value)}
        label="URL" placeholder="/path"
        data-testid="new-url-input"
      />
      <Button
        variant="outlined"
        startIcon={<AddOutlined />}
        onClick={onAdd}
        disabled={!label || !url}
        data-testid="add-menu-item-btn"
      >
        Add Item
      </Button>
    </Box>
  )
}
