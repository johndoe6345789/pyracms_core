import { Box, IconButton, Tooltip } from '@mui/material'
import { DeleteOutlined, DownloadOutlined } from '@mui/icons-material'
import { FileItem } from '@/hooks/useFileManager'
import { fileDownloadUrl } from '@/lib/fileDownloadUrl'

interface Props {
  file: FileItem
  onDelete: (file: FileItem) => void
}

/** Download (the API serves files as attachments) and delete. */
export default function FileCardActions({ file, onDelete }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
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
