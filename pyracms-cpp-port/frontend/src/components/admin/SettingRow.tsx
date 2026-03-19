import {
  TableRow, TableCell,
  TextField, Typography,
} from '@mui/material'
import { Setting } from '@/hooks/useAdminSettings'
import {
  SettingEditActions, SettingViewActions,
} from './SettingRowActions'

interface SettingRowProps {
  setting: Setting
  isEditing: boolean
  editValue: string
  onEditValueChange: (val: string) => void
  onStartEdit: (setting: Setting) => void
  onSaveEdit: (id: number) => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function SettingRow({
  setting, isEditing, editValue,
  onEditValueChange, onStartEdit,
  onSaveEdit, onCancelEdit, onDelete,
}: SettingRowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{
        fontFamily: 'monospace',
        fontWeight: 600,
      }}>
        {setting.key}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            size="small"
            value={editValue}
            autoFocus
            fullWidth
            data-testid="setting-value-input"
            onChange={(e) =>
              onEditValueChange(
                e.target.value,
              )}
            onKeyDown={(e) => {
              if (e.key === 'Enter')
                onSaveEdit(setting.id)
              if (e.key === 'Escape')
                onCancelEdit()
            }}
          />
        ) : (
          <Typography
            variant="body1"
            sx={{ fontFamily: 'monospace' }}
          >
            {setting.value}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        {isEditing ? (
          <SettingEditActions
            onSave={() =>
              onSaveEdit(setting.id)}
            onCancel={onCancelEdit}
          />
        ) : (
          <SettingViewActions
            onEdit={() =>
              onStartEdit(setting)}
            onDelete={() =>
              onDelete(setting.id)}
          />
        )}
      </TableCell>
    </TableRow>
  )
}
