import FeatureGuard from '@/components/common/FeatureGuard'

export default function DownloadLayout({
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
