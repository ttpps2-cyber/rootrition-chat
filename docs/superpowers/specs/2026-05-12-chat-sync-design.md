# Chat Sync 설계 문서

**날짜:** 2026-05-12  
**범위:** 챗봇 대화 내용 Supabase 저장 + 재개 기능  

---

## 목적

현재 `ChatWindow.tsx`의 모든 상태(메시지, 프로필, SKU 추천)는 메모리에만 존재해 새로고침 시 사라진다. 이 기능은 두 가지 목적을 충족한다:

1. **운영자 열람** — 어떤 사용자가 어떤 질문을 하고 어떤 SKU를 추천받았는지 Supabase에서 확인
2. **사용자 재개** — 이탈 후 재방문 시 이전 대화를 이어서 볼 수 있음

---

## 아키텍처 개요

```
클라이언트 (ChatWindow)
  │
  ├─ sessionId (localStorage UUID)
  │
  ├─ 온보딩 완료 → POST /api/sync/session
  ├─ AI 응답 완료 → POST /api/sync/messages
  └─ 리드 이메일 제출 → PATCH /api/sync/session/email
                         + 기존 lead webhook (병렬)

서버 (Next.js Edge API Routes)
  └─ Supabase (PostgreSQL)
       ├─ chat_sessions
       └─ chat_messages
```

---

## Supabase 스키마

### `chat_sessions`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID PK | Supabase 내부 ID |
| `session_id` | text UNIQUE | 클라이언트 localStorage UUID |
| `email` | text nullable | 리드 제출 시 연결 |
| `user_profile` | jsonb | disease, status, medications, ageGroup, concerns |
| `recommended_sku` | text | primary SKU 이름 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `chat_messages`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID PK | |
| `session_id` | UUID FK → chat_sessions.id | |
| `role` | text | 'user' \| 'assistant' |
| `content` | text | 메시지 본문 |
| `created_at` | timestamptz | |

---

## API 라우트 (4개)

### `POST /api/sync/session`
온보딩 완료 시 세션 생성.

```ts
body: { sessionId: string, userProfile: UserProfile, recommendedSku: string }
response: { id: string }  // chat_sessions.id
```

- `session_id` 기준으로 upsert (중복 호출 안전)

### `POST /api/sync/messages`
AI 응답 완료 시 메시지 저장.

```ts
body: { sessionId: string, role: 'user' | 'assistant', content: string }
response: 201
```

### `PATCH /api/sync/session/email`
리드 이메일 제출 시 세션에 이메일 연결.

```ts
body: { sessionId: string, email: string }
response: 200
```

### `GET /api/sync/resume`
이메일로 이전 세션 복원.

```ts
query: email=xxx@example.com
response: { session: ChatSession, messages: Message[] } | null
```

---

## 클라이언트 변경 (`ChatWindow.tsx`)

### sessionId 초기화
```ts
// 앱 시작 시
const sessionId = localStorage.getItem('rootrition_session_id') ?? (() => {
  const id = crypto.randomUUID()
  localStorage.setItem('rootrition_session_id', id)
  return id
})()
```

### sync 호출 시점
| 이벤트 | 호출 |
|--------|------|
| `handleQ4Confirm()` | `POST /api/sync/session` |
| `useChat.onFinish()` | `POST /api/sync/messages` × 2 (user + assistant) |
| LeadCapture 제출 | `PATCH /api/sync/session/email` (lead webhook과 병렬) |

### 재개 UX
- 앱 시작 시 localStorage sessionId 존재 → `/api/sync/resume?sessionId=...` 조회 → 세션 복원
- 온보딩 화면에 "이전 대화 이어하기" 버튼 → 이메일 입력 → `/api/sync/resume?email=...`

---

## 신규/변경 파일 목록

| 파일 | 변경 유형 | 역할 |
|------|----------|------|
| `lib/syncSession.ts` | 신규 | Supabase 클라이언트 + sync 헬퍼 함수 |
| `app/api/sync/session/route.ts` | 신규 | POST 세션 생성 |
| `app/api/sync/session/email/route.ts` | 신규 | PATCH 이메일 연결 |
| `app/api/sync/messages/route.ts` | 신규 | POST 메시지 저장 |
| `app/api/sync/resume/route.ts` | 신규 | GET 세션 복원 |
| `components/ChatWindow.tsx` | 수정 | sessionId 관리 + sync 호출 |
| `components/LeadCapture.tsx` | 수정 | email PATCH 병렬 호출 추가 |
| `types/chat.ts` | 수정 | `ChatSession` 타입 추가 |

---

## 환경 변수 (`.env.local` 추가)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # API 라우트 전용 (서버 사이드)
```

---

## 에러 처리 원칙

- sync 실패는 **사용자 경험을 차단하지 않음** — 콘솔 경고만 출력하고 채팅은 계속 진행
- API 라우트에서 Supabase 오류 시 500 반환하되, 클라이언트는 silently 무시
- resume 실패 시 새 세션으로 폴백

---

## 테스트 범위

- `lib/syncSession.ts` — 유닛 테스트 (Supabase 클라이언트 mock)
- `app/api/sync/*/route.ts` — 통합 테스트
- `ChatWindow.tsx` — sessionId 초기화, sync 호출 타이밍 테스트
