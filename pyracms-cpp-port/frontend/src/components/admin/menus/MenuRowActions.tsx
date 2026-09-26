import { Box } from '@mui/material'
import Act, { type ActProps } from './MenuRowAct'
import {
  AddOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@mui/icons-material'

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
  const acts: (ActProps & { show?: boolean })[] = [
    {
      show: !!p.onAddInside,
      label: `Add a link to ${p.name}`,
      id: `add-in-${p.id}`,
      onClick: () => p.onAddInside?.(),
      children: <AddOutlined fontSize="small" />,
    },
    {
      label: 'Move up',
      id: `up-${p.id}`,
      disabled: p.first || p.disabled,
      onClick: () => p.onMove(-1),
      children: <ArrowUpwardOutlined fontSize="small" />,
    },
    {
      label: 'Move down',
      id: `down-${p.id}`,
      disabled: p.last || p.disabled,
      onClick: () => p.onMove(1),
      children: <ArrowDownwardOutlined fontSize="small" />,
    },
    {
      label: `Edit ${p.name}`,
      id: `edit-${p.id}`,
      onClick: p.onEdit,
      children: <EditOutlined fontSize="small" />,
    },
    {
      label: `Delete ${p.name}`,
      id: `delete-${p.id}`,
      onClick: p.onDelete,
      children: <DeleteOutlined fontSize="small" />,
    },
  ]
  return (
    <Box sx={{ display: 'flex' }}>
      {acts
        .filter((a) => a.show !== false)
        .map((a) => (
          <Act
            key={a.id}
            label={a.label}
            id={a.id}
            disabled={a.disabled ?? false}
            onClick={a.onClick}
          >
            {a.children}
          </Act>
        ))}
    </Box>
  )
}
