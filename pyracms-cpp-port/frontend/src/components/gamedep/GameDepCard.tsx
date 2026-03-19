import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material'
import Link from 'next/link'
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import TagChips from '@/components/common/TagChips'
import type { GameDepItem } from '@/hooks/useGameDepList'

interface GameDepCardProps {
  item: GameDepItem
  href: string
  hoverColor?: string
}

export default function GameDepCard({
  item,
  href,
  hoverColor = 'primary.main',
}: GameDepCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: hoverColor,
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {item.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {item.description}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TagChips tags={item.tags} />
          </Box>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}
          >
            <StatIcon icon={<ThumbUpOutlined fontSize="small" />} value={item.likes} />
            <StatIcon icon={<ThumbDownOutlined fontSize="small" />} value={item.dislikes} />
            <StatIcon icon={<VisibilityOutlined fontSize="small" />} value={item.views} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function StatIcon({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography variant="caption">{value}</Typography>
    </Box>
  )
}
