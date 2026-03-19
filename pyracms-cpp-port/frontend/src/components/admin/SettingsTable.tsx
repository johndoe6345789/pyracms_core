import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import {
  Setting,
} from '@/hooks/useAdminSettings'
import SettingRow from './SettingRow'

interface SettingsTableProps {
  settings: Setting[]
  editingId: number | null
  editValue: string
  onEditValueChange: (
    val: string,
  ) => void
  onStartEdit: (
    setting: Setting,
  ) => void
  onSaveEdit: (id: number) => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function SettingsTable({
  settings,
  editingId,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: SettingsTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="settings-table"
    >
      <Table
        aria-label="Settings"
      >
        <TableHead>
          <TableRow>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
            >
              Key
            </TableCell>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
            >
              Value
            </TableCell>
            <TableCell
              scope="col"
              sx={{ fontWeight: 700 }}
              align="right"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {settings.map((setting) => (
            <SettingRow
              key={setting.id}
              setting={setting}
              isEditing={
                editingId ===
                setting.id
              }
              editValue={editValue}
              onEditValueChange={
                onEditValueChange
              }
              onStartEdit={
                onStartEdit
              }
              onSaveEdit={onSaveEdit}
              onCancelEdit={
                onCancelEdit
              }
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
