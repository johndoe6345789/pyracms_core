import type { ReactNode } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import {
  AddOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@mui/icons-material'

interface ActProps {
  label: string
  id: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function Act(p: ActProps) {
  return (
    <Tooltip title={p.label}>
      <span>
        <IconButton
          size="small"
          aria-label={p.label}
          disabled={p.disabled ?? false}
          onClick={p.onClick}
          data-testid={p.id}
        >
          {p.children}
        </IconButton>
      </span>
    </Tooltip>
  )
}

interface Props {
  id: number
  name: string
  first: boolean
  last: boolean
  disabled: boolean
  onMove: (by: -1 | 1) => void
  onEdit: () => void
  onDelete: () => void
  onAddInside?: () => void
}

/** Add-inside (folders), move up/down, edit and delete for one entry. */
export default function MenuRowActions(p: Props) {
  return (
    <Box sx={{ display: 'flex' }}>
      {p.onAddInside && (
        <Act
          label={`Add a link to ${p.name}`}
          id={`add-in-${p.id}`}
          onClick={p.onAddInside}
        >
          <AddOutlined fontSize="small" />
        </Act>
      )}
      <Act
        label="Move up"
        id={`up-${p.id}`}
        disabled={p.first || p.disabled}
        onClick={() => p.onMove(-1)}
      >
        <ArrowUpwardOutlined fontSize="small" />
      </Act>
      <Act
        label="Move down"
        id={`down-${p.id}`}
        disabled={p.last || p.disabled}
        onClick={() => p.onMove(1)}
      >
        <ArrowDownwardOutlined fontSize="small" />
      </Act>
      <Act label={`Edit ${p.name}`} id={`edit-${p.id}`} onClick={p.onEdit}>
        <EditOutlined fontSize="small" />
      </Act>
      <Act
        label={`Delete ${p.name}`}
        id={`delete-${p.id}`}
        onClick={p.onDelete}
      >
        <DeleteOutlined fontSize="small" />
      </Act>
    </Box>
  )
}
