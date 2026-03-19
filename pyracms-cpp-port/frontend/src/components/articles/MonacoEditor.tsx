'use client'

import {
  useCallback, useEffect, useRef, useState,
} from 'react'
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

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  autoSaveKey?: string
}

const LANG_MAP: Record<string, string> = {
  HTML: 'html', Markdown: 'markdown',
  BBCode: 'plaintext', RST: 'plaintext',
}

export function MonacoEditorComponent({
  value, onChange, language, autoSaveKey,
}: MonacoEditorProps) {
  const editorRef = useRef<
    MonacoEditor.IStandaloneCodeEditor | null
  >(null)
  const [viewMode, setViewMode] =
    useState<ViewMode>('edit')
  const lang = LANG_MAP[language] ?? 'plaintext'

  useEffect(() => {
    if (!autoSaveKey) return
    const t = setTimeout(() => {
      localStorage.setItem(
        `autosave-${autoSaveKey}`, value)
    }, 1000)
    return () => clearTimeout(t)
  }, [value, autoSaveKey])

  useEffect(() => {
    if (!autoSaveKey) return
    const s = localStorage.getItem(
      `autosave-${autoSaveKey}`)
    if (s && !value) onChange(s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey])

  const onMount: OnMount = (ed) => {
    editorRef.current = ed
  }

  const insert = useCallback(
    (pre: string, suf: string) => {
      const ed = editorRef.current
      if (!ed) return
      const sel = ed.getSelection()
      if (!sel) return
      const txt = ed.getModel()
        ?.getValueInRange(sel) ?? ''
      ed.executeEdits('toolbar', [
        { range: sel, text: `${pre}${txt}${suf}` },
      ])
      ed.focus()
    }, [])

  const showEd =
    viewMode === 'edit' || viewMode === 'split'
  const showPv =
    viewMode === 'preview' || viewMode === 'split'

  return (
    <section aria-label="Monaco code editor">
      <Box sx={{
        border: 1, borderColor: 'divider',
        borderRadius: 1, overflow: 'hidden',
      }}>
        <EditorToolbar
          actions={getToolbarActions(language)}
          onAction={insert}
        >
          <EditorViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode} />
        </EditorToolbar>
        <Box sx={{ display: 'flex', minHeight: 400 }}>
          {showEd && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Editor
                height="400px" language={lang}
                value={value} theme="vs-dark"
                onChange={(v) => onChange(v ?? '')}
                onMount={onMount}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on', fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }} />
            </Box>)}
          {showPv && (
            <Box sx={{
              flex: 1, minWidth: 0,
              borderLeft: showEd ? 1 : 0,
              borderColor: 'divider',
            }}>
              <EditorPreviewPane
                label={`Preview (${language})`}>
                {value ? (
                  <HtmlPreviewContent
                    sanitizedHtml={
                      DOMPurify.sanitize(value)} />
                ) : <EmptyPreview />}
              </EditorPreviewPane>
            </Box>)}
        </Box>
      </Box>
    </section>
  )
}
