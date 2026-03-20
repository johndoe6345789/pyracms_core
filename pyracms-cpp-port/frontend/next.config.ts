import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

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
  async redirects() {
    return [
      { source: '/dashboard', destination: '/admin', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
