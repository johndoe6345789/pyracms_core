'use client'

import { useState, useCallback } from 'react'
import { Alert, Container, Typography, Grid } from '@mui/material'
import ThemeActions from '@/components/admin/styles/ThemeActions'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import {
  DEFAULT_THEME, exportTheme, importTheme,
  type ThemeConfig,
} from '@/components/admin/styles/themeConfig'

export default function StyleEditorPage() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)

  const update = useCallback(
    (key: keyof ThemeConfig, value: string | number) => {
      setTheme((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

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
      <Alert severity="info" sx={{ mb: 3 }}>
        Saving themes is not available yet: the backend has no
        theme route. Changes here are a local preview; use Export
        JSON to keep them.
      </Alert>
      <ThemeActions
        onReset={() => setTheme(DEFAULT_THEME)}
        onExport={() => exportTheme(theme)}
        onImport={() => importTheme(setTheme)}
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
