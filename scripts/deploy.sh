#!/bin/bash

echo "🚀 Starting deployment..."

# 1. API 폴더 임시 이동
echo "📦 Moving API folder..."
mv app/api ../api_backup

# 2. 빌드
echo "🔨 Building..."
rm -rf .next out
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  mv ../api_backup app/api
  exit 1
fi

# 3. RSC 페이로드 파일 제거 (robots.txt는 유지)
echo "🧹 Removing RSC payload files..."
find ./out -name "*.txt" -type f ! -name "robots.txt" -delete

# 4. S3 업로드
echo "☁️ Uploading to S3..."
aws s3 sync ./out s3://g2-frontend-ver2 --delete

if [ $? -ne 0 ]; then
  echo "❌ S3 upload failed!"
  mv ../api_backup app/api
  exit 1
fi

# 5. HTML 파일에 캐시 헤더 설정
echo "🔧 Setting cache headers for HTML files..."
find ./out -name "*.html" -type f | while read file; do
  s3_path="s3://g2-frontend-ver2/${file#./out/}"
  aws s3 cp "$file" "$s3_path" --cache-control "public, max-age=0, must-revalidate" --metadata-directive REPLACE --quiet
done

# 6. CloudFront 무효화
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"

# 7. API 폴더 복원
echo "📂 Restoring API folder..."
mv ../api_backup app/api

echo "✅ Deployment complete!"
echo "🌐 Website: https://g2.sedaily.ai"
