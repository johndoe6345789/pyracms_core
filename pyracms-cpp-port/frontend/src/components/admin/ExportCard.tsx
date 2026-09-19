import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'

interface Props {
  icon: React.ReactNode
  title: string
  text: string
  onClick: () => void
}

export default function ExportCard({ icon, title, text, onClick }: Props) {
  return (
    <Grid item xs={12} sm={6}>
      <Card variant="outlined" sx={{ borderColor: 'divider', height: '100%' }}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}
        >
          {icon}
          <Typography variant="h5" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {text}
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={onClick}
          >
            {title}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  )
}
