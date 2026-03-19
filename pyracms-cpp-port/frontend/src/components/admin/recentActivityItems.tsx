import {
  EditOutlined, PersonAddOutlined,
  PostAddOutlined, UploadFileOutlined,
  DeleteOutlined, VisibilityOutlined,
} from '@mui/icons-material'
import { ActivityItem } from './recentActivityData'

const sm = 'small' as const

const ITEMS: ActivityItem[] = [
  {
    id: '1', type: 'edit',
    text: 'Alice edited "Getting Started"',
    icon: <EditOutlined fontSize={sm} />,
    time: '5 min ago',
  },
  {
    id: '2', type: 'user',
    text: 'New user: charlie_dev',
    icon: <PersonAddOutlined fontSize={sm} />,
    time: '15 min ago',
  },
  {
    id: '3', type: 'create',
    text: 'Bob created forum thread',
    icon: <PostAddOutlined fontSize={sm} />,
    time: '32 min ago',
  },
  {
    id: '4', type: 'create',
    text: 'Dana uploaded 3 files',
    icon: <UploadFileOutlined fontSize={sm} />,
    time: '1 hour ago',
  },
  {
    id: '5', type: 'delete',
    text: 'Admin deleted spam post',
    icon: <DeleteOutlined fontSize={sm} />,
    time: '2 hours ago',
  },
  {
    id: '6', type: 'edit',
    text: 'Eve updated site settings',
    icon: <EditOutlined fontSize={sm} />,
    time: '3 hours ago',
  },
  {
    id: '7', type: 'user',
    text: 'New user: frank_42',
    icon: <PersonAddOutlined fontSize={sm} />,
    time: '4 hours ago',
  },
  {
    id: '8', type: 'create',
    text: 'Alice published "TS Patterns"',
    icon: <PostAddOutlined fontSize={sm} />,
    time: '5 hours ago',
  },
  {
    id: '9', type: 'edit',
    text: 'Traffic spike: 500 views',
    icon: <VisibilityOutlined fontSize={sm} />,
    time: '6 hours ago',
  },
  {
    id: '10', type: 'edit',
    text: 'Bob modified nav menu',
    icon: <EditOutlined fontSize={sm} />,
    time: '8 hours ago',
  },
]

export default ITEMS
