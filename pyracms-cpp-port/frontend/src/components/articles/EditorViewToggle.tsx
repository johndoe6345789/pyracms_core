'use client'

import {
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  EditOutlined,
  VerticalSplit,
  PreviewOutlined,
} from '@mui/icons-material'

export type ViewMode = 'edit' | 'split' | 'preview'

interface EditorViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function EditorViewToggle({
  viewMode,
  onViewModeChange,
}: EditorViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, val) => val && onViewModeChange(val)}
      size="small"
      data-testid="editor-view-toggle"
    >
      <ToggleButton
        value="edit"
        data-testid="view-mode-edit"
        aria-label="Edit mode"
      >
        <EditOutlined sx={{ fontSize: 16 }} />
      </ToggleButton>
      <ToggleButton
        value="split"
        data-testid="view-mode-split"
        aria-label="Split mode"
      >
        <VerticalSplit sx={{ fontSize: 16 }} />
      </ToggleButton>
      <ToggleButton
        value="preview"
        data-testid="view-mode-preview"
        aria-label="Preview mode"
      >
        <PreviewOutlined sx={{ fontSize: 16 }} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
