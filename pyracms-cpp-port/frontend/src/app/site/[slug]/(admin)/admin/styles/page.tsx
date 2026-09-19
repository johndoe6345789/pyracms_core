'use client'

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Alert, Container, Typography, Grid } from '@mui/material'
import ThemeActions from '@/components/admin/styles/ThemeActions'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import {
  DEFAULT_THEME, exportTheme, importTheme,
  type ThemeConfig,
} from '@/components/admin/styles/themeConfig'
import { useTenantId } from '@/hooks/useTenantId'
import { useSettingJson } from '@/hooks/admin/useSettingJson'
import { announceSiteTheme } from '@/hooks/useSiteTheme'
import { THEME_KEY, parseSiteTheme } from '@/lib/siteTheme'

export default function StyleEditorPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const { value: theme, edit, save, saved, error } = useSettingJson(
    tenantId, THEME_KEY, parseSiteTheme, DEFAULT_THEME)

  const update = useCallback(
    (key: keyof ThemeConfig, value: string | number) => {
      edit((prev) => ({ ...prev, [key]: value }))
    },
    [edit],
  )
  const onSave = async () => {
    if (await save()) announceSiteTheme(slug, theme)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Style Editor
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Customize your site theme and appearance.
      </Typography>
      <ErrorAlert error={error} testId="theme-error" />
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>Theme saved.</Alert>
      )}
      <ThemeActions
        onReset={() => edit(DEFAULT_THEME)}
        onSave={onSave}
        onExport={() => exportTheme(theme)}
        onImport={() => importTheme(edit)}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ThemeControls theme={theme} update={update} />
        </Grid>
        <Grid item xs={12} md={7}>
          <ThemePreview theme={theme} />
        </Grid>
      </Grid>
    </Container>
  )
}
