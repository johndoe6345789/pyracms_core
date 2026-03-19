'use client'

import { Box, Paper } from '@mui/material'
import {
  DragIndicatorOutlined,
  SubdirectoryArrowRightOutlined,
} from '@mui/icons-material'
import DraggableMenuEditFields
  from './DraggableMenuEditFields'
import DraggableMenuItemView
  from './DraggableMenuItemView'

interface Props {
  depth: number
  isOver: boolean
  dragRef: (n: HTMLElement | null) => void
  editing: boolean
  editLabel: string
  editUrl: string
  onLabelChange: (v: string) => void
  onUrlChange: (v: string) => void
  onSave: () => void
  onCancelEdit: () => void
  label: string
  url: string
  hasKids: boolean
  expanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function DraggableMenuItemPaper({
  depth, isOver, dragRef, editing,
  editLabel, editUrl, onLabelChange,
  onUrlChange, onSave, onCancelEdit,
  label, url, hasKids, expanded,
  onToggleExpand, onEdit, onDelete,
}: Props) {
  return (
    <Paper variant="outlined" sx={{
      display: 'flex', alignItems: 'center',
      gap: 1, px: 2, py: 1, mb: 0.5,
      borderColor: isOver
        ? 'primary.main' : 'divider',
      bgcolor: isOver
        ? 'primary.main' + '08'
        : 'background.paper',
    }}>
      <Box
        ref={dragRef}
        sx={{ cursor: 'grab', display: 'flex' }}
      >
        <DragIndicatorOutlined
          sx={{ color: 'text.secondary' }}
        />
      </Box>
      {depth > 0 && (
        <SubdirectoryArrowRightOutlined sx={{
          fontSize: 16,
          color: 'text.secondary',
        }} />
      )}
      {editing ? (
        <DraggableMenuEditFields
          editLabel={editLabel}
          editUrl={editUrl}
          onLabelChange={onLabelChange}
          onUrlChange={onUrlChange}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
        <DraggableMenuItemView
          label={label} url={url}
          hasChildren={hasKids}
          expanded={expanded}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </Paper>
  )
}
