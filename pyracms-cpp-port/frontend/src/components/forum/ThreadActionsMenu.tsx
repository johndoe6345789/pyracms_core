'use client'

import {
  Menu, MenuItem, ListItemIcon,
  ListItemText, Divider,
} from '@mui/material'
import {
  PushPinOutlined, LockOutlined,
  LockOpenOutlined, DriveFileMoveOutlined,
  DeleteOutlined,
} from '@mui/icons-material'

interface ThreadActionsMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  isPinned: boolean
  isLocked: boolean
  onPin: () => void
  onLock: () => void
  onMove: () => void
  onDelete: () => void
}

export function ThreadActionsMenu({
  anchorEl, onClose, isPinned, isLocked,
  onPin, onLock, onMove, onDelete,
}: ThreadActionsMenuProps) {
  const lockIcon = isLocked
    ? <LockOpenOutlined fontSize="small" />
    : <LockOutlined fontSize="small" />

  return (
    <Menu anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}>
      <MenuItem onClick={onPin}
        data-testid="thread-action-pin">
        <ListItemIcon>
          <PushPinOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          {isPinned ? 'Unpin' : 'Pin'} Thread
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onLock}
        data-testid="thread-action-lock">
        <ListItemIcon>{lockIcon}</ListItemIcon>
        <ListItemText>
          {isLocked ? 'Unlock' : 'Lock'} Thread
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onMove}
        data-testid="thread-action-move">
        <ListItemIcon>
          <DriveFileMoveOutlined
            fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Move Thread
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onDelete}
        sx={{ color: 'error.main' }}
        data-testid="thread-action-delete">
        <ListItemIcon>
          <DeleteOutlined fontSize="small"
            color="error" />
        </ListItemIcon>
        <ListItemText>
          Delete Thread
        </ListItemText>
      </MenuItem>
    </Menu>
  )
}
