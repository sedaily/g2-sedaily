#!/bin/bash

# IAM 역할 및 Lambda 함수 자동 설정 스크립트

set -e

ROLE_NAME="lambda-quiz-generator-role"
FUNCTION_NAME="sedaily-quiz-generator"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "=================================="
echo "IAM 역할 및 Lambda 함수 설정"
echo "=================================="
echo "Account ID: $ACCOUNT_ID"
echo "Role Name: $ROLE_NAME"
echo "Function Name: $FUNCTION_NAME"
echo ""

# 1. IAM 역할 생성
echo "📝 1. IAM 역할 생성 중..."

cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "✅ IAM 역할이 이미 존재합니다: $ROLE_NAME"
else
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json \
        --description "Lambda quiz generator execution role" \
        --no-cli-pager
    echo "✅ IAM 역할 생성 완료: $ROLE_NAME"
fi

# 2. 기본 Lambda 실행 권한 추가
echo ""
echo "🔐 2. Lambda 기본 실행 권한 추가 중..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    --no-cli-pager 2>/dev/null || echo "   (이미 추가됨)"

# 3. Bedrock 권한 추가
echo ""
echo "🤖 3. Bedrock 권한 추가 중..."

cat > bedrock-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
    }
  ]
}
EOF

BEDROCK_POLICY_NAME="lambda-quiz-generator-bedrock-policy"

if aws iam get-policy --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${BEDROCK_POLICY_NAME} 2>/dev/null; then
    echo "   정책이 이미 존재합니다"
else
    aws iam create-policy \
        --policy-name $BEDROCK_POLICY_NAME \
        --policy-document file://bedrock-policy.json \
        --description "Bedrock Claude invocation permission" \
        --no-cli-pager
    echo "   정책 생성 완료"
fi

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${BEDROCK_POLICY_NAME} \
    --no-cli-pager 2>/dev/null || echo "   (이미 추가됨)"

echo "✅ Bedrock 권한 추가 완료"

# 4. DynamoDB 권한 추가
echo ""
echo "💾 4. DynamoDB 권한 추가 중..."

cat > dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:${ACCOUNT_ID}:table/sedaily-quiz-data"
    }
  ]
}
EOF

DYNAMODB_POLICY_NAME="lambda-quiz-generator-dynamodb-policy"

if aws iam get-policy --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${DYNAMODB_POLICY_NAME} 2>/dev/null; then
    echo "   정책이 이미 존재합니다"
else
    aws iam create-policy \
        --policy-name $DYNAMODB_POLICY_NAME \
        --policy-document file://dynamodb-policy.json \
        --description "DynamoDB quiz data write permission" \
        --no-cli-pager
    echo "   정책 생성 완료"
fi

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${DYNAMODB_POLICY_NAME} \
    --no-cli-pager 2>/dev/null || echo "   (이미 추가됨)"

echo "✅ DynamoDB 권한 추가 완료"

# 5. IAM 역할 전파 대기
echo ""
echo "⏳ 5. IAM 역할 전파 대기 중 (10초)..."
sleep 10

# 6. Lambda 함수 생성
echo ""
echo "🚀 6. Lambda 함수 생성 중..."

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "✅ Lambda 함수가 이미 존재합니다: $FUNCTION_NAME"
    echo "   코드만 업데이트합니다..."
    
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION \
        --no-cli-pager
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout 900 \
        --memory-size 512 \
        --region $REGION \
        --no-cli-pager > /dev/null
    
    echo "✅ Lambda 함수 업데이트 완료"
else
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.11 \
        --role $ROLE_ARN \
        --handler lambda_function.lambda_handler \
        --zip-file fileb://function.zip \
        --timeout 900 \
        --memory-size 512 \
        --region $REGION \
        --description "Sedaily AI GAMES quiz auto generator" \
        --no-cli-pager
    
    echo "✅ Lambda 함수 생성 완료"
fi

# 7. 정리
echo ""
echo "🧹 7. 임시 파일 정리 중..."
rm -f trust-policy.json bedrock-policy.json dynamodb-policy.json

echo ""
echo "=================================="
echo "✅ 설정 완료!"
echo "=================================="
echo ""
echo "다음 단계:"
echo "1. 환경 변수 설정:"
echo "   aws lambda update-function-configuration \\"
echo "     --function-name $FUNCTION_NAME \\"
echo "     --environment Variables='{BIGKINDS_API_KEY=YOUR_KEY,DYNAMODB_TABLE=sedaily-quiz-data,AWS_REGION=us-east-1}' \\"
echo "     --region $REGION"
echo ""
echo "2. EventBridge 규칙 생성:"
echo "   AWS Console → EventBridge → Rules → Create rule"
echo "   - Schedule: cron(0 21 * * ? *)"
echo "   - Target: Lambda → $FUNCTION_NAME"
echo ""
echo "3. 테스트 실행:"
echo "   aws lambda invoke \\"
echo "     --function-name $FUNCTION_NAME \\"
echo "     --region $REGION \\"
echo "     response.json"
echo ""
