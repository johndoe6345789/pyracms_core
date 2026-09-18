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
  AddCircleOutlineOutlined, ShieldOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import { clearToken } from '@/lib/session'
import { hasMinRole, UserRole } from '@/types'
import type { RootState } from '@/store/store'

export default function UserBubble() {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  // Only set inside /site/<slug>/...; the portal has no site
  const slug = (params?.slug as string | undefined) || undefined
  const { user, isAuthenticated } = useSelector(
    (s: RootState) => s.auth)
  const [el, setEl] =
    useState<null | HTMLElement>(null)
  const doLogout = () => {
    // Sign out of this site only; other sites keep their own sessions
    clearToken(slug ?? null)
    dispatch(logout())
    setEl(null)
    router.push(slug ? `/site/${slug}` : '/')
  }

  // Accounts are per-site. A session that belongs to another site is a
  // guest here; platform accounts (no tenantSlug) are valid everywhere.
  const signedIn = isAuthenticated
    && (!slug || !user?.tenantSlug || user.tenantSlug === slug)

  if (!signedIn) {
    const href = slug
      ? `/auth/login?tenant=${encodeURIComponent(slug)}`
        + `&redirect=${encodeURIComponent(pathname || `/site/${slug}`)}`
      : '/auth/login'
    return (
      <Chip icon={<PersonOutlined />}
        label={isAuthenticated ? 'Sign in here' : 'Sign in'}
        variant="outlined"
        size="small" component={Link}
        href={href} clickable
        data-testid="guest-login-link"
        sx={{ borderColor: 'divider',
          color: 'text.secondary' }} />)
  }
  const init =
    user?.username?.charAt(0).toUpperCase()
    || '?'
  const close = () => setEl(null)
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
      onClose={close}
      anchorOrigin={{ vertical: 'bottom',
        horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',
        horizontal: 'right' }}
      slotProps={{ paper: {
        sx: { minWidth: 220, mt: 1 } } }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2"
          fontWeight={700}>
          {user?.username}</Typography>
        <Typography variant="caption"
          color="text.secondary" display="block">
          {user?.email}</Typography>
        <Chip size="small" sx={{ mt: 0.75 }}
          label={user?.tenantSlug
            ? `Site account · ${user.tenantSlug}`
            : 'Platform account'} />
      </Box>
      <Divider />
      {slug ? [
        <MenuItem key="admin" component={Link}
          href={`/site/${slug}/admin`}
          onClick={close}
          data-testid="admin-link">
          <ListItemIcon>
            <DashboardOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin</ListItemText>
        </MenuItem>,
        <MenuItem key="settings" component={Link}
          href={`/site/${slug}/admin/settings`}
          onClick={close}
          data-testid="settings-link">
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>,
      ] : [
        <MenuItem key="create" component={Link}
          href="/create-site" onClick={close}
          data-testid="create-site-link">
          <ListItemIcon>
            <AddCircleOutlineOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create a site</ListItemText>
        </MenuItem>,
        ...(hasMinRole(user, UserRole.SuperAdmin) ? [
          <MenuItem key="super" component={Link}
            href="/super-admin" onClick={close}
            data-testid="super-admin-link">
            <ListItemIcon>
              <ShieldOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Super admin</ListItemText>
          </MenuItem>,
        ] : []),
      ]}
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
