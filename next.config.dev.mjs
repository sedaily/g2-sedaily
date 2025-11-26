/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경 설정 (API Routes 활성화)
  trailingSlash: true,
  
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
}

export default nextConfig
