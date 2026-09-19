'use client'

import NextLink from 'next/link'
import { Button, ListItem, ListItemText, IconButton, Link } from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import { safeHref } from '@/lib/safeUrl'
import type { useNotificationPage } from '@/hooks/useNotificationPage'

type Page = ReturnType<typeof useNotificationPage>

interface Props {
  n: Page['items'][number]
  markRead: Page['markRead']
  remove: Page['remove']
}

export default function NotificationRow({ n, markRead, remove }: Props) {
  const href = safeHref(n.link)
  return (
    <ListItem
      divider
      data-testid={`note-${n.id}`}
      secondaryAction={
        <IconButton aria-label="Delete" onClick={() => remove(n.id)}>
          <DeleteOutline />
        </IconButton>
      }
    >
      <ListItemText
        primary={
          href ? (
            <Link component={NextLink} href={href}>
              {n.title}
            </Link>
          ) : (
            n.title
          )
        }
        secondary={n.message}
        primaryTypographyProps={{ fontWeight: n.is_read ? 400 : 700 }}
      />
      {!n.is_read && (
        <Button size="small" onClick={() => markRead(n.id)} sx={{ mr: 4 }}>
          Mark read
        </Button>
      )}
    </ListItem>
  )
}
