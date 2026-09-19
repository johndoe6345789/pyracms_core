import {
  ArticleOutlined,
  ForumOutlined,
  CodeOutlined,
  PersonOutlined,
} from '@mui/icons-material'

export interface SearchResult {
  id: string
  type: 'article' | 'post' | 'snippet' | 'user'
  title: string
  snippet: string
  url: string
}
export const ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  user: <PersonOutlined fontSize="small" />,
}
export const COLORS: Record<string, string> = {
  article: '#1976d2',
  post: '#ed6c02',
  snippet: '#2e7d32',
  user: '#9c27b0',
}
