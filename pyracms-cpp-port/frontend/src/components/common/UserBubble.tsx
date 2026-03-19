'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Avatar, Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Chip,
} from '@mui/material'
import {
  PersonOutlined, LoginOutlined, LogoutOutlined, DashboardOutlined, SettingsOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import type { RootState } from '@/store/store'

export default function UserBubble() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch(logout())
    setAnchorEl(null)
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <Chip
        icon={<PersonOutlined />}
        label="Guest"
        variant="outlined"
        size="small"
        component={Link}
        href="/auth/login"
        clickable
        sx={{ borderColor: 'divider', color: 'text.secondary' }}
      />
    )
  }

  const initials = user?.username?.charAt(0).toUpperCase() || '?'

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.username}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href="/dashboard" onClick={() => setAnchorEl(null)}>
          <ListItemIcon><DashboardOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/auth/login" onClick={() => setAnchorEl(null)}>
          <ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
