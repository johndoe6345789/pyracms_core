'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export interface AuditEntry {
  id: number
  actor: string
  action: string
  target: string
  createdAt: string
}

type Raw = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** Tolerant mapper: the audit rows carry camelCase text fields. */
export function mapAudit(r: Raw): AuditEntry {
  return {
    id: Number(r.id) || 0,
    actor: str(r.actor) || str(r.username),
    action: str(r.action) || str(r.type),
    target: str(r.target) || str(r.title) || str(r.details),
    createdAt: str(r.createdAt),
  }
}

/** Loads the newest audit entries for a tenant (GET /api/audit). */
export function useAuditLog(tenantId: number | null, limit = 100) {
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!tenantId) return
    api.get(`/api/audit?tenant_id=${tenantId}&limit=${limit}`)
      .then((r) => setRows(((r.data || []) as Raw[]).map(mapAudit)))
      .catch((e) => setError(apiErrorMessage(e, 'Could not load audit log')))
      .finally(() => setLoading(false))
  }, [tenantId, limit])
  return { rows, loading, error }
}
