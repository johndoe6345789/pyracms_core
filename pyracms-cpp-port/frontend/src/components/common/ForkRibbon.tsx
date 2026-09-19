import { Box } from '@mui/material'
import { GitHub } from '@mui/icons-material'
import { repoUrl } from '@/lib/repo'
import ForkInline, { LABEL, printOff } from './ForkInline'

interface Props {
  /** 'corner' is a small top-right triangle; 'inline' is a plain link */
  variant?: 'corner' | 'inline'
  repo?: string
  size?: number
}

/** "Fork me on GitHub": pure CSS/SVG, theme-aware, hidden in print. */
export default function ForkRibbon({
  variant = 'corner',
  repo,
  size = 64,
}: Props) {
  const href = repoUrl(repo)
  if (variant === 'inline') return <ForkInline href={href} />
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABEL}
      title={LABEL}
      data-testid="fork-ribbon"
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: size,
        height: size,
        zIndex: 2,
        color: 'background.paper',
        ...printOff,
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.main',
        },
        '&:hover .tri': { opacity: 0.85 },
      }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <polygon
          className="tri"
          points="0,0 64,0 64,64"
          fill="#24292f"
          stroke="#fff"
          strokeOpacity="0.5"
        />
      </svg>
      <GitHub
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: size * 0.12,
          right: size * 0.12,
          fontSize: size * 0.34,
          color: '#fff',
        }}
      />
    </Box>
  )
}
