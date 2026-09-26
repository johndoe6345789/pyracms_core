import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material'
import type { SectionDef, SectionKey } from '@/lib/backup/types'

interface Props {
  sections: SectionDef[]
  selected: SectionKey[]
  onToggle: (key: SectionKey) => void
  /** how many items the backup holds per section, when restoring */
  counts?: Partial<Record<SectionKey, number>>
}

/** A tick-list of the parts of a site a backup can hold. */
export default function SectionPicker({
  sections,
  selected,
  onToggle,
  counts,
}: Props) {
  return (
    <Stack sx={{ mb: 2 }}>
      {sections.map((s) => {
        const n = counts?.[s.key]
        return (
          <FormControlLabel
            key={s.key}
            disabled={counts !== undefined && n === undefined}
            control={
              <Checkbox
                checked={selected.includes(s.key)}
                onChange={() => onToggle(s.key)}
              />
            }
            label={
              <>
                <Typography component="span" sx={{ fontWeight: 600 }}>
                  {s.label}
                  {n !== undefined && ` (${n})`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.description}
                </Typography>
              </>
            }
          />
        )
      })}
    </Stack>
  )
}
