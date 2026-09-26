import { Alert, List, ListItem, Typography } from '@mui/material'
import { SECTIONS } from '@/lib/backup/sections'
import type { Outcome, SectionKey } from '@/lib/backup/types'

type Report = Partial<Record<SectionKey, Outcome>>

/** Per-section counts of what a restore changed, and what went wrong. */
export default function RestoreReport({ report }: { report: Report }) {
  const shown = SECTIONS.filter((s) => report[s.key])
  if (shown.length === 0) return null
  return (
    <List dense data-testid="restore-report">
      {shown.map((s) => {
        const o = report[s.key] as Outcome
        return (
          <ListItem key={s.key} sx={{ display: 'block' }}>
            <Typography sx={{ fontWeight: 600 }}>{s.label}</Typography>
            <Typography variant="body2">
              {o.created} added, {o.updated} updated, {o.failed.length} failed
            </Typography>
            {o.failed.slice(0, 10).map((f) => (
              <Alert key={f} severity="warning" sx={{ mt: 0.5 }}>
                {f}
              </Alert>
            ))}
          </ListItem>
        )
      })}
    </List>
  )
}
