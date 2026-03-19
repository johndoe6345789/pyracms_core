'use client'

import { useState, useEffect } from 'react'
import {
  List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Typography,
  Button, Box, Paper,
} from '@mui/material'
import api from '@/lib/api'
import AnimatedList from
  '@/components/common/AnimatedList'

interface FollowUser {
  userId: number; username: string
  avatarUrl: string; createdAt: string
}
interface FollowerListProps {
  userId: number
  type: 'followers' | 'following'
}

export function FollowerList({
  userId, type,
}: FollowerListProps) {
  const [users, setUsers] =
    useState<FollowUser[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    (async () => {
      try {
        const url = `/api/users/${userId}`
          + `/${type}?limit=${limit}`
          + `&offset=${offset}`
        const res = await api.get(url)
        const items = res.data.items || []
        setUsers((p) => offset === 0
          ? items : [...p, ...items])
        setTotal(res.data.total || 0)
      } catch { /* ignore */ }
    })()
  }, [userId, type, offset])

  if (!users.length) return (
    <Paper variant="outlined"
      sx={{ p: 4, textAlign: 'center' }}
      data-testid="follower-list-empty">
      <Typography color="text.secondary">
        No {type} yet
      </Typography>
    </Paper>
  )

  return (
    <Box data-testid="follower-list">
      <Typography variant="subtitle2"
        color="text.secondary" sx={{ mb: 2 }}>
        {total} {type}
      </Typography>
      <List>
        <AnimatedList>
          {users.map((u) => (
            <ListItem key={u.userId}
              component="a"
              href={`../../users/${u.username}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
              }}
              data-testid={
                `follower-${u.username}`}>
              <ListItemAvatar>
                <Avatar src={u.avatarUrl}>
                  {u.username[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={u.username}
                secondary={'Since ' + new Date(
                  u.createdAt,
                ).toLocaleDateString()} />
            </ListItem>
          ))}
        </AnimatedList>
      </List>
      {users.length < total && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            data-testid="load-more-followers"
            onClick={() =>
              setOffset((p) => p + limit)}>
            Load more
          </Button>
        </Box>
      )}
    </Box>
  )
}
