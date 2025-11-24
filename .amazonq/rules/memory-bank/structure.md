# Project Structure

## Directory Organization

```
g2-clone/
├── app/                    # Next.js 15 App Router (pages & API routes)
├── components/             # React components (UI, games, admin, navigation)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and API clients
├── backend/                # Python Lambda functions (chatbot, auto-deploy)
├── scripts/                # Deployment automation and monitoring
├── types/                  # TypeScript type definitions
├── public/                 # Static assets (images, icons, backgrounds)
├── docs/                   # Project documentation
├── aws/                    # AWS Lambda utilities (unified quiz handler)
├── .deploy-logs/           # Deployment history logs
├── .amazonq/rules/         # Amazon Q rules and memory bank
└── .next/                  # Next.js build output (generated)
```

## Core Directories

### `/app` - Next.js App Router
**Purpose**: Main application pages and API routes using Next.js 15 App Router pattern

**Structure**:
- `app/page.tsx` - Homepage with game hub grid
- `app/layout.tsx` - Root layout with theme provider and global styles
- `app/games/` - Game-specific pages (g1, g2, g3, g4, quizlet)
- `app/admin/quiz/` - Admin panel for quiz management
- `app/api/` - Server-side API routes
  - `app/api/quiz/` - Quiz data endpoints (fetch, update)
  - `app/api/chat/` - AI chatbot proxy endpoint
  - `app/api/admin/` - Admin operations (cache invalidation, metrics)
- `app/test-chatbot/` - Chatbot testing interface
- `app/globals.css` - Global Tailwind CSS styles
- `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx` - Error boundaries and loading states

**Key Pattern**: Uses Next.js 15 App Router with server components, API routes, and dynamic routing

### `/components` - React Components
**Purpose**: Reusable UI components organized by feature domain

**Structure**:
- `components/ui/` - Base UI components (Radix UI + Tailwind)
  - Buttons, inputs, dialogs, cards, tooltips, etc.
  - `sidebar.tsx` - Sidebar navigation component
  - `use-mobile.tsx`, `use-toast.ts` - Custom hooks for UI
- `components/games/` - Game-specific components
  - `BlackSwanQuizPlayer.tsx` - BlackSwan game player
  - `QuizPlayer.tsx`, `SimpleQuizPlayer.tsx`, `UniversalQuizPlayer.tsx` - Quiz rendering engines
  - `AIChatbot.tsx` - AI chatbot interface
  - `CardMatchingGame.tsx`, `QuizletMatchGame.tsx` - Card matching games
  - `GameCard.tsx`, `GameHubGrid.tsx` - Game selection UI
  - `NewsHeaderBlock.tsx`, `BlackSwanLakeHeader.tsx` - Game headers
  - `QuizCompletion.tsx`, `QuizIntroScreen.tsx` - Quiz flow screens
  - `ProgressRippleIndicator.tsx` - Loading indicators
- `components/admin/` - Admin panel components
  - `QuizEditor.tsx` - Quiz creation/editing interface
  - `QuizletUploader.tsx` - CSV upload for Quizlet cards
  - `DeployManager.tsx` - Deployment and cache management
  - `RealtimeStatus.tsx` - Real-time metrics dashboard
  - `CacheManager.tsx` - Cache control interface
  - `DateSetList.tsx`, `ReviewList.tsx` - Quiz listing components
  - `PasswordModal.tsx` - Admin authentication
- `components/navigation/` - Site navigation
  - `SedailyHeader.tsx` - Main site header
  - `Footer.tsx` - Site footer
- `components/theme-provider.tsx` - Dark/light theme context

**Key Pattern**: Component composition with separation of concerns (UI, games, admin, navigation)

### `/hooks` - Custom React Hooks
**Purpose**: Reusable stateful logic for React components

**Files**:
- `useQuizState.ts` - Quiz state management (answers, progress, completion)
- `useQuizKeyboard.ts` - Keyboard navigation for quizzes
- `useRealtimeQuiz.ts` - Real-time quiz data fetching with 30s polling
- `use-mobile.ts` - Mobile device detection
- `use-toast.ts` - Toast notification management

