'use client'

import { Alert, Box, Divider, TextField } from '@mui/material'
import { CodeEditor } from './CodeEditor'
import { CodeOutput } from './CodeOutput'
import { SnippetEditorButtons } from './SnippetEditorButtons'
import { isRunnable } from '@/lib/snippets'
import { useSnippetRun } from '@/hooks/useSnippetRun'
import type { SnippetEditor } from '@/hooks/useSnippetEditor'

interface Props {
  editor: SnippetEditor
  saveLabel: string
  onSaved: (id: string) => void
  onCancel: () => void
}

export function SnippetEditorForm({
  editor: e, saveLabel, onSaved, onCancel,
}: Props) {
  const { running, result, run } = useSnippetRun()

  const handleSave = async () => {
    const id = await e.save()
    if (id) onSaved(id)
  }
  const handleRun = async () => {
    const id = await e.save()
    if (id) await run(id)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        label="Title"
        value={e.title}
        onChange={(ev) => e.setTitle(ev.target.value)}
        fullWidth
        placeholder="Enter a title for your snippet..."
        data-testid="snippet-title-input"
      />
      <CodeEditor
        value={e.code}
        onChange={e.setCode}
        language={e.language}
        onLanguageChange={e.setLanguage}
      />
      {e.error && <Alert severity="error">{e.error}</Alert>}
      <SnippetEditorButtons
        canRun={isRunnable(e.language)}
        running={running}
        saving={e.saving}
        hasCode={Boolean(e.code)}
        hasTitle={Boolean(e.title.trim())}
        saveLabel={saveLabel}
        onRun={handleRun}
        onSave={handleSave}
        onCancel={onCancel}
      />
      {(running || result) && (
        <>
          <Divider />
          <CodeOutput
            stdout={result?.stdout}
            stderr={result?.stderr}
            exitCode={result?.exitCode}
            executionTime={result?.executionTime}
            isLoading={running}
          />
        </>
      )}
    </Box>
  )
}
