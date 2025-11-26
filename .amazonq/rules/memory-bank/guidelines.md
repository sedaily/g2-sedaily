# Development Guidelines - 서울경제 뉴스게임 플랫폼

## Code Quality Standards

### TypeScript/JavaScript Conventions
- **Strict Mode**: All TypeScript files use strict type checking
- **Type Safety**: Explicit type annotations for function parameters and return values
- **Interface Definitions**: Prefer `interface` over `type` for object shapes
- **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Const Assertions**: Use `as const` for literal types and readonly arrays

### File Organization
- **Client Components**: Mark with `"use client"` directive at top of file
- **Import Order**: 
  1. React/Next.js imports
  2. Third-party libraries (UI components, utilities)
  3. Local components (`@/components`)
  4. Local utilities (`@/lib`, `@/hooks`)
  5. Types (`@/types`)
  6. Assets/styles
- **Named Exports**: Prefer named exports over default exports for utilities
- **Default Exports**: Use for page components and main component files

### Naming Conventions
- **Components**: PascalCase (e.g., `QuizEditor`, `UniversalQuizPlayer`)
- **Files**: Match component name (e.g., `QuizEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useQuizKeyboard`)
- **Utilities**: camelCase (e.g., `validateQuestion`, `saveToLambda`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SIDEBAR_WIDTH`, `CACHE_DURATION`)
- **Types/Interfaces**: PascalCase (e.g., `QuizQuestion`, `GameCard`)
- **Props Interfaces**: ComponentName + `Props` (e.g., `BlackSwanQuizPlayerProps`)

### Code Formatting
- **Indentation**: 2 spaces (enforced by ESLint)
- **Quotes**: Double quotes for strings, single quotes for JSX attributes
- **Semicolons**: Required at end of statements
- **Line Length**: Soft limit of 120 characters
- **Trailing Commas**: Required in multiline objects/arrays
- **Arrow Functions**: Prefer arrow functions for callbacks and inline functions

## React Patterns

### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// 2. Type definitions
interface ComponentProps {
  items?: QuizItem[]
  date: string
}

// 3. Component function
export function ComponentName({ items, date }: ComponentProps) {
  // 4. State declarations
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [date])
  
  // 6. Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // 7. Render logic
  if (!items) {
    return <div>Loading...</div>
  }
  
  // 8. JSX return
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### State Management
- **useState**: For local component state
- **Multiple States**: Separate useState calls for different concerns
- **State Updates**: Use functional updates when depending on previous state
  ```typescript
  setScore((prev) => prev + 1)
  setQuestions([...questions, newQuestion])
  ```
- **Derived State**: Calculate from existing state instead of storing separately
  ```typescript
  const progress = ((currentIndex + 1) / items.length) * 100
  const isCorrect = selectedAnswer === currentQuestion?.answer
  ```

### Effect Patterns
- **Cleanup**: Always return cleanup function for subscriptions
  ```typescript
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { /* ... */ }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])
  ```
- **Dependencies**: Include all used variables in dependency array
- **Conditional Effects**: Use early returns or conditional logic inside effect
- **Reset on Prop Change**: Common pattern for resetting state when props change
  ```typescript
  useEffect(() => {
    setCurrentIndex(0)
    setIsAnswered(false)
    // Reset all state
  }, [date])
  ```

### Event Handlers
- **Naming**: Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
- **Inline vs Named**: Use named handlers for complex logic, inline for simple cases
- **Prevent Default**: Call `e.preventDefault()` when needed
- **Type Safety**: Use proper event types (`React.MouseEvent`, `React.KeyboardEvent`)
  ```typescript
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextSubmit()
    }
  }
  ```

### Conditional Rendering
- **Early Returns**: Return early for loading/error states
  ```typescript
  if (!items || items.length === 0) {
    return <EmptyState />
  }
  ```
- **Ternary Operators**: For simple conditions
  ```typescript
  {isAnswered ? <NextButton /> : <SubmitButton />}
  ```
- **Logical AND**: For conditional rendering without else
  ```typescript
  {isAnswered && currentQuestion?.explanation && <Explanation />}
  ```

## UI Component Patterns

### Radix UI Integration
- **Composition**: Build complex components from Radix primitives
- **Accessibility**: Radix handles ARIA attributes automatically
- **Styling**: Use Tailwind classes with `cn()` utility for conditional styles
- **Variants**: Use `class-variance-authority` (cva) for component variants
  ```typescript
  const buttonVariants = cva(
    "base-classes",
    {
      variants: {
        variant: {
          default: "default-classes",
          outline: "outline-classes"
        }
      }
    }
  )
  ```

### Tailwind CSS Patterns
- **Utility-First**: Prefer utility classes over custom CSS
- **Responsive Design**: Mobile-first with breakpoint prefixes (`md:`, `lg:`)
- **Custom Colors**: Use theme colors from `quiz-themes.ts`
  ```typescript
  className="bg-[#EDEDE9] text-[#0F2233]"
  ```
- **Conditional Classes**: Use `cn()` utility for dynamic classes
  ```typescript
  className={cn(
    "base-classes",
    isActive && "active-classes",
    variant === "outline" && "outline-classes"
  )}
  ```

### Animation Patterns
- **Framer Motion**: Use for complex animations
  ```typescript
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  />
  ```
- **AnimatePresence**: Wrap components that mount/unmount
- **Tailwind Animations**: Use for simple transitions
  ```typescript
  className="transition-all duration-300 hover:scale-105"
  ```

## Python Backend Patterns

### Lambda Handler Structure
```python
def lambda_handler(event, context):
    """
    Docstring describing handler purpose
    """
    # 1. CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    # 2. OPTIONS handling
    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    # 3. Request parsing
    try:
        body = json.loads(event['body'])
        # Extract parameters
    except Exception as e:
        return error_response(headers, str(e))
    
    # 4. Business logic
    result = process_request(body)
    
    # 5. Response
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(result)
    }
