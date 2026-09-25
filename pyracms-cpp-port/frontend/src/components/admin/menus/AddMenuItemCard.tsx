import { Typography, Box, Card, CardContent, Button } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import type { useMenuEditor } from '@/hooks/useMenuEditor'

import { validateRoute } from '@/lib/routeSuggest'
import AddMenuItemFields from './AddMenuItemFields'

type Editor = ReturnType<typeof useMenuEditor>

export default function AddMenuItemCard({ editor }: { editor: Editor }) {
  return (
    <Card variant="outlined" sx={{ borderColor: 'divider', mb: 4 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Menu Item
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <AddMenuItemFields editor={editor} />
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={editor.handleAddItem}
            disabled={
              !editor.newName.trim() ||
              (editor.newType !== 'folder' &&
                (!editor.newRoute.trim() || !!validateRoute(editor.newRoute)))
            }
            data-testid="add-menu-item-btn"
          >
            {editor.newType === 'folder' ? 'Add Folder' : 'Add Item'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
