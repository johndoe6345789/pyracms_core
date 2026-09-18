'use client'

import { Paper } from '@mui/material'
import DragHandle from './DragHandle'
import DraggableMenuEditFields from './DraggableMenuEditFields'
import DraggableMenuItemView from './DraggableMenuItemView'

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

export default function DraggableMenuItemPaper(p: Props) {
  return (
    <Paper variant="outlined" sx={{
      display: 'flex', alignItems: 'center',
      gap: 1, px: 2, py: 1, mb: 0.5,
      borderColor: p.isOver ? 'primary.main' : 'divider',
      bgcolor: p.isOver
        ? 'primary.main' + '08'
        : 'background.paper',
    }}>
      <DragHandle dragRef={p.dragRef} nested={p.depth > 0} />
      {p.editing ? (
        <DraggableMenuEditFields
          editLabel={p.editLabel}
          editUrl={p.editUrl}
          onLabelChange={p.onLabelChange}
          onUrlChange={p.onUrlChange}
          onSave={p.onSave}
          onCancel={p.onCancelEdit}
        />
      ) : (
        <DraggableMenuItemView
          label={p.label} url={p.url}
          hasChildren={p.hasKids}
          expanded={p.expanded}
          onToggleExpand={p.onToggleExpand}
          onEdit={p.onEdit}
          onDelete={p.onDelete}
        />
      )}
    </Paper>
  )
}
