import { Box, TextField, Button } from '@mui/material'

interface EditFieldsProps {
  editLabel: string
  editUrl: string
  onLabelChange: (v: string) => void
  onUrlChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

export default function DraggableMenuEditFields({
  editLabel, editUrl,
  onLabelChange, onUrlChange,
  onSave, onCancel,
}: EditFieldsProps) {
  return (
    <Box sx={{
      display: 'flex',
      gap: 1, flex: 1, alignItems: 'center',
    }}>
      <TextField
        size="small"
        value={editLabel}
        onChange={(e) =>
          onLabelChange(e.target.value)}
        label="Label"
        sx={{ flex: 1 }}
        data-testid="edit-label-input"
      />
      <TextField
        size="small"
        value={editUrl}
        onChange={(e) =>
          onUrlChange(e.target.value)}
        label="URL"
        sx={{ flex: 1 }}
        data-testid="edit-url-input"
      />
      <Button
        size="small"
        variant="contained"
        onClick={onSave}
        data-testid="save-edit-btn"
      >
        Save
      </Button>
      <Button
        size="small"
        onClick={onCancel}
        data-testid="cancel-edit-btn"
      >
        Cancel
      </Button>
    </Box>
  )
}
