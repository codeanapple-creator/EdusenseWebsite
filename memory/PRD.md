# EDUSENSE by Codeanapple — PRD

## Original Problem Statement
> Create an app named EDUSENSE by Codeanapple. Add a western astrology API where users put name, place and time and it suggests their niche; for further info they can connect on a WhatsApp number. Platform suggests age-appropriate books, links and activities of different subjects — all for parents. Prepare three logins: parent, teacher and principal.
>
> *(Update — Feb 2026):* Add sentiment analysis aligned with Bhawna Tiwari's PhD thesis "Sentimental Analysis approach to improve teaching and learning in primary education" (2024) — across parent feedback, student journals, teacher notes, and a standalone analyzer for all three roles.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). All routes prefixed `/api`. JWT (Bearer) auth. LLM via `emergentintegrations` (Claude Sonnet 4.5).
- **Frontend**: React 19 + react-router 7 + Tailwind + shadcn/ui + Recharts. Auth state in `AuthContext`, JWT in localStorage.
- **Theme**: Light, amber-50 base, sky-500 primary, indigo cosmic accents. Fonts: Nunito (heading), Figtree (body), Caveat (script accent).

## Personas
- **Parent** — finds child's astrological niche; gets age-appropriate books/links/activities; submits feedback / journal entries with sentiment analysis; connects on WhatsApp.
- **Teacher** — manages students, generates curated content, records sentiment-tagged notes about students.
- **Principal** — school-wide analytics, all students, role distribution, astrology consult counts, **sentiment overview** (per kind + overall).

## Implemented (v1.1 — Feb 2026)
- ✅ Three-role JWT auth (register/login/me) with role-tab UX, pre-seeded principal admin.
- ✅ Western Astrology niche finder (name + place + DOB + TOB) → AI niche, traits, career_paths, summary, sun-sign + WhatsApp link.
- ✅ AI book/link/activity recommendations by subject + age (Parent + Teacher dashboards).
- ✅ Teacher dashboard: student CRUD, recommendation generator.
- ✅ Principal dashboard: stats, users-by-role pie, students-by-grade bar, all-students table, **sentiment overview**.
- ✅ **Sentiment Lab** (Tiwari, 2024) — POST /api/sentiment/analyze (instant) + /records (persist), /summary (principal+teacher), /records (filter by kind, RBAC visibility, ownership delete).
   - Hybrid lexicon + ML approach
   - 3-class polarity {positive, negative, neutral} + mixed
   - NRC 8-emotion lexicon: anger, anticipation, disgust, fear, joy, sadness, surprise, trust
   - Likert score (0–5) + polarity_score (-1..1) + confidence
   - Satisfaction (joy*0.5 + trust*0.3 + anticipation*0.2)
   - Dissatisfaction (anger*0.35 + disgust*0.25 + sadness*0.25 + fear*0.15)
   - Aspect-based: happiness_index, active_participation, sharing, self_initiation, gross_motors, fine_motors_cognitive, behaviour, learning, teaching_effectiveness, course_content, instructor_quality
- ✅ Standalone /sentiment page with Analyze + History tabs available to all 3 roles
- ✅ Beautiful landing page (hero, role cards, cosmic astrology teaser, footer).
- ✅ data-testid coverage across interactive elements.
- ✅ End-to-end tested by testing_agent_v3 (40/40 backend, 100% frontend).

## Backlog (P1/P2)
- P1: Persist favorite recommendations & assign content to students from Teacher dashboard.
- P1: Parent-child profile (multiple children, save niche per child).
- P1: Sentiment trends over time (line chart per kind, per student).
- P2: Email/SMS digest of weekly activities + sentiment digest.
- P2: Replace native date/time inputs with shadcn Calendar + custom time picker.
- P2: Localization (Hindi, Marathi).
- P2: School billing/subscription tier.
- P2: Refactor server.py into routes/* modules; migrate FastAPI startup to lifespan.

## Next Tasks
1. Sentiment trend chart (per role / per kind / over time) on Principal dashboard.
2. Multi-child profiles for parents (link sentiment records to a specific child).
3. Teacher → student content assignment and read-tracking.
4. Configurable WhatsApp number per Codeanapple (admin setting).

## Research Reference
Tiwari, B. (2024). *Sentimental Analysis approach to improve teaching and learning in primary education* (PhD Thesis).
