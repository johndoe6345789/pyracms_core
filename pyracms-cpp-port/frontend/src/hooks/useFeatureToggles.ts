'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useActionError } from './useActionError'
import { publishSiteFeatures } from './useSiteFeatures'
import { flagsFromSettings } from '@/lib/siteFeatures'
import {
  Feature,
  FEATURE_DEFS,
  featuresFromSettings,
} from './admin/featureDefs'

export type { Feature }

export function useFeatureToggles(tenantId: number | null) {
  const [features, setFeatures] = useState<Feature[]>(
    FEATURE_DEFS.map((f) => ({ ...f, enabled: true })),
  )
  const [loading, setLoading] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const { error, setError, fail } = useActionError()

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(`/api/settings?tenant_id=${tenantId}`)
      .then((res) => setFeatures(featuresFromSettings(res.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const handleToggle = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    )
  }

  const handleSave = () => {
    if (!tenantId) return
    setError('')
    const promises = features.map((f) =>
      api.put(`/api/settings/feature_${f.id}?tenant_id=${tenantId}`, {
        name: `feature_${f.id}`,
        value: String(f.enabled),
        tenantId,
      }),
    )
    Promise.all(promises)
      .then(() => {
        publishSiteFeatures(
          tenantId,
          flagsFromSettings(
            features.map((f) => ({
              name: `feature_${f.id}`,
              value: String(f.enabled),
            })),
          ),
        )
        setSnackbarOpen(true)
      })
      .catch(fail('Could not save feature toggles'))
  }

  const handleCloseSnackbar = () => setSnackbarOpen(false)

  return {
    features,
    loading,
    snackbarOpen,
    error,
    handleToggle,
    handleSave,
    handleCloseSnackbar,
  }
}
