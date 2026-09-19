'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Alert, Container, Typography } from '@mui/material'
import TemplateToolbar from
  '@/components/admin/templates/TemplateToolbar'
import TemplatePane from
  '@/components/admin/templates/TemplatePane'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useTenantId } from '@/hooks/useTenantId'
import { useSettingJson } from '@/hooks/admin/useSettingJson'
import {
  TEMPLATES_KEY, parseTemplates,
} from '@/components/admin/templates/templateStore'
import {
  DEFAULT_TEMPLATES, type TemplateSection,
} from '@/components/admin/templates/defaultTemplates'

export default function TemplateEditorPage() {
  const [section, setSection] = useState<TemplateSection>('header')
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const {
    value: templates, edit: setTemplates, save, saved, error,
  } = useSettingJson(
    tenantId, TEMPLATES_KEY, parseTemplates, DEFAULT_TEMPLATES)
  const [showPreview, setShowPreview] = useState(true)

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Template Editor
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Edit the HTML templates for your site sections.
      </Typography>
      <ErrorAlert error={error} testId="templates-error" />
      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Templates saved.
        </Alert>
      )}
      <TemplateToolbar
        section={section}
        onSection={setSection}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onReset={() => setTemplates(DEFAULT_TEMPLATES)}
        onSave={save}
      />
      <TemplatePane
        section={section}
        html={templates[section]}
        showPreview={showPreview}
        onChange={(html) =>
          setTemplates((prev) => ({ ...prev, [section]: html }))}
      />
    </Container>
  )
}
