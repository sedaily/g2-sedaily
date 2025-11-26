# Changelog v2.8.0

**날짜**: 2025-11-26  
**버전**: v2.8.0

## 🎯 주요 변경사항

### ✅ 퀴즈 CRUD 완전 구현
- **생성**: 관리자 페이지에서 퀴즈 작성 및 저장
- **조회**: Archive 페이지에서 동적 로딩
- **삭제**: 관리자 페이지에서 날짜별 퀴즈 삭제

### ✅ API Gateway 설정 완료
- `/quiz` 리소스에 POST, OPTIONS 메서드 추가
- `/quiz/{proxy+}` 리소스로 모든 하위 경로 처리
- CORS 헤더 설정 완료
- Lambda 호출 권한 추가

### ✅ Lambda 함수 수정
- Python 문법 에러 수정 (닫는 중괄호 누락)
- admin-utils payload 형식 지원 추가
- `{gameType, quizDate, data: {questions}}` 구조 처리

### ✅ 관리자 페이지 개선
- "퀴즈 삭제" 탭 추가
- 게임 타입별 날짜 선택
- 퀴즈 미리보기 기능
- 실시간 삭제 기능

### ✅ 정적 사이트 최적화
- `/api/admin/deploy` 라우트 제거
- `/api/admin/metrics` 라우트 제거
- RealtimeStatus 컴포넌트 제거
- 배포 관리 페이지 CLI 명령어 안내로 변경

## 🔧 기술적 변경사항

### Backend
```python
# Lambda handler.py
- 문법 에러 수정 (36번째, 78번째 줄)
- admin-utils payload 형식 지원
- gameType, quizDate, data.questions 구조 처리
```

### Frontend
```typescript
// 새로운 컴포넌트
- components/admin/QuizList.tsx (퀴즈 삭제)

// 수정된 컴포넌트
- components/admin/DeployManager.tsx (API 호출 제거)
- app/admin/quiz/page.tsx (삭제 탭 추가)
```

### API Gateway
```bash
# 추가된 리소스
POST /quiz
OPTIONS /quiz

# 기존 리소스
ANY /quiz/{proxy+}
OPTIONS /quiz/{proxy+}
```

## 📊 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/quiz` | 퀴즈 생성 |
| GET | `/quiz/{gameType}/dates` | 날짜 목록 조회 |
| GET | `/quiz/{gameType}/{date}` | 특정 날짜 퀴즈 조회 |
| DELETE | `/quiz/{gameType}/{date}` | 퀴즈 삭제 |

## 🐛 수정된 버그

1. **502 Bad Gateway 에러**
   - 원인: Lambda 함수 Python 문법 에러
   - 해결: 닫는 중괄호 추가

2. **CORS 에러**
   - 원인: `/quiz` 리소스에 OPTIONS 메서드 없음
   - 해결: OPTIONS 메서드 및 CORS 헤더 추가

3. **관리자 페이지 502 에러**
   - 원인: 정적 사이트에 `/api/admin/*` 라우트 없음
   - 해결: API 라우트 제거, CLI 명령어 안내로 변경

4. **퀴즈 데이터 형식 불일치**
   - 원인: admin-utils와 Lambda payload 형식 차이
   - 해결: Lambda에서 두 형식 모두 지원

## 🚀 배포 방법

### Frontend
```bash
bash scripts/deploy.sh
```

### Backend (Lambda)
```bash
cd aws/quiz-lambda
zip function.zip handler.py
aws lambda update-function-code \
  --function-name sedaily-quiz-api \
  --zip-file fileb://function.zip \
  --region us-east-1
```

### CloudFront 캐시 무효화
```bash
aws cloudfront create-invalidation \
  --distribution-id E8HKFQFSQLNHZ \
  --paths "/*"
```

## 📝 사용자 가이드

### 퀴즈 생성
1. https://g2.sedaily.ai/admin/quiz 접속
2. "퀴즈 관리" 탭에서 퀴즈 작성
3. "저장" 버튼 클릭
4. 사용자는 브라우저 새로고침만 하면 퀴즈 표시

### 퀴즈 삭제
1. https://g2.sedaily.ai/admin/quiz 접속
2. "퀴즈 삭제" 탭 선택
3. 게임 타입 및 날짜 선택
4. "삭제" 버튼 클릭

### 퀴즈 플레이
1. https://g2.sedaily.ai/games/g2/archive 접속
2. 날짜 선택
3. 퀴즈 플레이

## ⚠️ 주의사항

1. **퀴즈 데이터**: DynamoDB에 저장, CloudFront 캐시 없음
2. **브라우저 캐시**: 강력 새로고침 필요 (Ctrl+Shift+R)
3. **정적 사이트**: API 라우트 작동 안 함, Lambda API 직접 호출
4. **삭제 복구**: DynamoDB에서 직접 복구 필요

## 🔗 관련 문서

- [README.md](../README.md)
- [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [DYNAMIC_QUIZ_SETUP.md](docs/DYNAMIC_QUIZ_SETUP.md)

---

**작성자**: Amazon Q  
**날짜**: 2025-11-26