```

### Error Handling
- **Try-Except Blocks**: Wrap all external calls
- **Specific Exceptions**: Catch specific exception types first
- **Logging**: Use `logger.error()` for errors, `logger.info()` for success
- **Fallback Responses**: Provide meaningful fallback when external services fail
  ```python
  try:
      response = requests.get(url, timeout=10)
  except requests.Timeout:
      logger.warning("Request timeout")
      return fallback_response()
  except requests.RequestException as e:
      logger.error(f"Request error: {str(e)}")
      return error_response()
  ```

### Constants and Configuration
- **Module-Level Constants**: Define at top of file in UPPER_SNAKE_CASE
  ```python
  AWS_REGION = 'us-east-1'
  BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
  BIGKINDS_TIMEOUT = 10
  ```
- **Environment Variables**: Use `os.environ.get()` with defaults
- **Type Hints**: Use for function parameters and return values
  ```python
  def fetch_data(url: str, timeout: int = 10) -> Optional[Dict[str, Any]]:
  ```

### Retry Logic
- **Backoff Decorator**: Use `@backoff.on_exception` for retries
  ```python
  @backoff.on_exception(
      backoff.expo,
      (requests.RequestException, requests.Timeout),
      max_tries=3,
      max_time=20
  )
  def call_external_api(params: dict) -> dict:
  ```

### Data Sanitization
- **Masking**: Remove sensitive data from logs
  ```python
  def mask_sensitive_data(text: str) -> str:
      text = re.sub(r'([a-zA-Z0-9]{8})[a-zA-Z0-9]{16,}', r'\1****', text)
      return text
  ```

## API Integration Patterns

### Fetch API Usage
- **Environment Variables**: Use `process.env.NEXT_PUBLIC_*` for API URLs
- **Error Handling**: Always check `response.ok` before parsing
  ```typescript
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  const result = await response.json()
  ```
- **Try-Catch**: Wrap all fetch calls in try-catch blocks
- **Loading States**: Track loading state for UI feedback

### Caching Strategy
- **Multi-Layer**: Memory → localStorage → API
- **Cache Keys**: Use consistent naming pattern
  ```typescript
  const key = `quiz_${gameType}_${date}`
  ```
- **Expiration**: Check timestamp before using cached data
  ```typescript
  if (Date.now() - timestamp < CACHE_DURATION) {
    return cachedData
  }
  ```
- **Invalidation**: Clear cache after mutations
  ```typescript
  clearQuizDataCache()
  clearDateCache(gameType, date)
  ```

## State Management Patterns

### Local Storage
- **JSON Serialization**: Always stringify/parse objects
  ```typescript
  localStorage.setItem(key, JSON.stringify({ data, timestamp }))
  const cached = JSON.parse(localStorage.getItem(key) || '{}')
  ```
- **Error Handling**: Wrap in try-catch for quota exceeded errors
- **Type Safety**: Define interfaces for stored data

### Session Storage
- **Authentication**: Store auth state in sessionStorage
  ```typescript
  sessionStorage.setItem("admin_authenticated", "true")
  const auth = sessionStorage.getItem("admin_authenticated")
  ```
- **Temporary Data**: Use for data that shouldn't persist across sessions

## Testing and Validation

### Input Validation
- **Required Fields**: Check for presence before processing
  ```typescript
  if (!user_question) {
    return error_response('질문이 필요합니다.')
  }
  ```
- **Type Checking**: Validate data types match expected format
- **Validation Functions**: Create reusable validation utilities
  ```typescript
  export function validateQuestion(question: QuizQuestion): ValidationResult {
    const issues: string[] = []
    if (!question.question_text.trim()) issues.push("문제 내용")
    if (!question.choices || question.choices.length < 2) issues.push("선택지")
    return { status: issues.length > 0 ? "missing" : "valid", issues }
  }
  ```

### Error Messages
- **User-Friendly**: Provide clear, actionable error messages in Korean
- **Developer Logs**: Include technical details in console/logs
- **Status Indicators**: Use visual feedback (colors, icons) for errors

## Performance Optimization

### Code Splitting
- **Dynamic Imports**: Use for heavy components
  ```typescript
  const { saveToArchive } = await import('../../../lib/quiz-api-client')
  ```
- **Lazy Loading**: Load components only when needed

### Memoization
- **useMemo**: For expensive calculations
  ```typescript
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])
  ```
- **useCallback**: For stable function references
  ```typescript
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])
  ```

### Debouncing
- **User Input**: Debounce API calls for search/filter inputs
- **Resize Events**: Debounce window resize handlers

## Security Best Practices

### Authentication
- **Password Protection**: Use sessionStorage for admin auth
- **Environment Variables**: Never commit API keys to repository
- **CORS**: Configure proper CORS headers on Lambda

### Data Sanitization
- **User Input**: Sanitize before storing or displaying
- **SQL Injection**: Use parameterized queries (DynamoDB SDK handles this)
- **XSS Prevention**: React escapes by default, avoid `dangerouslySetInnerHTML`

### Sensitive Data
- **Logging**: Mask sensitive data in logs
- **Error Messages**: Don't expose internal details to users
- **API Keys**: Use environment variables, never hardcode

## Documentation Standards

### Code Comments
- **When to Comment**: Explain "why", not "what"
- **Complex Logic**: Add comments for non-obvious algorithms
- **TODOs**: Use `// TODO:` for future improvements
- **Docstrings**: Use for Python functions
  ```python
  def function_name(param: str) -> dict:
      """
      Brief description of function purpose.
      
      Args:
          param: Description of parameter
          
      Returns:
          Description of return value
      """
  ```

