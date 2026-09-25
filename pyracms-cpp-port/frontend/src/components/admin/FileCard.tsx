import { Card, CardContent, Typography } from '@mui/material'
import { FileItem } from '@/hooks/useFileManager'
import FileThumb from './FileThumb'
import FileCardMeta from './FileCardMeta'
import FileCardActions from './FileCardActions'

interface FileCardProps {
  file: FileItem
  onDelete: (file: FileItem) => void
  onMove?: (file: FileItem) => void
}

const nameSx = {
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  mb: 1,
}

export default function FileCard({ file, onDelete, onMove }: FileCardProps) {
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
        <FileThumb file={file} />
        <Typography variant="body1" title={file.name} sx={nameSx}>
          {file.name}
        </Typography>
        <FileCardMeta file={file} />
        <FileCardActions
          file={file}
          onDelete={onDelete}
          {...(onMove ? { onMove } : {})}
        />
      </CardContent>
    </Card>
  )
}
