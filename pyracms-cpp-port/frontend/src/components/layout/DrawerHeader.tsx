import { Box, Typography, IconButton } from '@mui/material'
import { CloseOutlined, LanguageOutlined } from '@mui/icons-material'

interface Props {
  title: string
  subtitle?: string | undefined
  onClose: () => void
}

/** Gradient masthead of the navigation drawer. */
export default function DrawerHeader({ title, subtitle, onClose }: Props) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        px: 2.5,
        pt: 3,
        pb: 2.5,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close navigation menu"
        sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
      >
        <CloseOutlined />
      </IconButton>
      <LanguageOutlined sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, pr: 4 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}
