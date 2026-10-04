# 3Talab UI Reja (Batafsil) — faqat o‘qish/plan

## 4. Lesson oqimi tafsilotlari

### 4.1 Route: app/[locale]/app/lesson/[blockId]/page.tsx (Server)
- AuthZ: requireStudent (RBAC). Check lesson access by StudyPlan/PlannedBlock
- Load: block + lesson + session (resume) + user + prefs + skillMastery + errorSummary
- Create/Resume LessonSession (POST /api/session/start via server action yoki fetch) — elapsed server-side
- Render: Lesson page with Chat (client), LessonTimer, state

### 4.2 Chat (client) — app/[locale]/app/lesson/[blockId]/_components/Chat.tsx
- SSE streaming: POST /api/chat (messages + context). ReadableStream, TextDecoderStream, RAF render
- Message types: user/assistant/system, kind LESSON
- Auto-scroll, markdown-lite (sanitize), tool-call results handled server-side
- Preserve messages on refresh (server stores ChatMessage)

### 4.3 LessonTimer (client) — components/lesson/LessonTimer.tsx
- Polls/receives elapsedSec (server). Shows target vs elapsed (non-intrusive). No prominent wall clock
- On block complete: call /api/session/step (finish block) > XP update, navigate or next
- Pause/Resume: update session status (PAUSED/ACTIVE), lastActiveAt

### 4.4 BreakPrompt (client) — components/lesson/BreakPrompt.tsx
- Dialog, 50-min soft offer, dismiss/skip/start break (local countdown optional). write breakOfferedAt once

### 4.5 Quiz/Exercise — components/lesson/Quiz.tsx, Exercise.tsx
- MCQ, numeric, short text (Zod). Client validation, submit to /api/session/step with result

## 5. App routes tafsilotlari

| Route | Type | Auth | Maqsad |
|---|---|---|---|
| /[locale]/app/layout.tsx | Server | requireAuth | Shell: MatrixShell + nav (hidden in focus), user prefs, RBAC gates |
| /[locale]/app/dashboard/page.tsx | Server+RSC | STUDENT | Bugungi reja (StudyDay), streak, XP, level, projection, due cards (SRS) |
| /[locale]/app/roadmap/page.tsx | Server | STUDENT | 52 hafta (Tabs), phases, focus skills, mock weeks |
| /[locale]/app/lesson/[blockId]/page.tsx | Server | STUDENT | Dars oqimi |
| /[locale]/app/mistakes/page.tsx | Server | STUDENT | ErrorEntry (OPEN/REVIEWING/RESOLVED), retry |
| /[locale]/app/reports/page.tsx | Server | STUDENT | Haftalik/oylik, mastery (theta), time, XP |
| /[locale]/app/mock/[examId]/page.tsx | Server/Client | STUDENT | MockAttempt, section timer, review |
| /[locale]/app/settings/page.tsx | Server+actions | STUDENT | Nickname, gender/addressForm, prefs (sound/matrixIntro/reduceMotion/breaks/bedtime), GDPR /api/account/export/delete, theme |
| /[locale]/app/admin/page.tsx | Server | ADMIN/TEACHER | Users, PromptTemplate (read/edit), stats, feature flags (SystemSetting) |

## 6. i18n kengaytmasi

src/lib/i18n/dictionaries/uz.ts, en.ts ga quyidagi bo‘limlar qo‘shiladi: pp.nav, dashboard, oadmap, lesson, mistakes, eports, mock, settings, dmin, common, matrix, ocus. Typing: lib/i18n/types.ts avtomatik majburiy (build-time).

## 7. Focus Mode + Immersion (talab bajarish)

- MatrixShell: dark, subtle glow, no heavy particles (perf), prefers-reduced-motion respect
- FocusMode: ocus aktiv — nav/chrome yashiriladi, lekin **Exit/Pause** doimo ko‘rinadi (sticky bottom/top safe)
- beforeunload: faqat LessonSession.status==='ACTIVE' paytida confirm. Matn uz/en
- Break every ~50m: soft prompt (once/block or session window). Dismiss allowed
- Bedtime 23:00 (env BEDTIME_REMINDER): non-blocking banner
- Nickname: har 3–4 javobda bir marta, natural, never forced (prompts.ts rules)
- Time perception: micro-content, continuous dialogue, minimal elapsed clock, no countdown stress

## 8. Qoniqish mezonlari (acceptance)

- typecheck/lint/build/unit tests yashil qoladi
- Har yangi komponent SSR-safe
- RBAC to‘g‘ri ishlaydi
- SSE stream barqaror, xato holatda graceful
- Focus mode exit har doim mavjud (safety)
- Server timer (elapsedSec) — client trust qilinmaydi
- Tahallus qoidasi buzilmaydi (nickname spacing)

## 9. Ish tartibi (incremental)

1. components/ui (minimal set first: Button/Card/Input/Label/Progress/Badge/Tabs)
2. components/matrix + FocusModeProvider + MatrixShell + layout
3. app/[locale]/app/layout.tsx + dashboard (server data)
4. roadmap + mistakes + reports (RSC)
5. lesson/[blockId] + Chat + Timer + BreakPrompt
6. mock + settings + admin
7. i18n full extend, typecheck/lint/build/test
8. Commit (clean)

## Eslatma (ethics)

"Vaqt tugaguncha chiqish" talabi — UI bloklov sifatida bajarilmaydi. Yuqoridagi **Focus Mode** aynan immersion maqsadini xavfsizlik bilan uyg‘unlashtiradi (confirm-on-leave + doimo mavjud exit + breaks + bedtime). Bu ARCHITECTURE.md §6 bilan mos.
