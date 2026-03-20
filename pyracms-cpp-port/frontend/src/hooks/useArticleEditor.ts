'use client'

import { useState } from 'react'

export const RENDERERS = ['HTML', 'Markdown', 'BBCode', 'RST']

export interface ArticleEditorState {
  title: string
  setTitle: (v: string) => void
  content: string
  setContent: (v: string) => void
  renderer: string
  setRenderer: (v: string) => void
  summary: string
  setSummary: (v: string) => void
  tagsInput: string
  setTagsInput: (v: string) => void
  viewMode: 'edit' | 'preview'
  setViewMode: (v: 'edit' | 'preview') => void
  parsedTags: string[]
}

interface EditorDefaults {
  title?: string
  content?: string
  renderer?: string
  tags?: string[]
}

export function useArticleEditor(defaults: EditorDefaults = {}): ArticleEditorState {
  const [title, setTitle] = useState(defaults.title ?? '')
  const [content, setContent] = useState(defaults.content ?? '')
  const [renderer, setRenderer] = useState(defaults.renderer ?? 'Markdown')
  const [summary, setSummary] = useState('')
  const [tagsInput, setTagsInput] = useState(defaults.tags?.join(', ') ?? '')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  const parsedTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    title, setTitle,
    content, setContent,
    renderer, setRenderer,
    summary, setSummary,
    tagsInput, setTagsInput,
    viewMode, setViewMode,
    parsedTags,
  }
}
