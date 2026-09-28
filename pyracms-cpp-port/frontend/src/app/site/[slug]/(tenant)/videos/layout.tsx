import FeatureGuard from '@/components/common/FeatureGuard'

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="videos" name="Videos">
      {children}
    </FeatureGuard>
  )
}
