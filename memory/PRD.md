# EDUSENSE by Codeanapple — PRD

## Original Problem Statement
> Create an app named EDUSENSE by Codeanapple. Add a western astrology API where users put name, place and time and it suggests their niche; for further info they can connect on a WhatsApp number. Platform suggests age-appropriate books, links and activities of different subjects — all for parents. Prepare three logins: parent, teacher and principal.
>
> *(v1.1 — Feb 2026):* Add sentiment analysis aligned with Bhawna Tiwari's PhD thesis "Sentimental Analysis approach to improve teaching and learning in primary education" (2024).
>
> *(v1.2 — Feb 2026):* Sentiment trend over time on Principal dashboard, multi-child profiles for parents, modular backend refactor.

## Architecture
- **Backend (modular)**: FastAPI (lifespan) + MongoDB (motor).
   - `core/` — config, auth, llm
   - `routes/` — auth, astrology, recommendations, students, children, sentiment, analytics, whatsapp
   - `server.py` — slim 91-line entrypoint
- **Frontend**: React 19 + react-router 7 + Tailwind + shadcn/ui + Recharts. Auth in `AuthContext`, JWT in localStorage.
- **Theme**: Light, amber-50 base, sky-500 primary, indigo cosmic accents. Fonts: Nunito, Figtree, Caveat.

## Personas
- **Parent** — manages multiple children, finds astrological niche per child, gets age-appropriate books/links/activities, submits feedback / journal entries with sentiment analysis, connects on WhatsApp.
- **Teacher** — manages students, generates curated content, records sentiment-tagged notes, sees trend.
- **Principal** — school-wide analytics, sentiment overview + **trend over time** (stacked area + avg-Likert line chart), all students, all children counter.

## Implemented (v1.3 — Feb 2026)
- ✅ All v1.0–v1.2 features.
- ✅ **Reusable `<DatePicker>`** (shadcn Calendar + Popover) replacing native date inputs in Astrology DOB and ChildrenManager.
- ✅ **MongoDB `$group` pipeline** for `/api/sentiment/trend` (date bucketing + zero-fill missing days; replaces in-process aggregation).
- ✅ **`asyncio.wait_for(45s)` timeout** wrapping every LLM call in `core/llm.py`; surfaces clean `504 AI service timed out` instead of silently stalling workers. Route handlers updated with `except HTTPException: raise` to preserve the 504 vs wrapping as 502.
- ✅ Tested end-to-end: **60/60 backend tests pass · 100% frontend flows pass.**

## Implemented (v1.2 — Feb 2026)
- ✅ Three-role JWT auth, pre-seeded principal admin.
- ✅ Western Astrology niche finder + AI book/link/activity recommendations.
- ✅ Teacher: student CRUD; Principal: stats, charts, all-students table.
- ✅ **Sentiment Lab** (Tiwari, 2024) — analyze, persistent records, summary, **trend endpoint** (1-180 days).
- ✅ NRC 8-emotion lexicon, polarity, Likert (0–5), satisfaction & dissatisfaction, aspect-based categories.
- ✅ Standalone `/sentiment` page available to all 3 roles.
- ✅ **Children CRUD** for parents — add/edit/delete multiple children with name, DOB, age, grade, notes.
- ✅ `child_id` linkage on astrology and sentiment records, with filtered GETs.
- ✅ **Sentiment Trend Chart** on Principal dashboard — stacked area (positive/neutral/mixed/negative) + Avg Likert line chart, 7/14/30/60/90-day range.
- ✅ Total Children KPI tile on Principal dashboard.
- ✅ **Modular backend refactor**: 91-line `server.py` + `core/` + `routes/*` modules (FastAPI lifespan).
- ✅ Tested end-to-end: **59/59 backend tests pass · 100% frontend flows pass.**

## Backlog (P1/P2)
- P1: Sentiment digest emails / SMS (per term / weekly).
- P1: Replace native date inputs with shadcn Calendar.
- P2: Localization (Hindi, Marathi).
- P2: School billing/subscription tier.
- P2: $group MongoDB pipeline for trend aggregation (currently in-process).
- P2: asyncio.wait_for timeout wrapper around LLM calls.

## Research Reference
Tiwari, B. (2024). *Sentimental Analysis approach to improve teaching and learning in primary education* (PhD Thesis).
