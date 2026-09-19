import { useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'

interface Props {
  tags: string[]
  tag: string
  onTag: (t: string) => void
}

/** Collapsible category chips. Clicking the active one clears it. */
export default function SidebarTags({ tags, tag, onTag }: Props) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)} dense>
        <ListItemText primary="Categories" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>
        <Box
          sx={{
            px: 1.5,
            pb: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {tags.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No tags yet.
            </Typography>
          )}
          {tags.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              color={tag === t ? 'primary' : 'default'}
              onClick={() => onTag(tag === t ? '' : t)}
            />
          ))}
        </Box>
      </Collapse>
    </>
  )
}
