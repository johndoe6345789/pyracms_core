'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import MenuKindToggle from './MenuKindToggle'
import MenuPlacementFields from './MenuPlacementFields'
import TargetField from './TargetField'
import type { MenuDraft } from '@/lib/menuDraft'
import { validateRoute } from '@/lib/routeSuggest'
import type { MenuItemRow } from '@/hooks/admin/menuData'
import type { MenuTarget } from '@/lib/menuTargets'

interface Props {
  title: string
  initial: MenuDraft
  editing: boolean
  folders: MenuItemRow[]
  targets: MenuTarget[]
  slug: string
  busy: boolean
  onClose: () => void
  onSave: (draft: MenuDraft) => void
}

/** Add or edit one menu entry: a link or a folder of links. */
export default function MenuItemDialog(p: Props) {
  const [d, setD] = useState(p.initial)
  const set = (patch: Partial<MenuDraft>) => setD((o) => ({ ...o, ...patch }))
  const folder = d.kind === 'folder'
  const route = d.route.trim()
  const invalid =
    !d.name.trim() || (!folder && (!route || !!validateRoute(route)))
  return (
    <Dialog open onClose={p.onClose} fullWidth maxWidth="sm">
      <DialogTitle>{p.title}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2.5, pt: 1 }}>
        <MenuKindToggle kind={d.kind} onChange={(kind) => set({ kind })} />
        <TextField
          autoFocus
          label={folder ? 'Folder name' : 'Link text'}
          value={d.name}
          onChange={(e) => set({ name: e.target.value })}
          inputProps={{ maxLength: 128, 'data-testid': 'menu-name-input' }}
        />
        {!folder && (
          <TargetField
            value={d.route}
            targets={p.targets}
            slug={p.slug}
            onChange={(r) => set({ route: r })}
          />
        )}
        <MenuPlacementFields
          isFolder={folder}
          folders={p.folders}
          parentId={d.parentId}
          permissions={d.permissions}
          onParent={(parentId) => set({ parentId })}
          onPermissions={(permissions) => set({ permissions })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={p.onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={invalid || p.busy}
          onClick={() => p.onSave(d)}
          data-testid="menu-save-btn"
        >
          {p.editing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
