'use client'

import { useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import TargetOption from './TargetOption'
import { ROUTE_FORMAT_HELP, validateRoute } from '@/lib/routeSuggest'
import type { MenuTarget } from '@/lib/menuTargets'
import { matchTargets, opensText, targetTitle } from '@/lib/menuTargetSearch'

interface Props {
  value: string
  targets: MenuTarget[]
  slug: string
  onChange: (route: string) => void
}

const looksLikeRoute = (t: string) => /^(\/|https?:\/\/|mailto:)/i.test(t)

/**
 * "Link to": pick a page, photo album, tag or site section by its title, or
 * type any path (/about) or outside link (https://...). Suggestions narrow
 * as you type, are grouped by kind, and the box says where the link opens.
 */
export default function TargetField({ value, targets, slug, onChange }: Props) {
  const [query, setQuery] = useState(value ? targetTitle(targets, value) : '')
  const problem = looksLikeRoute(query) ? validateRoute(query) : ''
  const hint = value
    ? `${targetTitle(targets, value)}: ${opensText(slug, value)}`
    : ROUTE_FORMAT_HELP
  return (
    <Autocomplete<MenuTarget, false, false, true>
      freeSolo
      autoHighlight
      options={matchTargets(targets, query)}
      filterOptions={(o) => o}
      inputValue={query}
      groupBy={(o) => o.group}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
      onInputChange={(_, text) => {
        setQuery(text)
        onChange(looksLikeRoute(text) ? text.trim() : '')
      }}
      onChange={(_, o) => {
        if (o && typeof o !== 'string') onChange(o.value)
      }}
      renderOption={(props, o) => (
        <li {...props} key={o.value}>
          <TargetOption option={o} />
        </li>
      )}
      renderInput={({ InputLabelProps: il, ...params }) => (
        <TextField
          {...params}
          slotProps={{ inputLabel: { ...il, className: il.className ?? '' } }}
          size="medium"
          label="Link to"
          placeholder="Start typing a page, album or tag..."
          error={!!problem}
          helperText={problem || hint}
          inputProps={{
            ...params.inputProps,
            'data-testid': 'menu-target-input',
          }}
        />
      )}
    />
  )
}
