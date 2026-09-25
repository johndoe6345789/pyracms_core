import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { MenuItemRow } from '@/hooks/admin/menuData'

/** Asks before removing an entry (a folder's links stay on the bar). */
export default function MenuDeleteDialog(p: {
  item: MenuItemRow | null
  onConfirm: (id: number) => void
  onClose: () => void
}) {
  const i = p.item
  return (
    <ConfirmDialog
      open={!!i}
      title="Delete menu entry"
      message={
        i?.type === 'folder'
          ? `Delete the folder "${i.name}"? Its links stay on the top bar.`
          : `Delete "${i?.name}" from the menu?`
      }
      onConfirm={() => {
        if (i) p.onConfirm(i.id)
        p.onClose()
      }}
      onCancel={p.onClose}
    />
  )
}
