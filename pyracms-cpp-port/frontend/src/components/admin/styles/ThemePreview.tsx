import {
  Typography, Button, Paper, Divider, Card, CardContent,
} from '@mui/material'
import type { ThemeConfig } from './themeConfig'
import ThemePreviewSecondary from './ThemePreviewSecondary'

export default function ThemePreview({
  theme,
}: {
  theme: ThemeConfig
}) {
  const r = `${theme.borderRadius}px`
  const f = theme.fontFamily
  const card = {
    borderRadius: r,
    bgcolor: theme.backgroundColor,
    border: 1,
    borderColor: 'divider',
  }
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderColor: 'divider',
        bgcolor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: f,
        minHeight: 500,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: 'text.secondary', mb: 2 }}
      >
        Live Preview
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Card sx={{ ...card, mb: theme.spacing / 4 }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{ color: theme.primaryColor, fontFamily: f, mb: 1 }}
          >
            Sample Article Title
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontFamily: f, color: theme.textColor, lineHeight: 1.8 }}
          >
            This is a preview of how your content will look with
            the selected theme settings.
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2, bgcolor: theme.primaryColor, borderRadius: r }}
          >
            Read More
          </Button>
        </CardContent>
      </Card>
      <ThemePreviewSecondary theme={theme} card={card} />
    </Paper>
  )
}
