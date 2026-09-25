import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { MenuDraft } from '@/lib/menuDraft'

/** Link or folder (a dropdown holding links). */
export default function MenuKindToggle({
  kind,
  onChange,
}: {
  kind: MenuDraft['kind']
  onChange: (kind: MenuDraft['kind']) => void
}) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={kind}
      onChange={(_, k) => k && onChange(k)}
      aria-label="Kind of entry"
    >
      <ToggleButton value="route" data-testid="kind-link">
        Link
      </ToggleButton>
      <ToggleButton value="folder" data-testid="kind-folder">
        Folder (dropdown)
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
