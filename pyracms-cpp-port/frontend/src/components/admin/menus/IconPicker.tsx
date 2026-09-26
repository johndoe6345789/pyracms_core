'use client'

import { useState } from 'react'
import { Box, Button, Popover, Tab, Tabs, TextField } from '@mui/material'
import { ClearOutlined, EmojiSymbolsOutlined } from '@mui/icons-material'
import IconGrid from './IconGrid'
import {
  ICON_CATEGORIES,
  ICON_COUNT,
  iconFor,
  searchIcons,
} from '@/lib/menuIcons'

interface Props {
  value: string
  onChange: (name: string) => void
}

/** Choose an icon from the library: search by name, or browse by subject. */
export default function IconPicker({ value, onChange }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(0)
  const chosen = iconFor(value)
  const shown = query.trim()
    ? searchIcons(query)
    : (ICON_CATEGORIES[tab]?.icons ?? [])
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
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={`Search ${ICON_COUNT} icons (train, camera, code...)`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ 'data-testid': 'icon-search' }}
          sx={{ mb: 1 }}
        />
        {!query.trim() && (
          <Tabs
            value={tab}
            onChange={(_, t: number) => setTab(t)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 1, minHeight: 36 }}
          >
            {ICON_CATEGORIES.map((c) => (
              <Tab key={c.title} label={c.title} sx={{ minHeight: 36 }} />
            ))}
          </Tabs>
        )}
        <IconGrid icons={shown} value={value} onPick={pick} />
      </Popover>
    </Box>
  )
}
