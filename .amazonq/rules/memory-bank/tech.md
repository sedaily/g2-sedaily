# Technology Stack - 서울경제 뉴스게임 플랫폼

## Programming Languages

### Frontend
- **TypeScript 5**: Strict type checking, enhanced IDE support
- **JavaScript (ES2022+)**: Modern syntax, async/await patterns
- **CSS**: Tailwind CSS utility classes, custom properties

### Backend
- **Python 3.11**: Lambda runtime for Quiz API and Chatbot
- **Shell Script**: Deployment automation (bash)

## Core Frameworks & Libraries

### Frontend Framework
- **Next.js 15.2.4**: React framework with App Router
  - Static Site Generation (SSG) via `output: 'export'`
  - File-based routing
  - Built-in optimization (code splitting, image optimization)
- **React 19**: UI library with latest features
  - Server Components support
  - Improved hooks performance

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives
  - Dialog, Select, Tabs, Toast, Tooltip, etc.
  - Full keyboard navigation support
- **Lucide React 0.454.0**: Icon library (500+ icons)
- **Framer Motion**: Animation library for smooth transitions
- **Tailwind CSS 4.1.9**: Utility-first CSS framework
  - Custom configuration for newspaper aesthetic
  - Dark mode support via next-themes

### State Management & Hooks
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **Custom Hooks**:
  - `useQuizKeyboard`: Keyboard shortcut handling (A/B/C/D)
  - `useQuizState`: Quiz progress and answer tracking
  - `useToast`: Toast notification system

### Backend Services
- **AWS Lambda**: Serverless compute
  - Quiz API: Python 3.11 runtime
  - Chatbot: Python 3.11 with boto3
- **AWS Bedrock**: Claude 3 Sonnet AI model
- **DynamoDB**: NoSQL database for quiz storage
- **API Gateway**: REST API endpoints with CORS
- **S3**: Static site hosting
- **CloudFront**: CDN distribution (E8HKFQFSQLNHZ)

## Build System & Tools

### Package Manager
- **pnpm**: Fast, disk-efficient package manager
  - Workspace support
  - Strict dependency resolution

### Build Tools
- **Next.js Compiler**: Built-in SWC-based compiler
- **TypeScript Compiler**: Type checking and transpilation
- **PostCSS**: CSS processing with Tailwind
- **ESLint**: Code linting (next/core-web-vitals)

### Build Configuration
```javascript
// next.config.mjs
{
  output: 'export',           // Static HTML export
  trailingSlash: true,        // /page/ instead of /page
  distDir: 'out',             // Output directory
  images: { unoptimized: true }, // No image optimization for static
  compress: true,             // Gzip compression
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/*']
  }
}
```

## Development Commands

### Local Development
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (localhost:3000)
pnpm build                # Production build
pnpm start                # Start production server (not used for static)
pnpm lint                 # Run ESLint
```

### Deployment
```bash
bash scripts/deploy.sh    # Deploy frontend to S3 + CloudFront
cd aws/quiz-lambda && bash deploy.sh  # Deploy Quiz API Lambda
```

### Verification
```bash
pnpm verify:build         # Check build output files
pnpm verify:env           # Verify environment variables
pnpm aws:status           # Check AWS resources
pnpm cloudfront:invalidate # Invalidate CDN cache
```

## Dependencies

### Core Dependencies (package.json)
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5",
  "tailwindcss": "^4.1.9",
  "framer-motion": "latest",
  "lucide-react": "^0.454.0"
}
```

### AWS SDK
```json
{
  "@aws-sdk/client-cloudfront": "^3.937.0",
  "@aws-sdk/client-cloudwatch": "^3.936.0",
  "@aws-sdk/client-dynamodb": "^3.936.0",
  "@aws-sdk/lib-dynamodb": "^3.936.0"
}
```

### Radix UI Components (20+ packages)
- react-dialog, react-select, react-tabs, react-toast, etc.
- All on "latest" version for automatic updates

### Python Dependencies (backend)
```txt
boto3              # AWS SDK
requests           # HTTP client
beautifulsoup4     # HTML parsing for BigKinds
```

## Environment Variables

### Required (.env.local)
```bash
NEXT_PUBLIC_QUIZ_API_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_QUIZ_SAVE_URL=https://u8ck54y36j.execute-api.us-east-1.amazonaws.com/prod/quiz
NEXT_PUBLIC_CHATBOT_API_URL=https://vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com/dev/chat
```

### Build-Time Inclusion
- Variables prefixed with `NEXT_PUBLIC_` are embedded in static build
- No runtime environment variable support (static export limitation)

## AWS Infrastructure

### Region
- **Primary**: us-east-1 (N. Virginia)
- **Reason**: Bedrock Claude 3 Sonnet availability

### Resources
```
S3 Bucket: g2-frontend-ver2
CloudFront Distribution: E8HKFQFSQLNHZ
Lambda (Quiz API): sedaily-quiz-api
Lambda (Chatbot): sedaily-chatbot-dev-handler
DynamoDB Table: sedaily-quiz-data
API Gateway: REST API with CORS
```

### DynamoDB Schema
```python
{
  'PK': 'QUIZ#{gameType}',        # Partition key
  'SK': 'DATE#{date}',            # Sort key
  'gameType': 'PrisonersDilemma',
  'date': '2025-11-26',
  'questions': [...],             # Array of question objects
  'createdAt': '2025-11-26T10:00:00.000Z',
  'updatedAt': '2025-11-26T10:00:00.000Z'
}
```

## API Endpoints

### Quiz API (Lambda + API Gateway)
```
GET  /quiz/{gameType}/dates          # List available dates
GET  /quiz/{gameType}/{date}         # Get quiz for specific date
POST /quiz                           # Create/update quiz
DELETE /quiz/{gameType}/{date}       # Delete quiz
OPTIONS /quiz                        # CORS preflight
```

### Chatbot API (Lambda + API Gateway)
```
POST /chat                           # Send message to AI chatbot
```

## Development Workflow

### Feature Development
1. Create feature branch
2. Run `pnpm dev` for local testing
3. Make changes with TypeScript type safety
4. Test in browser (localhost:3000)
5. Commit and push

### Deployment Workflow
1. Merge to main branch
2. Run `bash scripts/deploy.sh`
3. Script performs:
   - Temporary API folder move (avoid build errors)
   - `next build` (generates /out directory)
   - S3 sync (upload static files)
   - CloudFront invalidation (clear CDN cache)
   - API folder restoration
4. Verify at https://g2.sedaily.ai

### Backend Deployment
1. Modify Lambda code (handler.py)
2. Run `cd aws/quiz-lambda && bash deploy.sh`
3. Script performs:
   - Zip function code
   - Upload to Lambda
   - Update function configuration
4. Test API endpoints

## Performance Optimizations

### Build-Time
- Code splitting per route
- Tree shaking unused code
- Minification and compression
- Optimized package imports (experimental)

### Runtime
- Multi-layer caching (memory, localStorage, API)
- CDN delivery via CloudFront
- Lazy loading for heavy components
- Debounced API calls

### Bundle Size
- Radix UI: Tree-shakeable, only used components included
- Lucide Icons: Individual icon imports
- Framer Motion: Lazy-loaded animations
- Total bundle: ~500KB gzipped

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- No IE11 support
- Mobile-first responsive design

## Version Control
- **Git**: Source control
- **GitHub**: Repository hosting
- **Branching**: Feature branches → main
- **Versioning**: Semantic versioning (v2.10.1)
