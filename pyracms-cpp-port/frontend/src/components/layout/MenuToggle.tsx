'use client'

import { ButtonBase, Box } from '@mui/material'

interface Props {
  open: boolean
  onClick: () => void
}

const bar = {
  position: 'absolute' as const,
  left: 11,
  width: 18,
  height: 2,
  borderRadius: 2,
  bgcolor: 'currentColor',
  transition: 'transform .25s ease, opacity .2s ease, top .25s ease',
}

/**
 * Burger button whose three bars morph into a cross while the drawer is
 * open. Shared by every top bar so the menu looks the same everywhere.
 */
export default function MenuToggle({ open, onClick }: Props) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={open}
      data-testid="menu-toggle"
      sx={{
        position: 'relative',
        width: 40,
        height: 40,
        mr: 1.5,
        borderRadius: '12px',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'background-color .2s, border-color .2s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
        },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        component="span"
        sx={{
          ...bar,
          top: open ? 19 : 13,
          transform: open ? 'rotate(45deg)' : 'none',
        }}
      />
      <Box
        component="span"
        sx={{
          ...bar,
          top: 19,
          opacity: open ? 0 : 1,
        }}
      />
      <Box
        component="span"
        sx={{
          ...bar,
          top: open ? 19 : 25,
          transform: open ? 'rotate(-45deg)' : 'none',
        }}
      />
    </ButtonBase>
  )
}
