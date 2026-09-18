import {
  ArticleOutlined, ForumOutlined, CodeOutlined, SportsEsportsOutlined,
} from '@mui/icons-material'

export const TYPE_CONFIG: Record<
  string, { icon: React.ReactNode; label: string }
> = {
  article: { icon: <ArticleOutlined />, label: 'Articles' },
  forum_post: { icon: <ForumOutlined />, label: 'Forum Posts' },
  snippet: { icon: <CodeOutlined />, label: 'Snippets' },
  gamedep: { icon: <SportsEsportsOutlined />, label: 'Games & Deps' },
}
