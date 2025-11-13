/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'replicate.delivery'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
