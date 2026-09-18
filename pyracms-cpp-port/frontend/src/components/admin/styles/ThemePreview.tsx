import {
  Typography, Box, Button, Paper, Divider, Card, CardContent,
} from '@mui/material'
import type { ThemeConfig } from './themeConfig'

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
      <Card sx={card}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ color: theme.secondaryColor, fontFamily: f, mb: 1 }}
          >
            Secondary Element
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: f, color: theme.textColor }}
          >
            This element uses the secondary color for its heading.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
                borderRadius: r,
              }}
            >
              Action
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: theme.secondaryColor,
                color: theme.secondaryColor,
                borderRadius: r,
              }}
            >
              Secondary
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  )
}
