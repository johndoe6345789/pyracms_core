'use client'

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onLanguageChange: (
    language: string,
  ) => void
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  {
    value: 'javascript',
    label: 'JavaScript',
  },
  {
    value: 'typescript',
    label: 'TypeScript',
  },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'shell', label: 'Shell' },
]

function detectLanguage(
  code: string,
): string | null {
  if (
    code.includes('def ')
    && code.includes('print(')
  ) {
    return 'python'
  }
  if (
    code.includes('function ')
    || code.includes('const ')
    || code.includes('=>')
  ) {
    return 'javascript'
  }
  if (
    code.includes('#include')
    || code.includes('std::')
  ) {
    return 'cpp'
  }
  if (
    code.includes('fn ')
    && code.includes('let mut ')
  ) {
    return 'rust'
  }
  if (
    code.includes('func ')
    && code.includes('package ')
  ) {
    return 'go'
  }
  if (
    code.includes('public class')
    || code.includes('System.out')
  ) {
    return 'java'
  }
  return null
}

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const handleEditorChange = (
    newValue: string | undefined,
  ) => {
    const val = newValue ?? ''
    onChange(val)
    if (
      language === 'plaintext'
      && val.length > 20
    ) {
      const detected =
        detectLanguage(val)
      if (detected) {
        onLanguageChange(detected)
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
      data-testid="code-editor"
    >
      <FormControl
        size="small"
        sx={{ maxWidth: 200 }}
      >
        <InputLabel>
          Language
        </InputLabel>
        <Select
          value={language}
          label="Language"
          onChange={(e) =>
            onLanguageChange(
              e.target.value,
            )
          }
          data-testid={
            'code-editor-language'
          }
        >
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.value}
              value={lang.value}
            >
              {lang.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Editor
          height="400px"
          language={language}
          value={value}
          onChange={
            handleEditorChange
          }
          theme="vs-dark"
          options={{
            minimap: {
              enabled: false,
            },
            wordWrap: 'off',
            lineNumbers: 'on',
            fontSize: 14,
            scrollBeyondLastLine:
              false,
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </Box>
    </Box>
  )
}

export { LANGUAGES, detectLanguage }
