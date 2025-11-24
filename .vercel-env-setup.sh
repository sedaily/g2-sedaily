#!/bin/bash
# Vercel 환경 변수 설정 스크립트

echo "🔧 Vercel 환경 변수 설정 중..."

# .env.local에서 환경 변수 읽기
source .env.local

# Production 환경 변수 설정
vercel env add AWS_ACCESS_KEY_ID production <<< "$AWS_ACCESS_KEY_ID"
vercel env add AWS_SECRET_ACCESS_KEY production <<< "$AWS_SECRET_ACCESS_KEY"
vercel env add AWS_REGION production <<< "$AWS_REGION"
vercel env add DYNAMODB_TABLE_NAME production <<< "$DYNAMODB_TABLE_NAME"
vercel env add CLOUDFRONT_DISTRIBUTION_ID production <<< "$CLOUDFRONT_DISTRIBUTION_ID"
vercel env add ADMIN_PASSWORD production <<< "$ADMIN_PASSWORD"
vercel env add NEXT_PUBLIC_CHATBOT_API_URL production <<< "$NEXT_PUBLIC_CHATBOT_API_URL"

echo "✅ 환경 변수 설정 완료!"
