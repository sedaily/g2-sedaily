# Product Overview

## Project Purpose
서울경제 뉴스게임 플랫폼 - 경제 뉴스를 기반으로 한 인터랙티브 퀴즈 게임 플랫폼으로, AI 기반 RAG 시스템을 활용하여 실시간 경제 뉴스와 연계된 교육적 게임 경험을 제공합니다.

## Value Proposition
- **실시간 경제 교육**: BigKinds API를 통한 최신 30일 경제 뉴스 기반 퀴즈
- **AI 기반 학습 지원**: Claude 3 Sonnet을 활용한 RAG 챗봇으로 맥락 있는 설명 제공
- **다양한 게임 형식**: 4가지 게임 타입으로 다각도 학습 경험
- **실시간 업데이트**: 30초 폴링 시스템으로 관리자-사용자 간 즉각적 소통

## Key Features

### 1. 게임 시스템
- **BlackSwan (g1)**: 경제 이벤트 예측 게임 - 예상치 못한 경제 사건 분석
- **Prisoner's Dilemma (g2)**: 경제 딜레마 상황 게임 - 게임 이론 기반 의사결정
- **Signal Decoding (g3)**: 경제 신호 해석 게임 - 시장 신호 분석 능력 향상
- **Card Matching (quizlet)**: Quizlet 스타일 경제 용어 매칭 게임 (CSV 업로드 지원)

### 2. RAG 기반 AI 챗봇
- **3단계 지식 통합**:
  1. BigKinds API - 최신 30일 경제 뉴스
  2. 퀴즈 관련 기사 URL
  3. 퀴즈 문제 컨텍스트
- **게임별 전문화**: 각 게임 타입에 최적화된 응답
- **Intelligent Fallback**: API 실패 시 순수 Claude 응답으로 자동 전환

### 3. 관리자 시스템 (/admin/quiz)
- **퀴즈 관리**: 객관식/주관식 퀴즈 생성 및 즉시 DynamoDB 저장
- **Quizlet 관리**: CSV 파일 업로드로 대량 카드 생성
- **캐시 관리**: localStorage 기반 캐시 제어
- **배포 관리**:
  - 원클릭 CloudFront 캐시 무효화
  - 실시간 메트릭 (DynamoDB, Lambda)
  - 자동 새로고침 (30초 폴링)

### 4. 실시간 데이터 시스템
- **30초 폴링**: 관리자 변경사항 즉시 반영
- **API Routes**: Next.js 서버리스 API로 동적 데이터 제공
- **다층 캐싱**: localStorage + 서버 + API 3단계 캐싱

### 5. 자동화 & 모니터링
- **DynamoDB Streams**: 데이터 변경 시 자동 배포 트리거
- **CloudWatch**: 대시보드 + 알람 시스템
- **SNS 알림**: Slack/Discord 통합 알림
- **성능 모니터링**: CLI + HTML 대시보드

## Target Users

### Primary Users
- **경제 학습자**: 실시간 경제 뉴스로 학습하는 학생 및 일반인
- **경제 교육자**: 인터랙티브 교육 자료가 필요한 교사 및 강사

### Secondary Users
- **콘텐츠 관리자**: 퀴즈 및 게임 콘텐츠를 생성/관리하는 서울경제 담당자
- **시스템 관리자**: 플랫폼 운영 및 모니터링 담당자

## Use Cases

### 1. 일일 경제 학습
- 사용자가 매일 새로운 경제 퀴즈를 풀며 최신 경제 동향 학습
- AI 챗봇을 통해 이해하기 어려운 개념 즉시 질문

### 2. 게임화된 경제 교육
- 4가지 게임 타입으로 다양한 각도에서 경제 개념 학습
- 진행 상태 저장으로 학습 연속성 유지

### 3. 실시간 콘텐츠 관리
- 관리자가 새로운 퀴즈 생성 시 30초 내 사용자에게 반영
- CSV 업로드로 대량 Quizlet 카드 생성

### 4. 성능 모니터링 & 최적화
- CloudWatch 메트릭으로 시스템 상태 실시간 확인
- 자동 배포 시스템으로 수동 개입 최소화

## Technical Highlights
- **Frontend**: Next.js 15.2.4 (App Router) + React 19 + TypeScript 5
- **Backend**: AWS Lambda (Python 3.11) + Claude 3 Sonnet (Bedrock)
- **Database**: DynamoDB (Streams 활성화)
- **Hosting**: Vercel / AWS Amplify (동적 사이트)
- **Region**: us-east-1
- **Performance**: 이미지 90% 감소, 코드 86% 감소, 3단계 캐싱

## Success Metrics
- **이미지 최적화**: 8.4MB → 848KB (90% 감소)
- **코드 최적화**: 546줄 → 80줄 (86% 감소)
- **배포 효율**: 중복 코드 70% 감소
- **실시간성**: 30초 폴링으로 즉각적 업데이트
- **가용성**: 99.9% 업타임 (CloudWatch 모니터링)
