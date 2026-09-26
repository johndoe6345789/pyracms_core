'use client'

import { useParams } from 'next/navigation'
import { Box, Container, Grid } from '@mui/material'
import ThemeActions from '@/components/admin/styles/ThemeActions'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import StylePresets from '@/components/admin/styles/StylePresets'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import StyleHeader from '@/components/admin/styles/StyleHeader'
import StyleModeTabs from '@/components/admin/styles/StyleModeTabs'
import { sameThemes } from '@/components/admin/styles/presets'
import {
  DEFAULT_THEMES,
  exportThemes,
  importThemes,
} from '@/components/admin/styles/siteThemes'
import { useStyleEditor } from '@/hooks/admin/useStyleEditor'
import { useTenantId } from '@/hooks/useTenantId'

export default function StyleEditorPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const st = useStyleEditor(slug, tenantId)
  const theme = st.theme
  const unsaved = !sameThemes(st.themes, st.saved)
  const other = st.mode === 'light' ? 'dark' : 'light'

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <StyleHeader
        unsaved={unsaved}
        saved={st.justSaved}
        onSave={st.save}
        onUndo={() => st.edit(st.saved)}
      />
      <ErrorAlert error={st.error} testId="theme-error" />
      <StyleModeTabs
        mode={st.mode}
        onMode={st.setMode}
        onCopyToOther={() =>
          st.edit({ ...st.themes, [other]: st.themes[st.mode] })
        }
      />
      <StylePresets
        theme={theme}
        saved={st.saved[st.mode]}
        previous={st.previous?.[st.mode] ?? null}
        unsaved={unsaved}
        onPick={st.editMode}
      />
      <ThemeActions
        onReset={() => st.editMode(DEFAULT_THEMES[st.mode])}
        onExport={() => exportThemes(st.themes)}
        onImport={() => importThemes(st.edit)}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ThemeControls theme={theme} update={st.update} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ position: 'sticky', top: 16 }}>
            <ThemePreview theme={theme} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
