'use client'

import { CardActions, IconButton, Tooltip } from '@mui/material'
import { ForkRightOutlined, ShareOutlined } from '@mui/icons-material'

interface Props {
  id: string
  title: string
  onFork?: (() => void) | undefined
  onShare: () => void
}

// Fork/Share live outside SnippetCard's CardActionArea (a button can't
// nest inside the link that covers the rest of the card), so this is a
// separate footer, not a bar of separate buttons for reaching the snippet
// itself -- the whole card above already does that.
export function SnippetCardActions({ id, title, onFork, onShare }: Props) {
  return (
    <CardActions
      sx={{
        px: 2,
        py: 1,
        borderTop: 1,
        borderColor: 'divider',
        justifyContent: 'flex-end',
      }}
    >
      {onFork && (
        <Tooltip title="Fork snippet">
          <IconButton
            size="small"
            onClick={onFork}
            data-testid={`fork-snippet-${id}`}
            aria-label={`Fork ${title}`}
          >
            <ForkRightOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Share">
        <IconButton
          size="small"
          onClick={onShare}
          data-testid={`share-snippet-${id}`}
          aria-label={`Share ${title}`}
        >
          <ShareOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </CardActions>
  )
}
