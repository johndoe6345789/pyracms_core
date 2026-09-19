'use client'

import { Box } from '@mui/material'
import Editor from '@monaco-editor/react'
import TemplatePreview from './TemplatePreview'
import type { TemplateSection } from './defaultTemplates'
import { EDITOR_OPTIONS } from './templateEditorOptions'

interface Props {
  section: TemplateSection
  html: string
  showPreview: boolean
  onChange: (html: string) => void
}

export default function TemplatePane(p: Props) {
  return (
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
          value={p.html}
          onChange={(v) => p.onChange(v ?? '')}
          theme="vs-dark"
          options={EDITOR_OPTIONS}
        />
      </Box>
      {p.showPreview && (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TemplatePreview section={p.section} html={p.html} />
        </Box>
      )}
    </Box>
  )
}
