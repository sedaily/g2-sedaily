#!/bin/bash

# AWS 설정 확인
echo "🔍 AWS 설정 확인 중..."
aws sts get-caller-identity

# 변수 설정
FUNCTION_NAME="sedaily-quiz-unified"
REGION="ap-northeast-2"
ROLE_NAME="sedaily-quiz-lambda-role"
TABLE_NAME="sedaily-quiz-data"

echo "📦 Lambda 함수 배포 시작..."
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Table: $TABLE_NAME"

# 1. DynamoDB 테이블 생성 (이미 존재하면 스킵)
echo "🗄️ DynamoDB 테이블 확인/생성 중..."
aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION 2>/dev/null || {
    echo "테이블이 없습니다. 새로 생성합니다..."
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=PK,AttributeType=S \
            AttributeName=SK,AttributeType=S \
        --key-schema \
            AttributeName=PK,KeyType=HASH \
            AttributeName=SK,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION
    
    echo "⏳ 테이블 생성 대기 중..."
    aws dynamodb wait table-exists --table-name $TABLE_NAME --region $REGION
    echo "✅ DynamoDB 테이블 생성 완료"
}

# 2. IAM 역할 생성 (이미 존재하면 스킵)
echo "🔐 IAM 역할 확인/생성 중..."
aws iam get-role --role-name $ROLE_NAME 2>/dev/null || {
    echo "역할이 없습니다. 새로 생성합니다..."
    
    # Trust Policy 생성
    cat > trust-policy.json << EOF
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

    # IAM 역할 생성
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json

    # 기본 Lambda 실행 정책 연결
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    # DynamoDB 접근 정책 생성 및 연결
    cat > dynamodb-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:$REGION:*:table/$TABLE_NAME"
        }
    ]
}
EOF

    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name DynamoDBAccess \
        --policy-document file://dynamodb-policy.json

    echo "⏳ IAM 역할 전파 대기 중..."
    sleep 10
    echo "✅ IAM 역할 생성 완료"
}

# 3. Lambda 함수 패키징
echo "📦 Lambda 함수 패키징 중..."
zip -r quiz-lambda.zip quiz-handler.py

# 4. Lambda 함수 배포
echo "🚀 Lambda 함수 배포 중..."

# 계정 ID 가져오기
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

# 함수 존재 여부 확인
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null && {
    echo "기존 함수 업데이트 중..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://quiz-lambda.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment Variables="{DYNAMODB_TABLE=$TABLE_NAME}" \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION
} || {
    echo "새 함수 생성 중..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.11 \
        --role $ROLE_ARN \
        --handler quiz-handler.lambda_handler \
        --zip-file fileb://quiz-lambda.zip \
        --environment Variables="{DYNAMODB_TABLE=$TABLE_NAME}" \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION
}

# 5. API Gateway 생성 (수동으로 해야 함)
echo "🌐 API Gateway 설정이 필요합니다:"
echo "1. AWS Console에서 API Gateway 생성"
echo "2. REST API 선택"
echo "3. 리소스 생성: /quizzes"
echo "4. 메서드 생성: GET, POST, OPTIONS"
echo "5. Lambda 함수 연결: $FUNCTION_NAME"
echo "6. CORS 활성화"
echo "7. API 배포"

# 정리
rm -f trust-policy.json dynamodb-policy.json quiz-lambda.zip

echo "✅ Lambda 함수 배포 완료!"
echo "Function ARN: arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME"
echo "DynamoDB Table: $TABLE_NAME"