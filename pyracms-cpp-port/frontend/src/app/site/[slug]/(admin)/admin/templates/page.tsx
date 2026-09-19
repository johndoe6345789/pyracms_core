'use client'

import { useState } from 'react'
import { Alert, Container, Typography, Box } from '@mui/material'
import Editor from '@monaco-editor/react'
import TemplateToolbar from
  '@/components/admin/templates/TemplateToolbar'
import TemplatePreview from
  '@/components/admin/templates/TemplatePreview'
import { EDITOR_OPTIONS } from './templateEditorOptions'
import {
  DEFAULT_TEMPLATES, type TemplateSection, type Templates,
} from '@/components/admin/templates/defaultTemplates'

export default function TemplateEditorPage() {
  const [section, setSection] = useState<TemplateSection>('header')
  const [templates, setTemplates] =
    useState<Templates>(DEFAULT_TEMPLATES)
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
      <Alert severity="info" sx={{ mb: 3 }}>
        Saving templates is not available yet: the backend has no
        template route. Edits are a local preview only.
      </Alert>
      <TemplateToolbar
        section={section}
        onSection={setSection}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onReset={() => setTemplates(DEFAULT_TEMPLATES)}
      />
      <Box sx={{ display: 'flex', gap: 2, minHeight: 500 }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Editor
            height="500px"
            language="html"
            value={templates[section]}
            onChange={(v) =>
              setTemplates((prev) => ({ ...prev, [section]: v ?? '' }))
            }
            theme="vs-dark"
            options={EDITOR_OPTIONS}
          />
        </Box>
        {showPreview && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TemplatePreview
              section={section}
              html={templates[section]}
            />
          </Box>
        )}
      </Box>
    </Container>
  )
}
