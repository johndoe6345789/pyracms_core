import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DeleteOutlined,
  ImageOutlined,
  PictureAsPdfOutlined,
  DescriptionOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material'
import {
  FileItem,
  formatFileSize,
} from '@/hooks/useFileManager'

function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return (
      <ImageOutlined
        sx={{ fontSize: 48 }}
      />
    )
  }
  if (type === 'application/pdf') {
    return (
      <PictureAsPdfOutlined
        sx={{ fontSize: 48 }}
      />
    )
  }
  if (type.startsWith('text/')) {
    return (
      <DescriptionOutlined
        sx={{ fontSize: 48 }}
      />
    )
  }
  return (
    <InsertDriveFileOutlined
      sx={{ fontSize: 48 }}
    />
  )
}

interface FileCardProps {
  file: FileItem
  onDelete: (file: FileItem) => void
}

export default function FileCard({
  file,
  onDelete,
}: FileCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        transition:
          'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        },
      }}
      data-testid={
        `file-card-${file.id}`
      }
    >
      <CardContent>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor:
            'background.default',
          borderRadius: 2,
          py: 3,
          mb: 2,
          color: 'text.secondary',
        }}>
          {getFileIcon(file.type)}
        </Box>
        <Typography
          variant="body1"
          title={file.name}
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 1,
          }}
        >
          {file.name}
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          mb: 1,
        }}>
          <Chip
            label={
              formatFileSize(file.size)
            }
            size="small"
            variant="outlined"
          />
          <Chip
            label={
              `${file.downloads}` +
              ' downloads'
            }
            size="small"
            variant="outlined"
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {file.type}
        </Typography>
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={
                () => onDelete(file)
              }
              aria-label={
                `Delete file ` +
                file.name
              }
              data-testid={
                `delete-file-` +
                `${file.id}`
              }
            >
              <DeleteOutlined
                fontSize="small"
              />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )
}
