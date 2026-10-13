'use client'

import { useState } from 'react'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'

/** Search box that applies its words on Enter or the search button. */
export default function VideoSearchField({
  onSearch,
}: {
  onSearch: (q: string) => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <Box
      component="form"
      role="search"
      sx={{ flex: 1, maxWidth: 560 }}
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(draft.trim())
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search videos"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        inputProps={{ 'aria-label': 'Search videos', maxLength: 200 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" aria-label="Search" edge="end">
                <SearchOutlined />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
