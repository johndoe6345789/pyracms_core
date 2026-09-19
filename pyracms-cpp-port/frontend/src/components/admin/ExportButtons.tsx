import { Grid, Typography } from '@mui/material'
import { SettingsOutlined, MenuBookOutlined } from '@mui/icons-material'
import ExportCard from './ExportCard'

interface ExportButtonsProps {
  onExportSettings: () => void
  onExportMenus: () => void
}

const ICON_SX = { fontSize: 48, color: 'primary.main', mb: 2 }

export default function ExportButtons({
  onExportSettings,
  onExportMenus,
}: ExportButtonsProps) {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Export
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <ExportCard
          icon={<SettingsOutlined sx={ICON_SX} />}
          title="Export Settings"
          text="Download all site settings as a JSON file."
          onClick={onExportSettings}
        />
        <ExportCard
          icon={<MenuBookOutlined sx={ICON_SX} />}
          title="Export Menus"
          text="Download all menu configurations as a JSON file."
          onClick={onExportMenus}
        />
      </Grid>
    </>
  )
}
