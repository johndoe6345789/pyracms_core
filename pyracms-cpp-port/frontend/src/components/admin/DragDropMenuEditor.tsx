'use client'

import {
  Box, Button, Divider, Typography,
} from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import DraggableMenuItem
  from './DraggableMenuItem'
import AddMenuItemBar from './AddMenuItemBar'
import useMenuHandlers from './useMenuHandlers'

export function DragDropMenuEditor() {
  const {
    items, label, url,
    setLabel, setUrl,
    handleEdit, handleDelete,
    handleMove, handleAdd,
  } = useMenuHandlers()

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column', gap: 2,
      }}>
        <AddMenuItemBar
          label={label} url={url}
          onLabelChange={setLabel}
          onUrlChange={setUrl}
          onAdd={handleAdd}
        />
        <Divider />
        <Box>
          {items.map((m, i) => (
            <DraggableMenuItem
              key={m.id} item={m}
              index={i} parentId={null}
              depth={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
          {items.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{
                textAlign: 'center', py: 4,
              }}
            >
              No menu items. Add one above.
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={() =>
            console.log('Saving:', items)}
          sx={{ alignSelf: 'flex-start' }}
          data-testid="save-menu-order-btn"
        >
          Save Menu Order
        </Button>
      </Box>
    </DndProvider>
  )
}
