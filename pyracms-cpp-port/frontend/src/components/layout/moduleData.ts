import {
  ArticleOutlined,
  ForumOutlined,
  PhotoLibraryOutlined,
  RocketLaunchOutlined,
  CodeOutlined,
  LocalOfferOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material'

export interface ModuleInfo {
  key: string
  label: string
  description: string
  icon: typeof ArticleOutlined
  color: string
}

/** Every module a site offers; the nav bar links to the same routes. */
export const MODULES: ModuleInfo[] = [
  {
    key: 'articles',
    label: 'Articles',
    icon: ArticleOutlined,
    description: 'Read and publish articles, tutorials, and blog posts.',
    color: '#6366f1',
  },
  {
    key: 'forum',
    label: 'Forum',
    icon: ForumOutlined,
    description: 'Join discussions, ask questions, and share knowledge.',
    color: '#ec4899',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: PhotoLibraryOutlined,
    description: 'Browse image galleries and upload your own photos.',
    color: '#10b981',
  },
  {
    key: 'games',
    label: 'Hypernucleus',
    icon: RocketLaunchOutlined,
    description: 'Games to download and play, plus the dependencies they use.',
    color: '#f59e0b',
  },
  {
    key: 'snippets',
    label: 'Code',
    icon: CodeOutlined,
    description: 'Share, edit and run code snippets in the browser.',
    color: '#0ea5e9',
  },
  {
    key: 'tags',
    label: 'Tags',
    icon: LocalOfferOutlined,
    description: 'Explore everything on the site by topic.',
    color: '#14b8a6',
  },
]

export const ADMIN_MODULE: ModuleInfo = {
  key: 'admin',
  label: 'Admin',
  icon: AdminPanelSettingsOutlined,
  description: 'Manage content, users, menus, features and settings.',
  color: '#ef4444',
}
