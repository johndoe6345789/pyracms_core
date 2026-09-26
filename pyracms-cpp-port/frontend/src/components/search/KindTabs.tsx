import { Chip, Stack } from '@mui/material'
import { KIND_ORDER, kindOf } from '@/lib/search/kinds'

interface Props {
  facets: Record<string, number>
  active: string
  total: number
  onChange: (type: string) => void
}

/** Narrow the results to one kind of content; counts cover the whole site. */
export default function KindTabs({ facets, active, total, onChange }: Props) {
  const kinds = [
    ...KIND_ORDER.filter((k) => facets[k]),
    ...Object.keys(facets).filter((k) => !KIND_ORDER.includes(k) && facets[k]),
  ]
  const sum = kinds.reduce((n, k) => n + (facets[k] ?? 0), 0)
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: 'wrap' }}
      role="tablist"
      aria-label="Kind of result"
    >
      <Chip
        role="tab"
        aria-selected={active === 'all'}
        label={`All ${sum || total}`}
        color={active === 'all' ? 'primary' : 'default'}
        onClick={() => onChange('all')}
        data-testid="kind-all"
      />
      {kinds.map((k) => (
        <Chip
          key={k}
          role="tab"
          aria-selected={active === k}
          icon={kindOf(k).icon}
          label={`${kindOf(k).plural} ${facets[k]}`}
          color={active === k ? 'primary' : 'default'}
          variant={active === k ? 'filled' : 'outlined'}
          onClick={() => onChange(k)}
          data-testid={`kind-${k}`}
        />
      ))}
    </Stack>
  )
}
