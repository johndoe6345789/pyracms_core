import { Box, Typography } from '@mui/material'
import type { MenuTarget } from '@/lib/menuTargets'

/** One suggestion: its title on the left, where it goes on the right. */
export default function TargetOption({ option }: { option: MenuTarget }) {
  return (
    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
      <span>{option.label}</span>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: 'auto', alignSelf: 'center' }}
      >
        {option.hint ?? option.value}
      </Typography>
    </Box>
  )
}
