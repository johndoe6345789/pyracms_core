import { Box, TextField, Button, Typography } from '@mui/material'
import TagChips from '@/components/common/TagChips'

interface TagInputProps {
  tags: string[]
  tagInput: string
  onTagInputChange: (v: string) => void
  onAddTag: () => void
  onDeleteTag: (tag: string) => void
}

export default function TagInput({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onDeleteTag,
}: TagInputProps) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Tags
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TagChips tags={tags} onDelete={onDeleteTag} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Add tag..."
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button variant="outlined" onClick={onAddTag}>
          Add
        </Button>
      </Box>
    </Box>
  )
}
