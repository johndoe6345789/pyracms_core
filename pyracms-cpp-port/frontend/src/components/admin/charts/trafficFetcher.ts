import api from '@/lib/api'

export interface TrafficEntry {
  name: string
  value: number
  color: string
}

const C = {
  Articles: '#1976d2', Forum: '#2e7d32',
  'Code Snippets': '#ed6c02',
  Gallery: '#9c27b0', Other: '#757575',
} as const

export const DEFAULT_DATA: TrafficEntry[] = [
  { name: 'Articles', value: 0, color: C.Articles },
  { name: 'Forum', value: 0, color: C.Forum },
  { name: 'Code Snippets', value: 0, color: C['Code Snippets'] },
  { name: 'Gallery', value: 0, color: C.Gallery },
]

type Obj = Record<string, unknown>

export function mapTraffic(
  traffic: Obj[],
): TrafficEntry[] {
  return traffic.map((t) => ({
    name: t.name as string,
    value: (t.value || t.count) as number,
    color: C[t.name as keyof typeof C] ?? C.Other,
  }))
}

function countPosts(cats: Obj[]): number {
  return cats.reduce(
    (sum: number, c: Obj) =>
      sum + ((c.forums as Obj[]) || [])
        .reduce(
          (s: number, f: Obj) =>
            s + (Number(f.totalPosts) || 0),
          0,
        ),
    0,
  )
}

function countPics(albums: Obj[]): number {
  return albums.reduce(
    (s: number, a: Obj) =>
      s + (Number(a.pictureCount) || 0),
    0,
  )
}

export function fetchFallback(
  tid: number,
): Promise<TrafficEntry[]> {
  const q = `?tenant_id=${tid}`
  return Promise.all([
    api.get(`/api/articles${q}`)
      .then((r) => (r.data || []).length)
      .catch(() => 0),
    api.get(`/api/forum/categories${q}`)
      .then((r) => countPosts(r.data || []))
      .catch(() => 0),
    api.get(`/api/snippets${q}`)
      .then((r) =>
        (r.data.items || r.data || []).length)
      .catch(() => 0),
    api.get(`/api/gallery/albums${q}`)
      .then((r) => countPics(r.data || []))
      .catch(() => 0),
  ]).then(([a = 0, p = 0, s = 0, g = 0]) => [
    { name: 'Articles', value: a, color: C.Articles },
    { name: 'Forum', value: p, color: C.Forum },
    { name: 'Code Snippets', value: s, color: C['Code Snippets'] },
    { name: 'Gallery', value: g, color: C.Gallery },
  ])
}
