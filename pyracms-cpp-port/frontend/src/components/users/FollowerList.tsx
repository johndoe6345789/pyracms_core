'use client'

import { useState, useEffect } from 'react'
import {
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography,
  Button, Box, Paper,
} from '@mui/material'
import api from '@/lib/api'
import AnimatedList from '@/components/common/AnimatedList'

interface FollowUser {
  userId: number
  username: string
  avatarUrl: string
  createdAt: string
}

interface FollowerListProps {
  userId: number
  type: 'followers' | 'following'
}

export function FollowerList({ userId, type }: FollowerListProps) {
  const [users, setUsers] = useState<FollowUser[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/${type}?limit=${limit}&offset=${offset}`)
        setUsers(prev => offset === 0 ? (res.data.items || []) : [...prev, ...(res.data.items || [])])
        setTotal(res.data.total || 0)
      } catch { /* ignore */ }
    }
    fetchUsers()
  }, [userId, type, offset])

  if (users.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No {type} yet
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        {total} {type}
      </Typography>
      <List>
        <AnimatedList>
          {users.map((u) => (
            <ListItem
              key={u.userId}
              component="a"
              href={`../../users/${u.username}`}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemAvatar>
                <Avatar src={u.avatarUrl}>{u.username[0]?.toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={u.username}
                secondary={`Since ${new Date(u.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </AnimatedList>
      </List>
      {users.length < total && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setOffset(prev => prev + limit)}>Load more</Button>
        </Box>
      )}
    </>
  )
}
