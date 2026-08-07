# 🚀 Project Setup & Execution Log

---

## 📌 Document Overview

- **Project Name:** BassirAI — AI-Powered Patient Communication & Booking Platform
- **Repository:** `jen67/bassiraiAi
- **Document Purpose:** Single source of truth (SSOT) tracking the exact setup steps, architectural decisions, timestamps, and execution logic for all team collaborators.

---

## 🗓️ Setup History & Timeline Log

### 📅 July 21, 2026 — Project Inception & Initial Architecture

### Action

GitHub repository `jen67/bassiraiAi` created on GitHub.

### Reasoning

Established the central workspace for team collaboration.

Created the base folder layout:

```text
bassiraiAi/
├── database/
├── docker/
├── frontend/
└── n8n-workflows/
```

This modular monorepo structure separates:

- Frontend application
- Automation workflows
- Database scripts
- Container configurations

---

### 📅 July 22, 2026 — Phase 1: Environment Setup & Project Initialization

### Step 1 — Branch Isolation & Git Workflow Setup

#### Branch Created

```text
feature/day-1-setup
```

#### Commands Executed

```bash
git checkout -b feature/day-1-setup
```

#### Reasoning & Architectural Decision

##### Main Branch Protection

Pushing directly to `main` without review increases the risk of introducing breaking changes into production or the primary development branch.

##### Feature Branch Strategy

Working on isolated branches enables:

- Safe experimentation
- Easier debugging
- Clean pull requests
- Code reviews before merging
- Parallel development among multiple contributors

---

### Step 2 — Next.js 14 Initialization (`frontend/`)

#### Commands Executed

```bash
cd frontend

npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

#### Configuration Explained

##### `.` (Current Directory)

Installs the application directly inside the existing `frontend/` folder instead of creating:

```text
frontend/frontend/
```

---

##### `--app`

Enables the modern App Router architecture, including:

- Server Components
- Nested layouts
- File-based routing
- Streaming
- Server Actions

---

##### `--typescript`

Provides:

- Strict type safety
- Better IDE support
- Compile-time error checking
- Safer Supabase interactions

---

##### `--tailwind`

Installs Tailwind CSS with zero manual configuration.

---

##### `--import-alias "@/*"`

Creates cleaner imports.

Instead of:

```ts
../../../components/ui/button
```

You can simply write:

```ts
@/components/ui/button
```

---

### Step 3 — UI System Initialization (`shadcn/ui`)

#### Commands Executed

```bash
npx shadcn@latest init
```

#### Configuration

| Option        | Value   |
| ------------- | ------- |
| Style         | Default |
| Base Color    | Slate   |
| CSS Variables | Yes     |

#### Architectural Decision

`shadcn/ui` is **not** a traditional component library.

Instead, it:

- Copies components directly into your project
- Uses Tailwind CSS
- Builds on Radix UI primitives
- Gives full ownership over component code
- Eliminates vendor lock-in
- Makes customization straightforward

---

### Step 4 — Install Core SDKs & Dependencies (`database/`)

#### Commands Executed

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  lucide-react
```

#### Package Rationale

##### `@supabase/supabase-js`

Primary JavaScript SDK used for:

- Authentication
- CRUD operations
- Realtime subscriptions
- Storage
- Database interactions

---

##### `@supabase/ssr`

Provides:

- Server-side authentication
- Cookie management
- Full compatibility with the Next.js App Router

---

##### `lucide-react`

A lightweight icon library that integrates naturally with `shadcn/ui`.

---

### Step 5 — Supabase Database Provisioning & Multi-Tenant Security

#### Actions Performed

Created a new Supabase project named:

```text
BassirAI
```

Created the following database tables:

- clinics
- users
- clinic_customizations
- conversations
- messages
- appointments

Enabled Row Level Security (RLS) on every table.

---

#### Security Architecture

BassirAI is a **multi-tenant SaaS platform**.

Multiple clinics share the same database.

Every query must be restricted so that:

- Clinic A cannot access Clinic B's data.
- Patients remain isolated per clinic.
- Staff only access records belonging to their organization.

---

#### Example RLS Policy

```sql
ALTER TABLE messages
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_scope_select"
ON messages
FOR SELECT
USING (
    clinic_id = (
        SELECT clinic_id
        FROM users
        WHERE id = auth.uid()
    )
);
```

---

### Step 6 — Local Environment Configuration

#### Files

```text
.env.local
```

Contains local secrets.

Ignored by Git.

---

```text
.env.example
```

Committed to GitHub.

Serves as the template for collaborators.

---

#### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

#### Reasoning

Sensitive credentials should never be committed to source control.

Using:

- `.env.local`
- `.env.example`

allows every team member to configure their own environment without exposing secrets publicly.

---

## 🛠️ Next Steps & Roadmap

- [x] Initialize Next.js 14 inside `frontend/`
- [x] Initialize `shadcn/ui`
- [x] Install Supabase SDKs
- [ ] Execute SQL schema and RLS policies inside Supabase
- [ ] Commit changes to `feature/day-1-setup`
- [ ] Push branch to GitHub
- [ ] Create Pull Request for review
- [ ] Merge into `main`
- [ ] Configure Railway deployment with GitHub auto-deploys

---

## 📖 Summary

This document records:

- Project initialization
- Git workflow decisions
- Frontend architecture
- UI system setup
- Dependency installation
- Database security model
- Environment configuration
- Planned implementation roadmap

It serves as the project's **Single Source of Truth (SSOT)** for setup and onboarding.
