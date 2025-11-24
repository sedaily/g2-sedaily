# Changelog

## [2.6.0] - 2025-11-24

### 🎯 하이브리드 아키텍처 전환

#### Added
- CloudFront + API Gateway 통합 아키텍처
- 3개 Origins 설정 (S3, Quiz API, Chatbot API)
- REST API 라우팅 (/api/quiz/*, /api/admin/*, /api/chat/*)
- 자동 CloudFront 설정 스크립트 (update-cloudfront.mjs)
- 환경 변수 검증 스크립트 (verify-env.mjs)

#### Changed
- 정적 사이트 + 동적 API 하이브리드 구조
- API 엔드포인트를 CloudFront 경로로 변경
- 기존 S3 + CloudFront 인프라 활용

#### Infrastructure
- CloudFront: E8HKFQFSQLNHZ (3 Origins)
- S3: g2-frontend-ver2 (정적 파일)
- API Gateway: Quiz API, Chatbot API
- Lambda: sedaily-quiz-handler, sedaily-chatbot-dev-handler

### 📝 배포 방식
- 정적 파일: S3 → CloudFront
- API 요청: CloudFront → API Gateway → Lambda
- 단일 도메인: https://g2.sedaily.ai

---

## [2.5.0] - 2025-01-24

### 동적 사이트 전환
- API Routes 활성화
- 실시간 데이터 업데이트 (30초 폴링)
- AWS SDK 통합

---

## [2.4.0] - 2025-01-24

### AWS 고급 기능
- DynamoDB Streams + Lambda 자동 배포
- CloudWatch Dashboard + Alarms
- SNS 알림 시스템

---

## [2.3.0] - 2025-01-24

### 모니터링 & 자동화
- 자동 재배포 시스템
- Slack/Discord 알림
- 성능 모니터링 대시보드

---

## [2.2.0] - 2025-11-24

### 퀴즈 시스템 개선
- Play 버튼 → 최신 퀴즈 자동 이동
- 테스트 퀴즈 폴백
- DynamoDB 퀴즈 우선 로드

---

## [2.1.1] - 2025-11-24

### 버그 수정
- 404 에러 해결
- 퀴즈 답변 선택 로직 수정
- 퀴즈 재시작 기능 개선

---

## [2.1.0] - 2025-11-20

### 백엔드 개선
- 17개 상수 중앙 관리
- 구체적 예외 처리
- IAM 최소 권한
- 민감 정보 마스킹
