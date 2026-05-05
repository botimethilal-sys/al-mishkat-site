# Al-Mishkat — Islamic Educational Platform

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Wouter + TanStack Query + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Branding

- Deep Emerald Green: `#064E3B` (primary)
- Gold: `#D97706` (accent)
- Warm Cream: `#FDFCF0` (background)

## Artifacts

- `artifacts/al-mishkat` — React/Vite frontend, path `/`
- `artifacts/api-server` — Express 5 API, path `/api`

## DB Schema (lib/db/src/schema/)

- `videos` — subject & pillar videos with thumbnails
- `pdfs` — subject & pillar PDFs
- `quizzes` + `quizQuestions` — quiz builder
- `questions` — Q&A inbox submissions
- `pillarContent` — external video links for pillar pages
- `settings` — key-value store (used for announcements)

## Features Implemented

### Student-facing
- Homepage with hero, stats, continue learning, progress tracker, latest feed, 5 pillars
- 6 subject modules (Aqidah, Tafsir, Hadith, Fiqh, Tarbiyah, Sirah) each with:
  - Video Hub (filter by lecture/short/reel, inline video player)
  - PDF Library (read in-browser PDF viewer, download)
  - Reading Room (book snippet images)
  - Exam Center (quiz with name entry → certificate on pass)
- 5 Pillar pages with Arabic text, videos, external resource links
- Global search across videos and PDFs
- **Dark mode** — toggle in header, persists to localStorage
- **Bookmarks** — save any video/PDF/link, view in /saved page
- **Student Notes** — sticky-note icon on every video and PDF (localStorage)
- **WhatsApp share** — share any video or PDF instantly
- **Progress Tracker** — homepage shows visited subjects + quiz pass rings per subject
- **Quiz certificates** — printable/downloadable certificate on passing any quiz
- **Floating actions** — scroll-to-top + saved items badge (fixed bottom-right)
- **Announcement banner** — gold bar at top of site (admin-controlled)
- **PDF built-in reader** — opens PDFs inside the site without downloading

### Admin panel (/admin)
- Password protected (ADMIN_PASSWORD secret)
- Upload Video (file + thumbnail + subject/pillar targeting)
- Upload PDF (file + subject/pillar targeting)
- Video Link (external URL for pillar pages)
- Quiz Builder (create quiz → add questions → configurable pass threshold; add questions to existing quizzes)
- Q&A Inbox (view, mark read, delete student questions)
- Content Library (list + delete all uploaded content)
- **Announcements** — type a message → appears as banner on the site instantly

### localStorage keys
- `al-mishkat-bookmarks` — saved items
- `al-mishkat-theme` — dark/light preference
- `al-mishkat-notes` — per-item student notes
- `al-mishkat-progress` — quiz attempt history
- `al_mishkat_recently_viewed` — recently visited subjects

## Security Notes

- `ADMIN_PASSWORD` in Replit Secrets
- Admin auth via `/api/admin/auth` (session in sessionStorage)
- `SESSION_SECRET` for Express sessions
- Object storage via `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
