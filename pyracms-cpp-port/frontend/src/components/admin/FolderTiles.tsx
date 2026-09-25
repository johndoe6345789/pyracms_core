import { Box, IconButton, Paper, Typography } from '@mui/material'
import { DeleteOutlined, FolderOutlined } from '@mui/icons-material'
import { baseName } from '@/lib/folderPath'

interface Props {
  folders: string[]
  onOpen: (path: string) => void
  onRemove: (path: string) => void
}

/** The folders inside the open one. */
export default function FolderTiles({ folders, onOpen, onRemove }: Props) {
  if (!folders.length) return null
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2,
        mb: 3,
      }}
      data-testid="folder-tiles"
    >
      {folders.map((p) => (
        <Paper
          key={p}
          variant="outlined"
          sx={{ display: 'flex', alignItems: 'center', pr: 0.5 }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => onOpen(p)}
            data-testid={`folder-${p}`}
            sx={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              p: 2,
              minWidth: 0,
            }}
          >
            <FolderOutlined color="primary" />
            <Typography noWrap>{baseName(p)}</Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={`Remove folder ${baseName(p)}`}
            onClick={() => onRemove(p)}
            data-testid={`remove-folder-${p}`}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Paper>
      ))}
    </Box>
  )
}
