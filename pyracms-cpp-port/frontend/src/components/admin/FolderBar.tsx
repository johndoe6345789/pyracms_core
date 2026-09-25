import { Box, Breadcrumbs, Button, Link as MuiLink } from '@mui/material'
import { CreateNewFolderOutlined } from '@mui/icons-material'
import { baseName, trail } from '@/lib/folderPath'

interface Props {
  folder: string
  onOpen: (path: string) => void
  onNew: () => void
}

/** Where you are in the folders (click a name to go back up), and a way to
 * make a new folder here. */
export default function FolderBar({ folder, onOpen, onNew }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
      }}
    >
      <Breadcrumbs aria-label="Folder path" data-testid="folder-trail">
        <MuiLink
          component="button"
          underline="hover"
          onClick={() => onOpen('')}
          color={folder ? 'inherit' : 'text.primary'}
          data-testid="folder-root"
        >
          All files
        </MuiLink>
        {trail(folder).map((p) => (
          <MuiLink
            key={p}
            component="button"
            underline="hover"
            onClick={() => onOpen(p)}
            color={p === folder ? 'text.primary' : 'inherit'}
          >
            {baseName(p)}
          </MuiLink>
        ))}
      </Breadcrumbs>
      <Button
        startIcon={<CreateNewFolderOutlined />}
        variant="outlined"
        onClick={onNew}
        data-testid="new-folder-btn"
      >
        New folder
      </Button>
    </Box>
  )
}
