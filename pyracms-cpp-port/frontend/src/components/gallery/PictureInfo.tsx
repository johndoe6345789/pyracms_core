import { Typography, Box } from '@mui/material'
import TagChips from '@/components/common/TagChips'

interface PictureInfoProps {
  title: string
  description: string
  tags: string[]
}

export default function PictureInfo({
  title,
  description,
  tags,
}: PictureInfoProps) {
  return (
    <>
      <Typography variant="h3" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TagChips tags={tags} />
      </Box>
    </>
  )
}
