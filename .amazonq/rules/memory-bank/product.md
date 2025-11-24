# Product Overview

## Project Purpose
서울경제 뉴스게임 플랫폼 (g2-clone) is an interactive quiz game platform that transforms economic news into engaging educational experiences. The platform leverages AI-powered RAG (Retrieval-Augmented Generation) technology to create dynamic, context-aware quiz games based on real-time economic news from BigKinds API.

## Value Proposition
- **Educational Gaming**: Converts complex economic news into accessible, interactive quiz formats
- **AI-Powered Intelligence**: Uses Claude 3 Sonnet (AWS Bedrock) with RAG for contextual, intelligent responses
- **Real-time Content**: Integrates latest economic news (30-day window) from BigKinds API
- **Multi-Game Experience**: Offers 4 distinct game types covering different economic concepts
- **Admin-Friendly**: Comprehensive admin panel for quiz management, deployment, and monitoring

## Key Features

### 1. Four Game Types
- **BlackSwan (g1)**: Economic event prediction game - anticipate rare, high-impact events
- **Prisoner's Dilemma (g2)**: Economic dilemma scenarios - strategic decision-making
- **Signal Decoding (g3)**: Economic signal interpretation - decode market indicators
- **Card Matching (quizlet)**: Quizlet-style economic term matching with CSV upload support

### 2. RAG-Based AI Chatbot
- **3-Layer Knowledge Integration**:
  1. BigKinds API (latest 30-day economic news)
  2. Quiz-related article URLs
  3. Quiz problem context
- **Game-Specific Expertise**: Specialized responses for each game type
- **Intelligent Fallback**: Pure Claude responses when API fails
- **Contextual Understanding**: Combines multiple knowledge sources for accurate answers

### 3. Real-time Quiz System
- **Date-Based Quizzes**: Daily quiz sets with localStorage progress tracking
- **Auto-Navigation**: "Play" button automatically routes to latest quiz
- **Fallback System**: Test quizzes when DynamoDB is empty
- **Progress Persistence**: Saves user progress across sessions
- **Responsive Design**: Mobile-first, adaptive UI

### 4. Comprehensive Admin Panel (`/admin/quiz`)
- **Quiz Management**: Create/edit multiple-choice and short-answer questions
- **Instant Sync**: Direct DynamoDB storage with real-time updates
- **Quizlet Management**: CSV upload for bulk card creation
- **Cache Control**: localStorage and server cache management
- **Deployment Dashboard**:
  - One-click CloudFront cache invalidation
  - Real-time metrics (DynamoDB, Lambda, CloudWatch)
  - Auto-refresh monitoring (30-second polling)
  - AWS resource status tracking

### 5. Performance Optimizations
- **Image Optimization**: PNG → WebP conversion (90% size reduction: 8.4MB → 848KB)
- **Code Efficiency**: Component modularization (86% reduction: 546 → 80 lines)
- **Multi-Layer Caching**: localStorage + server + API caching
- **Date-Based API**: Individual quiz loading instead of bulk fetching
- **Deployment Automation**: Reduced code duplication by 70%

### 6. Monitoring & Automation
- **Auto-Redeploy System**: DynamoDB Streams trigger Lambda for automatic deployments
- **CloudWatch Integration**: Dashboard + Alarms for performance tracking
- **SNS Notifications**: Slack/Discord alerts for critical events
- **Performance Dashboard**: CLI + HTML monitoring interfaces
- **Deploy Guard**: 404 prevention with pre-deployment validation

## Target Users

### Primary Users
- **Students & Learners**: Individuals seeking to understand economic concepts through gamification
- **Economic News Readers**: Seoul Economic Daily readers wanting interactive content
- **Educators**: Teachers using games for economic education

### Secondary Users
- **Content Administrators**: Managing quiz content and monitoring platform health
- **Developers**: Maintaining and extending the platform capabilities

## Use Cases

### For Learners
1. **Daily Economic Quiz**: Access date-specific quizzes on current economic events
2. **Interactive Learning**: Engage with AI chatbot for explanations and context
3. **Progress Tracking**: Monitor learning progress across multiple quiz sessions
4. **Game Variety**: Choose from 4 different game types based on learning preference

### For Administrators
1. **Content Creation**: Create and publish quizzes instantly to DynamoDB
2. **CSV Bulk Upload**: Upload Quizlet card sets via CSV for rapid content deployment
3. **Cache Management**: Clear stale caches to ensure users see latest content
4. **Deployment Control**: Invalidate CloudFront cache and monitor deployment status
5. **Performance Monitoring**: Track real-time metrics for DynamoDB, Lambda, and CloudWatch

### For Developers
1. **API Integration**: Leverage Next.js API Routes for dynamic data fetching
2. **AWS Infrastructure**: Utilize Lambda, DynamoDB, CloudFront, and CloudWatch
3. **Monitoring Tools**: Use built-in scripts for performance tracking and auto-deployment
4. **Deployment Automation**: Execute one-command deployments with validation

## Technical Highlights
- **Version**: v2.5.0 (Dynamic Site with API Routes)
- **Live URL**: https://g2.sedaily.ai
- **Architecture**: Next.js 15.2.4 (App Router) + AWS Lambda (Python 3.11) + DynamoDB
- **AI Engine**: Claude 3 Sonnet (AWS Bedrock, us-east-1)
- **Deployment**: Vercel / AWS Amplify with CloudFront CDN
- **Real-time Updates**: 30-second polling for admin-user synchronization
- **Status**: Production-ready and operational ✅
