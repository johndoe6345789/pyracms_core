'use client'

import { useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import {
  ArticleOutlined,
  ForumOutlined,
  PhotoLibraryOutlined,
  SportsEsportsOutlined,
  CodeOutlined,
} from '@mui/icons-material'
import React from 'react'

export const NAV_ITEMS = [
  { label: 'Articles', icon: React.createElement(ArticleOutlined), path: 'articles' },
  { label: 'Forum', icon: React.createElement(ForumOutlined), path: 'forum' },
  { label: 'Gallery', icon: React.createElement(PhotoLibraryOutlined), path: 'gallery' },
  { label: 'Games', icon: React.createElement(SportsEsportsOutlined), path: 'games' },
  { label: 'Code', icon: React.createElement(CodeOutlined), path: 'snippets' },
]

export function useTenantNav() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  const siteName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  const activeLink = NAV_ITEMS.find(
    (item) => pathname === `/site/${slug}/${item.path}`
  )?.path

  return { slug, siteName, drawerOpen, openDrawer, closeDrawer, activeLink }
}
