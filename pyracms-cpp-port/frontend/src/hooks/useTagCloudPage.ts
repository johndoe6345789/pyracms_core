'use client'

import { useParams } from 'next/navigation'
import { useTagCloud } from '@/hooks/useTagCloud'
import { useTenantId } from '@/hooks/useTenantId'

export interface TagCloudViewItem {
  /** 0..1: how common the tag is, for weight and colour */
  weight: number
  count: number
  fontSize: number
  height: number
  href: string
  name: string
}

/** The articles carrying this tag (not a text search for its name). */
function tagHref(slug: string, tag: string) {
  return `/site/${slug}/articles?tag=${encodeURIComponent(tag)}`
}

export function useTagCloudPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { tags, loading } = useTagCloud(tenantId)
  const maxCount = Math.max(...tags.map((tag) => tag.count), 1)
  const items: TagCloudViewItem[] = tags.map((tag) => {
    const weight = tag.count / maxCount
    return {
      weight,
      count: tag.count,
      fontSize: 15 + weight * 25,
      height: 32 + weight * 8,
      href: tagHref(slug, tag.name),
      name: tag.name,
    }
  })

  return { items, loading }
}
