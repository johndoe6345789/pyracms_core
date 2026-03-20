import { Paper, Typography, Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'

export default function SourceUpload() {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Typography variant="h5" gutterBottom>
        Upload Source
      </Typography>
      <Button variant="outlined" startIcon={<UploadOutlined />} component="label">
        Select Source Archive
        <input type="file" hidden accept=".zip,.tar.gz,.tar.bz2,.7z" />
      </Button>
    </Paper>
  )
}
