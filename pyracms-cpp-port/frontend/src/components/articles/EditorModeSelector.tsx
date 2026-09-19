'use client'

import { useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ModeSwitchDialog } from './ModeSwitchDialog'
import { MODE_INFO, isIncompatible, type EditorMode } from './editorModes'

export type { EditorMode }

interface EditorModeSelectorProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

export function EditorModeSelector({
  mode,
  onModeChange,
}: EditorModeSelectorProps) {
  const [pendingMode, setPendingMode] = useState<EditorMode | null>(null)

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: EditorMode | null,
  ) => {
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
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleChange}
          size="small"
        >
          {(Object.keys(MODE_INFO) as EditorMode[]).map((key) => (
            <ToggleButton key={key} value={key}>
              {MODE_INFO[key].icon}
              {MODE_INFO[key].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <ModeSwitchDialog
        from={mode}
        pending={pendingMode}
        onCancel={() => setPendingMode(null)}
        onConfirm={confirmSwitch}
      />
    </>
  )
}
