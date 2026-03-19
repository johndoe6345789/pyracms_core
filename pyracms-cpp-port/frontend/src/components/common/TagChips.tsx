import { Box, Chip } from '@mui/material'

interface TagChipsProps {
  tags: string[]
  onDelete?: (tag: string) => void
}

export default function TagChips({ tags, onDelete }: TagChipsProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          variant="outlined"
          size="small"
          onDelete={onDelete ? () => onDelete(tag) : undefined}
        />
      ))}
    </Box>
  )
}
