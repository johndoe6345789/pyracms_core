import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { securityHeaders } from './security-headers'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  // API_URL is deliberately NOT inlined via `env`: that froze the build-time
  // value (localhost) into the server bundle. It is read at runtime.
  poweredByHeader: false,
  async headers() {
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
    return [{ source: '/:path*', headers: securityHeaders(api) }]
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/admin', permanent: true },
      // Links in the e-mails sent by the backend
      {
        source: '/reset-password',
        destination: '/auth/reset-password',
        permanent: false,
      },
      {
        source: '/verify-email',
        destination: '/auth/verify-email',
        permanent: false,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
