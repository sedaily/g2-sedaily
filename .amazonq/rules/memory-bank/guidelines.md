# Development Guidelines

## Code Quality Standards

### 1. TypeScript Strict Mode
- **Strict type checking enabled**: `"strict": true` in tsconfig.json
- **No implicit any**: All variables and parameters must have explicit types
- **Type definitions**: Use `interface` for object shapes, `type` for unions/intersections
- **Example pattern**:
```typescript
interface QuizItem {
  question: string
  answer: string
  options?: string[]
  explanation?: string
  hint?: string[]
  newsLink?: string
}
```

### 2. React Component Patterns
- **Functional components only**: No class components
- **TypeScript props interfaces**: Always define props with `interface` or `type`
- **Props destructuring**: Destructure props in function parameters
- **Example**:
```typescript
interface BlackSwanQuizPlayerProps {
  items?: QuizItem[]
  date: string
}

export function BlackSwanQuizPlayer({ items, date }: BlackSwanQuizPlayerProps) {
  // Component logic
}
```

### 3. File Naming Conventions
- **Components**: PascalCase with `.tsx` extension (e.g., `BlackSwanQuizPlayer.tsx`)
- **Utilities**: camelCase with `.ts` extension (e.g., `quiz-api-client.ts`)
- **Python files**: snake_case with `.py` extension (e.g., `enhanced-chatbot-handler.py`)
- **Config files**: kebab-case (e.g., `next.config.mjs`)

### 4. Import Organization
- **Order**: React imports → Third-party → Local components → UI components → Utils → Types
- **Path aliases**: Use `@/` prefix for absolute imports
- **Example**:
```typescript
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { QuizItem } from "@/lib/quiz-api"
```

### 5. CSS and Styling
- **Tailwind CSS utility classes**: Primary styling method
- **Class composition**: Use `cn()` utility for conditional classes
- **Korean text class**: Apply `korean-text` or `korean-heading` for Korean content
- **Example**:
```typescript
className={cn(
  'w-full p-4 rounded-xl text-left transition-all korean-text',
  isAnswered && 'cursor-not-allowed',
  showCorrect && 'bg-green-100 border-2 border-green-400'
)}
```

## Semantic Patterns

### 1. State Management Pattern
- **useState for local state**: UI state, form inputs, toggles
- **Custom hooks for complex logic**: Extract reusable state logic
- **State initialization**: Always provide default values
- **Example**:
```typescript
const [currentIndex, setCurrentIndex] = useState(0)
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
const [isAnswered, setIsAnswered] = useState(false)
```

### 2. Effect Hooks Pattern
- **Cleanup functions**: Always return cleanup for subscriptions/timers
- **Dependency arrays**: Explicitly list all dependencies
- **Example**:
```typescript
useEffect(() => {
  let interval: NodeJS.Timeout
  if (gameStarted && !gameCompleted) {
    interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)
  }
  return () => clearInterval(interval)
}, [gameStarted, gameCompleted, startTime])
```

### 3. Animation Pattern (Framer Motion)
- **AnimatePresence for conditional rendering**: Wrap exit animations
- **Motion components**: Use `motion.div`, `motion.button` for animations
- **Transition timing**: Consistent duration (0.3s standard)
- **Example**:
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

