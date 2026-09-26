import { Chip, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { FolderOutlined, LinkOutlined } from '@mui/icons-material'
import MenuRowActions from './MenuRowActions'
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

/** One entry of the menu with its order, edit and delete controls. */
export default function MenuTreeRow(p: Props) {
  const { item: i, ...actions } = p
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
      <MenuRowActions id={i.id} name={i.name} {...actions} />
    </ListItem>
  )
}
