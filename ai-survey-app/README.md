# AI Learning Readiness Survey

일반인 대상 AI 교육 사전 설문조사 웹앱입니다.

## 설치 및 실행

```bash
cd ai-survey-app
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 환경 변수

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

## 라우팅

| 경로 | 설명 |
|------|------|
| `/` | 설문 안내 홈 |
| `/survey` | 설문 응답 |
| `/complete` | 제출 완료 |
| `/admin-login` | 관리자 로그인 |
| `/admin` | 관리자 대시보드 |

관리자 기본 비밀번호: `admin1234`

## Vercel 배포

1. GitHub 연결 후 Vercel 대시보드에서 Root Directory를 `ai-survey-app`으로 설정
2. Environment Variable: `VITE_ADMIN_PASSWORD=<your_password>`
3. Deploy

## 기술 스택

React 18 · TypeScript · Vite · Tailwind CSS · Recharts · xlsx · LocalStorage
