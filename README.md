# Inkline

Inkline is a comic and visual storytelling workspace for writers and artists. It combines script editing, collaboration, and compile/export tools in a single React app with an editorial dark UI.

The project currently supports two operating modes:

- Offline/demo mode with local persistence
- Supabase-backed mode with auth, projects, collaboration data, and storage hooks

## Current Product Surface

The app is organized around three main views:

- `Script Editor`: build episodes, pages, panels, and content blocks
- `Collaboration`: handoff and discussion space for creative teammates
- `Compile & Export`: preview assembly and export workflow

Recent account and workspace improvements include:

- A user profile and settings drawer
- A slimmer desktop settings drawer that preserves more editor space
- Editable display name and avatar URL
- Offline profile persistence when Supabase is not configured
- Workspace preferences for default view, remembered view, and compact dashboard layout
- Project JSON export/import from the active workspace

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS
- Supabase Auth, Postgres, Realtime, and Storage

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Environment Setup

### Offline/demo mode

If you do nothing, Inkline runs in offline mode. This is useful for UI work, local editing, and product prototyping.

In offline mode:

- auth screens are bypassed
- project data is stored locally
- profile updates are stored in localStorage
- network-backed collaboration features are limited

### Supabase mode

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Then set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

With Supabase configured, the app enables:

- email/password auth
- user profiles
- project loading and creation from the backend
- collaborator lookup/invites
- panel asset upload integration

## Available Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Builds the app for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint across the codebase.

## Project Structure

```text
src/
  components/      Shared UI pieces
  context/         Auth, project, and preferences state
  data/            Mock/default project data
  lib/             Supabase client, assembly logic, database types
  services/        Backend-facing project and export helpers
  views/           Main app screens
supabase/
  schema.sql       Database schema, RLS, triggers, and functions
PLAN.md            Product roadmap and security plan
```

## What’s Implemented

The app already includes:

- multi-view app shell
- project dashboard
- script editing flow with shared project state
- import/export of project JSON
- compile/export UI
- Supabase auth scaffolding
- profile/settings panel with a tighter responsive desktop layout
- offline fallback behavior

## Known Gaps

Inkline is still in active development. A few notable gaps remain:

- some roadmap items in `PLAN.md` are still incomplete
- security hardening tasks are identified but not fully implemented
- some buttons and advanced flows still need backend completion
- `npm run lint` currently reports pre-existing issues in older files that are not all resolved yet

## Roadmap

The high-level roadmap in [PLAN.md](./PLAN.md) is organized into:

1. Foundation and real editing
2. Backend and auth
3. Collaboration workflow
4. Compile and export
5. Polish and scale

It also includes a dedicated security hardening section covering:

- RLS tightening
- role escalation prevention
- rate limiting
- billing safeguards
- input validation

## Security Note

The current app plan explicitly calls out one important backend hardening task: users should not be able to change their own role from the client. The settings panel therefore treats role as read-only, even though profile name and avatar are editable.

Before production deployment, review and complete the security checklist in `PLAN.md` and `supabase/schema.sql`.

## Recommended Next Steps

- finish the remaining script editor CRUD and validation work
- complete Supabase security hardening
- add real-time collaboration polish
- connect compile/export to fully approved panel assets
- reduce bundle size with route or view-level code splitting
