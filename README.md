# BassirAI - AI-Powered Patient Communication Platform

**Production-Ready MVP**  
**Last Updated:** August 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features Implemented](#features-implemented)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [Page Flow & Navigation](#page-flow--navigation)
8. [Database Schema](#database-schema)
9. [API Routes](#api-routes)
10. [Security & Multi-Tenancy](#security--multi-tenancy)
11. [Environment Configuration](#environment-configuration)
12. [Deployment Guide](#deployment-guide)
13. [Testing](#testing)
14. [Documentation Files](#documentation-files)

---

## 🎯 Overview

BassirAI is an AI-powered patient communication platform designed specifically for aesthetic clinics in Africa. It automates patient inquiries on WhatsApp, Instagram, and Facebook using AI (Groq Llama 3.3 70B) with RAG (Pinecone) for contextual responses, while seamlessly handing off complex conversations to human receptionists.

### Core Value Proposition

- **24/7 AI Patient Support** - Automated responses on multiple messaging platforms
- **Smart Booking System** - AI qualifies leads and creates booking requests
- **Human Takeover** - Seamless escalation to clinic staff when needed
- **Multi-Tenant** - Secure, isolated data for each clinic
- **Mobile-First** - Responsive design for tablets and mobile devices

### Target Market

- Aesthetic clinics in Nigeria, Kenya, South Africa, Ghana
- Small to medium clinics (1-10 staff)
- Clinics using WhatsApp, Instagram DM, and Facebook Messenger

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PATIENT LAYER                            │
│         WhatsApp  │  Instagram DM  │  Facebook Messenger         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION LAYER (n8n)                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   Webhook    │──▶│  AI Responder│──▶│ RAG Retrieval│       │
│  │   Receiver   │   │   (Groq AI)  │   │  (Pinecone)  │       │
│  └──────────────┘   └──────────────┘   └──────────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                     │
│         PostgreSQL + Row Level Security + Realtime               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND LAYER (Next.js 14 + React)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │  Inbox   │  │Appointmnt│  │ Settings │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Inbound Message** → Patient sends WhatsApp/Instagram/Facebook message
2. **Webhook Trigger** → Meta/WhatsApp API posts to n8n webhook
3. **Clinic Resolution** → n8n looks up clinic by phone number
4. **Context Retrieval** → Fetch clinic customizations (FAQs, catalog, tone)
5. **RAG Query** → Search Pinecone for relevant knowledge base context
6. **AI Generation** → Groq Llama 3.3 generates response using context
7. **Database Save** → Message saved to Supabase (conversations + messages tables)
8. **Realtime Update** → Inbox UI updates via Supabase Realtime
9. **Reply Sent** → Response sent via WhatsApp/Instagram/Facebook API

---

## ✨ Features Implemented

### Authentication & Onboarding ✅

- [x] User registration with clinic creation
- [x] Supabase Auth integration
- [x] 6-step progressive onboarding wizard
  - Step 1: Clinic Identity (name, tone, language)
  - Step 2: Platform Integrations (WhatsApp, Instagram, Facebook)
  - Step 3: Services Catalog (treatments, pricing)
  - Step 4: FAQs (knowledge base)
  - Step 5: Booking Strategy (Cal.com or callback)
  - Step 6: AI Sandbox (test the AI agent)
- [x] Mock mode for development without database

### n8n Automation ✅

- [x] Complete workflow imported and tested
- [x] Intent classification (5 categories: booking, FAQ, greeting, complaint, human_support)
- [x] Groq Llama 3.3 70B integration (all nodes configured)
- [x] Booking information extraction with structured JSON output
- [x] Google Sheets logging (automatic spreadsheet updates)
- [x] Email notifications for complex bookings
- [x] Multi-language support framework (English, Arabic ready)
- [x] Webhook endpoint: `/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3`
- [x] Response time: <1 second per message

### Dashboard ✅

- [x] Real-time statistics (conversations, AI automation rate, escalations, bookings)
- [x] Recent inbox threads preview
- [x] AI system configuration display
- [x] Live/Mock mode toggle

### Unified Inbox ✅

- [x] Multi-channel conversation list (WhatsApp, Instagram, Facebook)
- [x] Real-time message updates (Supabase Realtime)
- [x] Thread view with full message history
- [x] Human takeover toggle (AI ↔ Manual mode)
- [x] Reply interface with send functionality
- [x] Search and filter by status/channel
- [x] Mock message simulator for testing

### Appointments Management ✅

- [x] Three view modes: List, Calendar, Timeline
- [x] Create, read, update, delete appointments
- [x] Status management (pending, confirmed, completed, cancelled)
- [x] Date picker with pre-fill from calendar clicks
- [x] WhatsApp reminder functionality
- [x] Conversation linking
- [x] Search and filter by status/date
- [x] Mobile-responsive design
- [x] Statistics cards (collapsible on medium screens)
- [x] API integration with fallback to mock data

### Settings ✅

- [x] Clinic metadata configuration
- [x] Platform integrations management (toggle platforms, update credentials)
- [x] AI tone and language settings
- [x] Services catalog editor (add, edit, remove)
- [x] FAQs editor (add, edit, remove)
- [x] Booking strategy selection
- [x] Save to database with validation

### Security ✅

- [x] Row Level Security (RLS) on all tables
- [x] Multi-tenancy enforcement (clinic_id isolation)
- [x] Input validation on all API routes
- [x] Authentication checks on protected routes
- [x] XSS and SQL injection protection
- [x] Secure token storage
- [x] HTTPS enforcement (production)

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** TailwindCSS + Custom Design System
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect)
- **Real-time:** Supabase Realtime subscriptions
- **HTTP Client:** Fetch API

### Backend

- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth (JWT-based)
- **API:** Next.js API Routes (serverless)
- **Automation:** n8n (self-hosted workflow engine)
  - **Version:** Latest (2024+)
  - **Workflows:** BassirAI-n8n.json (complete automation)
  - **Triggers:** Webhook-based (WhatsApp/Instagram/Facebook)
  - **Integrations:** Groq AI, Google Sheets, Gmail
- **AI Model:** Groq Llama 3.3 70B (via n8n HTTP requests)
- **Vector DB:** Pinecone (RAG knowledge retrieval)
- **File Storage:** Google Drive (for RAG ingestion)

### Infrastructure

- **Hosting:** Vercel (frontend), Railway (database & n8n)
- **Domain:** Custom domain with SSL
- **CI/CD:** GitHub Actions + Vercel auto-deploy
- **Monitoring:** Vercel Analytics

### External APIs

- **WhatsApp:** Meta Cloud API
- **Instagram:** Meta Graph API
- **Facebook:** Meta Messenger API
- **Calendar:** Cal.com API (optional)

---

## 📁 Project Structure

```
bassirai-mvp/
├── bassirai-figma-design/          # Static design prototype
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── bassirai-mvp/                   # Backend configuration
│   ├── database/
│   │   ├── schema.sql              # PostgreSQL schema
│   │   ├── rls-policies.sql        # Row Level Security
│   │   ├── performance-indexes.sql # Database indexes
│   │   ├── seed.sql                # Sample data
│   │   └── MIGRATION_PLATFORM_SELECTION.sql
│   ├── docker/
│   │   ├── docker-compose.yml      # n8n + PostgreSQL containers
│   │   └── .env
│   ├── n8n-workflows/
│   │   ├── BassirAI-n8n.json       # **PRODUCTION WORKFLOW** ⭐
│   │   ├── N8N_INTEGRATION_COMPLETE_GUIDE.md # Complete setup guide
│   │   ├── ai-responder-rag.json   # Legacy workflow (archived)
│   │   ├── rag-loader-workflow.json # Knowledge base loader
│   │   └── n8n_integration_guide.md
│   └── .env.example
│
├── frontend/                       # Next.js application
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── page.tsx            # Home page (redirects to /login or /dashboard)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login & Registration
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # Dashboard home
│   │   │   │   └── onboarding/
│   │   │   │       └── page.tsx    # 6-step onboarding wizard
│   │   │   ├── inbox/
│   │   │   │   └── page.tsx        # Unified inbox
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx        # Appointments management
│   │   │   ├── settings/
│   │   │   │   └── page.tsx        # Settings page
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts    # OAuth callback handler
│   │   │   └── api/                # API Routes
│   │   │       ├── health/
│   │   │       │   └── route.ts    # Health check endpoint
│   │   │       ├── clinics/
│   │   │       │   ├── register/
│   │   │       │   │   └── route.ts
│   │   │       │   └── onboard/
│   │   │       │       └── route.ts
│   │   │       ├── users/
│   │   │       │   └── register/
│   │   │       │       └── route.ts
│   │   │       ├── appointments/
│   │   │       │   ├── list/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── create/
│   │   │       │   │   └── route.ts
│   │   │       │   └── update/
│   │   │       │       └── route.ts
│   │   │       ├── chats/
│   │   │       │   └── toggle-takeover/
│   │   │       │       └── route.ts
│   │   │       └── ai/
│   │   │           └── generate/
│   │   │               └── route.ts
│   │   ├── components/
│   │   │   ├── SidebarLayout.tsx   # Main layout with navigation
│   │   │   └── appointments/       # Appointment components
│   │   │       ├── CalendarView.tsx
│   │   │       ├── ListView.tsx
│   │   │       ├── TimelineView.tsx
│   │   │       ├── Toolbar.tsx
│   │   │       ├── StatsCards.tsx
│   │   │       ├── NewAppointmentModal.tsx
│   │   │       ├── DateDetailsModal.tsx
│   │   │       ├── types.ts
│   │   │       └── utils.ts
│   │   └── utils/
│   │       └── supabase/
│   │           ├── client.ts       # Browser Supabase client
│   │           ├── server.ts       # Server Supabase client
│   │           └── admin.ts        # Admin Supabase client
│   ├── public/                     # Static assets
│   ├── .env.local                  # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.ts
│
├── docs/                           # Comprehensive documentation
│   ├── APPOINTMENTS_UPDATE.md
│   ├── COMPLETE_SECURITY_AUDIT_SUMMARY.md
│   ├── COMPREHENSIVE_GUIDE.md
│   ├── ENVIRONMENT_SETUP_GUIDE.md
│   ├── ERRORS_FIXED_CHECKLIST.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── MISSING_FEATURES_ROADMAP.md
│   ├── MOCK_TO_PRODUCTION_GUIDE.md
│   ├── MULTI_TENANCY_SECURITY_AUDIT.md
│   ├── PLATFORM_INTEGRATION_IMPLEMENTATION.md
│   ├── PRODUCTION_DEPLOYMENT_READY.md
│   ├── PRODUCTION_READY_CHECKLIST.md
│   ├── PRODUCTION_READY.md
│   ├── PROJECT_STATUS.md
│   ├── QUICK_START.md
│   ├── SECURITY_FIXES_APPLIED.md
│   ├── SYSTEM_FLOW_EXPLAINED.md
│   └── SYSTEM_FLOWCHART.md
│
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Supabase account (free tier works)
- n8n instance (optional for full automation)
- Meta Developer account (for WhatsApp/Instagram/Facebook APIs)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/bassir-ai.git
cd bassir-ai/frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Set Up Database

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and keys to `.env.local`

2. **Run Database Schema**
   ```sql
   -- In Supabase SQL Editor, run these files in order:
   1. bassirai-mvp/database/schema.sql
   2. bassirai-mvp/database/rls-policies.sql
   3. bassirai-mvp/database/performance-indexes.sql
   4. bassirai-mvp/database/seed.sql (optional - sample data)
   ```

### Step 5: Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Step 6: Test the Application

1. **Register a new clinic:**
   - Go to http://localhost:3000/login
   - Click "Register Clinic"
   - Fill in clinic details
   - You'll be redirected to the 6-step onboarding wizard

2. **Complete onboarding:**
   - Step through all 6 onboarding steps
   - Test the AI sandbox in Step 6

3. **Explore the dashboard:**
   - View statistics and recent conversations
   - Navigate to Inbox, Appointments, Settings

---

## 📱 Page Flow & Navigation

### User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW USER REGISTRATION                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   /login         │  Landing Page
            │                  │  - Sign In Tab
            │                  │  - Register Tab
            └────────┬─────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
   [Sign In]              [Register Clinic]
          │                     │
          │                     ▼
          │         ┌──────────────────────┐
          │         │ /dashboard/onboarding│
          │         │                      │
          │         │ Step 1: Identity     │
          │         │ Step 2: Platforms    │
          │         │ Step 3: Services     │
          │         │ Step 4: FAQs         │
          │         │ Step 5: Booking      │
          │         │ Step 6: Sandbox      │
          │         └──────────┬───────────┘
          │                    │
          │                    │ [Complete]
          │                    │
          └──────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │   /dashboard     │  Main Dashboard
            │                  │  - Stats Overview
            │                  │  - Recent Threads
            │                  │  - Quick Actions
            └────────┬─────────┘
                     │
      ┌──────────────┼──────────────┬──────────────┐
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  /inbox  │  │/appointme│  │/settings │  │  Logout  │
│          │  │   nts    │  │          │  │          │
│ - Convos │  │          │  │ - Config │  │ - Clear  │
│ - Reply  │  │ - Create │  │ - Edit   │  │ - Return │
│ - Toggle │  │ - Update │  │ - Save   │  │   to     │
│   AI     │  │ - Filter │  │          │  │  /login  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Page Descriptions

#### 1. **`/` (Home Page)**

- **Purpose:** Landing page / redirect logic
- **Behavior:**
  - If user is authenticated → Redirect to `/dashboard`
  - If user is not authenticated → Redirect to `/login`
- **Components:** Simple redirect, no UI

#### 2. **`/login` (Authentication)**

- **Purpose:** User login and clinic registration
- **Features:**
  - Tab switcher (Sign In / Register Clinic)
  - Email/password authentication
  - Mock mode support (for testing without database)
  - Auto-redirect to onboarding for new users
- **Form Fields (Register):**
  - Clinic Name
  - Full Name
  - Email
  - Password
- **Redirect:**
  - After registration → `/dashboard/onboarding`
  - After login (returning user) → `/dashboard`

#### 3. **`/dashboard/onboarding` (6-Step Wizard)**

- **Purpose:** Initial clinic setup
- **Steps:**
  1. **Clinic Identity**
     - Clinic name, AI tone, primary language
  2. **Platform Integrations**
     - Toggle WhatsApp, Instagram, Facebook
     - Enter credentials for each platform
     - Validation: Must enable at least 1 platform
  3. **Services Catalog**
     - Add treatments/services with pricing
     - Dynamic add/remove rows
  4. **FAQs**
     - Add frequently asked questions and answers
     - Knowledge base for AI responses
  5. **Booking Strategy**
     - Choose: Receptionist Callback OR Cal.com Integration
     - Optional Cal.com URL and API key
  6. **AI Sandbox**
     - Test the AI agent with sample questions
     - Preview how AI responds with your data
- **Completion:**
  - Saves all data to database
  - Sets onboarded cookie
  - Redirects to `/dashboard`

#### 4. **`/dashboard` (Main Dashboard)**

- **Purpose:** Overview and quick navigation
- **Sections:**
  - **Welcome Header** - Personalized greeting with clinic name
  - **Stats Grid** (4 cards):
    1. Total Conversations
    2. AI Automation Rate (%)
    3. Human Escalations
    4. Bookings Qualified (₦ value)
  - **Recent Inbox Threads** - Last 3 conversations with status
  - **AI Agent System Info** - Configuration display
  - **Quick Actions** - "Open Live Inbox" button
- **Navigation:** Sidebar with links to Inbox, Appointments, Settings

#### 5. **`/inbox` (Unified Inbox)**

- **Purpose:** Manage all patient conversations
- **Layout:** Split view
  - **Left Panel:** Conversation list
    - Filter by status (all, new, active, booked, closed)
    - Filter by channel (WhatsApp, Instagram, Facebook)
    - Search by patient name/phone
    - Real-time updates via Supabase Realtime
  - **Right Panel:** Thread view
    - Message history (inbound/outbound)
    - AI-generated badge indicator
    - Human takeover toggle button
    - Reply input with send button
    - Patient metadata display
- **Features:**
  - Real-time message syncing
  - AI ↔ Human mode toggle per conversation
  - Simulate incoming messages (mock mode)
  - Responsive mobile design

#### 6. **`/appointments` (Appointments Management)**

- **Purpose:** Schedule and manage patient appointments
- **View Modes:**
  - **List View:** Table with all appointments, sortable columns
  - **Calendar View:** Monthly calendar with appointment dots, click dates to create
  - **Timeline View:** Chronological timeline with appointment cards
- **Features:**
  - **Toolbar:**
    - View mode switcher (List/Calendar/Timeline)
    - New Appointment button
    - Search input (patient name/phone/procedure)
    - Status filter dropdown
    - Show/Hide Stats toggle (medium screens only)
  - **Stats Cards:** (collapsible on tablets)
    - Total Appointments
    - Confirmed
    - Pending
    - Completed
  - **Create Appointment:**
    - Patient name, phone, procedure
    - Date & time picker
    - Notes field
    - Status selection
    - Link to conversation (optional)
  - **Update Appointment:**
    - Change status (pending → confirmed → completed → cancelled)
    - Edit details
    - Send WhatsApp reminder
  - **Calendar Interactions:**
    - Click empty date → Create appointment with pre-filled date
    - Click date with appointments → Show date details modal
  - **Date Details Modal:**
    - Light backdrop (calendar visible behind)
    - List of all appointments for selected date
    - Quick actions (view, edit, complete, cancel)
- **Data Flow:**
  - Tries API first (`/api/appointments/list`, `/create`, `/update`)
  - Falls back to mock data if API fails
  - Optimistic UI updates with automatic rollback on error

#### 7. **`/settings` (Configuration)**

- **Purpose:** Manage clinic settings
- **Sections:**
  1. **Clinic Metadata**
     - Clinic name
     - AI tone of voice
  2. **Platform Integrations**
     - Toggle platforms ON/OFF
     - Update credentials for each platform
     - Same UI as onboarding Step 2
  3. **Services Catalog**
     - Edit treatments/services
     - Add/remove rows
  4. **FAQs**
     - Edit questions/answers
     - Add/remove rows
- **Save:** All changes saved to database with validation

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│      clinics        │         │        users        │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │◄───────┤│ id (PK)             │
│ name                │         │ clinic_id (FK)      │
│ email               │         │ email               │
│ phone               │         │ full_name           │
│ enabled_platforms   │         │ role                │
│ whatsapp_number     │         │ is_active           │
│ whatsapp_phone_id   │         │ last_login          │
│ whatsapp_token      │         │ created_at          │
│ instagram_username  │         └─────────────────────┘
│ instagram_access... │
│ facebook_page_id    │         ┌─────────────────────┐
│ facebook_access...  │         │clinic_customizations│
│ ai_mode             │         ├─────────────────────┤
│ tone_of_voice       │◄───────┤│ id (PK)             │
│ is_active           │         │ clinic_id (FK,UNIQ) │
│ created_at          │         │ catalog (JSONB)     │
│ updated_at          │         │ faqs (JSONB)        │
└──────────┬──────────┘         │ custom_prompt       │
           │                    │ google_drive_folder │
           │                    │ pinecone_namespace  │
           │                    │ created_at          │
           │                    │ updated_at          │
           │                    └─────────────────────┘
           │
           │                    ┌─────────────────────┐
           │                    │   conversations     │
           │                    ├─────────────────────┤
           └───────────────────▶│ id (PK)             │
                                │ clinic_id (FK)      │
                                │ patient_phone       │
                                │ patient_name        │
                                │ channel             │
                                │ status              │
                                │ is_human_takeover   │
                                │ last_message_at     │
                                │ created_at          │
                                └──────────┬──────────┘
                                           │
                                           │
           ┌───────────────────────────────┼────────────────────┐
           │                               │                    │
           ▼                               ▼                    ▼
┌─────────────────────┐         ┌─────────────────────┐
│      messages       │         │    appointments     │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ clinic_id (FK)      │         │ clinic_id (FK)      │
│ conversation_id(FK) │         │ conversation_id(FK) │
│ content             │         │ patient_name        │
│ media_url           │         │ patient_phone       │
│ direction           │         │ procedure           │
│ is_ai_generated     │         │ appointment_date    │
│ created_at          │         │ status              │
└─────────────────────┘         │ notes               │
                                │ created_at          │
                                └─────────────────────┘
```

### Table Definitions

#### `clinics`

**Purpose:** Store clinic metadata and platform credentials

| Column                   | Type        | Description                                                         |
| ------------------------ | ----------- | ------------------------------------------------------------------- |
| `id`                     | UUID        | Primary key                                                         |
| `name`                   | TEXT        | Clinic name (e.g., "Zuri Aesthetic Clinic")                         |
| `email`                  | TEXT        | Clinic email (unique)                                               |
| `phone`                  | TEXT        | Main clinic phone number                                            |
| `enabled_platforms`      | JSONB       | Array of enabled platforms: `["whatsapp", "instagram", "facebook"]` |
| `whatsapp_number`        | TEXT        | WhatsApp business phone number                                      |
| `whatsapp_phone_id`      | TEXT        | Meta WhatsApp Phone ID                                              |
| `whatsapp_token`         | TEXT        | Meta WhatsApp Access Token                                          |
| `instagram_username`     | TEXT        | Instagram business username                                         |
| `instagram_access_token` | TEXT        | Instagram API access token                                          |
| `facebook_page_id`       | TEXT        | Facebook Page ID                                                    |
| `facebook_access_token`  | TEXT        | Facebook Page Access Token                                          |
| `ai_mode`                | BOOLEAN     | AI automation enabled (default: true)                               |
| `tone_of_voice`          | TEXT        | AI response tone: professional/friendly/luxury                      |
| `is_active`              | BOOLEAN     | Clinic active status                                                |
| `created_at`             | TIMESTAMPTZ | Record creation timestamp                                           |
| `updated_at`             | TIMESTAMPTZ | Last update timestamp (auto-updated)                                |

#### `users`

**Purpose:** Store clinic staff user accounts

| Column       | Type        | Description                                 |
| ------------ | ----------- | ------------------------------------------- |
| `id`         | UUID        | Primary key (matches Supabase Auth user ID) |
| `clinic_id`  | UUID        | Foreign key to clinics table                |
| `email`      | TEXT        | User email (unique)                         |
| `full_name`  | TEXT        | User's full name                            |
| `role`       | ENUM        | User role: `clinic_admin` or `receptionist` |
| `is_active`  | BOOLEAN     | Account active status                       |
| `last_login` | TIMESTAMPTZ | Last login timestamp                        |
| `created_at` | TIMESTAMPTZ | Account creation timestamp                  |

#### `clinic_customizations`

**Purpose:** Store clinic-specific AI configurations

| Column                   | Type        | Description                                               |
| ------------------------ | ----------- | --------------------------------------------------------- |
| `id`                     | UUID        | Primary key                                               |
| `clinic_id`              | UUID        | Foreign key to clinics (UNIQUE)                           |
| `catalog`                | JSONB       | Services/treatments array: `[{name, price, description}]` |
| `faqs`                   | JSONB       | FAQ array: `[{question, answer}]`                         |
| `custom_prompt`          | TEXT        | AI system prompt template                                 |
| `google_drive_folder_id` | TEXT        | Google Drive folder for RAG ingestion                     |
| `pinecone_namespace`     | TEXT        | Pinecone namespace for vector storage                     |
| `created_at`             | TIMESTAMPTZ | Record creation timestamp                                 |
| `updated_at`             | TIMESTAMPTZ | Last update timestamp (auto-updated)                      |

#### `conversations`

**Purpose:** Store patient conversation threads

| Column              | Type        | Description                                              |
| ------------------- | ----------- | -------------------------------------------------------- |
| `id`                | UUID        | Primary key                                              |
| `clinic_id`         | UUID        | Foreign key to clinics                                   |
| `patient_phone`     | TEXT        | Patient phone number (E.164 format)                      |
| `patient_name`      | TEXT        | Patient name (extracted from messages)                   |
| `channel`           | ENUM        | Message platform: `whatsapp`, `instagram`, `facebook`    |
| `status`            | ENUM        | Conversation status: `new`, `active`, `booked`, `closed` |
| `is_human_takeover` | BOOLEAN     | AI disabled, human handling (default: false)             |
| `last_message_at`   | TIMESTAMPTZ | Timestamp of last message                                |
| `created_at`        | TIMESTAMPTZ | Conversation start timestamp                             |
| **UNIQUE**          | -           | `(clinic_id, patient_phone, channel)`                    |

#### `messages`

**Purpose:** Store individual messages in conversations

| Column            | Type        | Description                                |
| ----------------- | ----------- | ------------------------------------------ |
| `id`              | UUID        | Primary key                                |
| `clinic_id`       | UUID        | Foreign key to clinics                     |
| `conversation_id` | UUID        | Foreign key to conversations               |
| `content`         | TEXT        | Message text content                       |
| `media_url`       | TEXT        | URL of attached media (images, etc.)       |
| `direction`       | ENUM        | Message direction: `inbound` or `outbound` |
| `is_ai_generated` | BOOLEAN     | Message generated by AI (vs. human)        |
| `created_at`      | TIMESTAMPTZ | Message timestamp                          |

#### `appointments`

**Purpose:** Store scheduled patient appointments

| Column             | Type        | Description                                                          |
| ------------------ | ----------- | -------------------------------------------------------------------- |
| `id`               | UUID        | Primary key                                                          |
| `clinic_id`        | UUID        | Foreign key to clinics                                               |
| `conversation_id`  | UUID        | Foreign key to conversations (nullable)                              |
| `patient_name`     | TEXT        | Patient name                                                         |
| `patient_phone`    | TEXT        | Patient phone number                                                 |
| `procedure`        | TEXT        | Treatment/service booked                                             |
| `appointment_date` | TIMESTAMPTZ | Scheduled appointment date and time                                  |
| `status`           | ENUM        | Appointment status: `pending`, `confirmed`, `completed`, `cancelled` |
| `notes`            | TEXT        | Additional notes                                                     |
| `created_at`       | TIMESTAMPTZ | Record creation timestamp                                            |

### Enums

```sql
CREATE TYPE user_role AS ENUM ('clinic_admin', 'receptionist');
CREATE TYPE msg_channel AS ENUM ('whatsapp', 'instagram', 'facebook');
CREATE TYPE conv_status AS ENUM ('new', 'active', 'booked', 'closed');
CREATE TYPE msg_dir AS ENUM ('inbound', 'outbound');
CREATE TYPE appt_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
```

---

## 🔌 API Routes

All API routes are in `frontend/src/app/api/`. They use Next.js 14 Route Handlers.

### n8n Webhook Integration

#### `POST /webhook/d4cee446-c445-49f7-b402-e7f27e4827a3`

**Purpose:** Receive incoming WhatsApp/Instagram/Facebook messages

**Workflow:** See `bassirai-mvp/n8n-workflows/BassirAI-n8n.json`

**Request Body:**

```json
{
  "userId": "patient-id",
  "name": "Ahmed Ali",
  "phone": "+971501234567",
  "channel": "whatsapp",
  "language": "en",
  "message": "Hello, I want to book a consultation for Botox."
}
```

**Processing Flow:**

1. Intent Classification (Groq AI)
2. Routing to specialized handlers
3. Response generation
4. Database logging (Google Sheets)
5. Optional staff notification (email)

**Response:**

```json
{
  "ai_response": "Hello Ahmed! I'd be happy to help you book a Botox consultation...",
  "intent": "booking",
  "channel": "whatsapp"
}
```

**Documentation:** `bassirai-mvp/n8n-workflows/N8N_INTEGRATION_COMPLETE_GUIDE.md`

### Health Check

#### `GET /api/health`

**Purpose:** Verify API and database connectivity

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-08-13T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Authentication

#### `POST /api/clinics/register`

**Purpose:** Create new clinic record during registration

**Request Body:**

```json
{
  "clinicName": "Zuri Aesthetic Clinic",
  "adminEmail": "admin@zuriclinic.com"
}
```

**Response:**

```json
{
  "clinicId": "d8c47b56-c0c2-488f-a9eb-88fb7c8c3e80",
  "success": true,
  "message": "Clinic profile created successfully"
}
```

**Validation:**

- Clinic name: 2-200 characters
- Email format check
- Duplicate email check

#### `POST /api/users/register`

**Purpose:** Create user profile after Supabase Auth signup

**Request Body:**

```json
{
  "userId": "auth-user-id",
  "clinicId": "clinic-id",
  "email": "admin@zuriclinic.com",
  "fullName": "Babajide Benson",
  "role": "clinic_admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User profile linked to database successfully"
}
```

**Validation:**

- UUID format check
- Email format check
- Full name: 2-100 characters
- Role: must be `clinic_admin` or `receptionist`

### Onboarding

#### `POST /api/clinics/onboard`

**Purpose:** Save onboarding wizard data (Steps 1-6)

**Request Body:**

```json
{
  "userId": "user-id",
  "clinicName": "Zuri Aesthetic Clinic",
  "aiTone": "professional",
  "primaryLang": "en",
  "enabledPlatforms": ["whatsapp", "instagram"],
  "waPhoneId": "10982390192830",
  "waAccId": "9812739012389",
  "waToken": "EAAGy...token",
  "instaUsername": "@zuri.clinic",
  "instaToken": "IGAAxxxxx",
  "fbPageId": "123456789",
  "fbToken": "EAAGxxxxx",
  "catalog": [
    { "name": "Botox", "price": "₦180,000", "description": "Forehead lines" }
  ],
  "faqs": [
    { "question": "Do you offer parking?", "answer": "Yes, free parking." }
  ],
  "bookingStrategy": "callback",
  "calComUrl": "",
  "calComApiKey": ""
}
```

**Response:**

```json
{
  "success": true,
  "message": "Clinic settings updated successfully"
}
```

**Database Operations:**

1. Updates `clinics` table with name, tone, platform credentials
2. Upserts `clinic_customizations` table with catalog, FAQs, custom prompt

#### `GET /api/clinics/onboard?userId={userId}`

**Purpose:** Retrieve existing onboarding data

**Response:**

```json
{
  "success": true,
  "clinicName": "Zuri Aesthetic Clinic",
  "aiTone": "professional",
  "primaryLang": "en",
  "waPhoneId": "+234 803 123 4567",
  "catalog": [...],
  "faqs": [...],
  "bookingStrategy": "callback",
  "calComUrl": "",
  "calComApiKey": ""
}
```

### Appointments

#### `GET /api/appointments/list`

**Purpose:** Retrieve all appointments for authenticated user's clinic

**Headers:**

```
Authorization: Bearer {supabase-jwt-token}
```

**Response:**

```json
{
  "success": true,
  "appointments": [
    {
      "id": "uuid",
      "patient_name": "Chioma Adebayo",
      "patient_phone": "+234 803 123 4567",
      "procedure": "Botox Consultation",
      "appointment_date": "2026-08-14T14:00:00Z",
      "status": "confirmed",
      "notes": "First-time patient",
      "conversation_id": "conv-uuid",
      "created_at": "2026-08-13T10:00:00Z"
    }
  ]
}
```

**Security:**

- Requires authentication (Supabase JWT)
- Enforces clinic_id from authenticated user
- RLS policies enforce row-level isolation

#### `POST /api/appointments/create`

**Purpose:** Create new appointment

**Request Body:**

```json
{
  "patient_name": "Chioma Adebayo",
  "patient_phone": "+234 803 123 4567",
  "procedure": "Botox Treatment",
  "appointment_date": "2026-08-14T14:00:00Z",
  "notes": "Follow-up appointment",
  "conversation_id": "conv-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "appointment": {
    "id": "new-uuid",
    ...
  }
}
```

**Validation:**

- Phone number format: E.164 (+234...)
- Date validation (not in past)
- Patient name: 2-100 characters
- Procedure: 2-200 characters
- Notes: max 500 characters

#### `PATCH /api/appointments/update`

**Purpose:** Update appointment status or details

**Request Body:**

```json
{
  "appointmentId": "uuid",
  "status": "confirmed",
  "notes": "Updated notes"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment updated successfully"
}
```

**Validation:**

- UUID format check
- Status: must be `pending`, `confirmed`, `completed`, or `cancelled`
- Updates `conversation` status to "booked" if status is confirmed

### Conversations

#### `POST /api/chats/toggle-takeover`

**Purpose:** Toggle AI/Human mode for a conversation

**Request Body:**

```json
{
  "conversationId": "conv-uuid",
  "isHumanTakeover": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Conversation mode updated to human takeover"
}
```

**Security:**

- Enforces clinic_id check (no cross-tenant access)
- Updates `conversations.is_human_takeover` field

### AI Generation

#### `POST /api/ai/generate`

**Purpose:** Generate AI response (used in Sandbox Step 6)

**Request Body:**

```json
{
  "message": "How much is Botox?",
  "clinicId": "clinic-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "response": "Botox treatment at Zuri Clinic ranges from ₦180,000 to ₦300,000...",
  "model": "llama-3.3-70b"
}
```

**Note:** This is a simplified version. Production uses n8n workflow with RAG.

---

## 🔒 Security & Multi-Tenancy

### Row Level Security (RLS)

All tables have RLS policies enforcing clinic-level isolation:

```sql
-- Example: conversations table RLS policy
CREATE POLICY "clinic_scope_select" ON conversations
  FOR SELECT USING (
    clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "clinic_scope_insert" ON conversations
  FOR INSERT WITH CHECK (
    clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );
```

**Result:** Users can only see/modify data belonging to their clinic.

### Authentication Flow

1. **Registration:**
   - User signs up with email/password
   - Supabase creates auth user
   - System creates clinic + user profile
   - JWT token stored in httpOnly cookie

2. **Login:**
   - User provides email/password
   - Supabase validates credentials
   - JWT token issued and stored
   - Token contains `user_id` → links to `clinic_id`

3. **API Requests:**
   - JWT included in Authorization header or cookie
   - Server validates JWT with Supabase
   - Extracts `user_id` → resolves to `clinic_id`
   - RLS enforces clinic isolation

### Input Validation

All API routes validate input:

- **UUID format:** `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **Email format:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Phone format:** E.164 format (`+234...`)
- **String lengths:** Min/max character limits
- **Enum values:** Status must match defined enums
- **Array validation:** Enabled platforms must be array

### XSS Protection

- React automatically escapes rendered content
- User input sanitized before database insertion
- CSP headers configured in production

### SQL Injection Protection

- All queries use parameterized statements via Supabase client
- No raw SQL string concatenation
- ORM-style query builder

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

File: `frontend/.env.local`

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Backend Environment Variables

File: `bassirai-mvp/.env`

```env
# Database
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_NAME=bassirai_prod
DB_PORT=5432

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI & RAG
GROQ_API_KEY=gsk_yourGroqApiKey
OPENAI_API_KEY=sk-proj-yourOpenAiApiKey (for embeddings only)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=bassirai-prod

# Messaging Platforms
WHATSAPP_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_ID=your-phone-id
INSTAGRAM_ACCESS_TOKEN=your-instagram-token
FACEBOOK_ACCESS_TOKEN=your-facebook-token

# n8n
N8N_ENCRYPTION_KEY=random-secure-string-min-32-chars
N8N_HOST=your-n8n-domain.com
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3

# Email Notifications (for n8n)
CLINIC_EMAIL=tsd@naskamireglobal.com
```

---

## 🚀 Deployment Guide

### Deploy Frontend to Vercel

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Import GitHub repository
   - Select `frontend` as root directory
   - Add environment variables from `.env.local`
   - Deploy

3. **Configure Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Update DNS records

### Deploy Database (Supabase)

1. **Production Project**
   - Create new Supabase project (production tier)
   - Run database migrations:
     ```sql
     -- In SQL Editor:
     1. schema.sql
     2. rls-policies.sql
     3. performance-indexes.sql
     ```

2. **Update Frontend Env**
   - Update `NEXT_PUBLIC_SUPABASE_URL`
   - Update `SUPABASE_SERVICE_ROLE_KEY`
   - Redeploy Vercel

### Deploy n8n (Railway/Docker)

1. **Railway Deployment (Recommended)**

   ```bash
   # Fork and deploy using Railway template
   railway init
   railway add postgresql
   railway add n8n

   # Set environment variables
   railway variables set N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
   railway variables set N8N_HOST=your-n8n-domain.railway.app
   railway variables set GROQ_API_KEY=gsk_yourGroqApiKey

   # Deploy
   railway up
   ```

2. **Import BassirAI Workflow**
   - Open n8n UI: `https://your-n8n-domain.railway.app`
   - Go to **Workflows** → **Import from File**
   - Select `bassirai-mvp/n8n-workflows/BassirAI-n8n.json`
   - Configure credentials:
     - Groq API (get from https://console.groq.com)
     - Google Sheets OAuth2
     - Gmail OAuth2
   - **Activate** the workflow

3. **Get Webhook URL**
   - Click on "Incoming Message Webhook" node
   - Copy **Production URL**:
     ```
     https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
     ```

4. **Test the Workflow**
   ```bash
   curl -X POST https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3 \
     -H "Content-Type: application/json" \
     -d '{
       "body": {
         "userId": "test-123",
         "name": "Test Patient",
         "phone": "+2348031234567",
         "channel": "whatsapp",
         "language": "en",
         "message": "Hello, I want to book Botox"
       }
     }'
   ```

**📚 Complete n8n Integration Guide:** `bassirai-mvp/n8n-workflows/N8N_INTEGRATION_COMPLETE_GUIDE.md`

### Configure Platform APIs

1. **WhatsApp Cloud API**
   - Meta Developer Console → WhatsApp → Webhooks
   - Set webhook URL: `https://your-n8n-domain.com/webhook/whatsapp-inbound`
   - Subscribe to `messages` events
   - Save access token to env vars

2. **Instagram Graph API**
   - Meta Developer Console → Instagram → Webhooks
   - Configure messaging permissions
   - Save access token to env vars

3. **Facebook Messenger API**
   - Meta Developer Console → Messenger → Webhooks
   - Set webhook URL: `https://your-n8n-domain.com/webhook/facebook-inbound`
   - Subscribe to messaging events
   - Save page access token to env vars

---

## 🧪 Testing

### Manual Testing Checklist

#### Registration & Onboarding

- [ ] Register new clinic
- [ ] Verify redirect to onboarding
- [ ] Complete all 6 onboarding steps
- [ ] Test platform toggle (enable/disable)
- [ ] Test catalog add/remove
- [ ] Test FAQ add/remove
- [ ] Test AI sandbox
- [ ] Verify data saved to database

#### Dashboard

- [ ] View stats (should load from DB or show mock)
- [ ] Click "Open Live Inbox" button
- [ ] Navigate via sidebar

#### Inbox

- [ ] View conversation list
- [ ] Filter by status
- [ ] Filter by channel
- [ ] Search by patient name
- [ ] Open conversation thread
- [ ] View message history
- [ ] Toggle AI/Human mode
- [ ] Send reply (if human mode)
- [ ] Test real-time updates

#### Appointments

- [ ] Switch between List/Calendar/Timeline views
- [ ] Create new appointment
- [ ] Update appointment status
- [ ] Delete appointment
- [ ] Search appointments
- [ ] Filter by status
- [ ] Click calendar date (empty) → Opens create modal with pre-filled date
- [ ] Click calendar date (with appointments) → Shows date details modal
- [ ] Send WhatsApp reminder
- [ ] Test stats card collapse (medium screens)

#### Settings

- [ ] Edit clinic name
- [ ] Change AI tone
- [ ] Toggle platforms
- [ ] Update platform credentials
- [ ] Edit catalog
- [ ] Edit FAQs
- [ ] Save changes
- [ ] Verify changes persist after refresh

#### Security

- [ ] Cannot access pages without authentication
- [ ] Cannot see other clinic's data
- [ ] RLS policies enforce isolation
- [ ] Invalid input rejected

### API Testing

Use tools like Postman or curl:

```bash
# Health check
curl https://your-domain.com/api/health

# Create appointment (requires auth)
curl -X POST https://your-domain.com/api/appointments/create \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"patient_name":"Test","patient_phone":"+2348031234567","procedure":"Consultation","appointment_date":"2026-08-14T14:00:00Z"}'
```

---

## 📚 Documentation Files

Comprehensive docs are in the `docs/` folder:

### Setup & Configuration

- **`QUICK_START.md`** - Fast setup guide (5 minutes)
- **`ENVIRONMENT_SETUP_GUIDE.md`** - Detailed environment configuration
- **`PRODUCTION_READY_CHECKLIST.md`** - Pre-deployment checklist

### Architecture & Design

- **`COMPREHENSIVE_GUIDE.md`** - Layman explanation of every file
- **`SYSTEM_FLOW_EXPLAINED.md`** - How the system works end-to-end
- **`SYSTEM_FLOWCHART.md`** - Visual diagrams
- **`PROJECT_STATUS.md`** - Current implementation status

### Implementation Details

- **`PLATFORM_INTEGRATION_IMPLEMENTATION.md`** - Platform selection feature
- **`IMPLEMENTATION_SUMMARY.md`** - Quick reference for what's done
- **`APPOINTMENTS_UPDATE.md`** - Appointments feature documentation
- **`bassirai-mvp/n8n-workflows/N8N_INTEGRATION_COMPLETE_GUIDE.md`** - n8n automation guide

### n8n Workflows

- **`bassirai-mvp/n8n-workflows/BassirAI-n8n.json`** - Complete production workflow
- **`bassirai-mvp/n8n-workflows/N8N_INTEGRATION_COMPLETE_GUIDE.md`** - Detailed setup guide
- **`bassirai-mvp/n8n-workflows/n8n_integration_guide.md`** - Quick reference

### Security & Production

- **`COMPLETE_SECURITY_AUDIT_SUMMARY.md`** - Security analysis
- **`MULTI_TENANCY_SECURITY_AUDIT.md`** - Multi-tenancy verification
- **`SECURITY_FIXES_APPLIED.md`** - Security enhancements
- **`PRODUCTION_DEPLOYMENT_READY.md`** - Production readiness report
- **`PRODUCTION_READY.md`** - Final production checklist

### Migration & Roadmap

- **`MOCK_TO_PRODUCTION_GUIDE.md`** - Transition from mock to live data
- **`MISSING_FEATURES_ROADMAP.md`** - Future enhancements (Phase 1-4)
- **`ERRORS_FIXED_CHECKLIST.md`** - Bug fixes and testing

---

## 🤝 Contributing

This is a production MVP. For feature requests or bug reports:

1. Check `docs/MISSING_FEATURES_ROADMAP.md` for planned features
2. Open an issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if UI-related)

---

## 📄 License

Proprietary - All rights reserved

---

## 👨‍💻 Developer

**Project:** BassirAI MVP  
**Developed By:** [Your Name/Team]  
**Contact:** [Your Email]  
**Repository:** [GitHub URL]  
**Production URL:** [Live URL]

---

## 📞 Support

For technical issues:

- Check documentation in `docs/` folder
- Review `COMPREHENSIVE_GUIDE.md` for file explanations
- See `QUICK_START.md` for common setup issues

---

**Last Updated:** August 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

_Built with ❤️ for aesthetic clinics in Africa_
