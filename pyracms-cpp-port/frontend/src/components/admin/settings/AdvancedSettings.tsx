import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import AddSettingForm from '@/components/admin/AddSettingForm'
import SettingsTable from '@/components/admin/SettingsTable'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import type { useAdminSettings } from '@/hooks/useAdminSettings'

type Raw = ReturnType<typeof useAdminSettings>

/** Collapsed raw key/value editor for keys the guided form lacks. */
export default function AdvancedSettings({ raw }: { raw: Raw }) {
  return (
    <Accordion variant="outlined" data-testid="advanced-settings">
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Advanced: raw settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Every stored key, including feature toggles and the theme. Edit these
          only if you know what a key does.
        </Typography>
        <ErrorAlert error={raw.error} testId="settings-error" />
        <AddSettingForm
          newKey={raw.newKey}
          newValue={raw.newValue}
          onKeyChange={raw.setNewKey}
          onValueChange={raw.setNewValue}
          onAdd={raw.handleAdd}
        />
        <SettingsTable
          settings={raw.settings}
          editingId={raw.editingId}
          editValue={raw.editValue}
          onEditValueChange={raw.setEditValue}
          onStartEdit={raw.handleStartEdit}
          onSaveEdit={raw.handleSaveEdit}
          onCancelEdit={raw.handleCancelEdit}
          onDelete={raw.handleDelete}
        />
      </AccordionDetails>
    </Accordion>
  )
}
