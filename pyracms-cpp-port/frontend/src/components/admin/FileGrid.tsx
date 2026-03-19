import { Grid } from '@mui/material'
import { FileItem } from '@/hooks/useFileManager'
import FileCard from './FileCard'

interface FileGridProps {
  files: FileItem[]
  onDelete: (file: FileItem) => void
}

export default function FileGrid({ files, onDelete }: FileGridProps) {
  return (
    <Grid container spacing={3}>
      {files.map((file) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
          <FileCard file={file} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  )
}
