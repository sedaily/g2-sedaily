# Phase 3: Archive UX Improvements & Original Article Links

**Status:** Completed  
**Date:** 2026-02-05  
**Priority:** Medium  
**Category:** User Experience & Content Discovery

## Overview

Enhanced the archive and quiz experience by adding original article links, improving archive card navigation, displaying actual question counts, and temporarily hiding the admin button. These changes improve content discoverability and provide users with direct access to source materials.

**Key Achievement:** Improved user engagement by providing direct access to original news articles and accurate quiz metadata.

## Changes Summary

### 1. Original Article Links in Quiz Questions

Added "원문 기사" (Original Article) links to quiz questions, allowing users to read the full source article.

**Component:** `components/games/QuizQuestion.tsx`

**Implementation:**
```typescript
{/* 질문 헤더 */}
<header
  className="flex items-center justify-between border-b pb-2"
  style={{ borderColor: themeStyles.accentColor }}
>
  <div className={`inline-flex items-center gap-2 px-2 py-1 border ${themeStyles.badgeBg} ${themeStyles.badgeText}`}>
    <span className="text-xs uppercase tracking-widest">{question.questionType}</span>
  </div>
  
  {/* 원문 기사 링크 */}
  {question.newsLink && (
    <a
      href={question.newsLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${themeStyles.inkColor} hover:${themeStyles.accentText} transition-colors`}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      <span>원문 기사</span>
    </a>
  )}
</header>
```

**Features:**
- External link icon (ExternalLink from lucide-react)
- Opens in new tab (`target="_blank"`)
- Security attributes (`rel="noopener noreferrer"`)
- Theme-aware styling (matches game theme colors)
- Hover effect with accent color
- Only shows when `newsLink` is available

**User Benefit:** Users can verify quiz content against original sources and read full context.

### 2. Archive Card Navigation Improvements

Changed archive cards from Next.js `<Link>` to `<button>` with `window.location.href` for more reliable navigation.

**Component:** `components/games/ArchiveCard.tsx`

**Before:**
```typescript
<Link
  href={href}
  className={`group block rounded-2xl border ...`}
  style={{ outlineColor: config.focusColor }}
>
  {/* Card content */}
</Link>
```

**After:**
```typescript
<button
  onClick={() => {
    console.log('[ArchiveCard] Navigating to:', href)
    window.location.href = href
  }}
  className={`group block rounded-2xl border ... w-full text-left cursor-pointer`}
  style={{ outlineColor: config.focusColor }}
>
  {/* Card content */}
</button>
```

**Changes:**
- Replaced `<Link>` with `<button>`
- Added `onClick` handler with `window.location.href`
- Added console logging for debugging
- Added `w-full text-left cursor-pointer` classes
- Removed Next.js Link import

**Rationale:** 
- More reliable navigation for full URLs (https://g2.sedaily.ai/...)
- Better debugging with console logs
- Consistent behavior across browsers
- Proper button semantics with full-width layout

### 3. Dynamic Question Counts in Archive

Display actual question counts from API data instead of hardcoded values.

**Component:** `app/games/g1/archive/page.tsx` (and g2, g3)

**Before:**
```typescript
const allDates.map(({ date }) => {
  const isToday = date === today
  // API에서 각 날짜는 항상 4문제씩 있음
  const questionCount = 4
  
  return (
    <ArchiveCard
      questionCount={questionCount}
      // ...
    />
  )
})
```

**After:**
```typescript
// State for question counts
const [dateQuestionCounts, setDateQuestionCounts] = useState<Record<string, number>>({})

// Load question counts with tags
useEffect(() => {
  async function loadArchive() {
    // ...
    const countsMap: Record<string, number> = {}
    for (const yearData of data.years) {
      for (const monthData of yearData.months) {
        for (const dateStr of monthData.dates) {
          const questions = await getQuestionsForDate("BlackSwan", dateStr)
          // ...
          countsMap[dateStr] = questions.length
        }
      }
    }
    setDateQuestionCounts(countsMap)
  }
  loadArchive()
}, [])