### 4. API Client Pattern
- **Fetch with error handling**: Always wrap in try-catch
- **Cache control**: Use `cache: "no-store"` for dynamic data
- **Type-safe responses**: Parse and validate API responses
- **Example**:
```typescript
export async function fetchQuizDataByDate(gameType: string, date: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${gameType}/${date}`,
      { cache: "no-store" }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    return null
  }
}
```

### 5. Python Lambda Pattern
- **Docstrings**: Every function has descriptive docstring
- **Type hints**: Use `typing` module for type annotations
- **Error handling**: Specific exception types with logging
- **Constants at top**: Define all constants in UPPER_CASE
- **Example**:
```python
def lambda_handler(event, context):
    """
    RAG 기반 Claude 챗봇 Lambda 핸들러
    메인: Claude 순수 응답 / RAG: BigKinds + 퀴즈 기사 + 퀴즈 문제
    """
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        body = json.loads(event['body'])
        # Handler logic
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {'statusCode': 500, 'headers': headers}
```

## Architectural Patterns

### 1. Component Composition
- **Small, focused components**: Single responsibility principle
- **Prop drilling avoidance**: Use composition over deep prop passing
- **Reusable UI components**: Extract to `components/ui/`
- **Game-specific components**: Keep in `components/games/`

### 2. Conditional Rendering Pattern
- **Early returns**: Handle loading/error states first
- **Ternary for simple conditions**: Use for inline conditional rendering
- **Logical AND for optional rendering**: `{condition && <Component />}`
- **Example**:
```typescript
if (!items || items.length === 0) {
  return <EmptyState />
}

if (isComplete) {
  return <CompletionScreen />
}

return <GameBoard />
```

### 3. Event Handler Pattern
- **Inline arrow functions for simple handlers**: `onClick={() => setState(value)}`
- **Named functions for complex logic**: Define handler functions separately
- **Prevent default when needed**: `e.preventDefault()` for forms
- **Example**:
```typescript
const handleSelectAnswer = (option: string) => {
  if (isAnswered) return
  
  setSelectedAnswer(option)
  setIsAnswered(true)
  
  const correct = option === currentQuestion?.answer
  if (correct) {
    setScore((prev) => prev + 1)
  }
}
```

### 4. Data Transformation Pattern
- **Map for transformations**: Transform arrays with `.map()`
- **Filter for subsets**: Filter arrays with `.filter()`
- **Reduce for aggregation**: Aggregate data with `.reduce()`
- **Example**:
```typescript
const formattedTerms = data.terms.map((term: any, index: number) => ({
  id: index + 1,
  term: term.term,
  definition: term.definition,
  explanation: term.explanation
}))
```

### 5. Error Boundary Pattern
- **Try-catch for async operations**: Wrap API calls and async logic
- **Fallback UI**: Provide user-friendly error messages
- **Logging**: Always log errors for debugging
- **Example**:
```typescript
try {
  const data = await fetchQuizData()
  setQuizData(data)
} catch (error) {
  console.error('Failed to load quiz:', error)
  setError('퀴즈를 불러올 수 없습니다.')
}
```

## Internal API Usage

### 1. Quiz API Client
```typescript
// lib/quiz-api-client.ts
import { fetchQuizDataByDate, getAvailableDates } from '@/lib/quiz-api-client'

// Get quiz for specific date
const quiz = await fetchQuizDataByDate('PrisonersDilemma', '2025-11-26')

// Get available dates
const dates = await getAvailableDates('PrisonersDilemma')
```

### 2. Admin Utils
```typescript
// lib/admin-utils.ts
import { saveQuizData, deleteQuizData } from '@/lib/admin-utils'

// Save quiz
await saveQuizData(gameType, date, questions)

// Delete quiz
await deleteQuizData(gameType, date)
```

### 3. Quiz Storage (LocalStorage)
```typescript
// lib/quiz-storage.ts
import { saveQuizProgress, getQuizProgress } from '@/lib/quiz-storage'

// Save progress
saveQuizProgress(date, score)

// Get progress
const progress = getQuizProgress(date)
```

### 4. Chatbot API
```typescript
// lib/chatbot-api.ts
import { sendChatMessage } from '@/lib/chatbot-api'

