# DSA Vault

A personal DSA question management, coding practice tracking, solution storage, and
spaced-revision system — built to scale comfortably from a few hundred problems to
10,000+.

## Features

- **Question vault** — title, difficulty, platform, problem link, status, confidence,
  favorites, bookmarks, description, and free-form notes.
- **Multiple language solutions per question** — a Monaco-powered code editor per
  language, one primary solution per question, approach/intuition/explanation and
  time/space complexity fields.
- **Topics & tags** — a shared 29-topic DSA taxonomy (Arrays, DP, Graphs, …) plus
  per-user custom tags, both fully relational (never comma-separated strings).
- **Spaced revision system** — an adjustable interval schedule (1 / 3 / 7 / 14 / 30
  days, growing beyond that) driven entirely by a Postgres function, with a Due
  Today / Overdue / Upcoming / Recently Revised dashboard.
- **Optimized dashboard** — every statistic and chart is computed by a Postgres RPC
  function, never by fetching all questions into React.
- **Server-side pagination, filtering, and full text search** — 25/50/100 page
  sizes, combinable filters (difficulty, platform, topic, language, status,
  confidence, favorite/bookmark/revision-required), 400ms debounced search over
  title, platform, topic, and tag.
- **Bulk CSV/JSON import** — validates, normalizes, batches (200 rows per request),
  detects duplicates at the database level, and reports success/failed/skipped
  counts. Handles 2,000+ row files without one request per row.
- **Duplicate prevention** — enforced by Postgres unique indexes, not just frontend
  checks: platform questions dedupe on normalized URL, custom questions on
  normalized title.
- **Row Level Security everywhere** — every user-owned table is scoped to
  `auth.uid()`; a user can never read, write, or see another user's data.

## Tech stack

- React 19 + Vite 8, Tailwind CSS v4 (CSS-first theme), React Router v7
- Supabase: Postgres, Auth, Row Level Security, Postgres functions/RPC
- Monaco Editor (`@monaco-editor/react`), Recharts, Papa Parse, React Hot Toast,
  Lucide React

## Project structure

```
supabase/migrations/     # 11 executable SQL migrations — see below
src/
  components/
    common/               # Button, Card, EmptyState, PageHeader, FormField, Select,
                           # Textarea, MultiSelect, Badge, ConfirmDialog, Skeleton,
                           # ProtectedRoute
    layout/               # Sidebar, Topbar
    questions/             # QuestionForm, QuestionTable, Pagination
    solutions/             # LanguageTabs, SolutionEditor (Monaco)
    revisions/              # RevisionRow, RevisionModal
    dashboard/             # DifficultyChart, BarChartCard (Recharts)
    filters/                # SearchBar, FilterPanel
  pages/                    # One file per route
  services/                 # All Supabase queries — components never call
                             # supabase.* directly for CRUD
  hooks/                     # useDebounce
  context/                   # AuthContext (session, signIn/signUp/signOut)
  lib/supabase.js            # Supabase client (anon key only)
  utils/                      # revisionSchedule preview, date formatting, Monaco
                               # language mapping
  constants/                  # Enum-like values shared across the app
  layouts/                    # MainLayout (sidebar shell), AuthLayout (centered)
```

## Design system

Dark theme by default, built around a "vault" concept: a deep graphite background
with a single warm amber accent standing in for the vault's lock, emerald for solved
problems, and teal reserved for secondary chart data.

| Token | Value | Use |
|---|---|---|
| `--color-base` | `#0a0d13` | App background |
| `--color-surface` | `#12161f` | Cards, sidebar |
| `--color-accent` | `#f0b429` | Primary actions, active nav, focus rings |
| `--color-success` | `#34d399` | Solved / Easy |
| `--color-warning` | `#fbbf24` | Attempted / Medium |
| `--color-danger` | `#f87171` | Destructive actions / Hard |
| `--color-info` | `#2dd4bf` | Secondary chart series |

Fonts: **Space Grotesk** (display/headings), **Inter** (body), **JetBrains Mono**
(code and data).

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your
project URL and anon key from **Project Settings → API**.

### 2. Run the migrations

In the Supabase dashboard, open **SQL Editor**, and run each file in
`supabase/migrations/` **in order** (001 through 011), or use the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

The migrations create every table, index, RLS policy, trigger, and function, and
seed the 29 default DSA topics. All 11 files were validated end-to-end against a
real Postgres 16 instance (extensions, RLS, spaced-revision scheduling, dashboard
aggregates, and bulk import were all exercised with real data) before this
delivery.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Only the public anon key is ever used from the frontend — the service role key is
never referenced anywhere in this codebase.

### 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`, register an account, and start adding questions.

### 5. Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages,
etc). No server-side runtime is required — everything talks directly to Supabase.

## Database design

11 migrations, run in order:

| File | Contents |
|---|---|
| `001_extensions.sql` | `pgcrypto`, `pg_trgm`, plus the `normalize_url`, `slugify`, and `set_updated_at` helper functions used by later migrations |
| `002_questions.sql` | `questions` table, generated dedup/search columns, dedup unique indexes |
| `003_solutions.sql` | `question_solutions` table, single-primary-solution triggers |
| `004_topics.sql` | shared `topics` table + `question_topics` junction |
| `005_tags.sql` | per-user `tags` table + `question_tags` junction |
| `006_revisions.sql` | append-only `question_revisions` history table |
| `007_settings.sql` | `user_settings` (default language, editor theme, view) |
| `008_indexes.sql` | every query-pattern-driven index, with rationale comments |
| `009_rls.sql` | Row Level Security policies for every table |
| `010_functions.sql` | spaced revision scheduling, `record_revision`, dashboard stat RPCs, full text search, `bulk_import_questions` |
| `011_seed_topics.sql` | seeds the 29 default DSA topics |

