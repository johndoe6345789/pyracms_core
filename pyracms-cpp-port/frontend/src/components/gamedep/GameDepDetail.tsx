import { Box, Typography, Button, Divider } from '@mui/material'
import Link from 'next/link'
import { EditOutlined } from '@mui/icons-material'
import VoteButtons from '@/components/common/VoteButtons'
import TagChips from '@/components/common/TagChips'
import GameDepTabs from './GameDepTabs'
import GameDepMeta from './GameDepMeta'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

interface GameDepDetailProps {
  detail: GameDepDetailData
  editHref: string
  tabIndex: number
  onTabChange: (index: number) => void
  children: React.ReactNode
}

export default function GameDepDetail({
  detail,
  editHref,
  tabIndex,
  onTabChange,
  children,
}: GameDepDetailProps) {
  return (
    <Box data-testid="gamedep-detail">
      <Box
        sx={{
          display: 'flex',
          mb: 2,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="h3" component="h1">
          {detail.displayName}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditOutlined />}
          component={Link}
          href={editHref}
          data-testid="edit-button"
        >
          Edit
        </Button>
      </Box>
      <GameDepMeta detail={detail} />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {detail.description}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <VoteButtons likes={detail.likes} dislikes={detail.dislikes} />
      </Box>
      <Box sx={{ mb: 4 }}>
        <TagChips tags={detail.tags} />
      </Box>
      <Divider />
      <GameDepTabs tabIndex={tabIndex} onTabChange={onTabChange} />
      {children}
    </Box>
  )
}
