'use client'

import { useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
import type { OnMount } from '@monaco-editor/react'
import type {
  editor as MonacoEditor,
} from 'monaco-editor'
import { EditorToolbar } from './EditorToolbar'
import {
  EditorViewToggle, type ViewMode,
} from './EditorViewToggle'
import { getToolbarActions } from './toolbarActions'
import { useAutoSave } from './useAutoSave'
import { MonacoEditorPane } from './MonacoEditorPane'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  autoSaveKey?: string
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
        <MonacoEditorPane
          value={value}
          language={language}
          showEditor={showEd}
          showPreview={showPv}
          onChange={onChange}
          onMount={onMount} />
      </Box>
    </section>
  )
}
