# 기여 가이드

G2 프로젝트에 기여해주셔서 감사합니다! 🎉

## 시작하기

### 1. 저장소 포크 및 클론

```bash
git clone https://github.com/YOUR_USERNAME/g2-clone.git
cd g2-clone
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 브랜치 생성

```bash
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/your-bug-fix
```

## 커밋 컨벤션

### 커밋 메시지 형식

```
<type>: <subject>

<body>
```

### Type

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

### 예시

```bash
git commit -m "feat: Add auto-deploy trigger Lambda"
git commit -m "fix: Resolve CloudFront cache invalidation issue"
git commit -m "docs: Update AWS optimization guide"
```

## 코드 스타일

### TypeScript/React

- ESLint 규칙 준수
- Prettier 포맷팅
- 컴포넌트는 함수형으로 작성
- Props는 명시적 타입 정의

### Python

- PEP 8 스타일 가이드
- Type hints 사용
- Docstring 작성

## 테스트

### 빌드 테스트

```bash
pnpm build
```

### 배포 테스트 (로컬)

```bash
pnpm deploy:quick
```

## Pull Request

### PR 체크리스트

- [ ] 로컬 테스트 완료
- [ ] 빌드 성공
- [ ] 문서 업데이트
- [ ] CHANGELOG.md 업데이트
- [ ] 버전 번호 업데이트 (필요시)

### PR 제목

```
[Type] Brief description
```

예시:
- `[Feature] Add CloudWatch Dashboard`
- `[Fix] Resolve DynamoDB Streams trigger issue`
- `[Docs] Update monitoring guide`

## 버전 관리

### 버전 번호 규칙

- **Major (X.0.0)**: 아키텍처 변경, Breaking changes
- **Minor (0.X.0)**: 새 기능 추가
- **Patch (0.0.X)**: 버그 수정

### 업데이트 파일

1. `package.json` - version
2. `VERSION` - 버전 번호
3. `CHANGELOG.md` - 변경 사항
4. `README.md` - Last Updated, Version

## 문서화

### 새 기능 추가 시

1. `README.md` 업데이트
2. `docs/` 폴더에 상세 가이드 추가
3. 코드 주석 작성
4. 예제 코드 제공

### 문서 작성 가이드

- 명확하고 간결하게
- 코드 예제 포함
- 스크린샷 추가 (UI 변경 시)
- 한글/영어 병기 (주요 용어)

## 이슈 리포팅

### 버그 리포트

```markdown
## 버그 설명
간단한 설명

## 재현 방법
1. 단계 1
2. 단계 2
3. 에러 발생

## 예상 동작
어떻게 동작해야 하는지

## 실제 동작
실제로 어떻게 동작하는지

## 환경
- OS: macOS/Windows/Linux
- Node: v20.x
- Browser: Chrome/Safari/Firefox
```

### 기능 제안

```markdown
## 기능 설명
무엇을 추가하고 싶은지

## 사용 사례
왜 필요한지

## 제안 구현
어떻게 구현할 수 있는지 (선택사항)
```

## 질문 및 지원

- GitHub Issues: 버그 리포트, 기능 제안
- GitHub Discussions: 일반 질문, 아이디어 공유

## 라이선스

기여하신 코드는 프로젝트 라이선스를 따릅니다.

---

**다시 한번 감사드립니다!** 🙏
