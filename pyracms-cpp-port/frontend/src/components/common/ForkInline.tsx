import { Link as MuiLink } from '@mui/material'
import { GitHub } from '@mui/icons-material'

export const LABEL = 'Fork me on GitHub'
export const printOff = { '@media print': { display: 'none' } }

/** Plain "Fork me on GitHub" text link (footer variant). */
export default function ForkInline({ href }: { href: string }) {
  return (
    <MuiLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL}
      data-testid="fork-inline"
      color="inherit"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        ...printOff,
      }}
    >
      <GitHub fontSize="small" aria-hidden="true" /> {LABEL}
    </MuiLink>
  )
}
