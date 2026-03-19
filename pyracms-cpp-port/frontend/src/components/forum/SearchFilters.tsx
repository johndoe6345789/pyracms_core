'use client'

import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'

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

export function SearchFilters({
  author,
  onAuthorChange,
  forum,
  onForumChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  availableForums,
}: SearchFiltersProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        borderColor: 'divider',
      }}
    >
      <TextField
        label="Author"
        value={author}
        onChange={(e) => onAuthorChange(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
        data-testid="search-filter-author"
      />
      <FormControl
        size="small"
        sx={{ minWidth: 180 }}
      >
        <InputLabel>Forum</InputLabel>
        <Select
          value={forum}
          label="Forum"
          onChange={(e) => onForumChange(e.target.value)}
          data-testid="search-filter-forum"
        >
          <MenuItem value="">All Forums</MenuItem>
          {availableForums.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Date From"
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
        data-testid="search-filter-date-from"
      />
      <TextField
        label="Date To"
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
        data-testid="search-filter-date-to"
      />
    </Paper>
  )
}
