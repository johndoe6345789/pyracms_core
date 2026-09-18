import React from 'react'

type Props = {
  href: string
  children: React.ReactNode
  [key: string]: unknown
}

/** next/link stand-in that renders a plain <a>. */
export const linkMock = ({ href, children, ...rest }: Props) => (
  <a href={href} {...rest}>{children}</a>
)
linkMock.displayName = 'MockLink'
