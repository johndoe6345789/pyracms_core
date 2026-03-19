'use client'

import { useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
import DOMPurify from 'dompurify'
import Editor, { type OnMount } from '@monaco-editor/react'
import type {
  editor as MonacoEditor,
} from 'monaco-editor'
import { EditorToolbar } from './EditorToolbar'
import {
  EditorViewToggle, type ViewMode,
} from './EditorViewToggle'
import {
  EditorPreviewPane, EmptyPreview,
  HtmlPreviewContent,
} from './EditorPreviewPane'
import { getToolbarActions } from './toolbarActions'
import { useAutoSave } from './useAutoSave'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  autoSaveKey?: string
}

const LANG: Record<string, string> = {
  HTML: 'html', Markdown: 'markdown',
  BBCode: 'plaintext', RST: 'plaintext',
}
const OPTS = {
  minimap: { enabled: false },
  wordWrap: 'on' as const, fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
}

export function MonacoEditorComponent({
  value, onChange, language, autoSaveKey,
}: MonacoEditorProps) {
  const ref = useRef<
    MonacoEditor.IStandaloneCodeEditor | null
  >(null)
  const [vm, setVm] =
    useState<ViewMode>('edit')
  useAutoSave(value, onChange, autoSaveKey)

  const onMount: OnMount = (ed) => {
    ref.current = ed
  }
  const insert = useCallback(
    (pre: string, suf: string) => {
      const ed = ref.current
      if (!ed) return
      const sel = ed.getSelection()
      if (!sel) return
      const t = ed.getModel()
        ?.getValueInRange(sel) ?? ''
      ed.executeEdits('toolbar', [
        { range: sel, text: `${pre}${t}${suf}` },
      ])
      ed.focus()
    }, [])

  const showEd =
    vm === 'edit' || vm === 'split'
  const showPv =
    vm === 'preview' || vm === 'split'

  return (
    <section aria-label="Monaco code editor">
      <Box sx={{
        border: 1, borderColor: 'divider',
        borderRadius: 1, overflow: 'hidden',
      }}>
        <EditorToolbar
          actions={getToolbarActions(language)}
          onAction={insert}>
          <EditorViewToggle
            viewMode={vm}
            onViewModeChange={setVm} />
        </EditorToolbar>
        <Box sx={{
          display: 'flex', minHeight: 400,
        }}>
          {showEd && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Editor
                height="400px"
                language={LANG[language]
                  ?? 'plaintext'}
                value={value} theme="vs-dark"
                onChange={(v) =>
                  onChange(v ?? '')}
                onMount={onMount}
                options={OPTS} />
            </Box>)}
          {showPv && (
            <Box sx={{
              flex: 1, minWidth: 0,
              borderLeft: showEd ? 1 : 0,
              borderColor: 'divider',
            }}>
              <EditorPreviewPane
                label={`Preview (${language})`}>
                {value
                  ? <HtmlPreviewContent
                      sanitizedHtml={
                        DOMPurify.sanitize(value)
                      } />
                  : <EmptyPreview />}
              </EditorPreviewPane>
            </Box>)}
        </Box>
      </Box>
    </section>
  )
}
