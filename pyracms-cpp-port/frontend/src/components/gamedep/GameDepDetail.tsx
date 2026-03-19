import {
  Box, Typography, Button,
  Divider, Tabs, Tab,
} from '@mui/material'
import Link from 'next/link'
import {
  EditOutlined, VisibilityOutlined,
} from '@mui/icons-material'
import VoteButtons from
  '@/components/common/VoteButtons'
import TagChips from
  '@/components/common/TagChips'
import type { GameDepDetailData } from
  '@/hooks/useGameDepDetail'

interface GameDepDetailProps {
  detail: GameDepDetailData
  editHref: string; tabIndex: number
  onTabChange: (index: number) => void
  children: React.ReactNode
}

export default function GameDepDetail({
  detail, editHref, tabIndex,
  onTabChange, children,
}: GameDepDetailProps) {
  return (
    <Box data-testid="gamedep-detail">
      <Box sx={{
        display: 'flex', mb: 2,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <Typography variant="h3" component="h1">
          {detail.displayName}
        </Typography>
        <Button variant="outlined"
          startIcon={<EditOutlined />}
          component={Link} href={editHref}
          data-testid="edit-button">
          Edit
        </Button>
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center',
        gap: 3, mb: 2, color: 'text.secondary',
      }}>
        <Typography variant="body2">
          By {detail.owner}
        </Typography>
        <Typography variant="body2">
          Created {new Date(detail.created)
            .toLocaleDateString()}
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center', gap: 0.5,
        }}>
          <VisibilityOutlined fontSize="small" />
          <Typography variant="body2">
            {detail.views.toLocaleString()} views
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1"
        color="text.secondary" sx={{ mb: 3 }}>
        {detail.description}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <VoteButtons likes={detail.likes}
          dislikes={detail.dislikes} />
      </Box>
      <Box sx={{ mb: 4 }}>
        <TagChips tags={detail.tags} />
      </Box>
      <Divider />
      <Box sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <Tabs value={tabIndex}
          onChange={(_, v) => onTabChange(v)}
          variant="scrollable"
          scrollButtons="auto"
          data-testid="detail-tabs">
          <Tab label="Revisions"
            data-testid="tab-revisions" />
          <Tab label="Binaries"
            data-testid="tab-binaries" />
          <Tab label="Dependencies"
            data-testid="tab-dependencies" />
          <Tab label="Screenshots"
            data-testid="tab-screenshots" />
        </Tabs>
      </Box>
      {children}
    </Box>
  )
}
