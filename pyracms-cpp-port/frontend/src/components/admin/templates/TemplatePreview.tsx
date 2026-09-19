import { Typography, Box, Paper, Divider } from '@mui/material'
import { sanitizeHtml } from '@/lib/sanitize'

export default function TemplatePreview({
  section,
  html,
}: {
  section: string
  html: string
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: '100%',
        overflow: 'auto',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
      >
        Live Preview - {section}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box
        data-testid="template-preview-body"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(html),
        }}
        sx={{
          fontFamily: 'sans-serif',
          '& a': { color: 'primary.main' },
          '& ul': { pl: 2 },
          '& h3': { mt: 2, mb: 1 },
        }}
      />
    </Paper>
  )
}
