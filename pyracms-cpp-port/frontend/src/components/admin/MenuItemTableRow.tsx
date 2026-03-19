import {
  TableRow, TableCell, Typography,
} from '@mui/material'
import { MenuItemRow } from '@/hooks/useMenuEditor'
import {
  EditActions, ViewActions,
} from './MenuItemViewActions'
import MenuItemEditCells
  from './MenuItemEditCells'

interface Props {
  item: MenuItemRow
  editing: boolean
  editRow: MenuItemRow | null
  onEditRowChange: (
    updater: (
      prev: MenuItemRow | null
    ) => MenuItemRow | null
  ) => void
  onStartEdit: (item: MenuItemRow) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function MenuItemTableRow({
  item, editing, editRow,
  onEditRowChange, onStartEdit,
  onSaveEdit, onCancelEdit, onDelete,
}: Props) {
  return (
    <TableRow hover>
      {editing ? (
        <MenuItemEditCells
          editRow={editRow}
          onEditRowChange={onEditRowChange}
        />
      ) : (
        <>
          <TableCell>{item.name}</TableCell>
          <TableCell>
            <Typography
              sx={{ fontFamily: 'monospace' }}
            >
              {item.route}
            </Typography>
          </TableCell>
          <TableCell>
            {item.position}
          </TableCell>
          <TableCell>
            {item.permissions}
          </TableCell>
        </>
      )}
      <TableCell align="right">
        {editing ? (
          <EditActions
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <ViewActions
            onEdit={() => onStartEdit(item)}
            onDelete={() =>
              onDelete(item.id)}
          />
        )}
      </TableCell>
    </TableRow>
  )
}
