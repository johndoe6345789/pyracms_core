'use client'

import { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  MoreVertOutlined,
  PushPinOutlined,
  LockOutlined,
  LockOpenOutlined,
  DriveFileMoveOutlined,
  DeleteOutlined,
} from '@mui/icons-material'

interface ThreadActionsProps {
  threadId: string
  isPinned: boolean
  isLocked: boolean
  isModerator: boolean
  forums?: { id: string; name: string }[]
  onPin?: () => void
  onLock?: () => void
  onMove?: (forumId: string) => void
  onDelete?: () => void
}

export function ThreadActions({
  threadId,
  isPinned,
  isLocked,
  isModerator,
  forums = [],
  onPin,
  onLock,
  onMove,
  onDelete,
}: ThreadActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveTargetForum, setMoveTargetForum] = useState('')

  if (!isModerator) return null

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handlePin = () => {
    onPin?.()
    handleMenuClose()
  }

  const handleLock = () => {
    onLock?.()
    handleMenuClose()
  }

  const handleMoveClick = () => {
    handleMenuClose()
    setMoveDialogOpen(true)
  }

  const handleMoveConfirm = () => {
    if (moveTargetForum) {
      onMove?.(moveTargetForum)
    }
    setMoveDialogOpen(false)
    setMoveTargetForum('')
  }

  const handleDeleteClick = () => {
    handleMenuClose()
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete?.()
    setDeleteDialogOpen(false)
  }

  const placeholderForums = forums.length > 0 ? forums : [
    { id: 'general', name: 'General Discussion' },
    { id: 'tech', name: 'Technology' },
    { id: 'help', name: 'Help & Support' },
    { id: 'off-topic', name: 'Off Topic' },
  ]

  return (
    <>
      <IconButton size="small" onClick={handleMenuOpen}>
        <MoreVertOutlined />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handlePin}>
          <ListItemIcon><PushPinOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>{isPinned ? 'Unpin Thread' : 'Pin Thread'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLock}>
          <ListItemIcon>
            {isLocked ? <LockOpenOutlined fontSize="small" /> : <LockOutlined fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isLocked ? 'Unlock Thread' : 'Lock Thread'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoveClick}>
          <ListItemIcon><DriveFileMoveOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Move Thread</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlined fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete Thread</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)}>
        <DialogTitle>Move Thread</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the forum to move this thread to:
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel>Target Forum</InputLabel>
            <Select value={moveTargetForum} label="Target Forum" onChange={(e) => setMoveTargetForum(e.target.value)}>
              {placeholderForums.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMoveConfirm} variant="contained" disabled={!moveTargetForum}>Move</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Thread</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this thread? This action cannot be undone.
            All posts within this thread will also be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
