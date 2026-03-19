'use client'

import {
  Box,
  Button,
  ButtonGroup,
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  FormatQuote,
  FormatListBulleted,
  Palette,
  FormatSize,
} from '@mui/icons-material'

export interface BBCodeButton {
  icon: React.ReactNode
  label: string
  tag: string
  hasAttr?: boolean
  attrPrompt?: string
}

export const BBCODE_BUTTONS: BBCodeButton[] = [
  {
    icon: <FormatBold />,
    label: 'Bold',
    tag: 'b',
  },
  {
    icon: <FormatItalic />,
    label: 'Italic',
    tag: 'i',
  },
  {
    icon: <FormatUnderlined />,
    label: 'Underline',
    tag: 'u',
  },
  {
    icon: <LinkIcon />,
    label: 'URL',
    tag: 'url',
    hasAttr: true,
    attrPrompt: 'Enter URL:',
  },
  {
    icon: <ImageIcon />,
    label: 'Image',
    tag: 'img',
  },
  {
    icon: <Code />,
    label: 'Code',
    tag: 'code',
  },
  {
    icon: <FormatQuote />,
    label: 'Quote',
    tag: 'quote',
  },
  {
    icon: <FormatListBulleted />,
    label: 'List',
    tag: 'list',
  },
  {
    icon: <Palette />,
    label: 'Color',
    tag: 'color',
    hasAttr: true,
    attrPrompt:
      'Enter color (e.g., red, #ff0000):',
  },
  {
    icon: <FormatSize />,
    label: 'Size',
    tag: 'size',
    hasAttr: true,
    attrPrompt: 'Enter size (e.g., 14, 20):',
  },
]

interface BBCodeToolbarProps {
  onInsertTag: (
    tag: string,
    hasAttr?: boolean,
    attrPrompt?: string,
  ) => void
}

export function BBCodeToolbar({
  onInsertTag,
}: BBCodeToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
      role="toolbar"
      aria-label="BBCode formatting toolbar"
    >
      <ButtonGroup variant="outlined" size="small">
        {BBCODE_BUTTONS.map((btn) => (
          <Button
            key={btn.tag}
            onClick={() => onInsertTag(
              btn.tag,
              btn.hasAttr,
              btn.attrPrompt,
            )}
            title={btn.label}
            aria-label={btn.label}
            data-testid={
              `bbcode-${btn.tag}`
            }
            sx={{ minWidth: 36, px: 1 }}
          >
            {btn.icon}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  )
}
