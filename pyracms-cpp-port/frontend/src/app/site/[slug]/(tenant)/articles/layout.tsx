import FeatureGuard from '@/components/common/FeatureGuard'

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="articles" name="Articles">
      {children}
    </FeatureGuard>
  )
}
