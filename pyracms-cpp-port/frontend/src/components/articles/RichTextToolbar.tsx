'use client'

import {
  Box, IconButton, Tooltip, Divider,
} from '@mui/material'
import type { Editor } from '@tiptap/react'
import { getRichToolbarItems } from './richTextToolbarItems'

interface RichTextToolbarProps {
  editor: Editor
}

export function RichTextToolbar({
  editor,
}: RichTextToolbarProps) {
  const items = getRichToolbarItems(editor)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5, px: 1, py: 0.5,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
      role="toolbar"
      aria-label="Rich text formatting toolbar"
    >
      {items.map((item, idx) =>
        item === null ? (
          <Divider
            key={`divider-${idx}`}
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5 }}
          />
        ) : (
          <Tooltip
            key={item.label}
            title={item.label}
          >
            <IconButton
              size="small"
              onClick={item.action}
              color={
                item.active
                  ? 'primary' : 'default'
              }
              aria-label={item.label}
              data-testid={`rich-${
                item.label.toLowerCase()
                  .replace(/\s+/g, '-')
              }`}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ),
      )}
    </Box>
  )
}
