# 동적 퀴즈 시스템 설정 가이드

## 개요

정적 사이트는 그대로 유지하면서, 퀴즈 데이터만 API Gateway + Lambda + DynamoDB로 동적 처리합니다.

**아키텍처:**
- 정적 사이트 (S3 + CloudFront) - 변경 없음
- API Gateway → Lambda → DynamoDB (퀴즈 CRUD)
- Archive 페이지에서 동적으로 퀴즈 목록 로드
- EventBridge → Lambda (매일 자동 퀴즈 생성)

## 1. Lambda 함수 배포

### 1.1 Lambda 함수 생성

```bash
cd aws/quiz-lambda

# 배포 패키지 생성
zip function.zip handler.py

# Lambda 함수 생성
aws lambda create-function \
  --function-name sedaily-quiz-api \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-dynamodb-role \
  --handler handler.lambda_handler \
  --zip-file fileb://function.zip \
  --environment Variables="{DYNAMODB_TABLE=sedaily-quiz-data}" \
  --region us-east-1 \
  --timeout 30 \
  --memory-size 256
```

### 1.2 IAM Role 생성 (필요시)

```bash
# Trust policy 파일 생성
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Role 생성
aws iam create-role \
  --role-name lambda-dynamodb-role \
  --assume-role-policy-document file://trust-policy.json

# DynamoDB 권한 추가
aws iam attach-role-policy \
  --role-name lambda-dynamodb-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# CloudWatch Logs 권한 추가
aws iam attach-role-policy \
  --role-name lambda-dynamodb-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## 2. API Gateway 설정

### 2.1 REST API 생성

```bash
# API 생성
API_ID=$(aws apigateway create-rest-api \
  --name sedaily-quiz-api \
  --region us-east-1 \
  --query 'id' \
  --output text)

echo "API ID: $API_ID"

# Root 리소스 ID 가져오기
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region us-east-1 \
  --query 'items[0].id' \
  --output text)
```

### 2.2 리소스 생성

```bash
# /quiz 리소스
QUIZ_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part quiz \
  --region us-east-1 \
  --query 'id' \
  --output text)

# /quiz/{gameType}
GAMETYPE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $QUIZ_ID \
  --path-part '{gameType}' \
  --region us-east-1 \
  --query 'id' \
  --output text)

# /quiz/{gameType}/dates
DATES_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $GAMETYPE_ID \
  --path-part dates \
  --region us-east-1 \
  --query 'id' \
  --output text)

# /quiz/{gameType}/{date}
DATE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $GAMETYPE_ID \
  --path-part '{date}' \
  --region us-east-1 \
  --query 'id' \
  --output text)
```

### 2.3 메서드 생성 및 Lambda 통합

```bash
# Lambda ARN
LAMBDA_ARN="arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:sedaily-quiz-api"

# GET /quiz/{gameType}/dates
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $DATES_ID \
  --http-method GET \
  --authorization-type NONE \
  --region us-east-1

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $DATES_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
  --region us-east-1

# GET /quiz/{gameType}/{date}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $DATE_ID \
  --http-method GET \
  --authorization-type NONE \
  --region us-east-1

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $DATE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
  --region us-east-1

# POST /quiz/{gameType}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $GAMETYPE_ID \
  --http-method POST \
  --authorization-type NONE \
  --region us-east-1

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $GAMETYPE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
  --region us-east-1

# DELETE /quiz/{gameType}/{date}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $DATE_ID \
  --http-method DELETE \
  --authorization-type NONE \
  --region us-east-1

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $DATE_ID \
  --http-method DELETE \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
  --region us-east-1
```

### 2.4 CORS 설정

```bash
# OPTIONS 메서드 추가 (각 리소스마다)
for RESOURCE_ID in $DATES_ID $DATE_ID $GAMETYPE_ID; do
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region us-east-1

  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --region us-east-1

  aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
    --region us-east-1
