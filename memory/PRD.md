# EDUSENSE by Codeanapple — PRD

## Original Problem Statement
> Create an app named EDUSENSE by Codeanapple. Add a western astrology API where users put name, place and time and it suggests their niche; for further info they can connect on a WhatsApp number. Platform suggests age-appropriate books, links and activities of different subjects — all for parents. Prepare three logins: parent, teacher and principal.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). All routes prefixed `/api`. JWT (Bearer) auth. LLM via `emergentintegrations` (Claude Sonnet 4.5).
- **Frontend**: React 19 + react-router 7 + Tailwind + shadcn/ui + Recharts. Auth state in `AuthContext`, JWT in localStorage.
- **Theme**: Light, amber-50 base, sky-500 primary, indigo cosmic accents. Fonts: Nunito (heading), Figtree (body), Caveat (script accent).

## Personas
- **Parent** — finds child's astrological niche; gets age-appropriate books/links/activities; connects on WhatsApp for deeper guidance.
- **Teacher** — manages students, generates curated content per subject/age.
- **Principal** — school-wide analytics, all students, role distribution, astrology consult counts.

## Implemented (v1 — 2026-02)
- ✅ Three-role JWT auth (register/login/me) with role-tab UX, pre-seeded principal admin.
- ✅ Western Astrology niche finder (name + place + DOB + TOB) → AI niche, traits, career_paths, summary, sun-sign + WhatsApp link.
- ✅ AI book/link/activity recommendations by subject + age (Parent + Teacher dashboards).
- ✅ Teacher dashboard: student CRUD, recommendation generator.
- ✅ Principal dashboard: stats, users-by-role pie, students-by-grade bar, all-students table.
- ✅ Beautiful landing page (hero, role cards, cosmic astrology teaser, footer).
- ✅ data-testid coverage across interactive elements.
- ✅ End-to-end tested by testing_agent_v3 (22/22 backend, 100% frontend).

## Backlog (P1/P2)
- P1: Persist favorite recommendations & assign content to students from Teacher dashboard.
- P1: Parent-child profile (multiple children, save niche per child).
- P2: Email/SMS digest of weekly activities.
- P2: Replace native date/time inputs with shadcn Calendar + custom time picker.
- P2: Localization (Hindi, Marathi).
- P2: School billing/subscription tier.

## Next Tasks
1. Multi-child profiles for parents.
2. Teacher → student content assignment and read-tracking.
3. Configurable WhatsApp number per Codeanapple (admin setting).
