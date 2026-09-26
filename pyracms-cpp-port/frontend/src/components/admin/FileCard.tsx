import { Card, CardContent, Typography } from '@mui/material'
import type { FileItem, Visibility } from '@/hooks/useFileManager'
import { useFileLink } from '@/hooks/admin/useFileLink'
import FileThumb from './FileThumb'
import FileCardMeta from './FileCardMeta'
import FileCardActions from './FileCardActions'

interface FileCardProps {
  file: FileItem
  onDelete: (file: FileItem) => void
  onMove?: (file: FileItem) => void
  onVisibility?: (file: FileItem, visibility: Visibility) => void
}

const nameSx = {
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  mb: 1,
}

export default function FileCard({
  file,
  onDelete,
  onMove,
  onVisibility,
}: FileCardProps) {
  const { query, ready } = useFileLink(file.uuid, file.visibility ?? 'public')
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        },
      }}
      data-testid={`file-card-${file.id}`}
    >
      <CardContent>
        <FileThumb file={file} link={query} ready={ready} />
        <Typography variant="body1" title={file.name} sx={nameSx}>
          {file.name}
        </Typography>
        <FileCardMeta file={file} />
        <FileCardActions
          file={file}
          onDelete={onDelete}
          link={query}
          ready={ready}
          {...(onMove ? { onMove } : {})}
          {...(onVisibility ? { onVisibility } : {})}
        />
      </CardContent>
    </Card>
  )
}
