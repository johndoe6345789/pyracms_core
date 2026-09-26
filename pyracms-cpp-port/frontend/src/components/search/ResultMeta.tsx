import { Typography } from '@mui/material'
import { dayOf } from '@/lib/dates'
import { kindOf } from '@/lib/search/kinds'
import type { SearchHit } from '@/lib/search/types'

/** "Article · by rog · 2014-01-21" under a result's title. */
export default function ResultMeta({ hit }: { hit: SearchHit }) {
  const bits = [
    kindOf(hit.type).label,
    hit.author && `by ${hit.author}`,
    dayOf(hit.createdAt),
  ].filter(Boolean)
  return (
    <Typography variant="caption" color="text.secondary">
      {bits.join(' · ')}
    </Typography>
  )
}
