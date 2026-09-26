import { Box, IconButton, Tooltip } from '@mui/material'
import { DeleteOutlined, DriveFileMoveOutlined } from '@mui/icons-material'
import type { FileItem, Visibility } from '@/hooks/useFileManager'
import FileOpenActions from './FileOpenActions'
import VisibilityAction from './VisibilityAction'

interface Props {
  file: FileItem
  onDelete: (file: FileItem) => void
  onMove?: (file: FileItem) => void
  onVisibility?: (file: FileItem, visibility: Visibility) => void
  /** signed-link query for a signed-in-only file */
  link?: string
  /** false while that link is still being fetched */
  ready?: boolean
}

/** Download (the API serves files as attachments) and delete. */
export default function FileCardActions({
  file,
  onDelete,
  onMove,
  onVisibility,
  link = '',
  ready = true,
}: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <FileOpenActions file={file} link={link} ready={ready} />
      {onVisibility && <VisibilityAction file={file} onChange={onVisibility} />}
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
