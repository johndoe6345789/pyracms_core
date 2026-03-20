import type { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    const res = await fetch(`${API_URL}/api/articles?tenant_id=1&limit=100`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const articles = await res.json()
      for (const article of articles) {
        entries.push({
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/site/default/articles/${article.name}`,
          lastModified: new Date(article.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // Silently continue if API is unavailable at build time
  }

  return entries
}
