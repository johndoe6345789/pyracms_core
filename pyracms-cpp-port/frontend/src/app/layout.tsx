import { Inter } from 'next/font/google'
import StoreProvider from '@/store/StoreProvider'
import ThemeWrapper from '@/components/common/ThemeWrapper'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PyraCMS',
    template: '%s | PyraCMS',
  },
  description:
    'A multi-tenant content management system with articles, '
    + 'forums, galleries, and more.',
  openGraph: {
    type: 'website',
    siteName: 'PyraCMS',
    title: 'PyraCMS',
    description: 'A multi-tenant content management system.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <ThemeWrapper>
              {children}
            </ThemeWrapper>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
