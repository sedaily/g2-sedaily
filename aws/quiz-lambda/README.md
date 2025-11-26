# Quiz API Lambda 배포 가이드

## 1. Lambda 함수 생성

```bash
aws lambda create-function \
  --function-name sedaily-quiz-api \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-dynamodb-role \
  --handler handler.lambda_handler \
  --zip-file fileb://function.zip \
  --environment Variables="{DYNAMODB_TABLE=sedaily-quiz-data}" \
  --region us-east-1
```

## 2. API Gateway 생성

### REST API 생성
```bash
aws apigateway create-rest-api \
  --name sedaily-quiz-api \
  --region us-east-1
```

### 리소스 및 메서드 설정

**엔드포인트 구조:**
```
/quiz
  /{gameType}
    /dates          GET - 날짜 목록
    /{date}         GET - 특정 날짜 퀴즈
    POST            - 퀴즈 생성
    DELETE          - 퀴즈 삭제
```

## 3. 배포

```bash
cd aws/quiz-lambda
chmod +x deploy.sh
./deploy.sh
```

## 4. 환경 변수 설정

`.env.local` 파일에 API Gateway URL 추가:
```
NEXT_PUBLIC_QUIZ_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

## API 엔드포인트

### GET /quiz/{gameType}/dates
날짜 목록 조회
```json
{
  "dates": ["2025-01-24", "2025-01-23"]
}
```

### GET /quiz/{gameType}/{date}
특정 날짜 퀴즈 조회
```json
{
  "PK": "QUIZ#BlackSwan",
  "SK": "DATE#2025-01-24",
  "questions": [...]
}
```

### POST /quiz/{gameType}
퀴즈 생성
```json
{
  "date": "2025-01-24",
  "questions": [...]
}
```

### DELETE /quiz/{gameType}/{date}
퀴즈 삭제
