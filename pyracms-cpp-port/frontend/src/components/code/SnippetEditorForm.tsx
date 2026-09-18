'use client'

import {
  Alert, Box, Button, Divider, TextField, Tooltip,
} from '@mui/material'
import {
  PlayArrowOutlined, SaveOutlined,
} from '@mui/icons-material'
import { CodeEditor } from './CodeEditor'
import { CodeOutput } from './CodeOutput'
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
  const canRun = isRunnable(e.language)

  const handleSave = async () => {
    const id = await e.save()
    if (id) onSaved(id)
  }
  const handleRun = async () => {
    const id = await e.save()
    if (id) await run(id)
  }

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
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
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Tooltip title={canRun ? '' :
          'Running is not supported for this language'}>
          <span>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrowOutlined />}
              onClick={handleRun}
              disabled={
                !e.code || running || e.saving || !canRun}
              data-testid="run-btn"
              aria-label="Run snippet"
            >
              {running ? 'Running...' : 'Save & Run'}
            </Button>
          </span>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={!e.title.trim() || !e.code || e.saving}
          data-testid="save-btn"
          aria-label="Save snippet"
        >
          {e.saving ? 'Saving...' : saveLabel}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          data-testid="cancel-btn"
        >
          Cancel
        </Button>
      </Box>
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
