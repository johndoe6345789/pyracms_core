'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
}

const FEATURE_DEFS: Omit<Feature, 'enabled'>[] = [
  { id: 'articles', name: 'Articles', description: 'Content management system for creating and publishing articles, blog posts, and pages.' },
  { id: 'forum', name: 'Forum', description: 'Discussion forums with threaded conversations, categories, and moderation tools.' },
  { id: 'gallery', name: 'Gallery', description: 'Image and media galleries with albums, slideshows, and lightbox support.' },
  { id: 'code_snippets', name: 'Code Snippets', description: 'Syntax-highlighted code sharing with support for multiple programming languages.' },
  { id: 'hypernucleus', name: 'Hypernucleus', description: 'Package management and distribution system for plugins and extensions.' },
]

export function useFeatureToggles(tenantId: number | null) {
  const [features, setFeatures] = useState<Feature[]>(
    FEATURE_DEFS.map(f => ({ ...f, enabled: false }))
  )
  const [loading, setLoading] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/settings?tenant_id=${tenantId}`)
      .then(res => {
        const settings = res.data || []
        const featureSettings: Record<string, string> = {}
        for (const s of settings) {
          if (typeof s.name === 'string' && s.name.startsWith('feature_')) {
            featureSettings[s.name.replace('feature_', '')] = s.value
          }
        }
        setFeatures(FEATURE_DEFS.map(f => ({
          ...f,
          enabled: featureSettings[f.id] === 'true',
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const handleToggle = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f))
  }

  const handleSave = () => {
    if (!tenantId) return
    const promises = features.map(f =>
      api.put(`/api/settings/feature_${f.id}?tenant_id=${tenantId}`, {
        name: `feature_${f.id}`,
        value: String(f.enabled),
      })
    )
    Promise.all(promises)
      .then(() => setSnackbarOpen(true))
      .catch(() => {})
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  return {
    features,
    loading,
    snackbarOpen,
    handleToggle,
    handleSave,
    handleCloseSnackbar,
  }
}
