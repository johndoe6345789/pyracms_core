import { Box, Card, CardContent, Typography } from '@mui/material'
import { FileItem } from '@/hooks/useFileManager'
import FileIcon from './FileIcon'
import FileCardMeta from './FileCardMeta'
import FileCardActions from './FileCardActions'

interface FileCardProps {
  file: FileItem
  onDelete: (file: FileItem) => void
}

const nameSx = {
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  mb: 1,
}

const iconBoxSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'background.default',
  borderRadius: 2,
  py: 3,
  mb: 2,
  color: 'text.secondary',
}

export default function FileCard({ file, onDelete }: FileCardProps) {
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
        <Box sx={iconBoxSx}>
          <FileIcon type={file.type} />
        </Box>
        <Typography variant="body1" title={file.name} sx={nameSx}>
          {file.name}
        </Typography>
        <FileCardMeta file={file} />
        <FileCardActions file={file} onDelete={onDelete} />
      </CardContent>
    </Card>
  )
}
