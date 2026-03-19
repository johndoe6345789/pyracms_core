'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Avatar, Box, Typography, IconButton,
  Menu, MenuItem, ListItemIcon,
  ListItemText, Divider, Chip,
} from '@mui/material'
import {
  PersonOutlined, LogoutOutlined,
  DashboardOutlined, SettingsOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import type { RootState } from '@/store/store'

export default function UserBubble() {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const slug = (params.slug as string) || 'demo'
  const { user, isAuthenticated } = useSelector(
    (s: RootState) => s.auth)
  const [el, setEl] =
    useState<null | HTMLElement>(null)
  const doLogout = () => {
    localStorage.removeItem('token')
    dispatch(logout())
    setEl(null); router.push('/')
  }
  if (!isAuthenticated) return (
    <Chip icon={<PersonOutlined />}
      label="Guest" variant="outlined"
      size="small" component={Link}
      href="/auth/login" clickable
      data-testid="guest-login-link"
      sx={{ borderColor: 'divider',
        color: 'text.secondary' }} />)
  const init =
    user?.username?.charAt(0).toUpperCase()
    || '?'
  return (<>
    <IconButton
      onClick={(e) => setEl(e.currentTarget)}
      sx={{ p: 0.5 }} aria-label="User menu"
      data-testid="user-bubble-btn">
      <Avatar sx={{ width: 32, height: 32,
        bgcolor: 'primary.main',
        fontSize: '0.875rem',
        fontWeight: 700 }}>{init}</Avatar>
    </IconButton>
    <Menu anchorEl={el} open={Boolean(el)}
      onClose={() => setEl(null)}
      anchorOrigin={{ vertical: 'bottom',
        horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',
        horizontal: 'right' }}
      slotProps={{ paper: {
        sx: { minWidth: 200, mt: 1 } } }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2"
          fontWeight={700}>
          {user?.username}</Typography>
        <Typography variant="caption"
          color="text.secondary">
          {user?.email}</Typography>
      </Box>
      <Divider />
      <MenuItem component={Link}
        href={`/site/${slug}/admin`}
        onClick={() => setEl(null)}
        data-testid="admin-link">
        <ListItemIcon>
          <DashboardOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Admin</ListItemText>
      </MenuItem>
      <MenuItem component={Link}
        href={`/site/${slug}/admin/settings`}
        onClick={() => setEl(null)}
        data-testid="settings-link">
        <ListItemIcon>
          <SettingsOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={doLogout}
        data-testid="logout-btn">
        <ListItemIcon>
          <LogoutOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sign Out</ListItemText>
      </MenuItem>
    </Menu>
  </>)
}
