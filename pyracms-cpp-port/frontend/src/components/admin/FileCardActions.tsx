import { Box, IconButton, Tooltip } from '@mui/material'
import {
  DeleteOutlined,
  DownloadOutlined,
  DriveFileMoveOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { FileItem } from '@/hooks/useFileManager'
import { fileDownloadUrl, fileViewUrl } from '@/lib/fileDownloadUrl'
import { canView } from '@/lib/fileKinds'

interface Props {
  file: FileItem
  onDelete: (file: FileItem) => void
  onMove?: (file: FileItem) => void
}

/** Download (the API serves files as attachments) and delete. */
export default function FileCardActions({ file, onDelete, onMove }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      {canView(file.name) && (
        <Tooltip title="View">
          <IconButton
            size="small"
            component="a"
            href={fileViewUrl(file.uuid)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View file ${file.name}`}
            data-testid={`view-file-${file.id}`}
          >
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Download">
        <IconButton
          size="small"
          component="a"
          href={fileDownloadUrl(file.uuid)}
          download={file.name}
          aria-label={`Download file ${file.name}`}
          data-testid={`download-file-${file.id}`}
        >
          <DownloadOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      {onMove && (
        <Tooltip title="Move to folder">
          <IconButton
            size="small"
            onClick={() => onMove(file)}
            aria-label={`Move file ${file.name}`}
            data-testid={`move-file-${file.id}`}
          >
            <DriveFileMoveOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(file)}
          aria-label={`Delete file ${file.name}`}
          data-testid={`delete-file-${file.id}`}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
