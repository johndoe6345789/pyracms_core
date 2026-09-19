import {
  ForumOutlined,
  ArticleOutlined,
  CodeOutlined,
  ThumbUpOutlined,
} from '@mui/icons-material'

export const TYPE_COLORS: Record<string, string> = {
  post: '#ed6c02',
  forum_post: '#ed6c02',
  article: '#1976d2',
  snippet: '#2e7d32',
  vote: '#9c27b0',
}

const sx = { fontSize: 18 }
const ICONS: Record<string, React.ReactNode> = {
  post: <ForumOutlined sx={sx} />,
  forum_post: <ForumOutlined sx={sx} />,
  article: <ArticleOutlined sx={sx} />,
  snippet: <CodeOutlined sx={sx} />,
  vote: <ThumbUpOutlined sx={sx} />,
}

export function getTypeIcon(type: string) {
  return ICONS[type] || ICONS.article
}