done
```

### 2.5 Lambda 권한 부여

```bash
aws lambda add-permission \
  --function-name sedaily-quiz-api \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:YOUR_ACCOUNT_ID:$API_ID/*/*" \
  --region us-east-1
```

### 2.6 API 배포

```bash
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region us-east-1

# API URL 출력
echo "API URL: https://$API_ID.execute-api.us-east-1.amazonaws.com/prod"
```

## 3. 환경 변수 설정

`.env.local` 파일 업데이트:

```bash
NEXT_PUBLIC_QUIZ_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/quiz
```

## 4. 테스트

### 4.1 날짜 목록 조회

```bash
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/quiz/BlackSwan/dates
```

### 4.2 퀴즈 생성

```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/quiz/BlackSwan \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-24",
    "questions": [
      {
        "question_text": "테스트 질문",
        "choices": ["A", "B", "C"],
        "correct_index": 0
      }
    ]
  }'
```

### 4.3 퀴즈 조회

```bash
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/quiz/BlackSwan/2025-01-24
```

## 5. 프론트엔드 재배포

```bash
# 빌드 (API 폴더 제외)
mv app/api ../api_backup
rm -rf .next out
pnpm next build

# S3 업로드
aws s3 sync ./out s3://g2-frontend-ver2 --delete

# CloudFront 무효화
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"

# API 폴더 복원
mv ../api_backup app/api
```

## 6. 사용 흐름

### 관리자 페이지에서 퀴즈 생성
1. https://g2.sedaily.ai/admin/quiz 접속
2. 퀴즈 작성 및 저장
3. API Gateway → Lambda → DynamoDB 저장

### 사용자 페이지에서 퀴즈 확인
1. https://g2.sedaily.ai/games/g1/archive 접속
2. API Gateway에서 날짜 목록 로드
3. 날짜 선택 시 해당 퀴즈 로드
4. 퀴즈 플레이

## API 엔드포인트 정리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /quiz/{gameType}/dates | 날짜 목록 조회 |
| GET | /quiz/{gameType}/{date} | 특정 날짜 퀴즈 조회 |
| POST | /quiz/{gameType} | 퀴즈 생성 |
| DELETE | /quiz/{gameType}/{date} | 퀴즈 삭제 |

**gameType**: `BlackSwan`, `PrisonersDilemma`, `SignalDecoding`

## 7. 자동 퀴즈 생성 스케줄 설정 (EventBridge)

매일 오전 6시 (KST)에 자동으로 퀴즈를 생성하도록 EventBridge 규칙을 설정합니다.

### 7.1 EventBridge 규칙 생성

```bash
# 매일 오전 6시 (KST) = 전날 21시 (UTC) 실행
aws events put-rule \
  --name sedaily-quiz-daily \
  --schedule-expression "cron(0 21 * * ? *)" \
  --state ENABLED \
  --region us-east-1
```

### 7.2 Lambda 함수에 권한 부여

```bash
aws lambda add-permission \
  --function-name sedaily-quiz-generator \
  --statement-id sedaily-quiz-daily-event \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:887078546492:rule/sedaily-quiz-daily \
  --region us-east-1
```

### 7.3 EventBridge 규칙에 Lambda 타겟 추가

```bash
aws events put-targets \
  --rule sedaily-quiz-daily \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:887078546492:function:sedaily-quiz-generator" \
  --region us-east-1
```

### 7.4 스케줄 확인

```bash
# 규칙 상태 확인
aws events describe-rule \
  --name sedaily-quiz-daily \
  --region us-east-1

# 타겟 확인
aws events list-targets-by-rule \
  --rule sedaily-quiz-daily \
  --region us-east-1
```

**스케줄 설명:**
- `cron(0 21 * * ? *)`: 매일 UTC 21:00 (KST 다음날 06:00)
- 한국 시간 기준 매일 오전 6시에 자동 실행
- Lambda 함수가 BigKinds API에서 뉴스를 가져와 퀴즈 생성
