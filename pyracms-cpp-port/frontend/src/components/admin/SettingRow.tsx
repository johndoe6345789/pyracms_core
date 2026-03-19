import {
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@mui/icons-material'
import { Setting } from '@/hooks/useAdminSettings'

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
  setting, isEditing, editValue, onEditValueChange,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete,
}: SettingRowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {setting.key}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            size="small" value={editValue} autoFocus fullWidth
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit(setting.id)
              if (e.key === 'Escape') onCancelEdit()
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
            {setting.value}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        {isEditing ? (
          <>
            <Tooltip title="Save">
              <IconButton size="small" color="success" onClick={() => onSaveEdit(setting.id)}>
                <CheckOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" color="default" onClick={onCancelEdit}>
                <CloseOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit">
              <IconButton size="small" color="primary" onClick={() => onStartEdit(setting)}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(setting.id)}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  )
}
