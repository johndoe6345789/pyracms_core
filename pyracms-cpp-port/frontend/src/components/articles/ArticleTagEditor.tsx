'use client'

import { AddOutlined, LocalOfferOutlined } from '@mui/icons-material'
import { Box, Chip, IconButton, InputAdornment, TextField } from '@mui/material'
import { normaliseTag, useTagDraft } from './useTagDraft'
import { boxSx, listSx } from './tagEditorStyles'

interface ArticleTagEditorProps {
  tagsInput: string
  setTagsInput: (v: string) => void
  tags: string[]
}

export function ArticleTagEditor({
  tagsInput,
  setTagsInput,
  tags,
}: ArticleTagEditorProps) {
  const d = useTagDraft(tags, setTagsInput)

  return (
    <Box sx={boxSx} data-testid="tag-editor">
      <Box sx={listSx} role="list" aria-label="Article tags">
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            color="primary"
            onDelete={() => d.removeTag(tag)}
            role="listitem"
            data-testid={`editable-tag-chip-${tag}`}
          />
        ))}
      </Box>
      <TextField
        label="Tags"
        value={d.draftTag}
        onChange={(e) => d.handleDraftChange(e.target.value)}
        onKeyDown={d.handleKeyDown}
        fullWidth
        placeholder={tagsInput ? 'Add tag' : 'Tags'}
        data-testid="tags-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocalOfferOutlined fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Add tag"
                edge="end"
                onClick={() => d.addTag()}
                disabled={!normaliseTag(d.draftTag)}
                data-testid="add-tag-btn"
              >
                <AddOutlined />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
