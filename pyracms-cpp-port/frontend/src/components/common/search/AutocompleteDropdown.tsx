'use client'

import { Paper, List, Popper } from '@mui/material'
import AutocompleteItem, { type Result } from './AutocompleteItem'

interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  results: Result[]
  width?: number | undefined
  onSelect: (r: Result) => void
}
export default function AutocompleteDropdown({
  open,
  anchorEl,
  results,
  width,
  onSelect,
}: Props) {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1300, width }}
    >
      <Paper
        elevation={8}
        sx={{
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        <List dense>
          {results.map((r, i) => (
            <AutocompleteItem key={i} r={r} i={i} onSelect={onSelect} />
          ))}
        </List>
      </Paper>
    </Popper>
  )
}
