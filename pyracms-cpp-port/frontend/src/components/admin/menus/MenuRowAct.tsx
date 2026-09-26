import type { ReactNode } from 'react'
import { IconButton, Tooltip } from '@mui/material'

export interface ActProps {
  label: string
  id: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

export default function Act(p: ActProps) {
  return (
    <Tooltip title={p.label}>
      <span>
        <IconButton
          size="small"
          aria-label={p.label}
          disabled={p.disabled ?? false}
          onClick={p.onClick}
          data-testid={p.id}
        >
          {p.children}
        </IconButton>
      </span>
    </Tooltip>
  )
}
