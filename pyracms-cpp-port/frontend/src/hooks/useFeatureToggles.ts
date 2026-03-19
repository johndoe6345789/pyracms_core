'use client'

import { useState } from 'react'

export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
}

const INITIAL_FEATURES: Feature[] = [
  {
    id: 'articles',
    name: 'Articles',
    description: 'Content management system for creating and publishing articles, blog posts, and pages.',
    enabled: true,
  },
  {
    id: 'forum',
    name: 'Forum',
    description: 'Discussion forums with threaded conversations, categories, and moderation tools.',
    enabled: true,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image and media galleries with albums, slideshows, and lightbox support.',
    enabled: false,
  },
  {
    id: 'code_snippets',
    name: 'Code Snippets',
    description: 'Syntax-highlighted code sharing with support for multiple programming languages.',
    enabled: false,
  },
  {
    id: 'hypernucleus',
    name: 'Hypernucleus',
    description: 'Package management and distribution system for plugins and extensions.',
    enabled: false,
  },
]

export function useFeatureToggles() {
  const [features, setFeatures] = useState<Feature[]>(INITIAL_FEATURES)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleToggle = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    )
  }

  const handleSave = () => {
    // TODO: Wire up RTK Query mutation
    setSnackbarOpen(true)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  return {
    features,
    snackbarOpen,
    handleToggle,
    handleSave,
    handleCloseSnackbar,
  }
}
