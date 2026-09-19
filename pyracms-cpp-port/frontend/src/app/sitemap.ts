import type { MetadataRoute } from 'next'
import { serverApiOrigin, siteOrigin } from '@/lib/siteOrigin'

type Entry = MetadataRoute.Sitemap[number]
type Row = { name: string; createdAt: string }

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${serverApiOrigin()}${path}`, {
      next: { revalidate: 3600 },
    })
    return res.ok ? await res.json() : null
  } catch {
    return null // API unavailable (e.g. at build time)
  }
}

async function siteEntries(
  origin: string,
  t: { id: number; slug: string },
): Promise<Entry[]> {
  const base = `${origin}/site/${encodeURIComponent(t.slug)}`
  const rows =
    (await getJson<Row[]>(`/api/articles?tenant_id=${t.id}&limit=100`)) ?? []
  return [
    { url: base, changeFrequency: 'daily', priority: 0.9 },
    ...rows.map((a): Entry => ({
      url: `${base}/articles/${encodeURIComponent(a.name)}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin()
  const home: Entry = {
    url: origin,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  }
  const tenants =
    (await getJson<{ id: number; slug: string }[]>('/api/tenants')) ?? []
  const groups = await Promise.all(tenants.map((t) => siteEntries(origin, t)))
  return [home, ...groups.flat()]
}
