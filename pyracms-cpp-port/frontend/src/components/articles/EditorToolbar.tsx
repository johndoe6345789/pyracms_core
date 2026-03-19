'use client'

import { Box, IconButton, Tooltip } from '@mui/material'

export interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix: string
}

interface EditorToolbarProps {
  actions: ToolbarAction[]
  onAction: (
    prefix: string,
    suffix: string,
  ) => void
  children?: React.ReactNode
}

export function EditorToolbar({
  actions,
  onAction,
  children,
}: EditorToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 0.5,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
      }}
      role="toolbar"
      aria-label="Editor formatting toolbar"
    >
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          flexWrap: 'wrap',
        }}
      >
        {actions.map((action) => (
          <Tooltip
            key={action.label}
            title={action.label}
          >
            <IconButton
              size="small"
              onClick={() => onAction(
                action.prefix,
                action.suffix,
              )}
              aria-label={action.label}
              data-testid={
                `toolbar-${action.label.toLowerCase()
                  .replace(/\s+/g, '-')}`
              }
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
      {children}
    </Box>
  )
}
