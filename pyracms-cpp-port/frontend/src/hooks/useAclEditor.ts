'use client'

import { useState } from 'react'

export interface AclRule {
  id: number
  action: 'Allow' | 'Deny'
  principal: string
  permission: string
}

const PLACEHOLDER_RULES: AclRule[] = [
  { id: 1, action: 'Allow', principal: 'admin', permission: 'manage_users' },
  { id: 2, action: 'Allow', principal: 'admin', permission: 'manage_settings' },
  { id: 3, action: 'Allow', principal: 'editor', permission: 'edit_articles' },
  { id: 4, action: 'Allow', principal: 'editor', permission: 'publish_articles' },
  { id: 5, action: 'Allow', principal: 'authenticated', permission: 'create_comments' },
  { id: 6, action: 'Deny', principal: 'banned', permission: 'create_comments' },
  { id: 7, action: 'Deny', principal: 'banned', permission: 'create_posts' },
  { id: 8, action: 'Allow', principal: 'moderator', permission: 'delete_comments' },
]

export function useAclEditor() {
  const [rules, setRules] = useState<AclRule[]>(PLACEHOLDER_RULES)
  const [newAction, setNewAction] = useState<'Allow' | 'Deny'>('Allow')
  const [newPrincipal, setNewPrincipal] = useState('')
  const [newPermission, setNewPermission] = useState('')

  const handleAdd = () => {
    if (!newPrincipal.trim() || !newPermission.trim()) return
    const nextId = Math.max(...rules.map((r) => r.id), 0) + 1
    setRules((prev) => [
      ...prev,
      {
        id: nextId,
        action: newAction,
        principal: newPrincipal.trim(),
        permission: newPermission.trim(),
      },
    ])
    setNewPrincipal('')
    setNewPermission('')
    setNewAction('Allow')
  }

  const handleDelete = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  return {
    rules,
    newAction,
    setNewAction,
    newPrincipal,
    setNewPrincipal,
    newPermission,
    setNewPermission,
    handleAdd,
    handleDelete,
  }
}
