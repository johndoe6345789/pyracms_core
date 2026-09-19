import { Box, Chip, Typography } from '@mui/material'
import { langColor, type Snippet } from '@/lib/snippets'

export function SnippetHeader({ s }: { s: Snippet }) {
  const color = langColor(s.language)
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h3" component="h1">
        {s.title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          label={s.language}
          size="small"
          sx={{
            bgcolor: color + '20',
            color,
            fontWeight: 600,
          }}
        />
        <Typography variant="body2" color="text.secondary">
          by {s.author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {s.date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {s.runCount} runs
        </Typography>
        {s.forkedFrom > 0 && (
          <Chip label="Fork" size="small" variant="outlined" />
        )}
      </Box>
    </Box>
  )
}
