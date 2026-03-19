import { Paper, Typography, Box, TextField } from '@mui/material'
import TagInput from './TagInput'

interface BasicInfoFormProps {
  nameSlug: string
  displayName: string
  onDisplayNameChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  tags: string[]
  tagInput: string
  onTagInputChange: (v: string) => void
  onAddTag: () => void
  onDeleteTag: (tag: string) => void
}

export default function BasicInfoForm({
  nameSlug,
  displayName,
  onDisplayNameChange,
  description,
  onDescriptionChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onDeleteTag,
}: BasicInfoFormProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Typography variant="h5" gutterBottom>Basic Info</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField label="Name (slug)" value={nameSlug} disabled fullWidth size="small" />
        <TextField label="Display Name" value={displayName} onChange={(e) => onDisplayNameChange(e.target.value)} fullWidth size="small" />
        <TextField label="Description" value={description} onChange={(e) => onDescriptionChange(e.target.value)} fullWidth multiline rows={4} size="small" />
        <TagInput
          tags={tags}
          tagInput={tagInput}
          onTagInputChange={onTagInputChange}
          onAddTag={onAddTag}
          onDeleteTag={onDeleteTag}
        />
      </Box>
    </Paper>
  )
}
