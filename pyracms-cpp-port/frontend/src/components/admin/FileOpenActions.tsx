import { IconButton, Tooltip } from '@mui/material'
import { DownloadOutlined, VisibilityOutlined } from '@mui/icons-material'
import type { FileItem } from '@/hooks/useFileManager'
import { fileDownloadUrl, fileViewUrl } from '@/lib/fileDownloadUrl'
import { canView } from '@/lib/fileKinds'
import { withLink } from '@/lib/fileLink'

interface Props {
  file: FileItem
  /** signed-link query for a signed-in-only file */
  link: string
  /** false while that link is still being fetched */
  ready: boolean
}

/** View (where the browser can show it) and download (the API serves
 * files as attachments). */
export default function FileOpenActions({ file, link, ready }: Props) {
  return (
    <>
      {ready && canView(file.name) && (
        <Tooltip title="View">
          <IconButton
            size="small"
            component="a"
            href={withLink(fileViewUrl(file.uuid), link)}
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
          disabled={!ready}
          href={withLink(fileDownloadUrl(file.uuid), link)}
          download={file.name}
          aria-label={`Download file ${file.name}`}
          data-testid={`download-file-${file.id}`}
        >
          <DownloadOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
