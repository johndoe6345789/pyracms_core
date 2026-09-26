import { Typography } from '@mui/material'

export default function FilesHeader() {
  return (
    <>
      <Typography variant="h3" sx={{ mb: 1 }}>
        File Manager
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload, organise into folders and manage your files. Lock a file to
        authenticated only and just signed-in users can open it.
      </Typography>
    </>
  )
}
