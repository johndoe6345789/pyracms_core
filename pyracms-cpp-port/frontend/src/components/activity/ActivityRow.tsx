'use client'

import NextLink from 'next/link'
import { Box, Chip, Divider, Link, ListItem, ListItemText } from '@mui/material'
import { safeHref } from '@/lib/safeUrl'
import type { SiteActivity } from '@/hooks/useSiteActivity'

/** One entry of the recent-activity list. */
export default function ActivityRow({
  a,
  first,
}: {
  a: SiteActivity
  first: boolean
}) {
  const href = safeHref(a.link)
  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      {!first && <Divider component="div" />}
      <ListItem
        component="div"
        disableGutters
        sx={{ py: 1.25, alignItems: 'flex-start', gap: 1.5 }}
        data-testid={`activity-${a.id}`}
      >
        <Chip
          size="small"
          variant="outlined"
          label={a.type}
          sx={{ mt: 0.25, minWidth: 72 }}
        />
        <ListItemText
          sx={{ m: 0 }}
          primary={
            href ? (
              <Link
                component={NextLink}
                href={href}
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                {a.title}
              </Link>
            ) : (
              a.title
            )
          }
          secondary={`${a.actor} · ${new Date(a.createdAt).toLocaleString()}`}
        />
      </ListItem>
    </Box>
  )
}
