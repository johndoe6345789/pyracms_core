import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/siteOrigin'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/super-admin', '/site/*/admin', '/auth/', '/api/'],
    },
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  }
}
