import { IconButton, Tooltip } from '@mui/material'
import type { ReactNode } from 'react'

interface Props {
  title: string
  /** Why the backend would refuse this; disables the button. */
  reason?: string | null | undefined
  label: string
  testId: string
  color: 'primary' | 'success' | 'warning' | 'error'
  onClick: () => void
  children: ReactNode
}

/** Icon button that explains, in a tooltip, why it is disabled. */
export default function GuardedIconButton(p: Props) {
  return (
    <Tooltip title={p.reason ?? p.title}>
      <span>
        <IconButton
          size="small"
          color={p.color}
          disabled={!!p.reason}
          onClick={p.onClick}
          aria-label={p.label}
          data-testid={p.testId}
        >
          {p.children}
        </IconButton>
      </span>
    </Tooltip>
  )
}
