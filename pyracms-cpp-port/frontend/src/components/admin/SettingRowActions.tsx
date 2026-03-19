import { IconButton, Tooltip } from '@mui/material'
import {
  EditOutlined, CheckOutlined,
  CloseOutlined, DeleteOutlined,
} from '@mui/icons-material'

interface EditActionsProps {
  onSave: () => void
  onCancel: () => void
}

export function SettingEditActions({
  onSave, onCancel,
}: EditActionsProps) {
  return (
    <>
      <Tooltip title="Save">
        <IconButton
          size="small"
          color="success"
          onClick={onSave}
          aria-label="Save setting"
          data-testid="save-setting-btn"
        >
          <CheckOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel">
        <IconButton
          size="small"
          color="default"
          onClick={onCancel}
          aria-label="Cancel edit"
          data-testid="cancel-setting-btn"
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

export function SettingViewActions({
  onEdit, onDelete,
}: ViewActionsProps) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          color="primary"
          onClick={onEdit}
          aria-label="Edit setting"
          data-testid="edit-setting-btn"
        >
          <EditOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          aria-label="Delete setting"
          data-testid="delete-setting-btn"
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
