import { ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material'
import { InsertDriveFileOutlined, CloseOutlined } from '@mui/icons-material'
import { formatSize } from '@/lib/release'
import { fileDownloadUrl } from '@/lib/fileDownloadUrl'
import type { SnippetAttachment } from '@/lib/snippets'

interface Props {
  attachment: SnippetAttachment
  isOwner: boolean
  onRemove: () => void
}

export function SnippetAttachmentRow({
  attachment: a,
  isOwner,
  onRemove,
}: Props) {
  return (
    <ListItem
      disablePadding
      data-testid={`snippet-attachment-${a.id}`}
      secondaryAction={
        isOwner && (
          <IconButton
            size="small"
            onClick={onRemove}
            data-testid={`remove-attachment-${a.id}`}
            aria-label={`Remove ${a.filename}`}
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        )
      }
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <InsertDriveFileOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <a href={fileDownloadUrl(a.fileUuid)} download={a.filename}>
            {a.filename}
          </a>
        }
        secondary={formatSize(a.size)}
      />
    </ListItem>
  )
}
