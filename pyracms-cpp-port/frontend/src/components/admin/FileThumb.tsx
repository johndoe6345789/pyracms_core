import { Box } from '@mui/material'
import FileIcon from './FileIcon'
import { galleryFileUrl } from '@/lib/galleryImage'
import { fileViewUrl } from '@/lib/fileDownloadUrl'
import { canView } from '@/lib/fileKinds'
import { withLink } from '@/lib/fileLink'

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
export default function FileThumb({ file, link = '', ready = true }: Props) {
  const inner =
    file.type.startsWith('image/') && file.uuid && ready ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withLink(galleryFileUrl(file.uuid, true), link)}
        alt={file.name}
        loading="lazy"
        data-testid={`file-thumb-${file.uuid}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <FileIcon type={file.type} name={file.name} />
    )
  // Wherever the card offers View, the preview opens it too.
  if (!file.uuid || !ready || !canView(file.name))
    return <Box sx={boxSx}>{inner}</Box>
  return (
    <Box
      component="a"
      href={withLink(fileViewUrl(file.uuid), link)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${file.name}`}
      data-testid={`file-thumb-link-${file.uuid}`}
      sx={{ ...boxSx, textDecoration: 'none', cursor: 'zoom-in' }}
    >
      {inner}
    </Box>
  )
}

interface Props {
  file: FileItemLike
  /** signed-link query for a signed-in-only file */
  link?: string
  /** false while that link is still being fetched */
  ready?: boolean
}

interface FileItemLike {
  uuid: string
  name: string
  type: string
}
