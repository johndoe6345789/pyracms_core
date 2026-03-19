import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { DownloadOutlined, SettingsOutlined, MenuBookOutlined } from '@mui/icons-material'

interface ExportButtonsProps {
  onExportSettings: () => void
  onExportMenus: () => void
}

export default function ExportButtons({ onExportSettings, onExportMenus }: ExportButtonsProps) {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>Export</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', py: 4,
            }}>
              <SettingsOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>Export Settings</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Download all site settings as a JSON file.
              </Typography>
              <Button variant="contained" startIcon={<DownloadOutlined />} onClick={onExportSettings}>
                Export Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', py: 4,
            }}>
              <MenuBookOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>Export Menus</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Download all menu configurations as a JSON file.
              </Typography>
              <Button variant="contained" startIcon={<DownloadOutlined />} onClick={onExportMenus}>
                Export Menus
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
