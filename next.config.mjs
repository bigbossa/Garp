/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/graph',
  assetPrefix: '/graph',
  devIndicators: {
    buildActivity: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
}

export default nextConfig
