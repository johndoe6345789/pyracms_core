'use client'

import { useState, useCallback } from 'react'
import { Container, Typography, Grid } from '@mui/material'
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
      <ThemeActions
        onReset={() => setTheme(DEFAULT_THEME)}
        onSave={() => console.log('Saving theme:', theme)}
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
