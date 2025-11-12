import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Fixed: Use serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ['mongoose'],
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
  },
}

export default nextConfig