'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface TenantRow {
  id: number
  slug: string
  name: string
  owner: string
  isActive: boolean
  createdAt: string
}

export interface CreateTenantPayload {
  slug: string
  displayName?: string
  ownerUsername?: string
}

export function useSuperAdminTenants() {
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] =
    useState<number | null>(null)

  useEffect(() => {
    api.get('/api/tenants')
      .then((res) => {
        const mapped: TenantRow[] = (
          res.data || []
        ).map((t: Record<string, unknown>) => ({
          id: Number(t.id),
          slug: String(t.slug || ''),
          name: String(t.displayName || t.slug || ''),
          owner: String(t.ownerUsername || ''),
          isActive: Boolean(t.isActive ?? true),
          createdAt: typeof t.createdAt === 'string'
            ? t.createdAt.split('T')[0]
            : '',
        }))
        setTenants(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    if (confirmDeleteId === null) return
    api.delete(`/api/tenants/${confirmDeleteId}`)
      .then(() => {
        setTenants((prev) =>
          prev.filter((t) => t.id !== confirmDeleteId),
        )
      })
      .catch(() => {})
      .finally(() => setConfirmDeleteId(null))
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  const createTenant = (
    payload: CreateTenantPayload,
  ): Promise<void> => {
    return api.post('/api/tenants', payload)
      .then((res) => {
        const t = res.data as Record<string, unknown>
        const row: TenantRow = {
          id: Number(t.id),
          slug: String(t.slug || ''),
          name: String(t.displayName || t.slug || ''),
          owner: String(t.ownerUsername || ''),
          isActive: Boolean(t.isActive ?? true),
          createdAt: typeof t.createdAt === 'string'
            ? t.createdAt.split('T')[0]
            : '',
        }
        setTenants((prev) => [...prev, row])
      })
      .catch(() => {})
  }

  return {
    tenants,
    loading,
    confirmDeleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
    createTenant,
  }
}
