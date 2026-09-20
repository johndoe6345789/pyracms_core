'use client'

import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import {
  ROUTE_FORMAT_HELP,
  suggestRoutes,
  validateRoute,
  type RouteSuggestion,
} from '@/lib/routeSuggest'

interface Props {
  value: string
  onChange: (value: string) => void
  testId: string
  minWidth?: number
  fullWidth?: boolean
}

/**
 * Route / URL input: suggests site pages as you type, states the expected
 * format and flags a value that will not work.
 */
export default function RouteField(p: Props) {
  const error = validateRoute(p.value)
  return (
    <Autocomplete<RouteSuggestion, false, false, true>
      freeSolo
      autoHighlight
      options={suggestRoutes(p.value)}
      filterOptions={(o) => o}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.value)}
      inputValue={p.value}
      onInputChange={(_, v) => p.onChange(v)}
      sx={{
        minWidth: p.minWidth ?? 260,
        ...(p.fullWidth && { width: '100%' }),
      }}
      data-testid={p.testId}
      renderOption={(props, o) => (
        <Box component="li" {...props} key={o.value}>
          <Typography sx={{ fontFamily: 'monospace', mr: 1.5 }}>
            {o.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {o.hint}
          </Typography>
        </Box>
      )}
      renderInput={({ InputLabelProps: il, ...params }) => (
        <TextField
          {...params}
          slotProps={{ inputLabel: { ...il, className: il.className ?? '' } }}
          size="small"
          label="Route / URL"
          placeholder="/articles or https://…"
          error={!!error}
          helperText={error || ROUTE_FORMAT_HELP}
        />
      )}
    />
  )
}
