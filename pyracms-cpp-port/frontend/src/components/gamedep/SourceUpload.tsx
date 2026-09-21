import { Paper, Typography, Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'
import { useArchiveUpload } from '@/hooks/useArchiveUpload'
import UploadStatus from './UploadStatus'

export default function SourceUpload({
  tenantId,
}: {
  tenantId?: number | null | undefined
}) {
  const { progress, error, result, upload } = useArchiveUpload(tenantId)
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Typography variant="h5" gutterBottom>
        Upload Source
      </Typography>
      <Button
        variant="outlined"
        startIcon={<UploadOutlined />}
        component="label"
      >
        Select Source Archive
        <input
          type="file"
          hidden
          accept=".zip,.tar.gz,.tar.bz2,.7z"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
      </Button>
      <UploadStatus
        label="Source upload progress"
        progress={progress}
        error={error}
        doneName={result?.filename}
      />
    </Paper>
  )
}
