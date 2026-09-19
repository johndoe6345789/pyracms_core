import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import { GitHub, Twitter } from '@mui/icons-material'
import { safeHref } from '@/lib/safeUrl'

interface ProfileActionsProps {
  githubUrl?: string
  twitterUrl?: string
}

export function ProfileActions({
  githubUrl,
  twitterUrl,
}: ProfileActionsProps) {
  if (!githubUrl && !twitterUrl) return null

  return (
    <Box
      sx={{ display: 'flex', gap: 0.5, mb: 2 }}
      data-testid="profile-actions"
    >
      {githubUrl && (
        <Tooltip title="GitHub">
          <IconButton
            size="small"
            component="a"
            href={safeHref(githubUrl)}
            target="_blank"
            rel="noopener noreferrer ugc"
            aria-label="GitHub profile"
            data-testid="github-link"
          >
            <GitHub fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {twitterUrl && (
        <Tooltip title="Twitter/X">
          <IconButton
            size="small"
            component="a"
            href={safeHref(twitterUrl)}
            target="_blank"
            rel="noopener noreferrer ugc"
            aria-label="Twitter profile"
            data-testid="twitter-link"
          >
            <Twitter fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}
