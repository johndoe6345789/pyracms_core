import { useState, useCallback } from 'react'
import { MenuItemData } from './menuItemTypes'
import PLACEHOLDER_MENU from './placeholderMenu'

export default function useMenuHandlers() {
  const [items, setItems] =
    useState<MenuItemData[]>(PLACEHOLDER_MENU)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  const handleEdit = useCallback(
    (id: string, l: string, u: string) => {
      const rec = (
        arr: MenuItemData[],
      ): MenuItemData[] =>
        arr.map((m) => m.id === id
          ? { ...m, label: l, url: u }
          : {
            ...m,
            children: rec(m.children),
          })
      setItems(rec)
    }, [])

  const handleDelete = useCallback(
    (id: string) => {
      const rec = (
        arr: MenuItemData[],
      ): MenuItemData[] =>
        arr.filter((m) => m.id !== id)
          .map((m) => ({
            ...m, children: rec(m.children),
          }))
      setItems(rec)
    }, [])

  const handleMove = useCallback(
    (dId: string, tId: string) => {
      console.log('Move', dId, 'to', tId)
    }, [])

  const handleAdd = () => {
    if (!label || !url) return
    setItems((p) => [...p, {
      id: `new-${Date.now()}`,
      label, url, children: [],
    }])
    setLabel('')
    setUrl('')
  }

  return {
    items, label, url,
    setLabel, setUrl,
    handleEdit, handleDelete,
    handleMove, handleAdd,
  }
}
