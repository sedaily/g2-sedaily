#!/bin/bash

# 서울경제 AI GAMES - 퀴즈 생성 Lambda 배포 스크립트

set -e

echo "=================================="
echo "Lambda 함수 배포 시작"
echo "=================================="

# 함수 설정
FUNCTION_NAME="sedaily-quiz-generator"
REGION="us-east-1"
RUNTIME="python3.11"
HANDLER="lambda_function.lambda_handler"
TIMEOUT=900  # 15분
MEMORY=512

# 1. 임시 디렉토리 생성
echo "📦 패키지 준비 중..."
rm -rf package
mkdir -p package

# 2. 의존성 설치
echo "📥 의존성 설치 중..."
pip install -r requirements.txt -t package/ --quiet

# 3. Lambda 함수 코드 복사
echo "📄 Lambda 함수 복사 중..."
cp lambda_function.py package/

# 4. 프롬프트 파일 복사
echo "📝 프롬프트 파일 복사 중..."
cp -r prompts package/

# 5. ZIP 파일 생성
echo "🗜️  ZIP 파일 생성 중..."
cd package
zip -r ../function.zip . -q
cd ..

echo "✅ 패키지 생성 완료: function.zip"

# 6. Lambda 함수 존재 여부 확인
echo ""
echo "🔍 Lambda 함수 확인 중..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION > /dev/null 2>&1; then
    echo "📤 기존 Lambda 함수 업데이트 중..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION \
        --no-cli-pager
    
    echo "⚙️  Lambda 설정 업데이트 중..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout $TIMEOUT \
        --memory-size $MEMORY \
        --region $REGION \
        --no-cli-pager > /dev/null
    
    echo "✅ Lambda 함수 업데이트 완료"
else
    echo "❌ Lambda 함수가 존재하지 않습니다."
    echo ""
    echo "다음 명령어로 Lambda 함수를 먼저 생성하세요:"
    echo ""
    echo "aws lambda create-function \\"
    echo "  --function-name $FUNCTION_NAME \\"
    echo "  --runtime $RUNTIME \\"
    echo "  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \\"
    echo "  --handler $HANDLER \\"
    echo "  --zip-file fileb://function.zip \\"
    echo "  --timeout $TIMEOUT \\"
    echo "  --memory-size $MEMORY \\"
    echo "  --region $REGION"
    echo ""
    echo "또는 AWS 콘솔에서 Lambda 함수를 생성한 후 다시 실행하세요."
    exit 1
fi

# 7. 정리
echo ""
echo "🧹 임시 파일 정리 중..."
rm -rf package

echo ""
echo "=================================="
echo "✅ 배포 완료!"
echo "=================================="
echo ""
echo "다음 단계:"
echo "1. AWS Console → Lambda → $FUNCTION_NAME"
echo "2. Configuration → Environment variables 설정:"
echo "   - BIGKINDS_API_KEY: (당신의 API 키)"
echo "   - DYNAMODB_TABLE: sedaily-quiz-data"
echo "   - AWS_REGION: us-east-1"
echo ""
echo "3. Configuration → Permissions에서 IAM 역할 권한 확인:"
echo "   - Bedrock InvokeModel 권한"
echo "   - DynamoDB PutItem 권한"
echo ""
echo "4. EventBridge 규칙 생성:"
echo "   - Schedule: cron(0 21 * * ? *)"
echo "   - Target: $FUNCTION_NAME"
echo ""
