import { MenuItemData } from './menuItemTypes'

function find(
  arr: MenuItemData[],
  id: string,
): MenuItemData | undefined {
  for (const m of arr) {
    if (m.id === id) return m
    const hit = find(m.children, id)
    if (hit) return hit
  }
  return undefined
}

function remove(arr: MenuItemData[], id: string): MenuItemData[] {
  return arr
    .filter((m) => m.id !== id)
    .map((m) => ({ ...m, children: remove(m.children, id) }))
}

function insertBefore(
  arr: MenuItemData[],
  targetId: string,
  node: MenuItemData,
): MenuItemData[] {
  const out: MenuItemData[] = []
  for (const m of arr) {
    if (m.id === targetId) out.push(node)
    out.push({
      ...m,
      children: insertBefore(m.children, targetId, node),
    })
  }
  return out
}

/**
 * Moves the dragged node so it sits just before the target,
 * inside the target's parent. No-op if the target is inside
 * the dragged subtree or either id is unknown.
 */
export function moveBefore(
  tree: MenuItemData[],
  dragId: string,
  targetId: string,
): MenuItemData[] {
  const node = find(tree, dragId)
  if (!node || dragId === targetId) return tree
  if (find(node.children, targetId)) return tree
  if (!find(tree, targetId)) return tree
  return insertBefore(remove(tree, dragId), targetId, node)
}
