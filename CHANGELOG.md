# Changelog

## [2.5.0] - 2025-01-24

### Added - 동적 사이트 전환
- **API Routes 활성화**: Next.js API Routes 사용
- **실시간 업데이트**: 30초 폴링 시스템
- **관리자 ↔ 사용자 실시간 소통**: 즉시 반영
- **AWS SDK 통합**: DynamoDB, CloudFront, CloudWatch
- **실시간 메트릭**: 관리자 페이지에서 확인
- **원클릭 캐시 무효화**: CloudFront API 직접 호출

### API Endpoints
- `POST /api/admin/quiz` - 퀴즈 저장
- `GET /api/admin/quiz` - 혴즈 조회
- `POST /api/admin/deploy` - 캐시 무효화
- `GET /api/admin/metrics` - 실시간 메트릭
- `GET /api/quiz/latest` - 최신 혴즈 조회

### Hooks
- `useRealtimeQuiz` - 실시간 혴즈 폴링 훅

### Changed
- **next.config.mjs**: `output: 'export'` 제거
- **배포 방식**: S3 정적 → Vercel/Amplify 동적
- **데이터 흐름**: 정적 JSON → 실시간 API

### Documentation
- `DYNAMIC_DEPLOYMENT.md` - 동적 배포 가이드
- `vercel.json` - Vercel 설정

## [2.4.0] - 2025-01-24

### Added - AWS 고급 기능 통합
- **DynamoDB Streams + Lambda**: 자동 배포 트리거 시스템
- **CloudWatch Dashboard**: 통합 모니터링 대시보드
- **SNS 알림**: 배포/에러 자동 알림
- **CloudWatch Alarms**: Lambda/DynamoDB 알람 설정
- **S3 Bucket Policy**: CloudFront 전용 보안 강화
- **자동화 스크립트**: `aws-setup.mjs` (6개 명령)
- **Lambda 함수**: `auto-deploy-trigger.py` (자동 배포)

### Added - 관리자 페이지 통합
- **배포 관리 탭**: 원클릭 배포, 캐시 무효화
- **실시간 메트릭**: DynamoDB, CloudFront, Lambda 상태
- **배포 API**: `/api/admin/deploy`, `/api/admin/metrics`
- **DeployManager 컴포넌트**: 통합 배포 UI

### Documentation
- `AWS_OPTIMIZATION.md`: AWS 최적화 가이드 (10개 서비스)
- `ADMIN_DEPLOY.md`: 관리자 페이지 통합 가이드
- `MONITORING.md`: 모니터링 & 자동화 가이드

## [2.3.0] - 2025-01-24

### Added - 모니터링 & 자동화
- **자동 재배포**: DynamoDB 변경 감지 시스템
- **Slack/Discord 알림**: Webhook 통합
- **성능 대시보드**: CLI + HTML 버전
- **CloudWatch 메트릭**: 실시간 조회
- **알림 시스템**: 5가지 타입 (success, error, warning, info, deploy)

### Scripts
- `auto-redeploy.mjs`: 자동 재배포 (5분 간격)
- `notification.mjs`: 통합 알림 시스템
- `monitoring-dashboard.mjs`: 성능 모니터링

### Commands
- `pnpm auto:redeploy`: 자동 재배포 시작
- `pnpm monitor:dashboard`: 성능 대시보드
- `pnpm monitor:watch`: 실시간 모니터링 (30초)
- `pnpm monitor:html`: HTML 대시보드 생성
- `pnpm notify:test`: 알림 테스트
- `pnpm aws:setup`: AWS 전체 설정
- `pnpm aws:dashboard`: CloudWatch 대시보드

## [2.2.0] - 2025-11-24

### Added
- **Play 버튼 기능**: 최신 날짜 퀴즈로 자동 리다이렉트
- **테스트 퀴즈**: DynamoDB 퀴즈 없을 때 폴백
- **동적 페이지**: /play 페이지에서 최신 날짜로 리다이렉트

### Changed
- **g1/g2/g3 play**: 하드코딩 테스트 퀴즈 + DynamoDB 퀴즈 우선
- **Play URL**: /games/g1/play → 최신 날짜로 리다이렉트

## [2.1.1] - 2025-11-24

### Fixed
- **next.config.mjs**: distDir 설정 제거 (output: export와 충돌)
- **QuizQuestion.tsx**: 객관식 답변 선택 로직 수정 (selectedAnswer → userAnswer)
- **QuizCompletion.tsx**: 재시작 버튼에 페이지 새로고침 추가
- **useQuizState.ts**: localStorage 진행 상태 명시적 삭제

## [2.1.0] - 2025-11-24

### Fixed
- **AIChatbot**: 에러 로깅 추가
- **ultimate-deploy.mjs**: CONFIG 경로 수정 (5곳)
- **.env.example**: 리전 통일 (us-east-1)

### Removed
- **games-data.ts**: 사용하지 않는 코드 제거

### Documentation
- 모든 문서 최신 코드 상황 반영
- 불필요한 정보 제거
- 간소화 및 명확화

---

## [2.0.0] - 2025-11-20

### Added
- **config.mjs**: 통합 설정 파일 생성
- **utils.mjs**: 유틸리티 함수 모듈 생성 (8개 함수)
- **배포 로그**: `.deploy-logs/` 디렉토리 자동 생성

### Changed
- **enhanced-chatbot-handler.py**: 17개 상수 정의, 구체적 예외 처리
- **serverless.yml**: IAM 권한 구체화, 리전 us-east-1로 통일
- **배포 스크립트**: Exponential backoff 재시도 로직 적용
- **보안**: 민감 정보 자동 마스킹 (API 키, 이메일, 전화번호)

### Improved
- CloudWatch 메트릭 수집 강화
- 배포 코드 중복 70% 감소
- 에러 처리 구체화

---

## [1.0.0] - 2025-11-17

### Added
- UniversalQuizPlayer 모듈화 (546줄 → 80줄)
- 날짜별 API + 다층 캐싱 시스템
- WebP 이미지 최적화 (8.4MB → 848KB)

### Changed
- 컴포넌트 아키텍처 개선
- API 성능 최적화
- 이미지 포맷 변환

---

**버전 관리 규칙**
- Major: 아키텍처 변경
- Minor: 기능 추가/개선
- Patch: 버그 수정
