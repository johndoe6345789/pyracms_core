'use client'

import { useEffect, useState } from 'react'
import { IconButton, InputBase, Paper } from '@mui/material'
import { ClearOutlined, SearchOutlined } from '@mui/icons-material'

interface Props {
  value: string
  onSubmit: (q: string) => void
  autoFocus?: boolean
}

/** The big search field at the top of the results page. */
export default function SearchBox({ value, onSubmit, autoFocus }: Props) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])

  return (
    <Paper
      component="form"
      role="search"
      variant="outlined"
      data-testid="search-box"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim()) onSubmit(text)
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.5,
        borderRadius: 8,
        borderWidth: 2,
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    >
      <SearchOutlined color="action" />
      <InputBase
        fullWidth
        autoFocus={autoFocus ?? false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search articles, code, photos, forum..."
        inputProps={{ 'aria-label': 'Search', 'data-testid': 'search-input' }}
        sx={{ fontSize: '1.15rem', py: 1 }}
      />
      {text && (
        <IconButton
          size="small"
          aria-label="Clear search"
          onClick={() => setText('')}
        >
          <ClearOutlined fontSize="small" />
        </IconButton>
      )}
    </Paper>
  )
}
