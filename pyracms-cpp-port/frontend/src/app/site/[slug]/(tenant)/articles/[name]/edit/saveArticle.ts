import api from '@/lib/api'
import { rendererToApi } from '@/lib/renderers'
import { apiErrorMessage } from '@/lib/apiError'

interface SaveArgs {
  name: string
  tenantId: number
  content: string
  summary: string
  tags: string[]
  renderer: string
  origRenderer: string
}

/** Content saved, but a follow-up (tags/renderer) failed. */
export class PartialSaveError extends Error {}

async function step(what: string, p: Promise<unknown>) {
  try {
    await p
  } catch (e) {
    const why = apiErrorMessage(e, `could not save ${what}`)
    throw new PartialSaveError(`Article saved, but ${what} failed: ${why}`)
  }
}

/** Persists content, then tags and renderer. */
export async function saveArticle(a: SaveArgs) {
  await api.put(`/api/articles/${a.name}`, {
    content: a.content,
    summary: a.summary || 'Updated article',
    tenant_id: a.tenantId,
  })
  await step(
    'tags',
    api.put(`/api/articles/${a.name}/tags`, {
      tags: a.tags,
      tenant_id: a.tenantId,
    }),
  )
  if (a.renderer !== a.origRenderer) {
    await step(
      'renderer',
      api.put(`/api/articles/${a.name}/renderer`, {
        renderer: rendererToApi(a.renderer),
        tenant_id: a.tenantId,
      }),
    )
  }
}
