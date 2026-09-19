import React from 'react'
import {
  ArticleOutlined,
  ForumOutlined,
  PhotoLibraryOutlined,
  SportsEsportsOutlined,
  CodeOutlined,
  ExtensionOutlined,
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
  item('Games', 'games', SportsEsportsOutlined),
  item('Code', 'snippets', CodeOutlined),
  item('Dependencies', 'dependencies', ExtensionOutlined),
  item('Tags', 'tags', LocalOfferOutlined),
]
