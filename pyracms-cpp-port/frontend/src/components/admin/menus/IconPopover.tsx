import { useState } from 'react'
import { Tab, Tabs, TextField } from '@mui/material'
import IconGrid from './IconGrid'
import { ICON_CATEGORIES, ICON_COUNT, searchIcons } from '@/lib/menuIcons'

interface Props {
  value: string
  onPick: (name: string) => void
}

/** The icon chooser's search box, subject tabs and grid. */
export default function IconPopover({ value, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(0)
  const shown = query.trim()
    ? searchIcons(query)
    : (ICON_CATEGORIES[tab]?.icons ?? [])
  return (
    <>
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
      <IconGrid icons={shown} value={value} onPick={onPick} />
    </>
  )
}
