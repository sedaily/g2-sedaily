# Project Structure - 서울경제 뉴스게임 플랫폼

## Directory Organization

### Frontend (Next.js App Router)
```
app/
├── layout.tsx              # Root layout with header/footer
├── page.tsx                # Home page (redirects to /games)
├── globals.css             # Global styles and Tailwind imports
├── games/
│   ├── page.tsx            # Game hub with 4 game cards
│   ├── g1/                 # BlackSwan game
│   │   ├── page.tsx        # Redirects to /play
│   │   ├── play/page.tsx   # Quiz player (query param routing)
│   │   └── archive/page.tsx # Past quizzes list
│   ├── g2/                 # Prisoner's Dilemma game
│   ├── g3/                 # Signal Decoding game
│   ├── g4/                 # Reserved for future game
│   └── quizlet/
│       └── page.tsx        # Card matching game
├── admin/
│   └── quiz/page.tsx       # Admin panel (password-protected)
└── test-chatbot/
    └── page.tsx            # Chatbot testing interface
```

### Components
```
components/
├── games/
│   ├── UniversalQuizPlayer.tsx  # Main quiz player (keyboard shortcuts)
│   ├── QuizQuestion.tsx         # Individual question renderer
│   ├── QuizCompletion.tsx       # Completion screen with stats
│   ├── AIChatbot.tsx            # RAG-based AI assistant
│   ├── ArchiveCard.tsx          # Date card for archive page
│   ├── GameCard.tsx             # Game hub card component
│   └── QuizletMatchGame.tsx     # Card matching game logic
├── admin/
│   ├── QuizEditor.tsx           # Multi-question editor (v2.10.0+)
│   ├── QuizPreview.tsx          # Preview before publishing
│   ├── QuizList.tsx             # Edit/delete existing quizzes
│   ├── QuizletUploader.tsx      # CSV upload for card games
│   ├── CacheManager.tsx         # Cache invalidation tools
│   └── PasswordModal.tsx        # Admin authentication
├── navigation/
│   ├── SedailyHeader.tsx        # Top navigation bar
│   └── Footer.tsx               # Site footer
└── ui/                          # Radix UI components (shadcn/ui)
    ├── button.tsx, card.tsx, dialog.tsx, etc.
    └── sidebar.tsx              # Admin sidebar navigation
```

### Library Functions
```
lib/
├── games-data.ts           # Game metadata and configuration
├── quiz-api-client.ts      # Lambda API client with caching
├── quiz-cache.ts           # localStorage cache management
├── admin-utils.ts          # Admin operations (save, validate)
├── chatbot-api.ts          # AI chatbot API client
├── quiz-themes.ts          # Game-specific theme styles
├── date-utils.ts           # Date formatting utilities
└── utils.ts                # General utilities (cn, etc.)
```

### Backend (AWS Lambda)
```
aws/quiz-lambda/
├── handler.py              # Quiz API Lambda (Python 3.11)
├── deploy.sh               # Deployment script
└── setup-api-gateway.sh    # API Gateway configuration

backend/lambda/
├── enhanced-chatbot-handler.py  # RAG chatbot Lambda
└── requirements.txt        # Python dependencies
```

### Configuration & Scripts
```
scripts/
├── deploy.sh               # Frontend deployment (S3 + CloudFront)
├── build-export.mjs        # Custom build script
└── config.mjs              # Deployment configuration

Root Config Files:
├── next.config.mjs         # Next.js configuration (output: 'export')
├── tailwind.config.ts      # Tailwind CSS 4 configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── .env.local              # Environment variables (API URLs)
```

## Core Components Relationships

### Quiz Flow Architecture
```
User → Archive Page → QuizList Component
                    ↓
              fetchAvailableDates()
                    ↓
              Lambda API (GET /quiz/{gameType}/dates)
                    ↓
              DynamoDB Query
                    ↓
              Date Cards Rendered
                    ↓
User Clicks Date → /games/g2/play?date=20251126
                    ↓
              normalizeDate() → "2025-11-26"
                    ↓
              getQuestionsForDate()
                    ↓
              Multi-layer Cache Check
                    ↓
              Lambda API (GET /quiz/{gameType}/{date})
                    ↓
              UniversalQuizPlayer Renders
                    ↓
              User Answers → AI Chatbot Available
```

