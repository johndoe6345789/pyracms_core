import { Alert, Box, Button, Card, CardContent } from '@mui/material'
import { Typography } from '@mui/material'
import type { useSiteSettingsEditor } from '@/hooks/admin/useSiteSettingsEditor'
import SettingField from './SettingField'
import { SETTING_GROUPS } from './siteSettingDefs'

type Editor = ReturnType<typeof useSiteSettingsEditor>

/** The guided settings form: grouped, typed, each field explained. */
export default function SiteSettingsForm({ ed }: { ed: Editor }) {
  return (
    <Box data-testid="site-settings-form" sx={{ mb: 4 }}>
      {SETTING_GROUPS.map((g) => (
        <Card key={g.title} variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h6">{g.title}</Typography>
            {g.fields.map((f) => (
              <SettingField
                key={f.key}
                def={f}
                value={ed.values[f.key]}
                problem={ed.problems[f.key]}
                onChange={(v) => ed.setField(f.key, v as never)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      {ed.saved && (
        <Alert severity="success" sx={{ mb: 2 }} data-testid="settings-saved">
          Settings saved.
        </Alert>
      )}
      <Button
        variant="contained"
        onClick={ed.save}
        data-testid="save-site-settings-btn"
      >
        Save settings
      </Button>
    </Box>
  )
}
