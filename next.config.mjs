/** @type {import('next').NextConfig} */
const nextConfig = {
  // 동적 사이트 설정 (Lambda@Edge 또는 Vercel)
  // output: 'export' 제거 - API Routes 활성화
  trailingSlash: true,
  
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // CloudFront/S3 직접 서빙 (Next.js 이미지 최적화 비활성화)
    loader: 'custom', // 커스텀 이미지 로더 사용
    loaderFile: './lib/image-loader.js', // 이미지 로더 파일
  },
  // 프로덕션 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: false, // CloudFront에서 ETag 처리
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'], // 패키지 임포트 최적화
  },
  
  // Webpack 설정: api_temp 폴더 제외
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/app/api_temp/**'],
    };
    return config;
  },
}

export default nextConfig
