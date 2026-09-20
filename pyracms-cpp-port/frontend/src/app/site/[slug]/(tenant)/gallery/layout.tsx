import FeatureGuard from '@/components/common/FeatureGuard'

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="gallery" name="Gallery">
      {children}
    </FeatureGuard>
  )
}
