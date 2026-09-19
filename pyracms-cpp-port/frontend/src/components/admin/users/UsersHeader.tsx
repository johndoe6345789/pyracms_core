import { Box, Button, Typography } from '@mui/material'
import { PersonAddOutlined } from '@mui/icons-material'

export default function UsersHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all registered users.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<PersonAddOutlined />}
        onClick={onCreate}
        data-testid="create-user-btn"
      >
        Create User
      </Button>
    </Box>
  )
}
