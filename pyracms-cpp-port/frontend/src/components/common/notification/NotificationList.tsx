'use client'

import {
  List, ListItem, ListItemIcon,
  ListItemText, Box, Typography,
  CircularProgress,
} from '@mui/material'
import {
  ReplyOutlined, ThumbUpOutlined,
  CommentOutlined, InfoOutlined,
  GavelOutlined,
} from '@mui/icons-material'

export interface Notification {
  id: number; type: string
  title: string; message: string
  link: string | null; is_read: boolean
  created_at: string
}

const icons: Record<string, React.ReactNode> = {
  reply: <ReplyOutlined fontSize="small" />,
  vote: <ThumbUpOutlined fontSize="small" />,
  comment: <CommentOutlined fontSize="small" />,
  system: <InfoOutlined fontSize="small" />,
  moderation: <GavelOutlined fontSize="small" />,
  mention: <CommentOutlined fontSize="small" />,
}

interface Props {
  notifications: Notification[]
  loading: boolean
  isAuthenticated: boolean
  onMarkRead: (id: number) => void
}

export default function NotificationList({
  notifications: ns, loading,
  isAuthenticated, onMarkRead,
}: Props) {
  if (!isAuthenticated) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">
        Sign in to see notifications
      </Typography></Box>)
  if (loading) return (
    <Box sx={{ display: 'flex',
      justifyContent: 'center', p: 4 }}>
      <CircularProgress /></Box>)
  if (ns.length === 0) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">
        No notifications
      </Typography></Box>)

  return (
    <List dense sx={{ p: 0 }}>
      {ns.map((n) => (
        <ListItem key={n.id}
          onClick={() => onMarkRead(n.id)}
          data-testid={
            `notification-item-${n.id}`}
          sx={{ cursor: 'pointer',
            bgcolor: n.is_read
              ? 'transparent'
              : 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected' } }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {icons[n.type] || icons.system}
          </ListItemIcon>
          <ListItemText primary={n.title}
            secondary={n.message}
            primaryTypographyProps={{
              fontWeight: n.is_read ? 400 : 600,
              fontSize: 14 }}
            secondaryTypographyProps={{
              fontSize: 12, noWrap: true }} />
        </ListItem>))}
    </List>
  )
}
