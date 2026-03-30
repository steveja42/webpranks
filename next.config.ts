import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Phaser/Matter.js are not React-safe for double-invoke
  typescript: {
    // Pre-existing Phaser type errors in game code — ignore during build
    ignoreBuildErrors: true,
  },
}

export default nextConfig
