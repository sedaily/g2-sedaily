#!/bin/bash

# 자동 배포 트리거 Lambda 배포 스크립트

set -e

echo "📦 Deploying Auto-Deploy Trigger Lambda..."

cd backend/lambda

# 패키지 생성
echo "Creating deployment package..."
mkdir -p package
pip install -r requirements-auto-deploy.txt -t package/
cp auto-deploy-trigger.py package/
cd package
zip -r ../auto-deploy-trigger.zip .
cd ..

# Lambda 함수 생성 또는 업데이트
echo "Deploying to AWS Lambda..."

FUNCTION_NAME="g2-auto-deploy-trigger"
ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"

# 함수 존재 확인
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
  echo "Updating existing function..."
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://auto-deploy-trigger.zip
else
  echo "Creating new function..."
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime python3.11 \
    --role $ROLE_ARN \
    --handler auto-deploy-trigger.lambda_handler \
    --zip-file fileb://auto-deploy-trigger.zip \
    --timeout 60 \
    --memory-size 256 \
    --environment Variables="{S3_BUCKET=g2-frontend-ver2,CLOUDFRONT_ID=E8HKFQFSQLNHZ}"
fi

# DynamoDB Streams 트리거 연결
echo "Connecting DynamoDB Streams trigger..."
STREAM_ARN=$(aws dynamodb describe-table --table-name sedaily-quiz-data --query 'Table.LatestStreamArn' --output text)

aws lambda create-event-source-mapping \
  --function-name $FUNCTION_NAME \
  --event-source-arn $STREAM_ARN \
  --starting-position LATEST \
  --batch-size 10 \
  2>/dev/null || echo "Trigger already exists"

echo "✅ Auto-Deploy Trigger Lambda deployed successfully!"
echo "🔗 Function: $FUNCTION_NAME"
echo "📊 Stream: $STREAM_ARN"

# 정리
rm -rf package auto-deploy-trigger.zip

cd ../..
