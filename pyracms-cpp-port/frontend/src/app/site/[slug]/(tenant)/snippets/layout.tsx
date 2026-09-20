import FeatureGuard from '@/components/common/FeatureGuard'

export default function SnippetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature="code_snippets" name="Code Snippets">
      {children}
    </FeatureGuard>
  )
}
