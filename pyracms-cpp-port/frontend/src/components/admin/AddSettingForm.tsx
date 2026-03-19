import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'

interface AddSettingFormProps {
  newKey: string
  newValue: string
  onKeyChange: (val: string) => void
  onValueChange: (val: string) => void
  onAdd: () => void
}

export default function AddSettingForm({
  newKey, newValue, onKeyChange, onValueChange, onAdd,
}: AddSettingFormProps) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'divider', mb: 4 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add New Setting
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            label="Key" size="small" value={newKey}
            onChange={(e) => onKeyChange(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Value" size="small" value={newValue}
            onChange={(e) => onValueChange(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <Button
            variant="contained" startIcon={<AddCircleOutline />}
            onClick={onAdd} disabled={!newKey.trim() || !newValue.trim()}
          >
            Add Setting
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
