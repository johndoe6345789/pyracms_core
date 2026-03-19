'use client'

import { useState } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { EditOutlined, PreviewOutlined } from '@mui/icons-material'
import DOMPurify from 'dompurify'
import { ArticleTagChips } from './ArticleTagChips'
import { RENDERERS, type ArticleEditorState } from '@/hooks/useArticleEditor'
import { EditorModeSelector, type EditorMode } from './EditorModeSelector'
import { MonacoEditorComponent } from './MonacoEditor'
import { RichTextEditor } from './RichTextEditor'
import { BBCodeEditor } from './BBCodeEditor'
import { MarkdownEditor } from './MarkdownEditor'

interface ArticleEditorFormProps {
  editor: ArticleEditorState
  contentPlaceholder?: string
}

export function ArticleEditorForm({ editor, contentPlaceholder }: ArticleEditorFormProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>('monaco')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField label="Title" value={editor.title} onChange={(e) => editor.setTitle(e.target.value)} fullWidth placeholder="Enter a title for your article..." />

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Renderer" select value={editor.renderer} onChange={(e) => editor.setRenderer(e.target.value)} sx={{ maxWidth: 200 }}>
          {RENDERERS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>
        <EditorModeSelector mode={editorMode} onModeChange={setEditorMode} />
      </Box>

      {editorMode === 'monaco' && (
        <>
          <ViewModeToggle viewMode={editor.viewMode} setViewMode={editor.setViewMode} />
          {editor.viewMode === 'edit' ? (
            <MonacoEditorComponent
              value={editor.content}
              onChange={editor.setContent}
              language={editor.renderer}
              autoSaveKey="article-editor"
            />
          ) : (
            <ContentPreview content={editor.content} renderer={editor.renderer} />
          )}
        </>
      )}

      {editorMode === 'wysiwyg' && (
        <RichTextEditor value={editor.content} onChange={editor.setContent} />
      )}

      {editorMode === 'bbcode' && (
        <BBCodeEditor value={editor.content} onChange={editor.setContent} />
      )}

      {editorMode === 'markdown' && (
        <MarkdownEditor value={editor.content} onChange={editor.setContent} />
      )}

      <TextField label="Tags (comma-separated)" value={editor.tagsInput} onChange={(e) => editor.setTagsInput(e.target.value)} fullWidth helperText="Separate tags with commas" />
      {editor.parsedTags.length > 0 && <ArticleTagChips tags={editor.parsedTags} color="primary" />}

      <TextField label="Revision Summary" value={editor.summary} onChange={(e) => editor.setSummary(e.target.value)} fullWidth placeholder="Briefly describe your changes..." />
    </Box>
  )
}

function ViewModeToggle({ viewMode, setViewMode }: { viewMode: 'edit' | 'preview'; setViewMode: (v: 'edit' | 'preview') => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small">
        <ToggleButton value="edit"><EditOutlined sx={{ mr: 0.5, fontSize: 18 }} />Edit</ToggleButton>
        <ToggleButton value="preview"><PreviewOutlined sx={{ mr: 0.5, fontSize: 18 }} />Preview</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

function ContentPreview({ content, renderer }: { content: string; renderer: string }) {
  const sanitized = DOMPurify.sanitize(content)
  return (
    <Paper variant="outlined" sx={{ p: 3, minHeight: 300, borderColor: 'divider' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Preview ({renderer})</Typography>
      <Divider sx={{ mb: 2 }} />
      {content ? (
        <Box sx={{ '& h2': { mt: 2, mb: 1, fontWeight: 600, fontSize: '1.5rem' }, '& p': { mb: 2, lineHeight: 1.8 } }} dangerouslySetInnerHTML={{ __html: sanitized }} />
      ) : (
        <Typography variant="body2" color="text.secondary">Nothing to preview yet. Start writing in the editor.</Typography>
      )}
    </Paper>
  )
}
