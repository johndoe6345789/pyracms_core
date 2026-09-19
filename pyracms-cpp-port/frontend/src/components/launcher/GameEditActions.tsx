import { Box, Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface Props {
  cancelHref: string
  saving: boolean
  onSave: () => void
}

/** Cancel / Save buttons at the bottom of the edit page. */
export default function GameEditActions({ cancelHref, saving, onSave }: Props) {
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
