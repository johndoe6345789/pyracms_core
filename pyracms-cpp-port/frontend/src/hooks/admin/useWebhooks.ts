'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActionError } from '@/hooks/useActionError'
import {
  fetchWebhooks, createWebhook, updateWebhook, deleteWebhook,
  type Webhook, type WebhookDraft,
} from './webhookApi'

/** Webhook list state plus save (create or update) and delete. */
export function useWebhooks(tenantId: number | null) {
  const [hooks, setHooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError, fail } = useActionError()

  const load = useCallback(() => {
    if (!tenantId) return
    fetchWebhooks(tenantId)
      .then(setHooks)
      .catch(fail('Could not load webhooks'))
      .finally(() => setLoading(false))
  }, [tenantId, fail])

  useEffect(load, [load])

  const save = async (d: WebhookDraft, id?: number) => {
    if (!tenantId) return false
    setError('')
    try {
      if (id) await updateWebhook(id, d)
      else await createWebhook(tenantId, d)
      load()
      return true
    } catch (e) {
      fail('Could not save webhook')(e)
      return false
    }
  }

  const remove = (id: number) => {
    setError('')
    deleteWebhook(id)
      .then(() => setHooks((p) => p.filter((h) => h.id !== id)))
      .catch(fail('Could not delete webhook'))
  }

  return { hooks, loading, error, save, remove }
}
