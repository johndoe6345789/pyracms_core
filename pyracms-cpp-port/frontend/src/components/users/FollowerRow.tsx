import { ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material'

export interface FollowUser {
  userId: number
  username: string
  avatarUrl: string
  createdAt: string
}

export function FollowerRow({ u }: { u: FollowUser }) {
  return (
    <ListItem
      component="a"
      href={`../../users/${u.username}`}
      sx={{ textDecoration: 'none', color: 'inherit' }}
      data-testid={`follower-${u.username}`}
    >
      <ListItemAvatar>
        <Avatar src={u.avatarUrl}>{u.username[0]?.toUpperCase()}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={u.username}
        secondary={'Since ' + new Date(u.createdAt).toLocaleDateString()}
      />
    </ListItem>
  )
}
