const clamp = (n: number) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: n,
  WebkitBoxOrient: 'vertical',
})

export const cardSx = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderColor: 'divider',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: 'primary.main',
    boxShadow: 3,
    transform: 'translateY(-4px)',
  },
}

export const actionSx = {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'flex-start',
}

export const titleSx = clamp(2)
export const excerptSx = { mb: 2, ...clamp(3) }
