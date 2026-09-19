'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Avatar, IconButton } from '@mui/material'
import { useParams, usePathname } from 'next/navigation'
import { useSignOut } from '@/hooks/useSignOut'
import { hasMinRole, UserRole } from '@/types'
import type { RootState } from '@/store/store'
import GuestChip from './GuestChip'
import UserBubbleMenu from './UserBubbleMenu'
import { siteMenuItems, portalMenuItems } from './userMenuItems'

const avatarSx = {
  width: 32,
  height: 32,
  bgcolor: 'primary.main',
  fontSize: '0.875rem',
  fontWeight: 700,
} as const

export default function UserBubble() {
  const params = useParams()
  const pathname = usePathname()
  // Only set inside /site/<slug>/...; the portal has no site
  const slug = (params?.slug as string | undefined) || undefined
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [el, setEl] = useState<null | HTMLElement>(null)
  const close = () => setEl(null)

  const doLogout = useSignOut(slug, close)

  // Accounts are per-site. A session that belongs to another site is a
  // guest here; platform accounts (no tenantSlug) are valid everywhere.
  const signedIn =
    isAuthenticated && (!slug || !user?.tenantSlug || user.tenantSlug === slug)

  if (!signedIn) {
    return (
      <GuestChip slug={slug} pathname={pathname} otherSite={isAuthenticated} />
    )
  }
  const init = user?.username?.charAt(0).toUpperCase() || '?'
  const links = slug
    ? siteMenuItems(slug, close)
    : portalMenuItems(hasMinRole(user, UserRole.SuperAdmin), close)
  return (
    <>
      <IconButton
        onClick={(e) => setEl(e.currentTarget)}
        sx={{ p: 0.5 }}
        aria-label="User menu"
        data-testid="user-bubble-btn"
      >
        <Avatar sx={avatarSx}>{init}</Avatar>
      </IconButton>
      <UserBubbleMenu
        anchor={el}
        user={user}
        links={links}
        onClose={close}
        onLogout={doLogout}
      />
    </>
  )
}
