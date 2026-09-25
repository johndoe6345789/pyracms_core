import { Grid } from '@mui/material'
import { FileItem } from '@/hooks/useFileManager'
import FileCard from './FileCard'

interface FileGridProps {
  files: FileItem[]
  onDelete: (file: FileItem) => void
  onMove?: (file: FileItem) => void
}

export default function FileGrid({ files, onDelete, onMove }: FileGridProps) {
  return (
    <Grid container spacing={3} data-testid="file-grid">
      {files.map((file) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
          <FileCard
            file={file}
            onDelete={onDelete}
            {...(onMove ? { onMove } : {})}
          />
        </Grid>
      ))}
    </Grid>
  )
}
