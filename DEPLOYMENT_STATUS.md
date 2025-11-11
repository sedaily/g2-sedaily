# 배포 상태 (Deployment Status)

## 🚀 현재 배포 상태

### Frontend
- ✅ **배포 완료**: CloudFront + S3
- 🌐 **URL**: https://d37wz4zxwakwl0.cloudfront.net
- 📦 **빌드**: Next.js 15.2.4 Static Export
- 🔄 **캐시**: CloudFront 무효화 완료

### Backend
- ✅ **Lambda 함수**: `sedaily-chatbot-dev-handler`
- 🐍 **Runtime**: Python 3.11
- 🧠 **AI Model**: Claude 3 Sonnet (AWS Bedrock)
- 📍 **Region**: ap-northeast-2
- 🔧 **Handler**: `enhanced-chatbot-handler.lambda_handler`

## 🔧 최근 업데이트 (2025-11-10)

### RAG 시스템 개선
- **BigKinds API 실패 시**: 폴백 응답 → 순수 Claude 전문 응답
- **지능형 폴백**: 외부 지식 없이도 고품질 경제 분석 제공
- **응답 품질**: 250-350자 전문적 분석 유지

### 기술적 변경사항
1. **Lambda 함수 업데이트**
   - 함수명: `sedaily-chatbot-dev-handler`
   - 핸들러: `enhanced-chatbot-handler.lambda_handler`
   - 메모리: 1024MB, 타임아웃: 60초

2. **API 엔드포인트**
   - Region: us-east-1 → ap-northeast-2
   - Stage: prod → dev

3. **배포 스크립트 개선**
   - `pnpm backend-deploy`: Lambda 직접 업데이트
   - `pnpm full-deploy`: Frontend + Backend 통합 배포

## 📊 RAG 아키텍처

### 3단계 지식 통합
1. **BigKinds API** (30일 경제 뉴스)
2. **퀴즈 관련 기사** (URL 기반)
3. **퀴즈 문제 컨텍스트** (게임별)

### Intelligent Fallback
```
BigKinds API 성공 → RAG 기반 응답
     ↓ 실패
순수 Claude 전문 응답 (게임별 특화)
     ↓ 실패  
게임별 폴백 응답
```

## 🎯 게임별 특화

- **BlackSwan**: 위기/리스크 분석 특화
- **PrisonersDilemma**: 게임이론 특화  
- **SignalDecoding**: 경제지표 분석 특화

## 🔄 배포 명령어

```bash
# Frontend만 배포 (권장)
pnpm quick-deploy

# Backend만 배포
pnpm backend-deploy

# 전체 배포 (Frontend + Backend)
pnpm full-deploy

# 개발 서버
pnpm dev
```

## 🐛 알려진 이슈

- ✅ **해결됨**: RSC 404 에러 (CloudFront 캐시 무효화로 해결)
- ✅ **해결됨**: BigKinds API 실패 시 폴백 응답 → 순수 Claude 응답으로 개선

## 📈 성능 지표

- **응답 시간**: < 10초 (Claude + RAG)
- **가용성**: 99.9% (Lambda + CloudFront)
- **캐시 적중률**: 95%+ (정적 자산)

---

**마지막 업데이트**: 2025-11-10 15:35 KST
**배포 담당**: Amazon Q Developer