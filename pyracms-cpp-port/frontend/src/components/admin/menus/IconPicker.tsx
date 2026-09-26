'use client'

import { useState } from 'react'
import { Box, Button, Popover } from '@mui/material'
import { ClearOutlined, EmojiSymbolsOutlined } from '@mui/icons-material'
import IconPopover from './IconPopover'
import { iconFor } from '@/lib/menuIcons'

interface Props {
  value: string
  onChange: (name: string) => void
}

/** Choose an icon from the library: search by name, or browse by subject. */
export default function IconPicker({ value, onChange }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const chosen = iconFor(value)
  const pick = (name: string) => {
    onChange(name)
    setAnchor(null)
  }
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        variant="outlined"
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={chosen ? <chosen.Icon /> : <EmojiSymbolsOutlined />}
        data-testid="icon-picker-btn"
        sx={{ justifyContent: 'flex-start', flexGrow: 1 }}
      >
        {chosen ? chosen.label : 'Choose an icon (optional)'}
      </Button>
      {value && (
        <Button
          size="small"
          startIcon={<ClearOutlined />}
          onClick={() => onChange('')}
          data-testid="icon-clear-btn"
        >
          No icon
        </Button>
      )}
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { width: 460, maxWidth: '95vw', p: 1.5 } } }}
      >
        <IconPopover value={value} onPick={pick} />
      </Popover>
    </Box>
  )
}
