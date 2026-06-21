'use client'

import { useState, useEffect } from 'react'
import {
  useParams,
  useRouter,
} from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import {
  useArticleEditor,
} from '@/hooks/useArticleEditor'
import {
  useTenantId,
} from '@/hooks/useTenantId'
import {
  BackButton,
} from '@/components/common/BackButton'
import {
  ArticleEditorForm,
} from '@/components/articles/ArticleEditorForm'
import api from '@/lib/api'

interface ArticleEditSnapshot {
  content: string
  renderer: string
  tagsInput: string
}

function parseTagsInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function sameTags(left: string, right: string) {
  const a = parseTagsInput(left).map((tag) => tag.toLowerCase()).sort()
  const b = parseTagsInput(right).map((tag) => tag.toLowerCase()).sort()
  return a.length === b.length
    && a.every((tag, index) => tag === b[index])
}

function buildRevisionSummary(
  original: ArticleEditSnapshot,
  current: ArticleEditSnapshot
) {
  const changes: string[] = []

  if (current.content !== original.content) {
    changes.push('content')
  }
  if (current.renderer !== original.renderer) {
    changes.push('renderer')
  }
  if (!sameTags(current.tagsInput, original.tagsInput)) {
    changes.push('tags')
  }

  if (changes.length === 0) {
    return ''
  }

  return `Updated ${changes.join(', ')}`
}

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const editor = useArticleEditor()
  const {
    content,
    renderer,
    tagsInput,
    setSummary,
  } = editor
  const [saving, setSaving] = useState(false)
  const [originalRenderer, setOriginalRenderer] = useState('')
  const [originalEdit, setOriginalEdit] =
    useState<ArticleEditSnapshot | null>(null)
  const [summaryEdited, setSummaryEdited] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    api.get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then(res => {
        const a = res.data
        const renderer = (a.rendererName || 'html').toLowerCase()
        const capitalised = renderer.charAt(0).toUpperCase() + renderer.slice(1)
        editor.setTitle(a.displayName || '')
        editor.setContent(a.content || '')
        editor.setRenderer(capitalised)
        editor.setTagsInput((a.tags || []).join(', '))
        setOriginalRenderer(capitalised)
        setOriginalEdit({
          content: a.content || '',
          renderer: capitalised,
          tagsInput: (a.tags || []).join(', '),
        })
        setSummaryEdited(false)
        editor.setSummary('')
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, tenantId])

  useEffect(() => {
    if (!originalEdit || summaryEdited) return

    setSummary(buildRevisionSummary(
      originalEdit,
      {
        content,
        renderer,
        tagsInput,
      }
    ))
  }, [
    content,
    renderer,
    tagsInput,
    originalEdit,
    summaryEdited,
    setSummary,
  ])

  const handleSave = async () => {
    if (!tenantId) return
    setSaving(true)
    try {
      await api.put(`/api/articles/${name}`, {
        content: editor.content,
        summary: editor.summary || 'Updated article',
        tenant_id: tenantId,
      })

      // Save tags separately
      await api.put(`/api/articles/${name}/tags`, {
        tags: editor.parsedTags,
        tenant_id: tenantId,
      }).catch(() => {})

      // Switch renderer if changed
      if (editor.renderer !== originalRenderer) {
        await api.put(`/api/articles/${name}/renderer`, {
          renderer: editor.renderer.toLowerCase(),
          tenant_id: tenantId,
        }).catch(() => {})
      }

      router.push(`/site/${slug}/articles/${name}`)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="edit-article-page"
    >
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={`/site/${slug}/articles/${name}`}
          label="Back to Article"
          data-testid="back-to-article-btn"
        />
      </Box>
      <section aria-label="Edit article form">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
        >
          Edit Article
        </Typography>
        <ArticleEditorForm
          editor={editor}
          onSummaryChange={() => setSummaryEdited(true)}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            size="large"
            onClick={handleSave}
            disabled={saving}
            data-testid="save-article-btn"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href={`/site/${slug}/articles/${name}`}
            data-testid="cancel-edit-btn"
          >
            Cancel
          </Button>
        </Box>
      </section>
    </Container>
  )
}
