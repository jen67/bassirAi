# BassirAI: Mock to Production Migration Guide

**Date:** August 11, 2026  
**Purpose:** Understand how the app works and transition from mock data to real production data

---

## 🎯 Table of Contents

1. [How BassirAI Works - System Architecture](#system-architecture)
2. [Current State: What's Mock vs Real](#current-state)
3. [Step-by-Step Production Migration](#production-migration)
4. [Testing Your Production Setup](#testing)
5. [Troubleshooting Common Issues](#troubleshooting)

---

## 📐 System Architecture

### High-Level Flow

```
Patient (WhatsApp)
    ↓
Meta WhatsApp Cloud API
    ↓
n8n Webhook (AI Responder Workflow)
    ↓
Groq Llama 3.3 70B + Pinecone RAG
    ↓
BassirAI Database (Supabase)
    ↓
Frontend (Next.js) ← Receptionist/Admin
```

### Detailed Component Breakdown

#### 1. **Patient Interaction Layer**

```
Patient → WhatsApp → Meta Cloud API
```

- Patient sends message to clinic's WhatsApp Business number
- Meta receives message and forwards to your webhook
- Your n8n workflow captures the incoming message

#### 2. **AI Processing Layer**

```
n8n Workflow → Groq (Llama) → Pinecone (RAG) → Response
```

- n8n receives webhook from Meta
- Retrieves conversation history from Supabase
- Queries Pinecone for relevant clinic knowledge
- Sends context to Groq Llama for response generation
- Saves message to database

#### 3. **Database Layer (Supabase)**

```
PostgreSQL + Row Level Security (RLS)
```

Tables:

- `clinics` - Clinic profiles
- `users` - Receptionists/admins
- `conversations` - WhatsApp threads
- `messages` - Individual messages
- `appointments` - Booked appointments
- `clinic_customizations` - AI knowledge base

#### 4. **Frontend Layer (Next.js)**

```
Receptionist Dashboard → API Routes → Supabase
```

- View conversations in real-time
- Toggle human takeover
- Manage appointments
- Customize AI behavior

---

## 🔄 Current State: What's Mock vs Real

### ✅ REAL (Already Working)

| Component             | Status   | Location                                 |
| --------------------- | -------- | ---------------------------------------- |
| **Database Schema**   | ✅ Ready | `bassirai-mvp/database/schema.sql`       |
| **RLS Policies**      | ✅ Ready | `bassirai-mvp/database/rls-policies.sql` |
| **Authentication**    | ✅ Live  | Supabase Auth (configured)               |
| **API Routes**        | ✅ Live  | `/api/*` routes (all functional)         |
| **Appointments Page** | ✅ Live  | Tries API first, falls back to mock      |
| **User Registration** | ✅ Live  | Can create real accounts                 |

### 🟡 MOCK (Needs Configuration)

| Component               | Status    | What's Needed                                      |
| ----------------------- | --------- | -------------------------------------------------- |
| **Dashboard Stats**     | 🟡 Mock   | Needs API route to fetch real stats                |
| **Inbox Conversations** | 🟡 Mock   | Needs n8n + WhatsApp integration                   |
| **AI Responses**        | 🟡 Mock   | Needs n8n workflows deployed                       |
| **Settings Page**       | 🟡 Hybrid | Fetches from API but shows placeholder if DB empty |

### 🔴 MISSING (Requires Setup)

| Component                | Status            | Action Required                       |
| ------------------------ | ----------------- | ------------------------------------- |
| **WhatsApp Integration** | 🔴 Not configured | Add WHATSAPP_TOKEN, WHATSAPP_PHONE_ID |
| **OpenAI Embeddings**    | 🔴 Not configured | Add OPENAI_API_KEY                    |
| **Pinecone Vector DB**   | 🔴 Not configured | Add PINECONE_API_KEY + create index   |
| **Groq AI Engine**       | 🔴 Not configured | Add GROQ_API_KEY                      |
| **n8n Workflows**        | 🔴 Waiting        | Teammate working on it                |

---

## 🚀 Production Migration Steps

### Phase 1: Database Setup (30 minutes)

#### Step 1.1: Deploy Database Schema

```bash
# Go to Supabase Dashboard → SQL Editor
# Run these files IN ORDER:

1. bassirai-mvp/database/schema.sql
2. bassirai-mvp/database/rls-policies.sql
3. bassirai-mvp/database/performance-indexes.sql
4. (Optional) bassirai-mvp/database/seed.sql  # Test data
```

**Verify:**

```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Should show: clinics, users, conversations, messages, appointments, clinic_customizations
```

#### Step 1.2: Test RLS Policies

```sql
-- Create test clinic
INSERT INTO clinics (name, email)
VALUES ('Test Clinic', 'test@test.com');

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- All should show rowsecurity = true
```

---

### Phase 2: Environment Configuration (1 hour)

Follow the complete guide in `ENVIRONMENT_SETUP_GUIDE.md`. Quick checklist:

#### Step 2.1: Backend Environment (`bassirai-mvp/.env`)

```bash
# Copy example file
cd bassirai-mvp
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Supabase
SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
SUPABASE_ANON_KEY=<your-new-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-new-service-role-key>

# AI Stack
OPENAI_API_KEY=sk-proj-xxx
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=bassirai-index
GROQ_API_KEY=gsk_xxx

# WhatsApp
WHATSAPP_TOKEN=xxx
WHATSAPP_PHONE_ID=xxx

# n8n
N8N_ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
N8N_HOST=http://localhost:5678
```

#### Step 2.2: Frontend Environment (`frontend/.env.local`)

```bash
cd frontend

# Create new .env.local (don't use old one - it's exposed!)
cat > .env.local << 'EOF'
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-new-anon-key>

# Supabase Service Role (Private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=<your-new-service-role-key>

# AI Keys (Private - server-side only)
OPENAI_API_KEY=sk-proj-xxx
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=bassirai-index
GROQ_API_KEY=gsk_xxx

# WhatsApp (Private)
WHATSAPP_TOKEN=xxx
WHATSAPP_PHONE_ID=xxx

# n8n
N8N_ENCRYPTION_KEY=<same-as-backend>
N8N_HOST=http://localhost:5678
EOF
```

---

### Phase 3: Update Frontend to Use Real Data

#### Step 3.1: Dashboard - Create Real Stats API

**Create:** `frontend/src/app/api/dashboard/stats/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user's clinic
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clinicId = userData.clinic_id;

    // Fetch real stats
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, status")
      .eq("clinic_id", clinicId);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("clinic_id", clinicId);

    const totalConversations = conversations?.length || 0;
    const humanTakeover =
      conversations?.filter((c) => c.status === "active").length || 0;
    const aiActive = totalConversations - humanTakeover;
    const totalAppointments = appointments?.length || 0;

    return NextResponse.json({
      totalConversations,
      aiActive,
      humanTakeover,
      totalAppointments,
      aiResponseRate:
        totalConversations > 0
          ? ((aiActive / totalConversations) * 100).toFixed(1)
          : "0",
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
```

**Update:** `frontend/src/app/dashboard/page.tsx`

```typescript
// Add at the top of the component
const [stats, setStats] = useState({
  totalConversations: "0",
  aiResponseRate: "0%",
  humanTakeover: "0",
  totalAppointments: "0",
});
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchStats() {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalConversations: data.totalConversations.toString(),
          aiResponseRate: data.aiResponseRate + "%",
          humanTakeover: data.humanTakeover.toString(),
          totalAppointments: data.totalAppointments.toString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Keep default mock data on error
    } finally {
      setLoading(false);
    }
  }
  fetchStats();
}, []);

// Replace hardcoded stats array with dynamic one using state
```

---

#### Step 3.2: Inbox - Create Conversations API

**Create:** `frontend/src/app/api/conversations/list/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user's clinic
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clinicId = userData.clinic_id;

    // Fetch conversations with messages
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        patient_name,
        patient_phone,
        channel,
        status,
        is_human_takeover,
        last_message_at,
        created_at
      `,
      )
      .eq("clinic_id", clinicId)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    // Fetch messages for each conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: messages } = await supabase
          .from("messages")
          .select("content, direction, is_ai_generated, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        return {
          id: conv.id,
          name: conv.patient_name || "Unknown Patient",
          phone: conv.patient_phone,
          takeover: conv.is_human_takeover,
          messages: (messages || []).map((msg) => ({
            sender:
              msg.direction === "inbound"
                ? "patient"
                : msg.is_ai_generated
                  ? "ai"
                  : "human",
            text: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        };
      }),
    );

    return NextResponse.json({ conversations: conversationsWithMessages });
  } catch (error) {
    console.error("Conversations list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
```

**Update:** `frontend/src/app/inbox/page.tsx`

```typescript
// Change this line from:
const isMockMode = true;

// To:
const isMockMode = false; // Switch to production mode

// Add data fetching
useEffect(() => {
  if (!isMockMode) {
    async function loadConversations() {
      try {
        const response = await fetch("/api/conversations/list");
        if (response.ok) {
          const data = await response.json();
          setThreads(data.conversations);
          if (data.conversations.length > 0) {
            setActiveThreadId(data.conversations[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    }
    loadConversations();
  }
}, [isMockMode]);
```

---

### Phase 4: Deploy n8n Workflows (Teammate's Task)

Your teammate needs to deploy these workflows:

#### Workflow 1: RAG Loader (`rag-loader-workflow.json`)

**Purpose:** Load clinic knowledge from Google Drive to Pinecone

**Triggers:**

- Manual trigger (admin runs it)
- Scheduled (nightly refresh)

**Steps:**

1. Fetch documents from Google Drive folder
2. Split documents into chunks
3. Generate embeddings with OpenAI
4. Store vectors in Pinecone with clinic namespace

#### Workflow 2: AI Responder (`ai-responder-rag.json`)

**Purpose:** Handle incoming WhatsApp messages with AI

**Triggers:**

- WhatsApp webhook (Meta sends message)

**Steps:**

1. Receive message from WhatsApp webhook
2. Save message to `messages` table
3. Fetch conversation history from database
4. Query Pinecone for relevant clinic knowledge
5. Build context for Llama (history + knowledge + clinic settings)
6. Generate response with Groq Llama 3.3
7. Check if `is_human_takeover` is true
   - If TRUE: Don't send AI response, just save to database
   - If FALSE: Send AI response via WhatsApp API
8. Save AI response to `messages` table

**n8n Configuration:**

```json
{
  "nodes": [
    {
      "name": "WhatsApp Webhook",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "your-webhook-id",
      "path": "whatsapp-inbound"
    },
    {
      "name": "Save Inbound Message",
      "type": "n8n-nodes-base.postgres",
      "operation": "insert",
      "table": "messages"
    },
    {
      "name": "Query Pinecone",
      "type": "@n8n/n8n-nodes-langchain.vectorStorePinecone",
      "operation": "retrieve"
    },
    {
      "name": "Groq Llama Chat",
      "type": "@n8n/n8n-nodes-langchain.lmChatGroq",
      "model": "llama-3.3-70b-versatile"
    },
    {
      "name": "Send WhatsApp Reply",
      "type": "n8n-nodes-base.httpRequest",
      "method": "POST",
      "url": "https://graph.facebook.com/v18.0/{{WHATSAPP_PHONE_ID}}/messages"
    }
  ]
}
```

---

### Phase 5: WhatsApp Integration Setup

#### Step 5.1: Configure WhatsApp Webhook

```bash
# In Meta Developer Console:
1. Go to your WhatsApp app
2. Navigate to Configuration
3. Add webhook URL: https://your-n8n-domain.com/webhook/whatsapp-inbound
4. Add verify token: your_secure_token_here
5. Subscribe to "messages" events
```

#### Step 5.2: Test WhatsApp Flow

```bash
# 1. Send test message to your WhatsApp Business number
# 2. Check n8n workflow execution log
# 3. Verify message appears in database:

SELECT * FROM messages
WHERE clinic_id = 'your-clinic-id'
ORDER BY created_at DESC
LIMIT 5;

# 4. Check if AI response was sent back
# 5. Verify in frontend inbox page
```

---

## ✅ Testing Your Production Setup

### Test 1: Authentication Flow

```bash
1. Go to http://localhost:3000/login
2. Click "Register New Clinic"
3. Fill in clinic details
4. Create admin account
5. Verify redirect to dashboard
6. Check database:
   - clinics table should have new entry
   - users table should have admin user
   - Both linked by clinic_id
```

### Test 2: Appointments CRUD

```bash
1. Go to Appointments page
2. Click "New Appointment"
3. Fill in details
4. Save
5. Verify in database:
   SELECT * FROM appointments WHERE clinic_id = 'your-clinic-id';
6. Try updating status
7. Try searching/filtering
```

### Test 3: Inbox Real-Time

```bash
# After n8n is deployed:
1. Send WhatsApp message to clinic number
2. Check n8n execution log
3. Verify message in database
4. Check inbox page - message should appear
5. Toggle human takeover
6. Send another message
7. Verify AI doesn't auto-respond (takeover is on)
```

### Test 4: Multi-Tenancy Security

```bash
1. Create 2 test clinics (Clinic A, Clinic B)
2. Log in as Clinic A
3. Try to access Clinic B's appointment by guessing ID:
   curl -H "Authorization: Bearer <clinic-a-token>" \
     http://localhost:3000/api/appointments/list
4. Should only see Clinic A appointments
5. Verify in database logs that RLS blocked cross-access
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "Unauthorized" Error on API Calls

**Symptom:** 401 errors when accessing `/api/*` routes

**Diagnosis:**

```typescript
// Check auth status
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session); // Should have user object
```

**Fix:**

1. Verify user is logged in
2. Check JWT token is valid
3. Ensure cookies are being sent with requests
4. Check SUPABASE_URL matches in both frontend and backend

---

### Issue 2: "User clinic not found" Error

**Symptom:** 404 error saying user not linked to clinic

**Diagnosis:**

```sql
-- Check if user exists in users table
SELECT * FROM users WHERE id = 'your-auth-user-id';

-- Check if clinic_id is populated
SELECT u.id, u.email, u.clinic_id, c.name as clinic_name
FROM users u
LEFT JOIN clinics c ON u.clinic_id = c.id
WHERE u.id = 'your-auth-user-id';
```

**Fix:**

1. Ensure registration flow creates both auth user AND database user
2. Check `/api/users/register` was called after signup
3. Verify clinic_id foreign key relationship

---

### Issue 3: Appointments Not Showing

**Symptom:** Appointments page shows "No appointments" but data exists

**Diagnosis:**

```typescript
// Check API response
const response = await fetch("/api/appointments/list");
const data = await response.json();
console.log("API Response:", data);
```

**Fix:**

1. Check if appointments belong to correct clinic_id
2. Verify RLS policies are not blocking access
3. Check date filters aren't excluding all records
4. Ensure API route is correctly filtering by clinic_id

---

### Issue 4: n8n Workflow Not Triggering

**Symptom:** WhatsApp messages not generating AI responses

**Diagnosis:**

```bash
# Check n8n logs
docker logs n8n-container

# Check webhook endpoint
curl -X POST https://your-n8n-domain.com/webhook-test/whatsapp-inbound \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'

# Check database for saved messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;
```

**Fix:**

1. Verify webhook URL in Meta Developer Console
2. Check n8n encryption key matches across services
3. Ensure n8n has access to database credentials
4. Test each node individually in n8n UI

---

### Issue 5: RLS Blocking Valid Access

**Symptom:** Can't access own data despite being authenticated

**Diagnosis:**

```sql
-- Check get_user_clinic_id() function
SELECT get_user_clinic_id();

-- Check if function returns correct clinic_id
SELECT auth.uid(), get_user_clinic_id();

-- Check RLS policy
SELECT * FROM pg_policies WHERE tablename = 'appointments';
```

**Fix:**

1. Ensure `auth.uid()` returns your user ID
2. Verify users table has correct clinic_id for your user
3. Check RLS policies use `get_user_clinic_id()` function
4. Temporarily disable RLS for testing:

```sql
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;  -- Test only!
-- Then re-enable:
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Production Readiness Checklist

### Pre-Launch

- [ ] Database schema deployed
- [ ] RLS policies enabled and tested
- [ ] Performance indexes created
- [ ] All environment variables configured
- [ ] Supabase credentials rotated (from exposed ones)
- [ ] WhatsApp webhook configured
- [ ] n8n workflows deployed and tested
- [ ] Pinecone index created and populated
- [ ] Test clinic created and verified

### Launch Day

- [ ] Switch `isMockMode` to `false` in inbox page
- [ ] Remove mock data from dashboard
- [ ] Test full WhatsApp flow end-to-end
- [ ] Monitor n8n execution logs
- [ ] Monitor Supabase logs
- [ ] Test human takeover toggle
- [ ] Verify appointments sync correctly

### Post-Launch Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Monitor API response times
- [ ] Track AI response quality
- [ ] Collect user feedback

---

## 🎓 Key Concepts to Understand

### 1. Authentication Flow

```
User → Supabase Auth (JWT) → API Route → Database
                                 ↓
                          Extracts user_id from JWT
                                 ↓
                          Looks up clinic_id from users table
                                 ↓
                          Uses clinic_id to filter data
```

### 2. RLS (Row Level Security)

```
Every database query passes through RLS policies
    ↓
Policy checks: auth.uid() = current_user_id
    ↓
Queries get_user_clinic_id() to find clinic
    ↓
Only returns rows where clinic_id matches
```

### 3. AI Response Flow

```
Patient message → WhatsApp → n8n webhook
    ↓
n8n fetches conversation history
    ↓
n8n queries Pinecone for clinic knowledge
    ↓
Groq Llama generates response with context
    ↓
n8n checks if human takeover is active
    ↓
If NO: Send AI response to WhatsApp
If YES: Save to DB only, don't send
```

### 4. Human Takeover Logic

```
is_human_takeover = FALSE
    ↓
AI auto-responds to messages
Receptionist can view conversation

is_human_takeover = TRUE
    ↓
AI stops responding
Receptionist must manually reply
Messages still logged in database
```

---

## 📞 Next Steps

1. **Follow `ENVIRONMENT_SETUP_GUIDE.md`** to get all API keys
2. **Deploy database** using SQL files in correct order
3. **Update frontend** to use real APIs (Steps 3.1 & 3.2 above)
4. **Wait for teammate** to deploy n8n workflows
5. **Test thoroughly** using the test scenarios above
6. **Launch** and monitor closely

---

**Questions?** Refer to:

- `PRODUCTION_READY_CHECKLIST.md` - Security and deployment checklist
- `ENVIRONMENT_SETUP_GUIDE.md` - API keys configuration
- `COMPREHENSIVE_GUIDE.md` - Original system architecture
- `MULTI_TENANCY_SECURITY_AUDIT.md` - Security deep dive

---

**Last Updated:** August 11, 2026  
**Status:** Ready for production migration  
**Estimated Migration Time:** 4-6 hours (excluding n8n workflows)
