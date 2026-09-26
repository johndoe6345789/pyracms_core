'use client'

import { useState } from 'react'
import { Box, Button, Menu, MenuItem, Paper, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import { siblingsOf } from '@/lib/menuOrder'
import type { MenuItemRow } from '@/hooks/admin/menuData'

/** A live picture of the top bar: folders open as dropdowns. */
export default function MenuPreview({ items }: { items: MenuItemRow[] }) {
  const [open, setOpen] = useState<{ el: HTMLElement; id: number } | null>(null)
  const kids = open ? siblingsOf(items, open.id) : []
  return (
    <Paper variant="outlined" sx={{ p: 1, mb: 3 }} data-testid="menu-preview">
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        Preview of your top bar (click a folder)
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {siblingsOf(items, 0).map((i) =>
          i.type === 'folder' ? (
            <Button
              key={i.id}
              size="small"
              endIcon={<ArrowDropDown />}
              onClick={(e) => setOpen({ el: e.currentTarget, id: i.id })}
            >
              {i.name}
            </Button>
          ) : (
            <Button key={i.id} size="small">
              {i.name}
            </Button>
          ),
        )}
      </Box>
      <Menu anchorEl={open?.el} open={!!open} onClose={() => setOpen(null)}>
        {kids.length ? (
          kids.map((k) => <MenuItem key={k.id}>{k.name}</MenuItem>)
        ) : (
          <MenuItem disabled>Empty folder</MenuItem>
        )}
      </Menu>
    </Paper>
  )
}
