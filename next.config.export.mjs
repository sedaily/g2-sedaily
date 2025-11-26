/** @type {import('next').NextConfig} */
const nextConfig = {
  // CloudFront 정적 배포 설정
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
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
