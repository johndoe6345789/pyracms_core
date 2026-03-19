'use client'

import { useCallback, useRef } from 'react'
import { Box, IconButton, Tooltip, Paper, Typography, TextField, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  Title,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  TableChart,
  FormatQuote,
  VerticalSplit,
  EditOutlined,
  PreviewOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: <FormatBold />, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: <FormatItalic />, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: <Title />, label: 'Heading', prefix: '## ', suffix: '' },
  { icon: <LinkIcon />, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: <ImageIcon />, label: 'Image', prefix: '![alt](', suffix: ')' },
  { icon: <Code />, label: 'Code', prefix: '```\n', suffix: '\n```' },
  { icon: <FormatListBulleted />, label: 'Bullet List', prefix: '- ', suffix: '' },
  { icon: <FormatListNumbered />, label: 'Numbered List', prefix: '1. ', suffix: '' },
  { icon: <TableChart />, label: 'Table', prefix: '| Header | Header |\n|--------|--------|\n| ', suffix: ' | Cell |' },
  { icon: <FormatQuote />, label: 'Quote', prefix: '> ', suffix: '' },
]

type ViewMode = 'edit' | 'split' | 'preview'

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const insertAtCursor = useCallback((prefix: string, suffix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`
    onChange(value.substring(0, start) + replacement + value.substring(end))
    setTimeout(() => {
      textarea.focus()
      const newPos = start + prefix.length + (selectedText ? selectedText.length : 4)
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [value, onChange])

  const showEditor = viewMode === 'edit' || viewMode === 'split'
  const showPreview = viewMode === 'preview' || viewMode === 'split'

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {TOOLBAR_ACTIONS.map((action) => (
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
            <TextField
              inputRef={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              fullWidth
              multiline
              minRows={16}
              maxRows={40}
              placeholder="Write your Markdown content here..."
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiInputBase-input': {
                  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                },
              }}
            />
          </Box>
        )}
        {showPreview && (
          <Box sx={{ flex: 1, minWidth: 0, borderLeft: showEditor ? 1 : 0, borderColor: 'divider' }}>
            <Paper sx={{ p: 3, height: '100%', overflow: 'auto', borderRadius: 0 }} elevation={0}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{
                '& h1': { fontSize: '2rem', fontWeight: 700, mt: 3, mb: 1 },
                '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 2, mb: 1 },
                '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                '& p': { mb: 2, lineHeight: 1.8 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& blockquote': { borderLeft: '3px solid', borderColor: 'divider', pl: 2, ml: 0, color: 'text.secondary' },
                '& pre': { bgcolor: '#1e293b', color: '#e2e8f0', p: 2, borderRadius: 1, overflow: 'auto' },
                '& code': { bgcolor: '#f1f5f9', px: 0.5, borderRadius: 0.5, fontSize: '0.875rem' },
                '& pre code': { bgcolor: 'transparent', p: 0 },
                '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
                '& th, & td': { border: '1px solid', borderColor: 'divider', px: 2, py: 1 },
                '& th': { bgcolor: 'background.default', fontWeight: 600 },
                '& img': { maxWidth: '100%', height: 'auto' },
                '& input[type="checkbox"]': { mr: 1 },
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*Nothing to preview yet.*'}</ReactMarkdown>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  )
}
