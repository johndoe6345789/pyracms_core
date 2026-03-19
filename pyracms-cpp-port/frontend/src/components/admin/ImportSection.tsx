import { Alert, Button, Card, CardContent, Typography } from '@mui/material'
import { UploadFileOutlined, WarningAmberOutlined } from '@mui/icons-material'

interface ImportSectionProps {
  fileInputRef: React.Ref<HTMLInputElement>
  onImportClick: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ImportSection({
  fileInputRef, onImportClick, onFileChange,
}: ImportSectionProps) {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>Import / Restore</Typography>
      <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Caution: Restoring data will overwrite existing configuration.
        </Typography>
        <Typography variant="body2">
          Make sure you have a current backup before importing. This operation will replace
          all settings or menus with the data from the uploaded file. This action cannot be undone.
        </Typography>
      </Alert>
      <Card variant="outlined" sx={{ borderColor: 'divider' }}>
        <CardContent sx={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', py: 4,
        }}>
          <UploadFileOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>Import JSON File</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Upload a previously exported PyraCMS JSON file to restore settings or menus.
          </Typography>
          <Button variant="outlined" startIcon={<UploadFileOutlined />} onClick={onImportClick}>
            Choose File
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" hidden onChange={onFileChange} />
        </CardContent>
      </Card>
    </>
  )
}
