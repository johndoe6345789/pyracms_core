'use client'

import { useMemo, useState } from 'react'
import {
  AddOutlined,
  LocalOfferOutlined,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'

interface ArticleTagEditorProps {
  tagsInput: string
  setTagsInput: (v: string) => void
  tags: string[]
}

function normaliseTag(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function tagsToInput(tags: string[]) {
  return tags.join(', ')
}

export function ArticleTagEditor({
  tagsInput,
  setTagsInput,
  tags,
}: ArticleTagEditorProps) {
  const [draftTag, setDraftTag] = useState('')
  const tagSet = useMemo(
    () => new Set(tags.map((tag) => tag.toLowerCase())),
    [tags]
  )

  const addTag = (rawValue = draftTag) => {
    const nextTag = normaliseTag(rawValue)
    if (!nextTag || tagSet.has(nextTag.toLowerCase())) {
      setDraftTag('')
      return
    }
    setTagsInput(tagsToInput([...tags, nextTag]))
    setDraftTag('')
  }

  const addTags = (rawTags: string[]) => {
    const nextTags = [...tags]
    const nextTagSet = new Set(tagSet)

    rawTags.forEach((rawTag) => {
      const nextTag = normaliseTag(rawTag)
      const key = nextTag.toLowerCase()
      if (!nextTag || nextTagSet.has(key)) return
      nextTags.push(nextTag)
      nextTagSet.add(key)
    })

    setTagsInput(tagsToInput(nextTags))
  }

  const removeTag = (tagToRemove: string) => {
    setTagsInput(tagsToInput(
      tags.filter((tag) => tag !== tagToRemove)
    ))
  }

  const handleDraftChange = (
    value: string
  ) => {
    if (value.includes(',')) {
      const pieces = value.split(',')
      addTags(pieces.slice(0, -1))
      setDraftTag(pieces[pieces.length - 1] ?? '')
      return
    }
    setDraftTag(value)
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
      data-testid="tag-editor"
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          minHeight: 32,
          alignItems: 'center',
        }}
        role="list"
        aria-label="Article tags"
      >
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            color="primary"
            onDelete={() => removeTag(tag)}
            role="listitem"
            data-testid={`editable-tag-chip-${tag}`}
          />
        ))}
      </Box>
      <TextField
        label="Tags"
        value={draftTag}
        onChange={(e) =>
          handleDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          }
          if (
            e.key === 'Backspace'
            && !draftTag
            && tags.length > 0
          ) {
            const lastTag = tags[tags.length - 1]
            if (lastTag) {
              removeTag(lastTag)
            }
          }
        }}
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
                onClick={() => addTag()}
                disabled={!normaliseTag(draftTag)}
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
