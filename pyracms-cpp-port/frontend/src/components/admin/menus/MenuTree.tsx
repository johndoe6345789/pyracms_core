import { Button, List, Paper, Typography } from '@mui/material'
import MenuTreeRow from './MenuTreeRow'
import { siblingsOf } from '@/lib/menuOrder'
import type { MenuTarget } from '@/lib/menuTargets'
import { targetTitle } from '@/lib/menuTargetSearch'
import type { MenuItemRow } from '@/hooks/admin/menuData'

interface Props {
  items: MenuItemRow[]
  targets: MenuTarget[]
  busy: boolean
  onMove: (id: number, by: -1 | 1) => void
  onEdit: (item: MenuItemRow) => void
  onDelete: (item: MenuItemRow) => void
  onAddInside: (folder: MenuItemRow) => void
  onAdd: () => void
}

const folderNote = (n: number) => `Folder with ${n} link${n === 1 ? '' : 's'}`

/** The menu as the visitor sees it: folders with their links indented. */
export default function MenuTree(p: Props) {
  if (!p.items.length)
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          This menu is empty. Add your first link or folder.
        </Typography>
        <Button variant="contained" onClick={p.onAdd}>
          Add a link
        </Button>
      </Paper>
    )
  const row = (i: MenuItemRow, level: MenuItemRow[], indent: boolean) => {
    const at = level.findIndex((x) => x.id === i.id)
    const inside = siblingsOf(p.items, i.id)
    return (
      <MenuTreeRow
        key={i.id}
        item={i}
        indent={indent}
        detail={
          i.type === 'folder'
            ? folderNote(inside.length)
            : targetTitle(p.targets, i.route)
        }
        first={at === 0}
        last={at === level.length - 1}
        disabled={p.busy}
        onMove={(by) => p.onMove(i.id, by)}
        onEdit={() => p.onEdit(i)}
        onDelete={() => p.onDelete(i)}
        {...(i.type === 'folder'
          ? { onAddInside: () => p.onAddInside(i) }
          : {})}
      />
    )
  }
  const top = siblingsOf(p.items, 0)
  return (
    <Paper variant="outlined">
      <List disablePadding data-testid="menu-tree">
        {top.flatMap((i) => [
          row(i, top, false),
          ...siblingsOf(p.items, i.id).map((c, _, kids) => row(c, kids, true)),
        ])}
      </List>
    </Paper>
  )
}