**Key Pattern**: Custom hooks encapsulate complex state logic and side effects

### `/lib` - Utility Libraries
**Purpose**: Shared utilities, API clients, and helper functions

**Files**:
- `quiz-api.ts` - DynamoDB quiz data fetching (server-side)
- `quiz-api-client.ts` - Client-side quiz API wrapper
- `chatbot-api.ts` - Lambda chatbot API client
- `quiz-storage.ts` - localStorage quiz progress management
- `quiz-cache.ts` - Multi-layer caching logic
- `cache-manager.ts` - Cache invalidation utilities
- `admin-utils.ts` - Admin panel helper functions
- `date-utils.ts` - Date formatting and manipulation
- `quiz-themes.ts` - Game-specific theme configurations
- `games-data.ts` - Static game metadata
- `bigkinds.ts` - BigKinds API integration
- `utils.ts` - General utility functions (cn, etc.)
- `image-loader.js` - Custom Next.js image loader

**Key Pattern**: Separation of client/server logic, API abstraction, and utility functions

### `/backend` - Python Lambda Functions
**Purpose**: AWS Lambda serverless backend functions

**Structure**:
- `backend/lambda/enhanced-chatbot-handler.py` - Main AI chatbot Lambda (Claude 3 Sonnet + RAG)
- `backend/lambda/auto-deploy-trigger.py` - DynamoDB Streams trigger for auto-deployment
- `backend/lambda/requirements.txt` - Python dependencies for chatbot
- `backend/lambda/requirements-auto-deploy.txt` - Python dependencies for auto-deploy
- `backend/serverless.yml` - Serverless Framework configuration
- `backend/package.json` - Node.js dependencies for Serverless Framework

**Key Pattern**: Python 3.11 Lambda functions with Serverless Framework deployment

### `/scripts` - Deployment & Monitoring
**Purpose**: Automation scripts for deployment, monitoring, and AWS management

**Files**:
- `ultimate-deploy.mjs` - Full deployment pipeline (frontend + backend)
- `quick-deploy.mjs` - Fast frontend-only deployment
- `deploy-backend.mjs` - Backend Lambda deployment
- `deploy-guard.mjs` - Pre-deployment validation (404 prevention)
- `monitoring-dashboard.mjs` - Performance monitoring CLI/HTML dashboard
- `auto-redeploy.mjs` - Automatic redeployment on DynamoDB changes
- `aws-setup.mjs` - AWS infrastructure setup (CloudWatch, SNS, alarms)
- `notification.mjs` - Slack/Discord notification integration
- `update-cloudfront.mjs` - CloudFront cache invalidation
- `config.mjs` - Centralized configuration
- `utils.mjs` - Shared utility functions
- `verify-env.mjs` - Environment variable validation

**Key Pattern**: Node.js ESM scripts with AWS SDK v3 integration

### `/types` - TypeScript Definitions
**Purpose**: Shared TypeScript type definitions

**Files**:
- `quiz.ts` - Quiz data structures (Quiz, Question, Answer, QuizSet)
- `shims-recharts-vaul.d.ts` - Type shims for third-party libraries

**Key Pattern**: Centralized type definitions for type safety across the project

### `/public` - Static Assets
**Purpose**: Static files served directly by Next.js/CDN

**Structure**:
- `public/images/` - Game thumbnails and logos (WebP optimized)
- `public/backgrounds/` - Game background images (WebP optimized)
- `public/icons/` - Game icons (woodcut style, WebP)
- `public/games/` - Hero images
- `public/404.html`, `public/robots.txt`, `public/sitemap.xml` - SEO and error pages
- `public/sample-quizlet.csv` - Example CSV for Quizlet upload

**Key Pattern**: WebP image format for 90% size reduction, organized by asset type

### `/docs` - Documentation
**Purpose**: Comprehensive project documentation

