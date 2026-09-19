import type { Metadata } from 'next'
import { serverApiOrigin, siteOrigin, tenantIdOf } from './siteOrigin'

async function articleUrl(
  kind: 'opengraph' | 'jsonld', slug: string, name: string,
): Promise<string | null> {
  const tenantId = await tenantIdOf(slug)
  if (!tenantId) return null
  const base = encodeURIComponent(`${await siteOrigin()}/site/${slug}`)
  return `${serverApiOrigin()}/api/articles/${encodeURIComponent(name)}`
    + `/${kind}?tenant_id=${tenantId}&base_url=${base}`
}

export async function generateArticleMetadata(
  slug: string,
  name: string,
): Promise<Metadata> {
  try {
    const url = await articleUrl('opengraph', slug, name)
    if (!url) return { title: name }
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) return {}

    const og = await res.json()

    return {
      title: og['og:title'] || name,
      description: og['og:description'] || '',
      openGraph: {
        type: 'article',
        title: og['og:title'] || name,
        description: og['og:description'] || '',
        url: og['og:url']
          || `${await siteOrigin()}/site/${slug}/articles/${name}`,
        publishedTime: og['article:published_time'],
        authors: og['article:author'] ? [og['article:author']] : undefined,
      },
    }
  } catch {
    return { title: name }
  }
}

export async function fetchArticleJsonLd(
  slug: string,
  name: string,
): Promise<Record<string, unknown> | null> {
  try {
    const url = await articleUrl('jsonld', slug, name)
    if (!url) return null
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
