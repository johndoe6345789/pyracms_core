'use client'

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
import { ArticleTagChips } from './ArticleTagChips'
import { RENDERERS, type ArticleEditorState } from '@/hooks/useArticleEditor'

interface ArticleEditorFormProps {
  editor: ArticleEditorState
  contentPlaceholder?: string
}

export function ArticleEditorForm({ editor, contentPlaceholder }: ArticleEditorFormProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField label="Title" value={editor.title} onChange={(e) => editor.setTitle(e.target.value)} fullWidth placeholder="Enter a title for your article..." />

      <TextField label="Renderer" select value={editor.renderer} onChange={(e) => editor.setRenderer(e.target.value)} sx={{ maxWidth: 200 }}>
        {RENDERERS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>

      <ViewModeToggle viewMode={editor.viewMode} setViewMode={editor.setViewMode} />

      {editor.viewMode === 'edit' ? (
        <TextField label="Content" value={editor.content} onChange={(e) => editor.setContent(e.target.value)} fullWidth multiline minRows={12} maxRows={30} placeholder={contentPlaceholder} />
      ) : (
        <ContentPreview content={editor.content} renderer={editor.renderer} />
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
  return (
    <Paper variant="outlined" sx={{ p: 3, minHeight: 300, borderColor: 'divider' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Preview ({renderer})</Typography>
      <Divider sx={{ mb: 2 }} />
      {content ? (
        <Box sx={{ '& h2': { mt: 2, mb: 1, fontWeight: 600, fontSize: '1.5rem' }, '& p': { mb: 2, lineHeight: 1.8 } }} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <Typography variant="body2" color="text.secondary">Nothing to preview yet. Start writing in the editor.</Typography>
      )}
    </Paper>
  )
}
