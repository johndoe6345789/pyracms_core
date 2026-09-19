/** next/link stand-in that renders a plain <a>. */
export const MockLink = ({
  href,
  children,
  ...rest
}: {
  href: string
  children: React.ReactNode
  [key: string]: unknown
}) => (
  <a href={href} {...rest}>
    {children}
  </a>
)
MockLink.displayName = 'MockLink'
