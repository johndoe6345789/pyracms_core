'use client'

import { useState } from 'react'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import {
  CodeOutlined,
  EditOutlined,
  TextFieldsOutlined,
  DescriptionOutlined,
} from '@mui/icons-material'

export type EditorMode = 'monaco' | 'wysiwyg' | 'bbcode' | 'markdown'

interface EditorModeSelectorProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

const INCOMPATIBLE_PAIRS: [EditorMode, EditorMode][] = [
  ['wysiwyg', 'bbcode'],
  ['bbcode', 'wysiwyg'],
  ['wysiwyg', 'markdown'],
  ['markdown', 'wysiwyg'],
]

function isIncompatible(from: EditorMode, to: EditorMode): boolean {
  return INCOMPATIBLE_PAIRS.some(([a, b]) => a === from && b === to)
}

const MODE_INFO: Record<EditorMode, { icon: React.ReactNode; label: string }> = {
  monaco: { icon: <CodeOutlined sx={{ mr: 0.5, fontSize: 18 }} />, label: 'Monaco' },
  wysiwyg: { icon: <EditOutlined sx={{ mr: 0.5, fontSize: 18 }} />, label: 'WYSIWYG' },
  bbcode: { icon: <TextFieldsOutlined sx={{ mr: 0.5, fontSize: 18 }} />, label: 'BBCode' },
  markdown: { icon: <DescriptionOutlined sx={{ mr: 0.5, fontSize: 18 }} />, label: 'Markdown' },
}

export function EditorModeSelector({ mode, onModeChange }: EditorModeSelectorProps) {
  const [pendingMode, setPendingMode] = useState<EditorMode | null>(null)

  const handleChange = (_: React.MouseEvent<HTMLElement>, newMode: EditorMode | null) => {
    if (!newMode || newMode === mode) return

    if (isIncompatible(mode, newMode)) {
      setPendingMode(newMode)
    } else {
      onModeChange(newMode)
    }
  }

  const confirmSwitch = () => {
    if (pendingMode) {
      onModeChange(pendingMode)
      setPendingMode(null)
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ToggleButtonGroup value={mode} exclusive onChange={handleChange} size="small">
          {(Object.keys(MODE_INFO) as EditorMode[]).map((key) => (
            <ToggleButton key={key} value={key}>
              {MODE_INFO[key].icon}
              {MODE_INFO[key].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Dialog open={pendingMode !== null} onClose={() => setPendingMode(null)}>
        <DialogTitle>Switch Editor Mode?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Switching from {mode ? MODE_INFO[mode].label : ''} to{' '}
            {pendingMode ? MODE_INFO[pendingMode].label : ''} may cause content formatting
            to be lost or rendered incorrectly. The content will not be automatically
            converted between formats.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMode(null)}>Cancel</Button>
          <Button onClick={confirmSwitch} variant="contained" color="warning">
            Switch Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
