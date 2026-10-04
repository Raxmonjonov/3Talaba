# UI Implementation Plan

## Current state
- Backend logic: IRT placement, FSRS, curriculum generator, AI tutor (prompts/tools/guard), auth, gamification, validation - complete
- APIs: auth/register, auth/[...nextauth], health, onboarding, placement/*, session/* - complete  
- i18n: uz/en dictionaries, config, types - complete
- Landing/login/register pages exist
- Missing: app zone UI (dashboard, lesson, roadmap, mock, mistakes, reports, settings, admin), components/matrix, components/classroom, components/lesson, components/ui primitives, components/charts
- i18n dictionaries only have landing/auth keys; need full app strings

## Next implementation steps

1. **components/ui (shadcn-style primitives)** - button, card, input, label, tabs, progress, badge, avatar, dialog, select, textarea, form helpers, skeleton
2. **components/matrix** - immersive shell, intro, loading, mission banners
3. **components/lesson** - chat, exercise, quiz, timer, break prompt
4. **components/classroom/charts** - progress visualizations
5. **app/[locale]/app/layout.tsx** - authenticated layout with nav, matrix theme
6. **app/[locale]/app/dashboard/page.tsx** - today's mission, streak, XP, level, projection
7. **app/[locale]/app/roadmap/page.tsx** - 52-week view
8. **app/[locale]/app/lesson/[blockId]/page.tsx + Chat.tsx** - lesson flow
9. **app/[locale]/app/mistakes/page.tsx** - error notebook
10. **app/[locale]/app/reports/page.tsx** - weekly/monthly reports
11. **app/[locale]/app/mock/[examId]/page.tsx** - mock exam (basic)
12. **app/[locale]/app/settings/page.tsx** - profile, nickname, prefs, GDPR export/delete
13. **app/[locale]/app/admin/page.tsx** - users/prompts/stats (RBAC)
14. **i18n** - extend uz/en with all app keys
15. **Focus mode** - respect "immersion" without hard lock; confirm-on-leave, break prompts, auto-save, resume

## Notes
- Use server-only where appropriate, keep client components minimal
- Respect addressForm/nickname behavior per prompts.ts
- Timer server-authoritative (LessonSession.elapsedSec) - don't trust client
- Follow existing code style (lint/typecheck must pass)
