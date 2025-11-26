# 기여 가이드

G2 프로젝트에 기여해주셔서 감사합니다! 🎉

## 시작하기

```bash
git clone https://github.com/sedaily/g2-clone.git
cd g2-clone
pnpm install
pnpm dev
```

## 개발 워크플로우

### 1. 브랜치 생성
```bash
git checkout -b feature/your-feature
```

### 2. 개발 및 테스트
```bash
pnpm dev          # 개발 서버
pnpm build        # 빌드 테스트
```

### 3. 커밋
```bash
git commit -m "feat: Add new feature"
```

## 커밋 컨벤션

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `refactor`: 리팩토링
- `chore`: 빌드/설정

## 배포

### Frontend
```bash
./scripts/deploy.sh
```

### Backend (Quiz API)
```bash
cd aws/quiz-lambda
./deploy.sh
```

## 문서

새 기능 추가 시:
1. `README.md` 업데이트
2. `docs/` 폴더에 가이드 추가
3. `CHANGELOG.md` 업데이트

## 질문

- GitHub Issues: 버그 리포트
- GitHub Discussions: 질문

---

**감사합니다!** 🙏
