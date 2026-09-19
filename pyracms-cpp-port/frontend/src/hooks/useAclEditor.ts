'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useActionError } from './useActionError'
import { url, parseRules, type AclRule } from './aclRules'

export type { AclRule }

export function useAclEditor(tenantId: number | null) {
  const [rules, setRules] = useState<AclRule[]>([])
  const [loading, setLoading] = useState(true)
  const [newAction, setNewAction] = useState<'Allow' | 'Deny'>('Allow')
  const [newPrincipal, setNewPrincipal] = useState('')
  const [newPermission, setNewPermission] = useState('')
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(url(tenantId))
      .then((res) => setRules(parseRules(res.data.value)))
      .catch(() => setRules([]))
      .finally(() => setLoading(false))
  }, [tenantId])

  const saveRules = (updated: AclRule[]) => {
    if (!tenantId) return
    setError('')
    api
      .put(url(tenantId), {
        name: 'acl_rules',
        value: JSON.stringify(updated),
        tenantId,
      })
      .catch(fail('Could not save ACL rules'))
  }

  const handleAdd = () => {
    const principal = newPrincipal.trim()
    const permission = newPermission.trim()
    if (!principal || !permission) return
    const id = Math.max(...rules.map((r) => r.id), 0) + 1
    const updated = [...rules, { id, action: newAction, principal, permission }]
    setRules(updated)
    saveRules(updated)
    setNewPrincipal('')
    setNewPermission('')
    setNewAction('Allow')
  }

  const handleDelete = (id: number) => {
    const updated = rules.filter((r) => r.id !== id)
    setRules(updated)
    saveRules(updated)
  }

  return {
    rules,
    loading,
    error,
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
