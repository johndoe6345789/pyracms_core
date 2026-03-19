import { IconButton, Tooltip } from '@mui/material'
import {
  EditOutlined, DeleteOutlined,
  CheckOutlined, CloseOutlined,
} from '@mui/icons-material'

interface EditActionsProps {
  onSave: () => void
  onCancel: () => void
}

export function EditActions({
  onSave,
  onCancel,
}: EditActionsProps) {
  return (
    <>
      <Tooltip title="Save">
        <IconButton
          size="small"
          color="success"
          onClick={onSave}
          aria-label="Save edit"
          data-testid="save-edit-btn"
        >
          <CheckOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel">
        <IconButton
          size="small"
          onClick={onCancel}
          aria-label="Cancel edit"
          data-testid="cancel-edit-btn"
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}

interface ViewActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export function ViewActions({
  onEdit,
  onDelete,
}: ViewActionsProps) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          color="primary"
          onClick={onEdit}
          aria-label="Edit row"
          data-testid="edit-row-btn"
        >
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          aria-label="Delete row"
          data-testid="delete-row-btn"
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
