# Changelog

## v2.10.1 (2025-11-26) - 퀴즈 수정 기능 추가

### ✨ Added
- **퀴즈 수정 기능**: 기존 퀴즈를 불러와서 수정 가능
- **수정 모드 UI**: "수정 모드" 배지 표시
- **기존 값 유지**: 수정 시 모든 기존 값 표시 (문제, 선택지, 정답, 해설, 관련 기사, 태그)

### 🔧 Improved
- **탭 이름 변경**: "퀴즈 삭제" → "퀴즈 수정"
- **데이터 변환**: Lambda Question ↔ QuizQuestion 자동 변환
- **주관식 처리**: 주관식 답변 표시 로직 개선

### 📝 Technical Details
```typescript
// 수정 모드 진입
"퀴즈 수정" 탭 → 날짜 선택 → "수정" 버튼
  ↓
handleEdit() - Lambda Question → QuizQuestion 변환
  ↓
onEdit(questions, date) - 관리자 페이지로 전달
  ↓
isEditMode = true, 기존 값 유지
```

---

## v2.10.0 (2025-11-26) - 여러 문제 추가 기능

### ✨ Added
- **한 날짜에 여러 문제 추가**: 관리자 페이지에서 한 세트에 여러 문제 작성 가능
- **문제 네비게이션**: 이전/다음 버튼으로 문제 간 이동
- **문제 카운터**: "문제 1 / 3" 형식으로 현재 위치 표시
- **문제 삭제**: 현재 문제 삭제 기능 (2개 이상일 때)
- **일괄검증**: 모든 문제 검증 후 저장

### 🔧 Improved
- **배포 스크립트**: `bash scripts/deploy.sh` 권장 (`pnpm build:export` 에러 발생)
- **저장 메시지**: "저장된 문제 개수" 표시

### 📝 Technical Details
```typescript
// 상태 관리
const [questions, setQuestions] = useState<QuizQuestion[]>([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

// 일괄 저장
await saveToLambda(questions, date, apiUrl)
```

---

## v2.9.0 (2025-11-26) - CRITICAL FIX

### 🔥 Breaking Changes
- 동적 라우트 제거: `/games/g2/[date]` → `/games/g2/play?date=YYYYMMDD`
- 모든 게임 (g1, g2, g3) 라우팅 구조 변경

### ✅ Fixed
- **정적 빌드 호환성**: `output: 'export'`와 `dynamicParams: true` 충돌 해결
- **404 에러 해결**: Archive 카드 클릭 시 404 에러 수정
- **빌드 실패 해결**: 동적 라우트 폴더 제거로 빌드 성공

### ✨ Improved
- **UniversalQuizPlayer**: 키보드 단축키 추가 (A, B, C, D)
- **완료 화면**: `isComplete` 조건으로 수정 (모든 문제 답변 시)
- **로딩 UI**: 스피너 애니메이션 추가
- **자동 캐시 초기화**: 퀴즈 저장/삭제 시 메모리 + localStorage 캐시 자동 초기화
- **관리자 UI 간소화**: 불필요한 탭 제거

### 🗑️ Removed
- Vercel 의존성 제거: `@vercel/analytics` 패키지 삭제
- `.vercel/` 폴더 제거
- 배포 관리 페이지 제거: DeployManager 컴포넌트 미사용
- 동적 라우트 폴더: `/games/g1/[date]`, `/games/g2/[date]`, `/games/g3/[date]`

### 📝 Technical Details
**Before (동적 라우트 - 작동 안 함)**
```
/games/g2/[date]/page.tsx
  ↓
dynamicParams: true
  ↓
output: 'export' 충돌
  ↓
빌드 실패 ❌
```

**After (정적 페이지 - 작동함)**
```
/games/g2/play/page.tsx?date=20251126
  ↓
useSearchParams()
  ↓
Lambda API 호출
  ↓
정상 작동 ✅
```

---

## v2.8.1 (2025-11-26)

### Fixed
- Archive 페이지 캐시 문제 (`force-cache` → `no-store`)
- 환경 변수 빌드 포함 (`.env` → `.env.local`)

---

## v2.8.0 (2025-11-26)

### Added
- 퀴즈 CRUD 완전 구현 (생성/조회/삭제)
- 관리자 페이지 퀴즈 삭제 기능

### Fixed
- API Gateway CORS 설정
- Lambda 함수 Python 문법 에러
- 정적 사이트 API 라우트 제거

---

## v2.7.0 (2025-11-24)

### Added
- 동적 퀴즈 시스템 (API Gateway + Lambda)
- Archive 페이지 동적 로딩

---

## v2.6.0 (2025-11-24)

### Added
- 정적 export 빌드 시스템
- Tailwind CSS 4 설정
