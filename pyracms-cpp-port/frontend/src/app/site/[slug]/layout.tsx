import type { Metadata } from 'next'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import { fetchSiteSettings } from '@/lib/siteSettingsServer'
import { siteMetadata } from '@/lib/siteMetadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return siteMetadata(await fetchSiteSettings((await params).slug))
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  )
}
