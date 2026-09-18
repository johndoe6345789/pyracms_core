import {
  StarOutlined, ForumOutlined,
  ArticleOutlined, CodeOutlined,
  RocketLaunchOutlined, BugReportOutlined,
  CalendarMonthOutlined, ThumbUpOutlined,
  EmojiEventsOutlined, WhatshotOutlined,
} from '@mui/icons-material'

export interface Achievement {
  id: number; name: string
  displayName: string; description: string
  icon: string; earned: boolean; earnedAt: string
}

export const ico: Record<string, React.ReactNode> = {
  star: <StarOutlined />,
  forum: <ForumOutlined />,
  article: <ArticleOutlined />,
  code: <CodeOutlined />,
  rocket: <RocketLaunchOutlined />,
  bug: <BugReportOutlined />,
  calendar: <CalendarMonthOutlined />,
  thumbup: <ThumbUpOutlined />,
  hundred: <WhatshotOutlined />,
  default: <EmojiEventsOutlined />,
}