### Cascade behavior

Deleting a question cascades to its solutions, revision history, and topic/tag
links via `ON DELETE CASCADE` — a single `DELETE` from the frontend, never five
manual requests.

### Spaced revision algorithm

Base schedule: 1 → 3 → 7 → 14 → 30 days, then growing ×1.5 per stage beyond that.
`Failed` steps back a stage and halves the interval; `Struggled` repeats the stage
at 75% of the interval; `Solved With Hint` / `Solved` advance one stage;
`Easy Recall` advances two stages. A question is marked **Mastered** once it's
advanced 3+ stages past the base schedule. All of this lives in
`compute_next_interval_days()` in `010_functions.sql` — it is the single source of
truth; `src/utils/revisionSchedule.js` is a read-only preview copy used only to show
"next revision in ~N days" before the user submits.

## Security architecture

- Every user-owned table (`questions`, `question_solutions`, `tags`,
  `question_revisions`, `user_settings`) has RLS enabled with `SELECT` / `INSERT` /
  `UPDATE` / `DELETE` policies scoped to `auth.uid() = user_id`.
- Junction tables without their own `user_id` (`question_topics`, `question_tags`)
  validate ownership via an `EXISTS` subquery against the parent `questions` row.
- `question_revisions` has no `UPDATE`/`DELETE` policy — revision history is
  append-only by design.
- The browser-supplied `user_id` is never trusted: every insert/update policy's
  `WITH CHECK` re-verifies against `auth.uid()` server-side.
- `record_revision()` is `SECURITY DEFINER` but re-checks question ownership
  internally before touching any row.
- The frontend only ever holds the Supabase anon key (`VITE_SUPABASE_ANON_KEY`).
  The service role key never appears in this repository.

## Known dependency advisory

`@monaco-editor/react`'s bundled `monaco-editor` pulls in a `dompurify` version
with published XSS advisories in its HTML-sanitization path (used internally by
Monaco's hover tooltips). This app never feeds untrusted HTML through that path,
but `npm audit` will flag it. No fix is currently available upstream without
downgrading Monaco; track `@monaco-editor/react`'s releases for an update.

## Performance notes

- Every list and table view fetches only display columns — solution code, full
  descriptions, and notes are only fetched when a single question is opened.
- The Questions page uses real server-side pagination and filtering (Postgres
  does the work, not the browser).
- Search is debounced ~400ms and backed by a Postgres full text search index
  (`GIN` on a generated `tsvector` column).
- Dashboard statistics are five Postgres RPC calls, not a full table fetch.
- Routes are code-split (`React.lazy`) so Monaco (~900KB) and Recharts only
  download when the Question Details or Dashboard pages are actually visited.

## Testing checklist

Manual QA checklist — walk through this after connecting a real Supabase project.

**Auth**
- [ ] Register a new account, confirm redirect to Dashboard (or "check your email" if confirmations are enabled)
- [ ] Log out, log back in
- [ ] Visiting any `/questions`, `/revisions`, `/settings`, etc. while logged out redirects to `/login`
- [ ] Session persists across a page refresh

**Questions CRUD**
- [ ] Create a question with all fields filled
- [ ] Create a question with only the required title
- [ ] Edit a question and confirm changes persist
- [ ] Delete a question — confirm the dialog, then verify it (and its solutions/revisions) are gone
- [ ] Toggle favorite / bookmark from both the table and the detail page
- [ ] Change status (Not Started → Attempted → Solved → Mastered)
- [ ] Submitting the form twice quickly does not create two rows (submit button disables while saving)

**Solutions**
- [ ] Add a solution in a second language — first solution stays primary
- [ ] Delete the primary solution — another one is *not* auto-promoted (use "Make Primary" on the desired one)
- [ ] Add a first solution — it is automatically primary
- [ ] Switch between language tabs, confirm code/complexity fields update
- [ ] Change the default language in Settings — confirm existing solutions are unchanged

**Topics & tags**
- [ ] Attach multiple default topics to a question
- [ ] Create a brand-new custom tag inline while editing a question
- [ ] Filter the Questions page by topic

**Filters, search, pagination**
- [ ] Combine 3+ filters (e.g. Platform + Difficulty + Status) and confirm results match all of them
- [ ] Change page size (25/50/100) and confirm the count updates
- [ ] Search for a title substring, a platform name, and a topic name
- [ ] Clear all filters via the "Clear all" button

**Revisions**
- [ ] Mark a question Solved, confirm it appears with a `next_revision_at`
- [ ] Record a revision with result "Failed" — confirm it reappears sooner and status becomes "Revision Needed"
- [ ] Record a revision with result "Easy Recall" repeatedly — confirm it eventually becomes "Mastered"
- [ ] Confirm a question appears in "Overdue" once its `next_revision_at` is in the past

**Dashboard**
- [ ] Stat tiles match what you'd count manually on the Questions page
- [ ] All four charts render once you have data in more than one category

**Bulk import**
- [ ] Import a small CSV with a duplicate URL already in your vault — confirm it's skipped, not duplicated
- [ ] Import a JSON file with topics and a solution — confirm topics and the primary solution appear on the created question
- [ ] Import a row with a missing title — confirm it's reported as failed, not silently dropped

**Security (RLS)**
- [ ] Create two test accounts; confirm account B never sees account A's questions, solutions, tags, or revisions
- [ ] Confirm the Supabase dashboard shows RLS **enabled** on every table

## Future improvements

- Optimistic UI for the Questions table (currently re-fetches after toggles)
- Keyboard shortcut (`/`) to focus the global search bar
- CSV export of the current filtered view
- Per-topic mastery breakdown on the dashboard
- Offline-friendly draft saving for long solution write-ups
