import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

export function ActivityFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Filter</InputLabel>
      <Select
        value={value}
        label="Filter"
        data-testid="activity-filter"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="forum_post">Posts</MenuItem>
        <MenuItem value="article">Articles</MenuItem>
        <MenuItem value="snippet">Snippets</MenuItem>
      </Select>
    </FormControl>
  )
}
