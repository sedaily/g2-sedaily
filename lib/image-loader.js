// CloudFront/S3용 이미지 로더
export default function cloudFrontLoader({ src }) {
  // 이미 최적화된 WebP 이미지들은 그대로 반환
  if (src.startsWith('/')) {
    return src
  }
  
  // 외부 이미지의 경우 원본 반환
  return src
}
