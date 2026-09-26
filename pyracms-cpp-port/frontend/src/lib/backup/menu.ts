import api from '@/lib/api'
import {
  createMenuGroup,
  fetchMenuGroups,
  type MenuGroup,
  type MenuItemRow,
} from '@/hooks/admin/menuData'
import { menuItemBody } from '@/lib/menuItemPayload'
import { attempt } from './pages'
import { folderFirst, rowsOf, type Row } from './menuRows'
import { emptyOutcome, type SectionDef, type Outcome } from './types'

async function restoreRow(g: MenuGroup, r: Row, out: Outcome) {
  const parent = g.items.find((i) => i.type === 'folder' && i.name === r.parent)
  const old = g.items.find(
    (i) => i.name === r.name && i.parentId === (parent?.id ?? 0),
  )
  const body = menuItemBody({ ...r, parentId: parent?.id ?? 0 })
  await attempt(out.failed, r.name, async () => {
    if (old) {
      await api.put(`/api/menus/${old.id}`, body)
      out.updated++
      return
    }
    const res = await api.post(`/api/menu-groups/${g.id}/items`, body)
    g.items.push({
      ...r,
      id: res.data.id,
      parentId: parent?.id ?? 0,
    } as MenuItemRow)
    out.created++
  })
}

export const menuSection: SectionDef = {
  key: 'menu',
  label: 'Menus',
  description: 'The top bar: folders, links, icons, order and visibility.',
  collect: async (tenantId) => rowsOf(await fetchMenuGroups(tenantId)),
  async restore(rows, tenantId, progress) {
    const out = emptyOutcome()
    const groups = await fetchMenuGroups(tenantId)
    for (const r of folderFirst(rows as Row[])) {
      progress(`Menu ${r.name}`)
      let g = groups.find((x) => x.name === r.group)
      if (!g) groups.push((g = await createMenuGroup(tenantId, r.group)))
      await restoreRow(g, r, out)
    }
    return out
  },
}
