import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material'
import {
  AddOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  LinkOutlined,
} from '@mui/icons-material'
import { permissionLabel } from '@/lib/menuDraft'
import type { MenuItemRow } from '@/hooks/admin/menuData'

interface Props {
  item: MenuItemRow
  detail: string
  indent: boolean
  first: boolean
  last: boolean
  disabled: boolean
  onMove: (by: -1 | 1) => void
  onEdit: () => void
  onDelete: () => void
  onAddInside?: () => void
}

function Act(
  p: { label: string; id: string; onClick: () => void } & {
    disabled?: boolean
    children: React.ReactNode
  },
) {
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

/** One entry of the menu with its order, edit and delete controls. */
export default function MenuTreeRow(p: Props) {
  const { item: i } = p
  return (
    <ListItem
      divider
      data-testid={`menu-row-${i.id}`}
      sx={{ pl: p.indent ? 6 : 2, gap: 1 }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        {i.type === 'folder' ? (
          <FolderOutlined color="primary" />
        ) : (
          <LinkOutlined />
        )}
      </ListItemIcon>
      <ListItemText primary={i.name} secondary={p.detail} />
      {i.permissions !== 'public' && (
        <Chip size="small" label={permissionLabel(i.permissions)} />
      )}
      <Box sx={{ display: 'flex' }}>
        {p.onAddInside && (
          <Act
            label={`Add a link to ${i.name}`}
            id={`add-in-${i.id}`}
            onClick={p.onAddInside}
          >
            <AddOutlined fontSize="small" />
          </Act>
        )}
        <Act
          label="Move up"
          id={`up-${i.id}`}
          disabled={p.first || p.disabled}
          onClick={() => p.onMove(-1)}
        >
          <ArrowUpwardOutlined fontSize="small" />
        </Act>
        <Act
          label="Move down"
          id={`down-${i.id}`}
          disabled={p.last || p.disabled}
          onClick={() => p.onMove(1)}
        >
          <ArrowDownwardOutlined fontSize="small" />
        </Act>
        <Act label={`Edit ${i.name}`} id={`edit-${i.id}`} onClick={p.onEdit}>
          <EditOutlined fontSize="small" />
        </Act>
        <Act
          label={`Delete ${i.name}`}
          id={`delete-${i.id}`}
          onClick={p.onDelete}
        >
          <DeleteOutlined fontSize="small" />
        </Act>
      </Box>
    </ListItem>
  )
}
