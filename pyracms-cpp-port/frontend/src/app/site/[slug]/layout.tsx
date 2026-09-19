import PageViewTracker from '@/components/analytics/PageViewTracker'

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
