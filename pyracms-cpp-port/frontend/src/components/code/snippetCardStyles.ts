export const cardSx = {
  borderColor: 'divider',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: 'primary.main',
    boxShadow: 3,
    transform: 'translateY(-4px)',
  },
}

export const actionSx = {
  flexGrow: 1,
  alignItems: 'stretch',
  justifyContent: 'flex-start',
}
