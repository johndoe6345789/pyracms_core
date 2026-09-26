import { IconButton, Tooltip } from '@mui/material'
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material'
import type { FileItem, Visibility } from '@/hooks/useFileManager'

interface Props {
  file: FileItem
  onChange: (file: FileItem, visibility: Visibility) => void
}

/** Flips a file between public and authenticated only. */
export default function VisibilityAction({ file, onChange }: Props) {
  const locked = file.visibility === 'authenticated'
  const next: Visibility = locked ? 'public' : 'authenticated'
  const label = locked ? 'Make public' : 'Make authenticated only'
  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        onClick={() => onChange(file, next)}
        aria-label={`${label}: ${file.name}`}
        data-testid={`visibility-btn-${file.id}`}
      >
        {locked ? (
          <LockOpenOutlined fontSize="small" />
        ) : (
          <LockOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  )
}
