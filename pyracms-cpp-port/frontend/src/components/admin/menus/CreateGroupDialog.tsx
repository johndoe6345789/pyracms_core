import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
} from '@mui/material'
import type { useMenuEditor } from '@/hooks/useMenuEditor'

type Editor = ReturnType<typeof useMenuEditor>

export default function CreateGroupDialog({
  editor,
}: {
  editor: Editor
}) {
  return (
    <Dialog
      open={editor.groupDialogOpen}
      onClose={editor.handleCloseGroupDialog}
      data-testid="create-group-dialog"
      aria-labelledby="create-group-title"
    >
      <DialogTitle id="create-group-title">
        Create Menu Group
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Group Name"
          fullWidth
          value={editor.newGroupName}
          onChange={(e) =>
            editor.setNewGroupName(e.target.value)
          }
          sx={{ mt: 1 }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              editor.handleCreateGroup()
            }
          }}
          data-testid="group-name-input"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={editor.handleCloseGroupDialog}
          data-testid="cancel-group-btn"
        >
          Cancel
        </Button>
        <Button
          onClick={editor.handleCreateGroup}
          variant="contained"
          disabled={!editor.newGroupName.trim()}
          data-testid="submit-group-btn"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
