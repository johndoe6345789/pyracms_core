import React from 'react'
import {
  ArticleOutlined,
  ForumOutlined,
  PhotoLibraryOutlined,
  CodeOutlined,
  LocalOfferOutlined,
} from '@mui/icons-material'

const item = (label: string, path: string, icon: React.ElementType) => ({
  label,
  path,
  icon: React.createElement(icon),
})

export const NAV_ITEMS = [
  item('Articles', 'articles', ArticleOutlined),
  item('Forum', 'forum', ForumOutlined),
  item('Gallery', 'gallery', PhotoLibraryOutlined),
  item('Code', 'snippets', CodeOutlined),
  item('Tags', 'tags', LocalOfferOutlined),
]
