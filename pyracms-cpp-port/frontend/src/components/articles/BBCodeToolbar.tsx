'use client'

import { Box, Button, ButtonGroup } from '@mui/material'
import { BUTTONS } from './bbcodeButtons'

interface BBCodeToolbarProps {
  onInsertTag: (
    tag: string,
    hasAttr?: boolean,
    attrPrompt?: string
  ) => void
}

const barSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  bgcolor: 'background.default',
  borderBottom: 1,
  borderColor: 'divider',
  flexWrap: 'wrap',
}

export function BBCodeToolbar(
  { onInsertTag }: BBCodeToolbarProps
) {
  return (
    <Box
      sx={barSx}
      role="toolbar"
      aria-label="BBCode formatting toolbar"
    >
      <ButtonGroup variant="outlined" size="small">
        {BUTTONS.map((btn) => (
          <Button
            key={btn.tag}
            onClick={() => onInsertTag(
              btn.tag, btn.hasAttr, btn.attrPrompt
            )}
            title={btn.label}
            aria-label={btn.label}
            data-testid={`bbcode-${btn.tag}`}
            sx={{ minWidth: 36, px: 1 }}
          >
            {btn.icon}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  )
}
