import { useState } from 'react'
import { Box, Typography, TextField } from '@mui/material'
import { HexColorPicker } from 'react-colorful'

interface Props {
  label: string
  color: string
  onChange: (color: string) => void
}

export default function ColorPickerField({
  label,
  color,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          data-testid={`swatch-${label}`}
          onClick={() => setOpen(!open)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: color,
            border: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
        />
        <TextField
          size="small"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 120 }}
          inputProps={{ 'aria-label': label }}
        />
      </Box>
      {open && (
        <Box sx={{ mt: 1 }}>
          <HexColorPicker color={color} onChange={onChange} />
        </Box>
      )}
    </Box>
  )
}
