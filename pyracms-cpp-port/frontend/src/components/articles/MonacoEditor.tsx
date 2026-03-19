'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Typography,
  Divider,
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatQuote,
  Link as LinkIcon,
  Image as ImageIcon,
  TableChart,
  Title,
  VerticalSplit,
  EditOutlined,
  PreviewOutlined,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  autoSaveKey?: string
}

type ViewMode = 'edit' | 'split' | 'preview'

const LANGUAGE_MAP: Record<string, string> = {
  HTML: 'html',
  Markdown: 'markdown',
  BBCode: 'plaintext',
  RST: 'plaintext',
}

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix: string
}

function getToolbarActions(language: string): ToolbarAction[] {
  if (language === 'markdown' || language === 'Markdown') {
    return [
      { icon: <FormatBold />, label: 'Bold', prefix: '**', suffix: '**' },
      { icon: <FormatItalic />, label: 'Italic', prefix: '_', suffix: '_' },
      { icon: <Title />, label: 'Heading', prefix: '## ', suffix: '' },
      { icon: <LinkIcon />, label: 'Link', prefix: '[', suffix: '](url)' },
      { icon: <ImageIcon />, label: 'Image', prefix: '![alt](', suffix: ')' },
      { icon: <Code />, label: 'Code', prefix: '```\n', suffix: '\n```' },
      { icon: <FormatListBulleted />, label: 'List', prefix: '- ', suffix: '' },
      { icon: <FormatQuote />, label: 'Quote', prefix: '> ', suffix: '' },
      { icon: <TableChart />, label: 'Table', prefix: '| Header | Header |\n|--------|--------|\n| ', suffix: ' | Cell |' },
    ]
  }
  if (language === 'html' || language === 'HTML') {
    return [
      { icon: <FormatBold />, label: 'Bold', prefix: '<strong>', suffix: '</strong>' },
      { icon: <FormatItalic />, label: 'Italic', prefix: '<em>', suffix: '</em>' },
      { icon: <Title />, label: 'Heading', prefix: '<h2>', suffix: '</h2>' },
      { icon: <LinkIcon />, label: 'Link', prefix: '<a href="url">', suffix: '</a>' },
      { icon: <ImageIcon />, label: 'Image', prefix: '<img src="', suffix: '" alt="" />' },
      { icon: <Code />, label: 'Code', prefix: '<pre><code>', suffix: '</code></pre>' },
      { icon: <FormatListBulleted />, label: 'List', prefix: '<ul>\n  <li>', suffix: '</li>\n</ul>' },
      { icon: <FormatListNumbered />, label: 'Ordered List', prefix: '<ol>\n  <li>', suffix: '</li>\n</ol>' },
      { icon: <FormatQuote />, label: 'Quote', prefix: '<blockquote>', suffix: '</blockquote>' },
    ]
  }
  return [
    { icon: <FormatBold />, label: 'Bold', prefix: '[b]', suffix: '[/b]' },
    { icon: <FormatItalic />, label: 'Italic', prefix: '[i]', suffix: '[/i]' },
    { icon: <LinkIcon />, label: 'Link', prefix: '[url=', suffix: ']link text[/url]' },
    { icon: <Code />, label: 'Code', prefix: '[code]', suffix: '[/code]' },
    { icon: <FormatQuote />, label: 'Quote', prefix: '[quote]', suffix: '[/quote]' },
  ]
}

export function MonacoEditorComponent({ value, onChange, language, autoSaveKey }: MonacoEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')

  const monacoLang = LANGUAGE_MAP[language] ?? 'plaintext'
  const toolbarActions = getToolbarActions(language)

  // Auto-save to localStorage
  useEffect(() => {
    if (!autoSaveKey) return
    const timer = setTimeout(() => {
      localStorage.setItem(`autosave-${autoSaveKey}`, value)
    }, 1000)
    return () => clearTimeout(timer)
  }, [value, autoSaveKey])

  // Restore from localStorage on mount
  useEffect(() => {
    if (!autoSaveKey) return
    const saved = localStorage.getItem(`autosave-${autoSaveKey}`)
    if (saved && !value) {
      onChange(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey])

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const insertAtCursor = useCallback((prefix: string, suffix: string) => {
    const editor = editorRef.current
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    const selectedText = editor.getModel()?.getValueInRange(selection) ?? ''
    const replacement = `${prefix}${selectedText}${suffix}`
    editor.executeEdits('toolbar', [{ range: selection, text: replacement }])
    editor.focus()
  }, [])

  const showEditor = viewMode === 'edit' || viewMode === 'split'
  const showPreview = viewMode === 'preview' || viewMode === 'split'

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {toolbarActions.map((action) => (
            <Tooltip key={action.label} title={action.label}>
              <IconButton size="small" onClick={() => insertAtCursor(action.prefix, action.suffix)}>
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small">
          <ToggleButton value="edit"><EditOutlined sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="split"><VerticalSplit sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="preview"><PreviewOutlined sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', minHeight: 400 }}>
        {showEditor && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Editor
              height="400px"
              language={monacoLang}
              value={value}
              onChange={(v) => onChange(v ?? '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </Box>
        )}
        {showPreview && (
          <Box sx={{ flex: 1, minWidth: 0, borderLeft: showEditor ? 1 : 0, borderColor: 'divider' }}>
            <Paper sx={{ p: 3, height: '100%', overflow: 'auto', borderRadius: 0 }} elevation={0}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Preview ({language})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {value ? (
                <Box dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} sx={{ '& h2': { mt: 2, mb: 1, fontWeight: 600, fontSize: '1.5rem' }, '& p': { mb: 2, lineHeight: 1.8 } }} />
              ) : (
                <Typography variant="body2" color="text.secondary">Nothing to preview yet.</Typography>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  )
}
