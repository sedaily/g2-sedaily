# Development Guidelines

## Code Quality Standards

### 1. TypeScript/JavaScript Conventions

#### Strict Type Safety
- **TypeScript strict mode enabled**: `strict: true` in tsconfig.json
- **Explicit type annotations**: All function parameters and return types must be typed
- **Type imports**: Use `import type` for type-only imports
  ```typescript
  import type React from "react"
  import type { Metadata } from "next"
  import type { QuizItem } from "@/lib/quiz-api"
  ```
- **Interface over type**: Prefer interfaces for object shapes, especially for props
  ```typescript
  interface BlackSwanQuizPlayerProps {
    items?: QuizItem[]
    date: string
  }
  ```

#### Naming Conventions
- **Components**: PascalCase (e.g., `BlackSwanQuizPlayer`, `SedailyHeader`)
- **Files**: Match component name (e.g., `BlackSwanQuizPlayer.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useQuizState`, `useRealtimeQuiz`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SIDEBAR_WIDTH`, `BIGKINDS_API_URL`)
- **Functions**: camelCase (e.g., `handleSelectAnswer`, `fetchBigkindsKnowledge`)
- **Variables**: camelCase (e.g., `currentIndex`, `isAnswered`)

#### File Organization
- **Client Components**: Start with `"use client"` directive
- **Imports order**:
  1. React/Next.js core
  2. Third-party libraries
  3. Internal components (@/components)
  4. Internal utilities (@/lib, @/hooks)
  5. Types (@/types)
  6. Styles
- **Export pattern**: Named exports for components, default export for pages

### 2. Python Conventions

#### Type Hints
- **Function signatures**: Always include type hints for parameters and return types
  ```python
  def build_rag_knowledge_base(user_question: str, question_text: str, 
                                quiz_article_url: str, game_type: str) -> Dict[str, Any]:
  ```
- **Optional types**: Use `Optional[Type]` for nullable values
  ```python
  def call_bigkinds_api(keywords: str, api_key: str) -> Optional[Dict[str, Any]]:
  ```

#### Constants Management
- **Module-level constants**: Define all configuration at the top
  ```python
  AWS_REGION = 'us-east-1'
  BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  BIGKINDS_TIMEOUT = 10
  NEWS_RESULT_LIMIT = 3
  ```
- **Environment variables**: Use `os.environ.get()` with defaults
  ```python
  DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')
  ```

#### Error Handling
- **Specific exceptions**: Catch specific exception types, not generic `Exception`
  ```python
  except requests.Timeout:
      logger.warning("BigKinds API timeout")
  except requests.RequestException as e:
      logger.error(f"BigKinds API request error: {str(e)}")
  except boto3.exceptions.Boto3Error as e:
      logger.error(f"DynamoDB error: {e}")
  ```
- **Logging**: Use structured logging with appropriate levels
  ```python
  logger.info(f"Successfully saved {len(questions)} questions")
  logger.warning(f"Quiz article fetch timeout: {article_url}")
  logger.error(f"Unexpected error: {str(e)}")
  ```

## Structural Conventions

### 1. Component Architecture

#### Compound Components Pattern
- **Parent-child relationship**: Break complex components into smaller, focused pieces
- **State management**: Parent manages state, children receive props
- **Example**: `QuizPlayer` → `QuizQuestion` → `QuizCompletion`

#### Radix UI Integration
- **Headless components**: Use Radix UI for accessibility-first components
- **Composition**: Wrap Radix primitives with custom styling
  ```typescript
  import { Slot } from '@radix-ui/react-slot'
  import { cva, VariantProps } from 'class-variance-authority'
  
  const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2...',
    {
      variants: {
        variant: { default: '...', outline: '...' },
        size: { default: 'h-8', sm: 'h-7', lg: 'h-12' }
      }
    }
  )
  ```

#### Data Attributes for Styling
- **State tracking**: Use `data-*` attributes for conditional styling
  ```typescript
  data-state={state}
  data-collapsible={state === 'collapsed' ? collapsible : ''}
  data-variant={variant}
  data-active={isActive}
  ```
- **Tailwind selectors**: Target data attributes in CSS
  ```typescript
  className="group-data-[collapsible=icon]:hidden"
  ```

### 2. State Management Patterns

#### Local State with Hooks
- **useState**: For simple component state
  ```typescript
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  ```
- **useEffect**: For side effects and lifecycle
  ```typescript
  useEffect(() => {
    // Reset state when date changes
    setCurrentIndex(0)
    setScore(0)
  }, [date])
  ```

#### Custom Hooks for Reusability
- **Encapsulate logic**: Extract complex state logic into custom hooks
- **Return object pattern**: Return multiple values as an object
  ```typescript
  function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
      throw new Error('useSidebar must be used within a SidebarProvider.')
    }
    return context
  }
  ```

#### Context for Global State
- **Provider pattern**: Wrap app/component tree with context provider
  ```typescript
  const SidebarContext = React.createContext<SidebarContextProps | null>(null)
  
  function SidebarProvider({ children, ...props }) {
    const contextValue = React.useMemo(() => ({ ... }), [dependencies])
    return (
      <SidebarContext.Provider value={contextValue}>
        {children}
      </SidebarContext.Provider>
    )
  }
  ```

### 3. API Design Patterns

#### RESTful Conventions
- **HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Path structure**: `/api/resource` or `/api/resource/:id`
  ```python
  # GET /api/quiz/BlackSwan/2025-01-24
  # POST /api/quiz (body: { gameType, quizDate, data })
  ```

#### CORS Headers
- **Always include**: Set CORS headers in all API responses
  ```python
  headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
  ```

#### Response Format
- **Consistent structure**: Use standard response format
  ```python
  {
      'success': True,
      'data': { ... },
      'error': None,
      'timestamp': '2025-01-24T12:00:00Z'
  }
  ```

## Textual Standards

### 1. Documentation

#### Docstrings (Python)
- **Function documentation**: Use triple-quoted docstrings
  ```python
  def build_rag_knowledge_base(user_question, question_text, quiz_article_url, game_type):
      \"\"\"
      RAG 지식 베이스 구축 (3개 소스)
      1. BigKinds API 뉴스
      2. 퀴즈 관련 기사
      3. 퀴즈 문제 컨텍스트
      \"\"\"
  ```

#### JSDoc Comments (TypeScript)
- **Complex functions**: Add JSDoc for non-obvious logic
  ```typescript
  /**
   * Handles keyboard shortcuts for quiz navigation
   * - Numbers 1-4: Select answer
   * - Enter: Submit answer
   */
  ```

#### Inline Comments
- **Explain why, not what**: Comment on intent, not obvious code
  ```typescript
  // Reset state when date changes (user navigated to different quiz)
  useEffect(() => { ... }, [date])
  ```

### 2. Korean Language Support

#### Font Loading
- **Google Fonts**: Use next/font/google for optimal loading
  ```typescript
  import { Noto_Serif_KR, Inter } from "next/font/google"
  
  const notoSerifKR = Noto_Serif_KR({
    subsets: ["latin"],
    weight: ["600", "700", "900"],
    variable: "--font-title-kr",
    display: "swap",
  })
  ```
- **CSS Variables**: Define font families as CSS variables
  ```css
  --font-title-kr: 'Noto Serif KR', serif;
  --font-sans: 'Inter', sans-serif;
  ```

#### Korean Text Styling
- **CSS classes**: Use semantic class names for Korean text
  ```typescript
  className="korean-heading"  // For titles
  className="korean-text"     // For body text
  ```

## Practices & Patterns

### 1. React Best Practices

#### Performance Optimization
- **useMemo**: Memoize expensive computations
  ```typescript
  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, ... }),
    [state, open, setOpen, ...]
  )
  ```
- **useCallback**: Memoize callback functions
  ```typescript
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])
  ```
- **Lazy loading**: Use dynamic imports for heavy components
  ```typescript
  const HeavyComponent = dynamic(() => import('./HeavyComponent'))
  ```

#### Animation with Framer Motion
- **AnimatePresence**: Wrap components that mount/unmount
  ```typescript
  <AnimatePresence mode="wait">
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {content}
    </motion.div>
  </AnimatePresence>
  ```

#### Conditional Rendering
- **Early returns**: Return early for loading/error states
  ```typescript
  if (!items || items.length === 0) {
    return <EmptyState />
  }
  
  if (isComplete) {
    return <CompletionScreen />
  }
  
  return <QuizContent />
  ```

### 2. Python Best Practices

#### Retry Logic with Backoff
- **Exponential backoff**: Use `@backoff` decorator for retries
  ```python
  @backoff.on_exception(
      backoff.expo,
      (requests.RequestException, requests.Timeout),
      max_tries=BIGKINDS_MAX_RETRIES,
      max_time=BIGKINDS_MAX_TIME
  )
  def call_bigkinds_api(keywords: str, api_key: str) -> Optional[Dict[str, Any]]:
      # API call logic
  ```

#### Security Best Practices
- **Sensitive data masking**: Mask PII in logs
  ```python
  def mask_sensitive_data(text: str) -> str:
      # API 키 마스킹
      text = re.sub(r'([a-zA-Z0-9]{8})[a-zA-Z0-9]{16,}', r'\\1****', text)
      # 이메일 마스킹
      text = re.sub(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', r'****@\\2', text)
      return text
  ```

#### CloudWatch Metrics
- **Custom metrics**: Send metrics for monitoring
  ```python
  def send_cloudwatch_metric(metric_name: str, value: float, unit: str = 'Count') -> None:
      try:
          cloudwatch = boto3.client('cloudwatch', region_name=AWS_REGION)
          cloudwatch.put_metric_data(
              Namespace='G2/Chatbot',
              MetricData=[{
                  'MetricName': metric_name,
                  'Value': value,
                  'Unit': unit,
                  'Timestamp': datetime.now()
              }]
          )
      except Exception as e:
          logger.warning(f"Failed to send metric: {e}")
  ```

### 3. Styling Patterns

#### Tailwind CSS Utilities
- **Utility-first**: Use Tailwind classes directly in JSX
  ```typescript
  className="flex items-center gap-2 p-4 rounded-xl bg-white border-2 border-gray-200"
  ```
- **Conditional classes**: Use template literals for dynamic classes
  ```typescript
  className={`
    w-full p-4 rounded-xl transition-all
    ${isAnswered && "cursor-not-allowed"}
    ${showCorrect && "bg-green-100 border-2 border-green-400"}
    ${showIncorrect && "bg-red-100 border-2 border-red-400"}
  `}
  ```

#### Class Variance Authority (CVA)
- **Variant-based styling**: Define variants for component states
  ```typescript
  const buttonVariants = cva(
    'base-classes',
    {
      variants: {
        variant: { default: '...', outline: '...' },
        size: { sm: '...', md: '...', lg: '...' }
      },
      defaultVariants: { variant: 'default', size: 'md' }
    }
  )
  ```

#### cn() Utility
- **Class merging**: Use `cn()` from lib/utils for class composition
  ```typescript
  import { cn } from '@/lib/utils'
  
  className={cn(
    'base-classes',
    variant === 'primary' && 'primary-classes',
    className  // Allow prop override
  )}
  ```

### 4. Data Handling

#### DynamoDB Patterns
- **Composite keys**: Use PK/SK pattern for flexible queries
  ```python
  {
    'PK': f"QUIZ#{game_type}",  # Partition key
    'SK': quiz_date,             # Sort key
    'data': { ... }
  }
  ```
- **Decimal conversion**: Convert Decimal to float for JSON
  ```python
  def decimal_default(obj):
      if isinstance(obj, Decimal):
          return float(obj)
      raise TypeError(f'Object of type {type(obj)} is not JSON serializable')
  ```

#### localStorage Integration
- **Progress persistence**: Save quiz progress to localStorage
  ```typescript
  import { saveQuizProgress } from "@/lib/quiz-storage"
  
  const handleComplete = () => {
    saveQuizProgress(date, score)
    setIsComplete(true)
  }
  ```

### 5. Error Handling

#### Frontend Error Boundaries
- **Graceful degradation**: Show fallback UI on errors
  ```typescript
  if (!items || items.length === 0) {
    return <EmptyState message="퀴즈를 불러올 수 없습니다" />
  }
  ```

#### Backend Error Responses
- **Structured errors**: Return consistent error format
  ```python
  return {
      'statusCode': 400,
      'headers': headers,
      'body': json.dumps({
          'error': 'Missing required fields',
          'success': False
      })
  }
  ```

## Internal API Usage

### 1. Quiz API Client

#### Fetching Quiz Data
```typescript
import { fetchQuizByDate } from '@/lib/quiz-api-client'

const quiz = await fetchQuizByDate('BlackSwan', '2025-01-24')
```

#### Saving Quiz Data
```typescript
import { saveQuiz } from '@/lib/quiz-api-client'

await saveQuiz({
  gameType: 'BlackSwan',
  quizDate: '2025-01-24',
  data: { questions: [...] }
})
```

### 2. Chatbot API

#### Sending Chat Messages
```typescript
import { sendChatMessage } from '@/lib/chatbot-api'

const response = await sendChatMessage({
  question: userInput,
  gameType: 'BlackSwan',
  questionText: currentQuestion.question,
  quizArticleUrl: currentQuestion.newsLink
})
```

### 3. Admin Utilities

#### CloudFront Cache Invalidation
```typescript
import { invalidateCloudFrontCache } from '@/lib/admin-utils'

await invalidateCloudFrontCache()
```

#### CloudWatch Metrics
```typescript
import { getCloudWatchMetrics } from '@/lib/admin-utils'

const metrics = await getCloudWatchMetrics()
```

## Code Idioms

### 1. TypeScript Idioms

#### Optional Chaining
```typescript
const title = currentQuestion?.question
const options = currentQuestion?.options ?? []
```

#### Nullish Coalescing
```typescript
const open = openProp ?? _open
const items = props.items ?? []
```

#### Type Guards
```typescript
if (typeof tooltip === 'string') {
  tooltip = { children: tooltip }
}
```

### 2. Python Idioms

#### List Comprehensions
```python
quiz_items = [
    {
        'gameType': item.get('gameType'),
        'quizDate': item.get('quizDate'),
        'data': {'questions': item.get('questions', [])}
    }
    for item in items
]
```

#### Dictionary Get with Default
```python
game_type = body.get('gameType', '')
questions = data.get('questions', [])
```

#### F-strings for Formatting
```python
logger.info(f"Successfully saved {len(questions)} questions for {game_type}")
```

## Popular Annotations

### TypeScript
- `@/` - Path alias for project root
- `type` - Type-only imports
- `as const` - Literal type inference
- `satisfies` - Type checking without widening

### Python
- `@backoff.on_exception` - Retry decorator
- Type hints: `str`, `int`, `Dict[str, Any]`, `Optional[Type]`
- Docstrings: `\"\"\"Triple-quoted documentation\"\"\"`

## Testing Patterns

### Frontend Testing
- **Component testing**: Test user interactions and state changes
- **API mocking**: Mock API calls in tests
- **Accessibility**: Test keyboard navigation and screen reader support

### Backend Testing
- **Unit tests**: Test individual functions with mocked dependencies
- **Integration tests**: Test API endpoints with real DynamoDB
- **Error scenarios**: Test timeout, invalid input, and edge cases

## Deployment Practices

### Environment Variables
- **Never commit secrets**: Use `.env.local` (gitignored)
- **Vercel/Amplify**: Set environment variables in platform UI
- **Lambda**: Set environment variables in serverless.yml

### Build Optimization
- **Image optimization**: Convert PNG to WebP
- **Code splitting**: Use dynamic imports for large components
- **Tree shaking**: Remove unused code automatically

### Monitoring
- **CloudWatch Logs**: Monitor Lambda execution logs
- **Custom Metrics**: Track API calls, errors, and performance
- **Alarms**: Set up alerts for error rates and latency
