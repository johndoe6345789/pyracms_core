export const drawerPaperSx = {
  width: { xs: '86vw', sm: 320 },
  maxWidth: 360,
  borderTopRightRadius: 24,
  borderBottomRightRadius: 24,
  backgroundImage: 'none',
  display: 'flex',
  flexDirection: 'column',
} as const

export const drawerItemSx = {
  borderRadius: '12px',
  position: 'relative',
  '&.Mui-selected': {
    bgcolor: 'action.selected',
    color: 'primary.main',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderRadius: 3,
      bgcolor: 'primary.main',
    },
  },
} as const
