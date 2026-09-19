'use client'

import { Box, Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import { RunButton } from './RunButton'

interface Props {
  canRun: boolean
  running: boolean
  saving: boolean
  hasCode: boolean
  hasTitle: boolean
  saveLabel: string
  onRun: () => void
  onSave: () => void
  onCancel: () => void
}

export function SnippetEditorButtons(p: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <RunButton
        label="Save & Run"
        runningLabel="Running..."
        testId="run-btn"
        running={p.running}
        disabled={!p.hasCode || p.saving}
        runnable={p.canRun}
        onClick={p.onRun}
      />
      <Button
        variant="contained"
        startIcon={<SaveOutlined />}
        onClick={p.onSave}
        disabled={!p.hasTitle || !p.hasCode || p.saving}
        data-testid="save-btn"
        aria-label="Save snippet"
      >
        {p.saving ? 'Saving...' : p.saveLabel}
      </Button>
      <Button variant="outlined" onClick={p.onCancel} data-testid="cancel-btn">
        Cancel
      </Button>
    </Box>
  )
}
