import { Box } from '@mui/material'
import FileIcon from './FileIcon'
import { galleryFileUrl } from '@/lib/galleryImage'

const boxSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'background.default',
  borderRadius: 2,
  height: 150,
  mb: 2,
  overflow: 'hidden',
  color: 'text.secondary',
}

/** A real preview for images (scaled to fit), the type icon otherwise. */
export default function FileThumb({ file }: { file: FileItemLike }) {
  return (
    <Box sx={boxSx}>
      {file.type.startsWith('image/') && file.uuid ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={galleryFileUrl(file.uuid, true)}
          alt={file.name}
          loading="lazy"
          data-testid={`file-thumb-${file.uuid}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <FileIcon type={file.type} />
      )}
    </Box>
  )
}

interface FileItemLike {
  uuid: string
  name: string
  type: string
}
