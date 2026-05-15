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

## Implemented (v2.0 — Feb 2026)
- ✅ **Hindi localisation for BehaviourScope™ readings**: added EN/हिंदी toggle on `/astrology` form. Sends `language: "hi"` to `POST /api/astrology/niche`; backend instructs Claude Sonnet 4.5 to return all string values (niche, traits, career paths, summary, behaviour_scope.*) in Devanagari Hindi. WhatsApp consultation deep-link text also localised. Verified end-to-end via curl + screenshot.
- ✅ Updated availability copy on `/products/behaviourscope`: "Available in English and हिंदी".

## Implemented (v1.9 — Feb 2026)
- ✅ **Branding refresh**: Replaced gradient-square Sparkles logo with new **Code An Apple** logo (red apple + `</>` glyph) across Navbar, Landing footer, BehaviourScope footer; added as favicon + apple-touch-icon in `index.html`. Saved to `/app/frontend/public/codeanapple-logo.png`.
- ✅ **Credit & methodology copy**: Replaced all "Tiwari (2025) / Tiwari, 2025" references with **"Dr Bhawna Tiwari"** (Landing hero, products section, methodology strip, Sentiment page, SentimentResultCard, SentimentTrendChart, PrincipalDashboard, backend prompt + docstring + tests).
- ✅ Removed standalone "2025" year mentions from user-facing copy.
- ✅ Smoke-tested: Landing + `/products/behaviourscope` render with new logo, JSON-LD tags (`ld-behaviourscope-product`, `ld-behaviourscope-faq`) confirmed present in DOM.

## Implemented (v1.8 — Feb 2026)
- ✅ All v1.0–v1.7 features.
- ✅ **Dedicated marketing page** at `/products/behaviourscope` (public, no auth) with: cosmic hero (shimmer "BehaviourScope™" headline), "What's in every reading" 4-feature grid, **3 sample readings** (Gemini / Aries / Cancer), pricing (Free / Pro ₹1,499), availability, testimonial, **FAQ accordion** (7 questions), final CTA. Includes dynamic `<title>` and `<meta name="description">` for SEO.
- ✅ **Sample-output gallery on Landing** — new section "Three children. Three compasses." with the same 3 sample reading cards + CTA "See the full product" → `/products/behaviourscope`.
- ✅ Reusable `<SampleReadingCard>` component + static `lib/sampleReadings.js` data (single source of truth).
- ✅ Frontend lint clean.

## Implemented (v1.7 — Feb 2026)
- ✅ All v1.0–v1.6 features.
- ✅ **Rebrand**: Astrology niche-finder repositioned as **"BehaviourScope™ Western Astrology"** — flagship product of EDUSENSE by Codeanapple.
- ✅ Landing page restructured: hero ("BehaviourScope™ — for the primary years"), new Products section (3 product cards with BehaviourScope marked Flagship), Methodology Strip citing Tiwari (2025), Roles section moved below.
- ✅ New `/behaviourscope` route as primary URL; `/astrology` preserved as legacy alias.
- ✅ Sentiment Lab page header updated with "A Codeanapple product · built on Tiwari (2025)" badge.
- ✅ Backend prompt + all UI references updated from Tiwari (2024) → **Tiwari (2025)** per new thesis (19 Apr 2025 version) — methodology identical, citation refreshed.
- ✅ Parent dashboard CTA + history dashboards now reference BehaviourScope branding.

## Implemented (v1.6 — Feb 2026)
- ✅ All v1.0–v1.5 features.
- ✅ **Astrology Behaviour Scope** — `behaviour_scope` object returned by `/api/astrology/niche` containing `behavioural_traits[]`, `social_style`, `emotional_pattern`, `learning_style`, `strengths[]`, `growth_areas[]`, `parenting_tips[]`. Rendered as `<BehaviourScopeCard>` on the Astrology page below the niche card.
- ✅ **Sentiment + Subject-specific recommendations** — `/api/sentiment/analyze` and `/api/sentiment/records` accept optional `subject` + `age`; when both provided, the response embeds `recommendations: {subject, age, books[], links[], activities[]}` via parallel `asyncio.gather` LLM call. Frontend Sentiment Lab shows an "Optional · subject-specific recommendations" panel and SentimentResultCard renders an embedded 3-column books/links/activities section.
- ✅ Aligned with Bhawna Tiwari (2025) thesis — same NRC 8-emotion lexicon + 8 aspect categories (Happiness Index, Active Participation, Sharing, Self-initiation, Gross/Fine Motors, Behaviour, Learning).
- ✅ Tested end-to-end: **77/77 backend pytest pass · 100% frontend Sentiment flow pass** (Astrology UI render path verified; LLM call exceeded the 90 s Playwright window once but backend contract proven).

## Implemented (v1.5 — Feb 2026)
- ✅ All v1.0–v1.4 features.
- ✅ **Razorpay webhook endpoint** `POST /api/webhooks/razorpay`:
  - HMAC-SHA256 signature verification via `X-Razorpay-Signature` (returns 401 on mismatch, 503 if `RAZORPAY_WEBHOOK_SECRET` not configured)
  - Idempotency dedupe via `X-Razorpay-Event-Id` + `webhook_events` collection (unique sparse index)
  - Event handlers: `subscription.activated/charged/resumed` → flip to Pro + extend period from `current_end`; `subscription.paused` → grace; `subscription.cancelled/completed/halted` → downgrade to Free
  - School resolution via `payload.subscription.entity.notes.school_id` fallback to `razorpay_subscription_id`
  - Persists `razorpay_subscription_id` on the school
- ✅ `refresh_subscription_state` no longer overrides webhook-driven `grace/expired` statuses.
- ✅ End-to-end verified with HMAC-signed test payloads — all 6 scenarios pass (503, 401, charge, idempotent duplicate, pause, cancel).

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
