import { Inter } from 'next/font/google'
import StoreProvider from '@/store/StoreProvider'
import ThemeWrapper from '@/components/common/ThemeWrapper'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PyraCMS',
    template: '%s | PyraCMS',
  },
  description: 'A multi-tenant content management system with articles, forums, galleries, and more.',
  openGraph: {
    type: 'website',
    siteName: 'PyraCMS',
    title: 'PyraCMS',
    description: 'A multi-tenant content management system.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </StoreProvider>
      </body>
    </html>
  )
}
