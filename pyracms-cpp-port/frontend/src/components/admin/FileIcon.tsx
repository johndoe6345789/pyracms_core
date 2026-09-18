import {
  ImageOutlined,
  PictureAsPdfOutlined,
  DescriptionOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material'

const SX = { fontSize: 48 }

export default function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) {
    return <ImageOutlined sx={SX} />
  }
  if (type === 'application/pdf') {
    return <PictureAsPdfOutlined sx={SX} />
  }
  if (type.startsWith('text/')) {
    return <DescriptionOutlined sx={SX} />
  }
  return <InsertDriveFileOutlined sx={SX} />
}