const response = await sendChatMessage({
  question: userQuestion,
  gameType: 'BlackSwan',
  questionText: currentQuestion.question,
  quizArticleUrl: currentQuestion.newsLink
})
```

## Code Idioms

### 1. Optional Chaining
```typescript
// Safe property access
const title = currentQuestion?.question
const options = currentQuestion?.options ?? []
```

### 2. Nullish Coalescing
```typescript
// Default values
const apiUrl = process.env.NEXT_PUBLIC_QUIZ_API_URL ?? 'fallback-url'
const count = data?.count ?? 0
```

### 3. Array Destructuring
```typescript
// Extract array elements
const [first, second] = selectedPair
const [firstName, ...rest] = names
```

### 4. Object Destructuring
```typescript
// Extract object properties
const { question, answer, options } = currentQuestion
const { gameType, date, ...rest } = quizData
```

### 5. Spread Operator
```typescript
// Array/object copying and merging
const newCards = [...cards, newCard]
const updatedState = { ...state, isAnswered: true }
```

### 6. Template Literals
```typescript
// String interpolation
const message = `Quiz for ${gameType} on ${date}`
const apiUrl = `${baseUrl}/${gameType}/${date}`
```

### 7. Arrow Functions
```typescript
// Concise function syntax
const double = (x: number) => x * 2
const isValid = (value: string) => value.length > 0
```

## Popular Annotations

### 1. TypeScript Utility Types
```typescript
// Partial - make all properties optional
type PartialQuiz = Partial<QuizItem>

// Pick - select specific properties
type QuizPreview = Pick<QuizItem, 'question' | 'answer'>

// Omit - exclude specific properties
type QuizWithoutHint = Omit<QuizItem, 'hint'>

// Record - object with specific key-value types
type ScoreRecord = Record<string, number>
```

### 2. React Type Annotations
```typescript
// Component props
interface ComponentProps extends React.ComponentProps<'div'> {
  customProp: string
}

// Event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {}

// Refs
const inputRef = React.useRef<HTMLInputElement>(null)
```

### 3. Python Type Hints
```python
from typing import Dict, Any, Optional, List

def fetch_data(url: str, timeout: int = 10) -> Optional[Dict[str, Any]]:
    """Fetch data from URL with timeout"""
    pass

def process_items(items: List[str]) -> Dict[str, int]:
    """Process list of items"""
    pass
```

### 4. JSDoc Comments (when needed)
```typescript
/**
 * Calculate quiz score percentage
 * @param score - Number of correct answers
 * @param total - Total number of questions
 * @returns Percentage score (0-100)
 */
function calculatePercentage(score: number, total: number): number {
  return Math.round((score / total) * 100)
}
```

## Best Practices Summary

### Frontend
1. **Always use TypeScript strict mode** - No implicit any
2. **Functional components with hooks** - No class components
3. **Tailwind CSS for styling** - Utility-first approach
4. **Framer Motion for animations** - Consistent transitions
5. **Error boundaries** - Graceful error handling
6. **Accessibility** - Use semantic HTML and ARIA labels
7. **Korean text classes** - Apply `korean-text` for proper font rendering

### Backend
1. **Type hints in Python** - Use `typing` module
2. **Docstrings for all functions** - Clear documentation
3. **Constants at module level** - UPPER_CASE naming
4. **Structured logging** - Use `logger` with appropriate levels
5. **CORS headers** - Always include in API responses
6. **Error handling** - Specific exceptions with fallbacks
7. **CloudWatch metrics** - Send custom metrics for monitoring

### API Integration
1. **Cache control** - Use `no-store` for dynamic data
2. **Type-safe responses** - Validate API response structure
3. **Error handling** - Try-catch with user-friendly messages
4. **Environment variables** - Use `NEXT_PUBLIC_` prefix for client-side
5. **Timeout handling** - Set reasonable timeouts for external APIs

### Testing & Debugging
1. **Console logging** - Use for development debugging
2. **Error messages** - Provide context and actionable information
3. **Fallback UI** - Always have fallback for loading/error states
4. **Local storage** - Use for client-side persistence
5. **Browser DevTools** - Leverage React DevTools and Network tab
