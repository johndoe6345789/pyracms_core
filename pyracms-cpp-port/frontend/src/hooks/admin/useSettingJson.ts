'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useActionError } from '@/hooks/useActionError'
import { putSetting } from './settingsApi'

/**
 * A JSON document stored under one tenant setting key.
 * `parse` must be a stable function that returns null for bad input.
 */
export function useSettingJson<T>(
  tenantId: number | null,
  key: string,
  parse: (raw: string) => T | null,
  fallback: T,
) {
  const [value, setValue] = useState<T>(fallback)
  const [saved, setSaved] = useState(false)
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!tenantId) return
    api
      .get(`/api/settings/${key}?tenant_id=${tenantId}`)
      .then((r) => {
        const v = parse(String(r.data?.value ?? ''))
        if (v) setValue(v)
      })
      .catch(() => {})
  }, [tenantId, key, parse])

  const edit = (v: T | ((p: T) => T)) => {
    setSaved(false)
    setValue(v)
  }

  const save = async () => {
    setError('')
    setSaved(false)
    try {
      await putSetting(key, JSON.stringify(value), tenantId)
      setSaved(true)
      return true
    } catch (e) {
      fail('Could not save')(e)
      return false
    }
  }

  return { value, edit, save, saved, error }
}