// Use actual counts
allDates.map(({ date }) => {
  const isToday = date === today
  const questionCount = dateQuestionCounts[date] || 2
  
  return (
    <ArchiveCard
      questionCount={questionCount}
      // ...
    />
  )
})
```

**Implementation Details:**
- Added `dateQuestionCounts` state to store counts per date
- Load counts during initial archive data fetch
- Use `questions.length` from API response
- Fallback to `2` if count not available
- Applied to all three game archives (g1, g2, g3)

**User Benefit:** Accurate metadata helps users understand quiz content before playing.

### 4. Full URL Navigation in Archive

Changed archive cards to use full URLs instead of relative paths for better reliability.

**Component:** `app/games/g1/archive/page.tsx` (and g2, g3)

**Before:**
```typescript
const shortDate = date.replace(/-/g, '')

<ArchiveCard
  href={`/games/g1/play?date=${shortDate}`}
/>
```

**After:**
```typescript
const shortDate = date.replace(/-/g, '')
const fullUrl = `https://g2.sedaily.ai/games/g1/play/?date=${shortDate}`

<ArchiveCard
  href={fullUrl}
/>
```

**Changes:**
- Use full domain URL (`https://g2.sedaily.ai`)
- Consistent URL format across all games
- Added trailing slash before query params (`/?date=`)

**Rationale:**
- Works with button-based navigation
- Consistent with production deployment
- Easier debugging with full URLs in logs

### 5. Admin Button Hidden

Temporarily commented out the admin button in the header for production deployment.

**Component:** `components/navigation/SedailyHeader.tsx`

**Change:**
```typescript
<div className="flex items-center">
  {/* 관리자 버튼 - 임시 주석처리 */}
  {/* <Link
    href="/admin/quiz"
    className="text-sm text-[#111111] hover:text-[#3B82F6] transition-colors ..."
    aria-label="관리자 로그인"
  >
    관리자
  </Link> */}
</div>
```

**Rationale:**
- Hide admin access from public users
- Prevent unauthorized access attempts
- Can be re-enabled for internal use
- Maintains clean public interface

## Files Modified

### Quiz Components

**`components/games/QuizQuestion.tsx`** (Modified)
- Added original article link in question header
- ExternalLink icon from lucide-react
- Theme-aware styling
- Conditional rendering based on `newsLink` availability
- ~10 lines added

### Archive Components

**`components/games/ArchiveCard.tsx`** (Modified)
- Changed from `<Link>` to `<button>`
- Added `onClick` handler with `window.location.href`
- Added navigation logging
- Updated className for button semantics
- ~5 lines modified

### Archive Pages

**`app/games/g1/archive/page.tsx`** (Modified)
- Added `dateQuestionCounts` state
- Load actual question counts from API
- Use full URLs for navigation
- ~15 lines modified

**`app/games/g2/archive/page.tsx`** (Modified)
- Same changes as g1
- Hardcoded `questionCount = 2` (each game has 2 questions)
- Use full URLs for navigation
- ~10 lines modified

**`app/games/g3/archive/page.tsx`** (Modified)
- Same changes as g1 and g2
- Hardcoded `questionCount = 2`
- Use full URLs for navigation
- ~10 lines modified

### Navigation

**`components/navigation/SedailyHeader.tsx`** (Modified)
- Commented out admin button
- Added comment explaining temporary removal
- ~3 lines modified

## Technical Highlights

### 1. Conditional Link Rendering

The original article link only appears when data is available:

```typescript
{question.newsLink && (
  <a href={question.newsLink} target="_blank" rel="noopener noreferrer">
    <ExternalLink className="h-3.5 w-3.5" />
    <span>원문 기사</span>
  </a>
)}
```

**Benefits:**
- No broken links
- Clean UI when source unavailable
- Graceful degradation

### 2. Button-Based Navigation

Using buttons instead of links for archive cards:

```typescript
<button
  onClick={() => {
    console.log('[ArchiveCard] Navigating to:', href)
    window.location.href = href
  }}
  className="... w-full text-left cursor-pointer"
>
```

**Advantages:**
- Full control over navigation behavior
- Debugging with console logs
- Works with full URLs
- Proper button semantics

### 3. Dynamic Data Loading

Archive pages load both tags and question counts in a single pass:

