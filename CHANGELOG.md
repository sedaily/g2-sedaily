# Changelog

## [2.7.0] - 2025-11-24

### 동적 퀴즈 시스템 구현

#### Added
- Quiz API Lambda (`sedaily-quiz-api`)
- API Gateway 통한 동적 퀴즈 CRUD
- DynamoDB 연동 (퀴즈 저장/조회)
- 관리자 페이지 → DynamoDB 저장
- Archive 페이지 동적 로딩

#### Changed
- 정적 사이트 유지 + 퀴즈 데이터만 동적 처리
- 수동 배포 프로세스로 간소화
- Tailwind CSS 4 설정 추가

#### Documentation
- `docs/DYNAMIC_QUIZ_SETUP.md` 추가
- `docs/DEPLOYMENT.md` 업데이트
- `README.md` 현재 아키텍처 반영

#### Removed
- Outdated 문서 5개 삭제
- Outdated 스크립트 12개 삭제

---

## [2.6.0] - 2025-11-24

### 정적 Export 빌드

#### Added
- 정적 export 빌드 시스템
- `next.config.export.mjs` 설정
- API 폴더 제외 빌드

#### Changed
- S3 + CloudFront 배포
- 수동 배포 프로세스

---

## [2.5.0] - 2025-11-20

### 초기 구현

#### Added
- Next.js 15.2.4 기반 게임 플랫폼
- 3개 게임 (BlackSwan, PrisonersDilemma, SignalDecoding)
- Quizlet 카드 매칭 게임
- RAG 기반 AI 챗봇
- 관리자 패널