### Admin Flow Architecture
```
Admin → /admin/quiz → PasswordModal
                    ↓
              QuizEditor (Multiple Questions)
                    ↓
              validateQuestion() for each
                    ↓
              saveToLambda(questions[], date)
                    ↓
              Lambda API (POST /quiz)
                    ↓
              DynamoDB PutItem
                    ↓
              Auto Cache Invalidation
                    ↓
              Success Confirmation
```

### AI Chatbot Architecture
```
User Question → AIChatbot Component
                    ↓
              sendChatbotMessage({
                question,
                gameType,
                questionText,
                quizArticleUrl
              })
                    ↓
              Lambda (enhanced-chatbot-handler.py)
                    ↓
              RAG Knowledge Base:
              - BigKinds API (30-day news)
              - Quiz article URL
              - Current question context
                    ↓
              Claude 3 Sonnet (Bedrock)
                    ↓
              250-350 char response
                    ↓
              Display to User
```

## Architectural Patterns

### Hybrid Static-Dynamic Pattern
- **Static Pages**: All UI pages pre-rendered at build time
- **Dynamic Data**: Quiz content loaded via API at runtime
- **Query Param Routing**: `/play?date=X` instead of `/[date]` for static compatibility
- **Benefit**: Fast page loads + fresh content without rebuilds

### Multi-Layer Caching Strategy
1. **Memory Cache**: 5-minute in-memory cache for quiz data
2. **Date Cache**: 10-minute Map-based cache per game/date
3. **localStorage**: 15-minute browser storage cache
4. **API**: Lambda with DynamoDB as source of truth
5. **Auto-Invalidation**: Clears all layers on content updates

### Component Composition Pattern
- **UniversalQuizPlayer**: Orchestrates quiz flow
  - Uses QuizQuestion for rendering
  - Uses QuizCompletion for results
  - Integrates AIChatbot for help
- **Separation of Concerns**: Display vs. Logic vs. Data
- **Reusability**: Same player for all 3 quiz games (g1, g2, g3)

### Data Transformation Pattern
```typescript
// Frontend Format (QuizQuestion)
{
  id, date, theme, questionType,
  question_text, choices, correct_index,
  explanation, related_article
}

// Lambda Format (LambdaQuestion)
{
  id, questionType, question,
  options, answer, explanation,
  newsLink, tags, relatedArticle
}

// Conversion handled by admin-utils.ts
```

### Theme System Pattern
- **Game-Specific Themes**: Each game has unique color palette
- **Centralized Configuration**: quiz-themes.ts exports THEME_STYLES
- **Consistent Application**: Used across QuizPlayer, ArchiveCard, GameCard
- **Newspaper Aesthetic**: Vintage typography, muted colors, hairline borders

## Key Design Decisions

### Why Query Params Instead of Dynamic Routes?
- Next.js `output: 'export'` doesn't support `[date]` dynamic segments
- Query params (`?date=X`) work with static generation
- Single `/play` page handles all dates via useSearchParams()

### Why Multi-Layer Caching?
- Reduces Lambda invocations (cost savings)
- Improves user experience (faster loads)
- Balances freshness vs. performance
- Auto-invalidation ensures consistency

### Why Separate Lambda Functions?
- **Quiz API**: Simple CRUD operations, fast responses
- **Chatbot**: Complex RAG logic, longer execution time
- **Isolation**: Failures don't cascade
- **Scaling**: Independent concurrency limits

### Why Static Export?
- **Performance**: Pre-rendered HTML served from CDN
- **Cost**: No server costs, only S3 + CloudFront
- **Reliability**: No server downtime
- **SEO**: Fully crawlable static pages
