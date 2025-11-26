#!/bin/bash

echo "🚀 Starting deployment..."

# 1. API 폴더 임시 이동
echo "📦 Moving API folder..."
mv app/api ../api_backup

# 2. 빌드
echo "🔨 Building..."
rm -rf .next out
pnpm next build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  mv ../api_backup app/api
  exit 1
fi

# 3. S3 업로드
echo "☁️ Uploading to S3..."
aws s3 sync ./out s3://g2-frontend-ver2 --delete

if [ $? -ne 0 ]; then
  echo "❌ S3 upload failed!"
  mv ../api_backup app/api
  exit 1
fi

# 4. CloudFront 무효화
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"

# 5. API 폴더 복원
echo "📂 Restoring API folder..."
mv ../api_backup app/api

echo "✅ Deployment complete!"
echo "🌐 Website: https://g2.sedaily.ai"
