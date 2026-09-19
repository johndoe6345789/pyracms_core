import { Box, Typography } from '@mui/material'
import { AdminPanelSettingsOutlined } from '@mui/icons-material'

export default function AdminDrawerHeader() {
  return (
    <Box
      sx={{
        px: 2, pb: 2, display: 'flex',
        alignItems: 'center', gap: 1,
      }}
    >
      <AdminPanelSettingsOutlined
        sx={{ color: 'primary.main' }}
        aria-hidden="true"
      />
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Admin
      </Typography>
    </Box>
  )
}
