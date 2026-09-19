import { Typography, Box } from '@mui/material'
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import type { GameDepItem } from '@/hooks/useGameDepList'

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography variant="caption">{value}</Typography>
    </Box>
  )
}

/** Likes, dislikes and views row of a game/dependency card. */
export default function GameDepStats({ item }: { item: GameDepItem }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <Stat icon={<ThumbUpOutlined fontSize="small" />} value={item.likes} />
      <Stat
        icon={<ThumbDownOutlined fontSize="small" />}
        value={item.dislikes}
      />
      <Stat icon={<VisibilityOutlined fontSize="small" />} value={item.views} />
    </Box>
  )
}
