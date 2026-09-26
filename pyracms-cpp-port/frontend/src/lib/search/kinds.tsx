import {
  ArticleOutlined,
  CodeOutlined,
  ForumOutlined,
  PhotoLibraryOutlined,
  PhotoOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'

export interface Kind {
  /** singular, for a result ("Article") */
  label: string
  /** plural, for a filter ("Articles") */
  plural: string
  icon: React.ReactElement
  /** a theme palette colour, so results follow the site's style */
  color: string
}

const KINDS: Record<string, Kind> = {
  article: {
    label: 'Article',
    plural: 'Articles',
    icon: <ArticleOutlined />,
    color: 'primary.main',
  },
  snippet: {
    label: 'Code snippet',
    plural: 'Code snippets',
    icon: <CodeOutlined />,
    color: 'success.main',
  },
  forum_post: {
    label: 'Forum post',
    plural: 'Forum posts',
    icon: <ForumOutlined />,
    color: 'warning.main',
  },
  album: {
    label: 'Photo album',
    plural: 'Photo albums',
    icon: <PhotoLibraryOutlined />,
    color: 'secondary.main',
  },
  picture: {
    label: 'Photo',
    plural: 'Photos',
    icon: <PhotoOutlined />,
    color: 'secondary.main',
  },
  gamedep: {
    label: 'Game or library',
    plural: 'Games & libraries',
    icon: <SportsEsportsOutlined />,
    color: 'info.main',
  },
}

/** Filter order; kinds the server adds later follow these. */
export const KIND_ORDER = Object.keys(KINDS)

export function kindOf(type: string): Kind {
  return (
    KINDS[type] ?? {
      label: type,
      plural: type,
      icon: <ArticleOutlined />,
      color: 'text.secondary',
    }
  )
}
