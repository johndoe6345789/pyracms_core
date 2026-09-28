import { Button } from '@mui/material'
import { DeleteOutline, EditOutlined } from '@mui/icons-material'

/** Edit and Delete for the uploader (or a site admin). */
export default function VideoOwnerActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <>
      <Button
        size="small"
        startIcon={<EditOutlined />}
        onClick={onEdit}
        data-testid="video-edit-btn"
      >
        Edit
      </Button>
      <Button
        size="small"
        color="error"
        startIcon={<DeleteOutline />}
        onClick={onDelete}
        data-testid="video-delete-btn"
      >
        Delete
      </Button>
    </>
  )
}
