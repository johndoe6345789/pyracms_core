export const barSx = {
  bgcolor: 'background.paper',
  borderBottom: '1px solid',
  borderColor: 'divider',
  backgroundImage: 'none',
} as const

/** The globe beside the brand; dropped on phones to make room. */
export const logoSx = {
  color: 'primary.main',
  mr: 1,
  fontSize: 22,
  display: { xs: 'none', sm: 'block' },
} as const

export const brandSx = {
  color: 'text.primary',
  textDecoration: 'none',
  fontWeight: 800,
  flexGrow: { xs: 1, lg: 0 },
  mr: { lg: 3 },
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: { xs: '1.05rem', sm: '1.25rem' },
  whiteSpace: 'nowrap',
} as const
