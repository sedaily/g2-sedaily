# 통합 퀴즈 API 배포 가이드

관리자 페이지에서 퀴즈를 업데이트하면 실제 사용자 화면에 반영되는 완전한 시스템입니다.

## 🏗 아키텍처

```
관리자 페이지 → API Gateway → Lambda → DynamoDB ← Lambda ← API Gateway ← 사용자 페이지
```

- **DynamoDB**: `sedaily-quiz-data` 테이블 (퀴즈 데이터 저장)
- **Lambda**: `sedaily-quiz-unified` 함수 (저장/조회 통합)
- **API Gateway**: REST API (CORS 활성화)

## 🚀 배포 단계

### 1단계: AWS CLI 설정 확인
```bash
aws configure list
aws sts get-caller-identity
```

### 2단계: Lambda 함수 및 DynamoDB 배포
```bash
cd /Users/minseolee/Desktop/g2-clone/aws/unified-quiz-lambda
./deploy.sh
```

이 스크립트는 자동으로 다음을 수행합니다:
- ✅ DynamoDB 테이블 생성 (`sedaily-quiz-data`)
- ✅ IAM 역할 생성 (Lambda 실행 + DynamoDB 접근 권한)
- ✅ Lambda 함수 배포 (`sedaily-quiz-unified`)

### 3단계: API Gateway 수동 설정

AWS Console에서 다음을 수행하세요:

1. **API Gateway 생성**
   - REST API 선택
   - 이름: `sedaily-quiz-api`
   - 리전: `ap-northeast-2`

2. **리소스 구조 생성**
   ```
   /
   └── quizzes
       ├── {proxy+}  (ANY 메서드)
       └── OPTIONS   (CORS용)
   ```

3. **Lambda 통합 설정**
   - 메서드: `ANY`
   - Lambda 함수: `sedaily-quiz-unified`
   - Lambda 프록시 통합 사용: ✅

4. **CORS 활성화**
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Methods: `GET,POST,OPTIONS`
   - Access-Control-Allow-Headers: `Content-Type,Authorization`

5. **API 배포**
   - 스테이지: `prod`
   - 배포 후 엔드포인트 URL 복사

### 4단계: 환경 변수 업데이트

`.env` 파일에서 API URL을 실제 엔드포인트로 변경:

```env
# 예시: https://abc123def.execute-api.ap-northeast-2.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://YOUR_API_ID.execute-api.ap-northeast-2.amazonaws.com/prod/quizzes
NEXT_PUBLIC_QUIZ_API_URL=https://YOUR_API_ID.execute-api.ap-northeast-2.amazonaws.com/prod/quizzes/all
```

### 5단계: API 테스트

```bash
# API URL을 실제 엔드포인트로 수정 후 실행
./test-api.sh
```

## 📊 API 엔드포인트

### 저장 (관리자용)
```http
POST /quizzes
Content-Type: application/json

{
  "gameType": "BlackSwan",
  "quizDate": "2025-01-17",
  "data": {
    "questions": [...]
  }
}
```

### 조회 (사용자용)
```http
# 전체 데이터
GET /quizzes/all

# 날짜별 데이터
GET /quizzes/BlackSwan/2025-01-17

# 메타데이터 (날짜 목록)
GET /quizzes/meta/BlackSwan
```

## 🔄 작동 흐름

1. **관리자가 퀴즈 작성** → Admin 페이지에서 실시간 미리보기
2. **저장 버튼 클릭** → Lambda 함수로 POST 요청
3. **DynamoDB에 저장** → 기존 데이터 덮어쓰기 또는 새로 생성
4. **캐시 무효화** → 클라이언트 사이드 캐시 초기화
5. **사용자 페이지 새로고침** → 업데이트된 데이터 즉시 반영

## 🛠 DynamoDB 스키마

```json
{
  "PK": "QUIZ#BlackSwan",           // 파티션 키
  "SK": "2025-01-17",               // 정렬 키 (날짜)
  "gameType": "BlackSwan",
  "quizDate": "2025-01-17",
  "questions": [...],               // 퀴즈 문제 배열
  "questionCount": 5,
  "createdAt": "2025-01-17T10:00:00Z",
  "updatedAt": "2025-01-17T15:30:00Z"
}
```

## 🔧 트러블슈팅

### Lambda 함수 로그 확인
```bash
aws logs tail /aws/lambda/sedaily-quiz-unified --follow
```

### DynamoDB 데이터 확인
```bash
aws dynamodb scan --table-name sedaily-quiz-data --region ap-northeast-2
```

### API Gateway 테스트
AWS Console → API Gateway → 테스트 탭에서 직접 테스트 가능

## 📈 성능 최적화

- **캐싱**: 클라이언트 사이드 15분 캐시
- **DynamoDB**: On-Demand 빌링 (트래픽에 따라 자동 스케일링)
- **Lambda**: 256MB 메모리, 30초 타임아웃
- **API Gateway**: 기본 스로틀링 (10,000 RPS)

## 🔒 보안

- **CORS**: 특정 도메인만 허용 가능
- **IAM**: Lambda 함수는 DynamoDB 테이블에만 접근 권한
- **API Key**: 필요시 API Gateway에서 API 키 인증 추가 가능

## ✅ 완료 체크리스트

- [ ] AWS CLI 설정 완료
- [ ] `./deploy.sh` 실행 완료
- [ ] API Gateway 수동 설정 완료
- [ ] `.env` 파일 업데이트 완료
- [ ] `./test-api.sh` 테스트 통과
- [ ] 관리자 페이지에서 퀴즈 저장 테스트
- [ ] 사용자 페이지에서 업데이트 확인

## 🆘 지원

문제 발생 시:
1. CloudWatch 로그 확인
2. API Gateway 테스트 콘솔 사용
3. DynamoDB 콘솔에서 데이터 직접 확인