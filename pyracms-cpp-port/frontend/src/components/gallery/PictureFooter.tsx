import { Box } from '@mui/material'
import VoteButtons from '@/components/common/VoteButtons'
import PictureActions from './PictureActions'

interface PictureFooterProps {
  likes: number
  dislikes: number
  onLike: () => void
  onDislike: () => void
  onSetCover: () => void
  onDelete: () => void
}

export default function PictureFooter({
  likes, dislikes, onLike, onDislike, onSetCover, onDelete,
}: PictureFooterProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <VoteButtons
        likes={likes}
        dislikes={dislikes}
        onLike={onLike}
        onDislike={onDislike}
      />
      <PictureActions onSetCover={onSetCover} onDelete={onDelete} />
    </Box>
  )
}
