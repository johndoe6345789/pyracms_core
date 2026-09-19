'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { mapTenantRow, type TenantRow } from './superAdminRows'
import { useActionError } from './useActionError'

export type { TenantRow }

export interface CreateTenantPayload {
  slug: string
  displayName?: string
  ownerUsername?: string
}

export function useSuperAdminTenants() {
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const { error: deleteError, setError, fail } = useActionError()

  useEffect(() => {
    api
      .get('/api/tenants')
      .then((res) => setTenants((res.data || []).map(mapTenantRow)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    if (confirmDeleteId === null) return
    setError('')
    api
      .delete(`/api/tenants/${confirmDeleteId}`)
      .then(() => {
        setTenants((prev) => prev.filter((t) => t.id !== confirmDeleteId))
      })
      .catch(fail('Could not delete site'))
      .finally(() => setConfirmDeleteId(null))
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  const createTenant = async (
    payload: CreateTenantPayload,
  ): Promise<boolean> => {
    setCreateError(null)
    try {
      const res = await api.post('/api/tenants', payload)
      const row = mapTenantRow(res.data as Record<string, unknown>)
      setTenants((prev) => [...prev, row])
      return true
    } catch (e: any) {
      setCreateError(e.response?.data?.error ?? 'Failed to create site')
      return false
    }
  }

  return {
    tenants,
    loading,
    confirmDeleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
    createTenant,
    createError,
    deleteError,
  }
}
