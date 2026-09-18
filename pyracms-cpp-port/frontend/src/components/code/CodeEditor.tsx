'use client'

import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Editor from '@monaco-editor/react'
import { detectLanguage, LANGUAGES } from './languages'
import { LanguageSelect } from './LanguageSelect'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onLanguageChange?: (language: string) => void
  readOnly?: boolean
  height?: string
}

export function CodeEditor({
  value, onChange, language, onLanguageChange,
  readOnly = false, height = '400px',
}: CodeEditorProps) {
  const theme = useTheme()
  const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light'
  const handleEditorChange = (newValue: string | undefined) => {
    const val = newValue ?? ''
    onChange(val)
    if (language === 'plaintext' && val.length > 20) {
      const detected = detectLanguage(val)
      if (detected) onLanguageChange?.(detected)
    }
  }

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      data-testid="code-editor"
    >
      {onLanguageChange && !readOnly && (
        <LanguageSelect value={language} onChange={onLanguageChange} />
      )}
      <Box sx={{
        border: 1, borderColor: 'divider', borderRadius: 1,
        overflow: 'hidden',
      }}>
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={handleEditorChange}
          loading="Loading editor..."
          theme={monacoTheme}
          options={{
            minimap: { enabled: false },
            wordWrap: 'off',
            lineNumbers: 'on',
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            readOnly,
          }}
        />
      </Box>
    </Box>
  )
}

export { LANGUAGES, detectLanguage }
