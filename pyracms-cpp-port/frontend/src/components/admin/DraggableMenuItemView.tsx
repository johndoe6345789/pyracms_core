import {
  Box, Typography, IconButton,
} from '@mui/material'
import {
  DeleteOutlined,
  EditOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from '@mui/icons-material'

interface DraggableMenuItemViewProps {
  label: string
  url: string
  hasChildren: boolean
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function DraggableMenuItemView({
  label, url, hasChildren, expanded,
  onToggleExpand, onEdit, onDelete,
}: DraggableMenuItemViewProps) {
  return (
    <>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {url}
        </Typography>
      </Box>
      {hasChildren && (
        <IconButton
          size="small"
          onClick={onToggleExpand}
          aria-label={
            expanded ? 'Collapse' : 'Expand'
          }
          data-testid="toggle-expand-btn"
        >
          {expanded
            ? (
              <ExpandLessOutlined
                fontSize="small"
              />
            )
            : (
              <ExpandMoreOutlined
                fontSize="small"
              />
            )}
        </IconButton>
      )}
      <IconButton
        size="small"
        onClick={onEdit}
        aria-label="Edit menu item"
        data-testid="edit-menu-item-btn"
      >
        <EditOutlined fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={onDelete}
        aria-label="Delete menu item"
        data-testid="delete-menu-item-btn"
      >
        <DeleteOutlined fontSize="small" />
      </IconButton>
    </>
  )
}
