import {
  ReplyOutlined, ThumbUpOutlined, CommentOutlined,
  InfoOutlined, GavelOutlined,
} from '@mui/icons-material'

export interface Notification {
  id: number; type: string
  title: string; message: string
  link: string | null; is_read: boolean
  created_at: string
}

export const icons: Record<string, React.ReactNode> = {
  reply: <ReplyOutlined fontSize="small" />,
  vote: <ThumbUpOutlined fontSize="small" />,
  comment: <CommentOutlined fontSize="small" />,
  system: <InfoOutlined fontSize="small" />,
  moderation: <GavelOutlined fontSize="small" />,
  mention: <CommentOutlined fontSize="small" />,
}
