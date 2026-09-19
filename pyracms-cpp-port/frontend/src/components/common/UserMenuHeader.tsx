import { Box, Typography, Chip } from '@mui/material'
import type { User } from '@/types'

/** Name, e-mail and account-scope chip at the top of the user menu. */
export default function UserMenuHeader({ user }: { user: User | null }) {
  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {user?.username}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {user?.email}
      </Typography>
      <Chip
        size="small"
        sx={{ mt: 0.75 }}
        label={
          user?.tenantSlug
            ? `Site account · ${user.tenantSlug}`
            : 'Platform account'
        }
      />
    </Box>
  )
}
