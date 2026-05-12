# EDUSENSE by Codeanapple — PRD

## Original Problem Statement
> Create an app named EDUSENSE by Codeanapple. Add a western astrology API where users put name, place and time and it suggests their niche; for further info they can connect on a WhatsApp number. Platform suggests age-appropriate books, links and activities of different subjects — all for parents. Prepare three logins: parent, teacher and principal.

## Architecture
- **Backend (modular)**: FastAPI lifespan + MongoDB (motor)
  - `core/` — config, auth, llm (45 s `asyncio.wait_for` timeout), tenancy helpers
  - `routes/` — auth, astrology, recommendations, students, children, **schools**, sentiment, analytics, whatsapp
- **Frontend**: React 19 + react-router 7 + Tailwind + shadcn/ui + Recharts. JWT in localStorage.
- **Theme**: Amber-50 base, sky/indigo cosmic accents, Nunito + Figtree + Caveat fonts.

## Personas
- **Parent** — manages multiple children, finds astrological niche per child, AI book/link/activity recommendations, submits feedback + journals with sentiment analysis, **per-child sentiment trend filter**, WhatsApp connect.
- **Teacher** — student CRUD with subject focus + sentiment-tagged notes; joins a school via 6-char code.
- **Principal** — owns a **School** with auto-generated join code, manages plan (Free/Pro), sees stats + sentiment overview + **trend over time with kind filter** + member roster.

## Implemented (v1.4 — Feb 2026)
- ✅ Three-role JWT auth, pre-seeded principal admin.
- ✅ Western Astrology niche finder + AI book/link/activity recommendations.
- ✅ Teacher student CRUD; Principal analytics, stats, charts, all-students table.
- ✅ Sentiment Lab (Tiwari, 2024) — NRC 8-emotion lexicon, polarity, Likert (0–5), satisfaction/dissatisfaction, aspect-based categories. Standalone `/sentiment` page for all roles.
- ✅ Children CRUD for parents (multi-child) with optional `child_id` linkage on astrology + sentiment records.
- ✅ Sentiment Trend over time (Recharts stacked area + Avg Likert line) on Parent + Principal dashboards.
- ✅ Shadcn `<DatePicker>` (Calendar + Popover) replacing native date inputs.
- ✅ LLM `asyncio.wait_for(45s)` timeout → clean 504; routes preserve via `except HTTPException: raise`.
- ✅ **Multi-tenant `school_id`** boundary across users / students / children / sentiment_records / astrology_results.
- ✅ `/api/schools` CRUD: create (principal-led with 6-char code), `/me`, `/join`, `/subscribe` (MOCKED), `/leave`, `/members`.
- ✅ **Free / Pro plans** — Free=30 students soft 402 quota, Pro=unlimited; 7-day grace then auto-downgrade.
- ✅ `/sentiment/trend` MongoDB **`$dateFromString` + `$dateToString`** aggregation (UTC); `kind` + `child_id` filters; parent role allowed.
- ✅ SchoolManager card on Principal Dashboard (school code copy, plan badge, Subscribe Pro button — MOCKED).
- ✅ SubscriptionBanner across all 3 dashboards on grace / expired.
- ✅ Register page: optional school_code for parent/teacher → auto-joins on registration.
- ✅ Lifespan migration: default "EDUSENSE Demo" school (`DEMO01`) created + all legacy users/data backfilled.
- ✅ Tested end-to-end: **72/72 backend pytest pass · 100% frontend flows pass** (teacher-dashboard import bug caught + fixed during iteration 5).

## Backlog (P1/P2)
- P1: Wire real **Razorpay** payment when test keys are provided (currently MOCKED).
- P1: Webhook endpoint for Razorpay events (subscription.activated/paused/charged/cancelled).
- P1: Per-school billing history page.
- P2: Email digest of weekly sentiment (Resend).
- P2: Localization (Hindi, Marathi).
- P2: Per-aspect drill-down (compare Happiness Index vs Learning over time).
- P2: Lint enforcement in CI to prevent unimported-component bugs.

## Research Reference
Tiwari, B. (2024). *Sentimental Analysis approach to improve teaching and learning in primary education* (PhD Thesis).
