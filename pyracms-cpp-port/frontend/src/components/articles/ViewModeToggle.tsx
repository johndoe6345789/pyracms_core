'use client'

import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  EditOutlined,
  PreviewOutlined,
} from '@mui/icons-material'

interface ViewModeToggleProps {
  viewMode: 'edit' | 'preview'
  setViewMode: (v: 'edit' | 'preview') => void
}

export function ViewModeToggle({
  viewMode,
  setViewMode,
}: ViewModeToggleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, val) =>
          val && setViewMode(val)
        }
        size="small"
        data-testid="view-mode-toggle"
      >
        <ToggleButton
          value="edit"
          data-testid="toggle-edit"
          aria-label="Edit mode"
        >
          <EditOutlined
            sx={{ mr: 0.5, fontSize: 18 }}
          />
          Edit
        </ToggleButton>
        <ToggleButton
          value="preview"
          data-testid="toggle-preview"
          aria-label="Preview mode"
        >
          <PreviewOutlined
            sx={{ mr: 0.5, fontSize: 18 }}
          />
          Preview
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