### Type Documentation
- **JSDoc**: Use for complex types and utilities
  ```typescript
  /**
   * Validates a quiz question for completeness
   * @param question - The quiz question to validate
   * @returns Validation result with status and issues
   */
  export function validateQuestion(question: QuizQuestion): ValidationResult
  ```

## Common Patterns Summary

### Frequently Used Idioms
1. **Optional Chaining**: `currentQuestion?.explanation`
2. **Nullish Coalescing**: `apiUrl || ""`
3. **Array Spread**: `[...questions, newQuestion]`
4. **Object Spread**: `{ ...prev, isSelected: true }`
5. **Functional Updates**: `setScore((prev) => prev + 1)`
6. **Early Returns**: `if (!items) return <EmptyState />`
7. **Conditional Classes**: `cn("base", condition && "extra")`
8. **Template Literals**: `` `quiz_${gameType}_${date}` ``

### Design Patterns
1. **Compound Components**: Sidebar with SidebarHeader, SidebarContent, etc.
2. **Render Props**: Not heavily used, prefer composition
3. **Higher-Order Components**: Not used, prefer hooks
4. **Custom Hooks**: Extract reusable logic (useQuizKeyboard, useQuizState)
5. **Context API**: Used for Sidebar state management
6. **Provider Pattern**: SidebarProvider wraps children with context

### Architecture Patterns
1. **Separation of Concerns**: Components, utilities, types in separate files
2. **Single Responsibility**: Each function/component has one clear purpose
3. **DRY (Don't Repeat Yourself)**: Extract common logic to utilities
4. **Composition over Inheritance**: Build complex UIs from simple components
5. **Declarative over Imperative**: Prefer declarative React patterns
