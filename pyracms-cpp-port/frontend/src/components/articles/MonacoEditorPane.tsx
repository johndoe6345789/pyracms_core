'use client'

import { Box } from '@mui/material'
import DOMPurify from 'dompurify'
import Editor, {
  type OnMount,
} from '@monaco-editor/react'
import {
  EditorPreviewPane, EmptyPreview,
  HtmlPreviewContent,
} from './EditorPreviewPane'

const OPTS = {
  minimap: { enabled: false },
  wordWrap: 'on' as const, fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
}
const LANG: Record<string, string> = {
  HTML: 'html', Markdown: 'markdown',
  BBCode: 'plaintext', RST: 'plaintext',
}

interface MonacoEditorPaneProps {
  value: string
  language: string
  showEditor: boolean
  showPreview: boolean
  onChange: (v: string) => void
  onMount: OnMount
}

export function MonacoEditorPane({
  value, language, showEditor,
  showPreview, onChange, onMount,
}: MonacoEditorPaneProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: 400 }}>
      {showEditor && (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Editor
            height="400px" theme="vs-dark"
            language={
              LANG[language] ?? 'plaintext'}
            value={value}
            onChange={(v) => onChange(v ?? '')}
            onMount={onMount}
            options={OPTS} />
        </Box>)}
      {showPreview && (
        <Box sx={{
          flex: 1, minWidth: 0,
          borderLeft: showEditor ? 1 : 0,
          borderColor: 'divider',
        }}>
          <EditorPreviewPane
            label={`Preview (${language})`}>
            {value
              ? <HtmlPreviewContent
                  sanitizedHtml={
                    DOMPurify.sanitize(value)} />
              : <EmptyPreview />}
          </EditorPreviewPane>
        </Box>)}
    </Box>
  )
}
