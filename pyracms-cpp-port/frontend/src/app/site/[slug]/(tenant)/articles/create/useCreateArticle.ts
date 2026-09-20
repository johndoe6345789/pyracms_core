import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import api from '@/lib/api'
import { apiErrorDetails, apiErrorMessage } from '@/lib/apiError'
import { rendererToApi } from '@/lib/renderers'

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useCreateArticle(slug: string, tenantId: number | null) {
  const router = useRouter()
  const editor = useArticleEditor()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState('')

  const create = () => {
    if (!editor.title.trim() || !editor.content.trim() || !tenantId) {
      return
    }
    setSaving(true)
    setError('')
    setErrorDetails('')
    const name = slugifyTitle(editor.title)
    api
      .post('/api/articles', {
        name,
        displayName: editor.title,
        content: editor.content,
        renderer: rendererToApi(editor.renderer),
        tenant_id: tenantId,
      })
      .then(() => router.push(`/site/${slug}/articles/${name}`))
      .catch((err: unknown) => {
        setError(apiErrorMessage(err, 'Failed to create article'))
        setErrorDetails(
          apiErrorDetails(
            err,
            `POST /api/articles (${name}, ${editor.renderer})`,
          ),
        )
      })
      .finally(() => setSaving(false))
  }

  return { editor, saving, error, errorDetails, create }
}
