'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface AclRule {
  id: number
  action: 'Allow' | 'Deny'
  principal: string
  permission: string
}

export function useAclEditor(tenantId: number | null) {
  const [rules, setRules] = useState<AclRule[]>([])
  const [loading, setLoading] = useState(true)
  const [newAction, setNewAction] = useState<'Allow' | 'Deny'>('Allow')
  const [newPrincipal, setNewPrincipal] = useState('')
  const [newPermission, setNewPermission] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/settings/acl_rules?tenant_id=${tenantId}`)
      .then(res => {
        try {
          const parsed = JSON.parse(res.data.value || '[]')
          setRules(parsed)
        } catch {
          setRules([])
        }
      })
      .catch(() => setRules([]))
      .finally(() => setLoading(false))
  }, [tenantId])

  const saveRules = (updated: AclRule[]) => {
    if (!tenantId) return
    api.put(`/api/settings/acl_rules?tenant_id=${tenantId}`, {
      name: 'acl_rules',
      value: JSON.stringify(updated),
    }).catch(() => {})
  }

  const handleAdd = () => {
    if (!newPrincipal.trim() || !newPermission.trim()) return
    const nextId = Math.max(...rules.map(r => r.id), 0) + 1
    const updated = [
      ...rules,
      { id: nextId, action: newAction, principal: newPrincipal.trim(), permission: newPermission.trim() },
    ]
    setRules(updated)
    saveRules(updated)
    setNewPrincipal('')
    setNewPermission('')
    setNewAction('Allow')
  }

  const handleDelete = (id: number) => {
    const updated = rules.filter(r => r.id !== id)
    setRules(updated)
    saveRules(updated)
  }

  return {
    rules,
    loading,
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