**Files**:
- `DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_ARCHITECTURE.md` - Architecture overview
- `BACKEND_ARCHITECTURE.md` - Backend Lambda architecture
- `404_PREVENTION.md` - 404 error prevention strategies
- `MONITORING.md` - Monitoring and automation guide
- `ADMIN_DEPLOY.md` - Admin panel deployment integration
- `ADMIN_USAGE.md` - Admin panel usage guide
- `AWS_OPTIMIZATION.md` - AWS infrastructure optimization
- `DYNAMIC_DEPLOYMENT.md` - Dynamic site deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions

**Key Pattern**: Markdown documentation for each major system component

## Architectural Patterns

### 1. Next.js App Router Pattern
- **Server Components**: Default for data fetching and rendering
- **Client Components**: Interactive UI with `"use client"` directive
- **API Routes**: Server-side endpoints in `app/api/`
- **Dynamic Routing**: `[date]` folders for date-based quiz pages
- **Layouts**: Nested layouts with `layout.tsx` files

### 2. Component Composition
- **Atomic Design**: Base UI components (`components/ui/`) composed into features
- **Feature Components**: Game-specific components in `components/games/`
- **Container/Presenter**: Hooks manage state, components render UI
- **Radix UI Primitives**: Accessible, unstyled components styled with Tailwind

### 3. State Management
- **React Hooks**: useState, useEffect for local state
- **Custom Hooks**: Encapsulate complex logic (quiz state, keyboard, real-time)
- **localStorage**: Client-side persistence for quiz progress
- **Server State**: API routes fetch from DynamoDB, cached in memory

### 4. API Architecture
- **Next.js API Routes**: Server-side endpoints for quiz data and admin operations
- **Lambda Functions**: Python backend for AI chatbot and auto-deployment
- **DynamoDB**: NoSQL database for quiz data storage
- **BigKinds API**: External news API for RAG context
- **AWS Bedrock**: Claude 3 Sonnet for AI responses

### 5. Deployment Pipeline
- **Frontend**: Vercel or AWS Amplify (automatic Git deployments)
- **Backend**: Serverless Framework → AWS Lambda (us-east-1)
- **CDN**: CloudFront for static asset delivery
- **Monitoring**: CloudWatch + SNS for alerts
- **Automation**: DynamoDB Streams trigger auto-redeployment

## Key Relationships

### Frontend ↔ Backend
- Frontend calls Next.js API routes (`/api/quiz`, `/api/chat`)
- API routes proxy to Lambda functions or query DynamoDB directly
- Real-time updates via 30-second polling in admin panel

### Admin ↔ User
- Admin creates/edits quizzes → DynamoDB
- DynamoDB Streams trigger Lambda → CloudFront invalidation
- Users fetch latest quizzes via API routes (30s cache)

### AI Chatbot Flow
1. User sends message → Next.js API route (`/api/chat`)
2. API route forwards to Lambda chatbot
3. Lambda fetches BigKinds news + quiz context
4. Lambda calls Claude 3 Sonnet (Bedrock) with RAG context
5. Response returned to user via API route

### Deployment Flow
1. Developer runs `pnpm deploy` or pushes to Git
2. Scripts validate build (deploy-guard)
3. Frontend deploys to Vercel/Amplify
4. Backend deploys to Lambda via Serverless Framework
5. CloudFront cache invalidated
6. Monitoring dashboard tracks metrics

## Configuration Files

- `next.config.mjs` - Next.js configuration (dynamic site, image optimization)
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - Shadcn UI component configuration
- `vercel.json` - Vercel deployment settings
- `amplify.yml` - AWS Amplify build settings
- `serverless.yml` - Serverless Framework Lambda configuration
- `.env`, `.env.local` - Environment variables (API keys, URLs)
- `package.json` - Node.js dependencies and scripts
- `pnpm-lock.yaml` - Dependency lock file (pnpm)

## Build Output

- `.next/` - Next.js build cache and server bundles
- `.deploy-logs/` - JSON logs of deployment history
- `.vercel/` - Vercel deployment metadata
- `backend/.serverless/` - Serverless Framework deployment artifacts
