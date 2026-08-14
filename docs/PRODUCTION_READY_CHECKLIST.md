# BassirAI Production Readiness Checklist

**Date:** August 11, 2026  
**Status:** ⚠️ REQUIRES ACTION - Missing API Keys & Security Hardening Needed

---

## 🔴 CRITICAL ISSUES - MUST FIX BEFORE PRODUCTION

### 1. **MISSING API KEYS** (High Priority)

The following API keys are **NOT configured** in your frontend `.env.local` file:

#### Required for AI Engine (n8n workflows):

- ❌ **OPENAI_API_KEY** - Required for RAG embeddings
- ❌ **PINECONE_API_KEY** - Required for vector database
- ❌ **PINECONE_INDEX_NAME** - Required index name
- ❌ **GROQ_API_KEY** - Required for AI responder

#### Required for WhatsApp Integration:

- ❌ **WHATSAPP_TOKEN** - Meta WhatsApp Cloud API access token
- ❌ **WHATSAPP_PHONE_ID** - WhatsApp Phone Number ID

#### Required for n8n:

- ❌ **N8N_ENCRYPTION_KEY** - Secure random string for encrypting credentials
- ❌ **N8N_HOST** - n8n instance URL

**ACTION REQUIRED:**

1. Copy `bassirai-mvp/.env.example` to `bassirai-mvp/.env`
2. Fill in all API keys with your actual credentials
3. Add the same keys to `frontend/.env.local` (prefixed with `NEXT_PUBLIC_` where needed for client-side access)

---

### 2. **SECURITY VULNERABILITIES** (High Priority)

#### A. **Missing Input Validation**

**RISK:** SQL Injection, XSS attacks, data corruption

**Affected Files:**

- `frontend/src/app/api/appointments/create/route.ts` - No validation on `patient_phone`, `procedure`, `appointment_date`
- `frontend/src/app/api/appointments/update/route.ts` - No validation on date format or notes length
- `frontend/src/app/api/clinics/register/route.ts` - No email format validation
- `frontend/src/app/api/clinics/onboard/route.ts` - No validation on catalog/FAQs structure
- `frontend/src/app/api/chats/toggle-takeover/route.ts` - No phone number validation

**FIXES NEEDED:**

```typescript
// Add input validation library
npm install zod

// Example validation schema:
import { z } from 'zod';

const appointmentSchema = z.object({
  patient_name: z.string().min(2).max(100),
  patient_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  procedure: z.string().min(3).max(200),
  appointment_date: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});
```

#### B. **Missing Rate Limiting**

**RISK:** DDoS attacks, brute force attacks, API abuse

**ACTION REQUIRED:**

```typescript
// Install rate limiting middleware
npm install @upstash/ratelimit @upstash/redis

// Add to all API routes:
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});
```

#### C. **Insufficient Clinic-Based Authorization Check**

**RISK:** Cross-tenant data access

**ISSUE:** `frontend/src/app/api/chats/toggle-takeover/route.ts` does NOT verify clinic_id

**FIX:**

```typescript
// BEFORE (VULNERABLE):
const { phone, takeover } = await request.json();
await supabase
  .from("conversations")
  .update({ is_human_takeover: !!takeover })
  .eq("patient_phone", phone); // ❌ No clinic_id check!

// AFTER (SECURE):
const { data: userData } = await supabase
  .from("users")
  .select("clinic_id")
  .eq("id", user.id)
  .single();

await supabase
  .from("conversations")
  .update({ is_human_takeover: !!takeover })
  .eq("patient_phone", phone)
  .eq("clinic_id", userData.clinic_id); // ✅ Enforces multi-tenancy
```

#### D. **Missing CORS Configuration**

**RISK:** Unauthorized domains accessing your API

**ACTION REQUIRED:**
Create `frontend/src/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only allow your production domain
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ];

  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

#### E. **Sensitive Data in Logs**

**RISK:** Credential leakage in production logs

**FILES WITH EXCESSIVE LOGGING:**

- `frontend/src/app/api/clinics/register/route.ts` - Logs full error details
- `frontend/src/app/api/users/register/route.ts` - Logs user IDs and emails

**FIX:** Remove debug logs in production:

```typescript
// Add environment check
const isDev = process.env.NODE_ENV === "development";
if (isDev) {
  console.log("Debug info:", data);
}
```

---

### 3. **DATABASE SECURITY** (Medium Priority)

#### ✅ **GOOD:** Row Level Security (RLS) is properly configured

- All tables have RLS enabled
- Policies enforce clinic-based multi-tenancy
- Helper function `get_user_clinic_id()` prevents recursion

#### ⚠️ **ISSUE:** Missing Database Indexes

**RISK:** Slow queries in production with many records

**ACTION REQUIRED:**
Add to `bassirai-mvp/database/schema.sql`:

```sql
-- Performance indexes
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_conversations_clinic_phone ON conversations(clinic_id, patient_phone);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_users_clinic ON users(clinic_id);
```

#### ⚠️ **ISSUE:** No Database Backup Strategy

**ACTION REQUIRED:**

- Enable Supabase automatic backups (Settings → Database → Point in Time Recovery)
- Set up daily backups to external storage
- Test restore procedure

---

### 4. **ENVIRONMENT VARIABLES SECURITY** (High Priority)

#### ⚠️ **EXPOSED CREDENTIALS IN GIT**

**FILE:** `frontend/.env.local` contains LIVE SUPABASE CREDENTIALS

**CRITICAL ACTIONS:**

```bash
# 1. Remove from git history
git rm --cached frontend/.env.local
git commit -m "Remove exposed credentials"

