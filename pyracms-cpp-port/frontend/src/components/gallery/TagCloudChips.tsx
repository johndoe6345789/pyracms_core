import Link from 'next/link'
import { Box } from '@mui/material'
import type { TagCloudViewItem } from '@/hooks/useTagCloudPage'

function usage(t: TagCloudViewItem) {
  const parts = []
  if (t.articles)
    parts.push(`${t.articles} article${t.articles === 1 ? '' : 's'}`)
  if (t.snippets)
    parts.push(`${t.snippets} snippet${t.snippets === 1 ? '' : 's'}`)
  return parts.join(', ')
}

/** A real tag cloud: common tags are bigger, bolder and stronger. */
export default function TagCloudChips({
  items,
}: {
  items: TagCloudViewItem[]
}) {
  return (
    <Box
      component="ul"
      aria-label="Tag cloud"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: '6px 22px',
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
    >
      {items.map((tag) => (
        <li key={tag.name}>
          <Link
            href={tag.href}
            data-testid={`tag-cloud-chip-${tag.name}`}
            title={usage(tag)}
            style={{
              fontSize: tag.fontSize,
              fontWeight: tag.weight > 0.6 ? 700 : 500,
              opacity: 0.55 + tag.weight * 0.45,
              color: 'inherit',
              textDecoration: 'none',
              lineHeight: 1.25,
            }}
          >
            {tag.name}
            <sup style={{ fontSize: '0.5em', marginLeft: 2, opacity: 0.7 }}>
              {tag.count}
            </sup>
          </Link>
        </li>
      ))}
    </Box>
  )
}
