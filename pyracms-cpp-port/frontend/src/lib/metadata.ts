import type { Metadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateArticleMetadata(
  slug: string,
  name: string,
  tenantId: number = 1
): Promise<Metadata> {
  try {
    const res = await fetch(
      `${API_URL}/api/articles/${name}/opengraph?tenant_id=${tenantId}&base_url=${SITE_URL}/site/${slug}`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) return {}

    const og = await res.json()

    return {
      title: og['og:title'] || name,
      description: og['og:description'] || '',
      openGraph: {
        type: 'article',
        title: og['og:title'] || name,
        description: og['og:description'] || '',
        url: og['og:url'] || `${SITE_URL}/site/${slug}/articles/${name}`,
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
  tenantId: number = 1
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/articles/${name}/jsonld?tenant_id=${tenantId}&base_url=${SITE_URL}/site/${slug}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
