import { Box, Button } from '@mui/material'
import { UploadOutlined } from '@mui/icons-material'
import { useArchiveUpload } from '@/hooks/useArchiveUpload'
import UploadStatus from './UploadStatus'

/** File picker for a binary, with upload progress underneath. */
export default function BinaryFilePick({
  tenantId,
}: {
  tenantId?: number | null | undefined
}) {
  const { progress, error, result, upload } = useArchiveUpload(tenantId)
  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<UploadOutlined />}
        component="label"
      >
        Select Binary
        <input
          type="file"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
      </Button>
      <UploadStatus
        label="Binary upload progress"
        progress={progress}
        error={error}
        doneName={result?.filename}
      />
    </Box>
  )
}
