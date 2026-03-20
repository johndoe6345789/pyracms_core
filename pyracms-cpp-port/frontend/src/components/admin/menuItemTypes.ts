export interface MenuItemData {
  id: string
  label: string
  url: string
  children: MenuItemData[]
}

export interface DragItem {
  id: string
  index: number
  parentId: string | null
}

export const ITEM_TYPE = 'MENU_ITEM'

export interface DraggableMenuItemProps {
  item: MenuItemData
  index: number
  parentId: string | null
  depth: number
  onEdit: (
    id: string, label: string, url: string
  ) => void
  onDelete: (id: string) => void
  onMove: (
    dragId: string, dropId: string
  ) => void
}
