import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { SaveOutlined } from '@mui/icons-material'

interface EditActionsProps {
  cancelHref: string
  saving: boolean
  onSave: () => void
}

export default function EditActions({
  cancelHref,
  saving,
  onSave,
}: EditActionsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button variant="outlined" component={Link} href={cancelHref}>
        Cancel
      </Button>
      <Button
        variant="contained"
        startIcon={<SaveOutlined />}
        disabled={saving}
        onClick={onSave}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  )
}
