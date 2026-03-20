import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'

interface SearchFilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder: string
  filterTag: string
  onFilterTagChange: (v: string) => void
  availableTags: string[]
  sortBy: string
  onSortByChange: (v: string) => void
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  filterTag,
  onFilterTagChange,
  availableTags,
  sortBy,
  onSortByChange,
}: SearchFilterBarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
      <TextField
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ flexGrow: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Filter by Tag</InputLabel>
        <Select
          value={filterTag}
          label="Filter by Tag"
          onChange={(e) => onFilterTagChange(e.target.value)}
        >
          <MenuItem value="">All Tags</MenuItem>
          {availableTags.map((tag) => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          label="Sort By"
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <MenuItem value="votes">Most Voted</MenuItem>
          <MenuItem value="views">Most Viewed</MenuItem>
          <MenuItem value="date">Newest</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
