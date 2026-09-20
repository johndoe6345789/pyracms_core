import FeatureGuard from '@/components/common/FeatureGuard'

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="forum" name="Forum">
      {children}
    </FeatureGuard>
  )
}
