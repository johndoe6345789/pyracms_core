'use client'

import {
  Paper, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { FilterDate } from './FilterDate'

interface SearchFiltersProps {
  author: string
  onAuthorChange: (value: string) => void
  forum: string
  onForumChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  availableForums: string[]
}

export function SearchFilters(p: SearchFiltersProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2, display: 'flex', gap: 2, flexWrap: 'wrap',
        borderColor: 'divider',
      }}
    >
      <TextField
        label="Author"
        value={p.author}
        onChange={(e) => p.onAuthorChange(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
        data-testid="search-filter-author"
      />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Forum</InputLabel>
        <Select
          value={p.forum}
          label="Forum"
          onChange={(e) => p.onForumChange(e.target.value)}
          data-testid="search-filter-forum"
        >
          <MenuItem value="">All Forums</MenuItem>
          {p.availableForums.map((f) => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FilterDate label="Date From" value={p.dateFrom}
        testId="search-filter-date-from" onChange={p.onDateFromChange} />
      <FilterDate label="Date To" value={p.dateTo}
        testId="search-filter-date-to" onChange={p.onDateToChange} />
    </Paper>
  )
}
