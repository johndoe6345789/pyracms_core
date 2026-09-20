import FeatureGuard from '@/components/common/FeatureGuard'

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="hypernucleus" name="Hypernucleus">
      {children}
    </FeatureGuard>
  )
}
