import { Box, Button, Chip, Typography } from '@mui/material'
import { SaveOutlined, UndoOutlined } from '@mui/icons-material'

interface Props {
  unsaved: boolean
  saved: boolean
  onSave: () => void
  onUndo: () => void
}

/** Title, the state of your changes, and the two buttons that matter. */
export default function StyleHeader(p: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" component="h1">
          Style Editor
        </Typography>
        <Typography color="text.secondary">
          Pick a preset or make your own. Light and dark modes are styled
          separately.
        </Typography>
      </Box>
      {p.unsaved && (
        <Chip
          color="warning"
          label="Unsaved changes"
          data-testid="unsaved-chip"
        />
      )}
      {p.saved && !p.unsaved && (
        <Chip color="success" label="Saved" data-testid="saved-chip" />
      )}
      <Button
        startIcon={<UndoOutlined />}
        disabled={!p.unsaved}
        onClick={p.onUndo}
        data-testid="undo-btn"
      >
        Undo changes
      </Button>
      <Button
        variant="contained"
        startIcon={<SaveOutlined />}
        disabled={!p.unsaved}
        onClick={p.onSave}
        data-testid="save-style-btn"
      >
        Save style
      </Button>
    </Box>
  )
}
