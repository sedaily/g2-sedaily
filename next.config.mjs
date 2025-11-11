/** @type {import('next').NextConfig} */
const nextConfig = {
  // CloudFront 정적 배포 설정
  output: 'export', // 정적 export (S3/CloudFront용)
  trailingSlash: true, // S3 경로 충돌 방지 (/games/ → /games/index.html)
  distDir: 'out', // export 결과 폴더
  
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
}

export default nextConfig