# 2. Rotate ALL exposed keys immediately:
# - Go to Supabase Dashboard → Settings → API
# - Generate new ANON_KEY and SERVICE_ROLE_KEY
# - Update .env.local with new keys

# 3. Add to .gitignore (verify it's already there)
echo "*.env.local" >> .gitignore
echo "*.env" >> .gitignore
```

#### 📋 **REQUIRED .env.local Structure:**

```bash
# Supabase (NEVER commit these)
NEXT_PUBLIC_SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here

# AI Engine (Backend only - DO NOT prefix with NEXT_PUBLIC_)
OPENAI_API_KEY=sk-proj-xxx
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=bassirai-index
GROQ_API_KEY=gsk_xxx

# WhatsApp
WHATSAPP_TOKEN=xxx
WHATSAPP_PHONE_ID=xxx

# n8n
N8N_ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
N8N_HOST=https://your-n8n-instance.com
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. **Error Handling Improvements**

#### Current State:

- ✅ All API routes have try-catch blocks
- ✅ Detailed error messages for development
- ⚠️ Too much error detail exposed to clients

**RECOMMENDATIONS:**

```typescript
// Create error handler utility
// frontend/src/utils/errorHandler.ts
export function sanitizeError(error: unknown, isDev: boolean) {
  if (isDev) {
    return error instanceof Error ? error.message : "Unknown error";
  }
  return "An error occurred. Please contact support.";
}
```

### 6. **Missing Health Check Endpoint**

**ACTION:** Create `frontend/src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test database connection
    const { error } = await supabase.from("clinics").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
```

### 7. **Monitoring & Observability**

**MISSING:**

- Error tracking (Sentry, Rollbar, etc.)
- Performance monitoring
- Audit logs for sensitive operations

**RECOMMENDATION:**

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.ts
```

---

## 🟢 COMPLETED / WORKING WELL

### ✅ Authentication & Authorization

- Supabase Auth properly integrated
- All protected routes check authentication
- Multi-tenancy enforced via clinic_id (mostly - see issue #2C)

### ✅ Database Schema

- Well-structured schema with proper relationships
- Custom ENUM types for data validation
- Proper foreign key constraints
- Updated_at triggers in place

### ✅ Frontend Security

- React Portals for modals (no XSS via innerHTML)
- Client-side validation before API calls
- Optimistic UI updates with rollback

### ✅ Code Organization

- Clean component structure
- Separated concerns (UI, API, utils)
- TypeScript for type safety
- Modular appointment components

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Before Going Live:

#### Environment Setup:

- [ ] Copy `.env.example` to `.env` and fill all values
- [ ] Rotate Supabase keys (they're exposed in git)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production domain in Supabase Auth settings

#### Security Hardening:

- [ ] Add input validation (Zod) to all API routes
- [ ] Implement rate limiting
- [ ] Fix clinic_id check in toggle-takeover route
- [ ] Add CORS middleware
- [ ] Remove debug console.logs
- [ ] Add database indexes

#### API Keys Configuration:

- [ ] OpenAI API key (for embeddings)
- [ ] Pinecone API key + index name
- [ ] Groq API key (for Llama inference)
- [ ] WhatsApp Token + Phone ID
- [ ] n8n encryption key generated
- [ ] n8n host URL configured

#### Database:

- [ ] Run schema.sql on production database
- [ ] Run rls-policies.sql
- [ ] Run seed.sql (or create real data)
- [ ] Enable Point-in-Time Recovery
- [ ] Test backup/restore

#### Testing:

- [ ] Test registration flow end-to-end
- [ ] Test appointment creation/update
- [ ] Verify RLS policies work (try cross-tenant access)
- [ ] Test n8n workflows (when teammate completes them)
- [ ] Load test with 100+ concurrent users

#### Monitoring:

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Create alerts for failed API calls

#### Documentation:

- [ ] Document all environment variables
- [ ] Create runbook for common issues
- [ ] Document deployment process
- [ ] Create incident response plan

---

## 🔧 IMMEDIATE NEXT STEPS (Priority Order)

1. **URGENT:** Rotate exposed Supabase credentials
2. **URGENT:** Add input validation to all API routes
3. **HIGH:** Implement rate limiting
4. **HIGH:** Fix clinic_id authorization in toggle-takeover
5. **HIGH:** Add all missing API keys to `.env.local`
6. **MEDIUM:** Add database indexes
7. **MEDIUM:** Set up error tracking
8. **MEDIUM:** Create health check endpoint
9. **LOW:** Remove debug logging
10. **LOW:** Add CORS middleware

---

## 📊 SECURITY SCORE: 6/10

**Strengths:**

- Good database architecture with RLS
- Authentication properly implemented
- Multi-tenancy foundation is solid

**Weaknesses:**

- Missing input validation
- No rate limiting
- Exposed credentials in git
- Missing API keys
- One authorization gap (toggle-takeover)

**Estimated Time to Production-Ready:** 4-6 hours of focused work

---

## 🤝 WAITING ON TEAMMATE

The following components are **not yet complete** and are being handled by your n8n developer:

1. **AI RAG Loader Workflow** (`n8n-workflows/rag-loader-workflow.json`)
   - Loads knowledge from Google Drive to Pinecone
   - Status: Waiting

2. **AI Responder Workflow** (`n8n-workflows/ai-responder-rag.json`)
   - Handles incoming messages and generates AI responses
   - Status: Waiting

**Once n8n workflows are complete:**

- [ ] Test WhatsApp integration end-to-end
- [ ] Verify Pinecone vector search works
- [ ] Test AI responses with custom clinic knowledge
- [ ] Verify human takeover toggle works correctly

---

**Last Updated:** August 11, 2026  
**Next Review:** After security fixes are implemented
