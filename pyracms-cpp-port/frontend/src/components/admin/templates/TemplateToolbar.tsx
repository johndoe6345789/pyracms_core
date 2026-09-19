import {
  Box, Button, FormControl, InputLabel, Select, MenuItem,
  ToggleButton,
} from '@mui/material'
import {
  SaveOutlined, RestoreOutlined, VerticalSplit,
} from '@mui/icons-material'
import type { TemplateSection } from './defaultTemplates'

interface Props {
  section: TemplateSection
  onSection: (s: TemplateSection) => void
  showPreview: boolean
  onTogglePreview: () => void
  onReset: () => void
  onSave: () => void
}

export default function TemplateToolbar(p: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Template Section</InputLabel>
        <Select
          value={p.section}
          label="Template Section"
          onChange={(e) =>
            p.onSection(e.target.value as TemplateSection)
          }
        >
          <MenuItem value="header">Header</MenuItem>
          <MenuItem value="footer">Footer</MenuItem>
          <MenuItem value="sidebar">Sidebar</MenuItem>
          <MenuItem value="layout">Main Layout</MenuItem>
        </Select>
      </FormControl>
      <ToggleButton
        value="preview"
        selected={p.showPreview}
        onChange={p.onTogglePreview}
        size="small"
      >
        <VerticalSplit sx={{ mr: 0.5, fontSize: 18 }} />
        Preview
      </ToggleButton>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<RestoreOutlined />}
          onClick={p.onReset}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={p.onSave}
        >
          Save
        </Button>
      </Box>
    </Box>
  )
}
