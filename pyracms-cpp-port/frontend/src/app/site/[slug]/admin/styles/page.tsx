'use client'

import { useState, useCallback } from 'react'
import {
  Container, Typography, Box, Button, Paper, Divider, Slider,
  FormControl, InputLabel, Select, MenuItem, TextField, Grid, Card, CardContent,
} from '@mui/material'
import { SaveOutlined, RestoreOutlined, FileUploadOutlined, FileDownloadOutlined } from '@mui/icons-material'
import { HexColorPicker } from 'react-colorful'

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: number
  spacing: number
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#1976d2',
  secondaryColor: '#9c27b0',
  backgroundColor: '#ffffff',
  textColor: '#212121',
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 8,
  spacing: 8,
}

const FONTS = [
  'Roboto, sans-serif',
  'Inter, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Source Sans Pro, sans-serif',
  'Georgia, serif',
  'Merriweather, serif',
  'Fira Code, monospace',
]

interface ColorPickerFieldProps {
  label: string
  color: string
  onChange: (color: string) => void
}

function ColorPickerField({ label, color, onChange }: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box onClick={() => setOpen(!open)} sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: color, border: 1, borderColor: 'divider', cursor: 'pointer' }} />
        <TextField size="small" value={color} onChange={(e) => onChange(e.target.value)} sx={{ width: 120 }} />
      </Box>
      {open && (
        <Box sx={{ mt: 1 }}>
          <HexColorPicker color={color} onChange={onChange} />
        </Box>
      )}
    </Box>
  )
}

export default function StyleEditorPage() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)

  const updateTheme = useCallback((key: keyof ThemeConfig, value: string | number) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = () => { console.log('Saving theme:', theme) }
  const handleReset = () => { setTheme(DEFAULT_THEME) }
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'theme.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string)
          setTheme({ ...DEFAULT_THEME, ...imported })
        } catch { console.error('Invalid theme JSON') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>Style Editor</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Customize your site theme and appearance.</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<RestoreOutlined />} onClick={handleReset}>Reset</Button>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave}>Save</Button>
        <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={handleExport}>Export JSON</Button>
        <Button variant="outlined" startIcon={<FileUploadOutlined />} onClick={handleImport}>Import JSON</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Colors</Typography>
            <Divider sx={{ mb: 2 }} />
            <ColorPickerField label="Primary Color" color={theme.primaryColor} onChange={(c) => updateTheme('primaryColor', c)} />
            <ColorPickerField label="Secondary Color" color={theme.secondaryColor} onChange={(c) => updateTheme('secondaryColor', c)} />
            <ColorPickerField label="Background Color" color={theme.backgroundColor} onChange={(c) => updateTheme('backgroundColor', c)} />
            <ColorPickerField label="Text Color" color={theme.textColor} onChange={(c) => updateTheme('textColor', c)} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Typography</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Font Family</InputLabel>
              <Select value={theme.fontFamily} label="Font Family" onChange={(e) => updateTheme('fontFamily', e.target.value)}>
                {FONTS.map((f) => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f.split(',')[0]}</MenuItem>)}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Layout</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Border Radius: {theme.borderRadius}px</Typography>
            <Slider value={theme.borderRadius} onChange={(_, v) => updateTheme('borderRadius', v as number)} min={0} max={24} step={1} sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Spacing: {theme.spacing}px</Typography>
            <Slider value={theme.spacing} onChange={(_, v) => updateTheme('spacing', v as number)} min={2} max={16} step={1} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider', bgcolor: theme.backgroundColor, color: theme.textColor, fontFamily: theme.fontFamily, minHeight: 500 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>Live Preview</Typography>
            <Divider sx={{ mb: 3 }} />
            <Card sx={{ mb: theme.spacing / 4, borderRadius: `${theme.borderRadius}px`, bgcolor: theme.backgroundColor, border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: theme.primaryColor, fontFamily: theme.fontFamily, mb: 1 }}>Sample Article Title</Typography>
                <Typography variant="body1" sx={{ fontFamily: theme.fontFamily, color: theme.textColor, lineHeight: 1.8 }}>
                  This is a preview of how your content will look with the selected theme settings.
                </Typography>
                <Button variant="contained" size="small" sx={{ mt: 2, bgcolor: theme.primaryColor, borderRadius: `${theme.borderRadius}px` }}>Read More</Button>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: `${theme.borderRadius}px`, bgcolor: theme.backgroundColor, border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: theme.secondaryColor, fontFamily: theme.fontFamily, mb: 1 }}>Secondary Element</Typography>
                <Typography variant="body2" sx={{ fontFamily: theme.fontFamily, color: theme.textColor }}>
                  This element uses the secondary color for its heading.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="outlined" size="small" sx={{ borderColor: theme.primaryColor, color: theme.primaryColor, borderRadius: `${theme.borderRadius}px` }}>Action</Button>
                  <Button variant="outlined" size="small" sx={{ borderColor: theme.secondaryColor, color: theme.secondaryColor, borderRadius: `${theme.borderRadius}px` }}>Secondary</Button>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
