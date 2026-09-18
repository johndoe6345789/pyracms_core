import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
} from '@mui/material'
import { Setting } from '@/hooks/useAdminSettings'
import SettingRow from './SettingRow'

interface SettingsTableProps {
  settings: Setting[]
  editingId: number | null
  editValue: string
  onEditValueChange: (val: string) => void
  onStartEdit: (setting: Setting) => void
  onSaveEdit: (id: number) => void
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

const HEADS = ['Key', 'Value']

export default function SettingsTable(p: SettingsTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider' }}
      data-testid="settings-table"
    >
      <Table aria-label="Settings">
        <TableHead>
          <TableRow>
            {HEADS.map((h) => (
              <TableCell
                key={h}
                scope="col"
                sx={{ fontWeight: 700 }}
              >
                {h}
              </TableCell>
            ))}
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
          {p.settings.map((setting) => (
            <SettingRow
              key={setting.id}
              setting={setting}
              isEditing={p.editingId === setting.id}
              editValue={p.editValue}
              onEditValueChange={p.onEditValueChange}
              onStartEdit={p.onStartEdit}
              onSaveEdit={p.onSaveEdit}
              onCancelEdit={p.onCancelEdit}
              onDelete={p.onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
