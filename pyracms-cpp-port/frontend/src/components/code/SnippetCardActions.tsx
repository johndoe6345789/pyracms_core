'use client'

import { CardActions, Button, IconButton, Tooltip } from '@mui/material'
import {
  ForkRightOutlined, ShareOutlined, VisibilityOutlined,
} from '@mui/icons-material'
import Link from 'next/link'

interface Props {
  id: string
  title: string
  href: string
  onFork?: (() => void) | undefined
  onShare: () => void
}

export function SnippetCardActions(
  { id, title, href, onFork, onShare }: Props,
) {
  return (
    <CardActions sx={{
      px: 2, py: 1, borderTop: 1, borderColor: 'divider',
    }}>
      <Button size="small" component={Link} href={href}
        startIcon={<VisibilityOutlined />}
        data-testid={`view-snippet-${id}`}
        aria-label={`View ${title}`}>
        View
      </Button>
      {onFork && (
        <Tooltip title="Fork snippet">
          <IconButton size="small" onClick={onFork}
            data-testid={`fork-snippet-${id}`}
            aria-label={`Fork ${title}`}>
            <ForkRightOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Share">
        <IconButton size="small" onClick={onShare}
          data-testid={`share-snippet-${id}`}
          aria-label={`Share ${title}`}>
          <ShareOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </CardActions>
  )
}