```typescript
const tagsMap: Record<string, string[]> = {}
const countsMap: Record<string, number> = {}

for (const yearData of data.years) {
  for (const monthData of yearData.months) {
    for (const dateStr of monthData.dates) {
      const questions = await getQuestionsForDate("BlackSwan", dateStr)
      
      // Extract tags
      const uniqueTags = new Set<string>()
      questions.forEach(q => {
        if (q.tags) uniqueTags.add(q.tags)
      })
      tagsMap[dateStr] = Array.from(uniqueTags)
      
      // Count questions
      countsMap[dateStr] = questions.length
    }
  }
}

setDateTags(tagsMap)
setDateQuestionCounts(countsMap)
```

**Efficiency:**
- Single API call per date
- Batch state updates
- Reduces re-renders
- Better performance

## User Experience Improvements

### Before vs After

**Quiz Question Header:**

Before:
```
[객관식]
```

After:
```
[객관식]                    [🔗 원문 기사]
```

**Archive Card:**

Before:
```
4문제  (hardcoded)
```

After:
```
2문제  (actual count from API)
```

**Navigation:**

Before:
```
<Link href="/games/g1/play?date=20260205">
  (Next.js client-side navigation)
```

After:
```
<button onClick={() => window.location.href = "https://g2.sedaily.ai/games/g1/play/?date=20260205"}>
  (Full page navigation with logging)
```

## Results & Impact

### Content Discovery

- **Original articles:** Users can verify quiz content and read full context
- **Source transparency:** Builds trust by showing original sources
- **Educational value:** Encourages deeper learning beyond quiz questions

### Archive Accuracy

- **Dynamic counts:** Accurate question counts (2-4 per date)
- **Better metadata:** Users know what to expect before clicking
- **Consistent data:** Counts match actual quiz content

### Navigation Reliability

- **Full URLs:** More reliable navigation across environments
- **Debug logging:** Easier troubleshooting of navigation issues
- **Button semantics:** Proper HTML semantics for clickable cards

### Security & Privacy

- **Hidden admin:** Prevents unauthorized access attempts
- **Clean public interface:** Professional appearance for end users
- **Easy re-enable:** Can uncomment for internal use

## Future Enhancements

### Potential Improvements

1. **Article preview:** Show article snippet on hover
2. **Reading time:** Estimate time to read original article
3. **Related articles:** Link to similar news stories
4. **Bookmark articles:** Save interesting articles for later
5. **Share functionality:** Share quiz + article together
6. **Article metadata:** Show publication date, author, category

### Archive Enhancements

1. **Question difficulty:** Show easy/medium/hard indicators
2. **Completion status:** Mark completed quizzes
3. **Performance stats:** Show user's score history
4. **Favorite quizzes:** Bookmark favorite quiz dates
5. **Search functionality:** Search by keyword or topic
6. **Filter by difficulty:** Show only easy or hard quizzes

## Lessons Learned

### What Worked Well

1. **Conditional rendering:** Clean UI when data unavailable
2. **Button navigation:** More reliable than Link for full URLs
3. **Batch data loading:** Efficient API usage
4. **Console logging:** Helpful for debugging navigation

### Challenges Overcome

1. **Link vs Button:** Chose button for better control
2. **Full URLs:** Required for production deployment
3. **Dynamic counts:** Needed to load actual data
4. **Admin visibility:** Balanced security with usability

### Best Practices Established

1. **Always show sources:** Transparency builds trust
2. **Use actual data:** Don't hardcode metadata
3. **Log navigation:** Helps debug production issues
4. **Hide admin features:** Keep public interface clean

## Conclusion

Successfully improved archive and quiz UX by adding original article links, accurate question counts, and reliable navigation. These changes enhance content discovery and provide users with direct access to source materials while maintaining a clean public interface.

**Key Achievement:** Enhanced user engagement through better content discovery and source transparency.

---

**Related Documentation:**
- [Phase 1: Automated Quiz Generation](./PHASE-01-quiz-auto-generation-system.md)
- [Phase 2: Quiz UI/UX Improvements](./PHASE-02-quiz-ui-ux-improvements.md)
- [Quiz Question Component](../../components/games/QuizQuestion.tsx)
- [Archive Card Component](../../components/games/ArchiveCard.tsx)

**Modified Components:**
- QuizQuestion: Original article links
- ArchiveCard: Button-based navigation
- Archive Pages (g1, g2, g3): Dynamic counts + full URLs
- SedailyHeader: Hidden admin button

**Version:** 2.10.1+
