import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { securityHeaders } from './security-headers'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8080',
  },
  poweredByHeader: false,
  async headers() {
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
    return [{ source: '/:path*', headers: securityHeaders(api) }]
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/admin', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
