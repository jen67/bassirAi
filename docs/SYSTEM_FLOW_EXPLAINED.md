# BassirAI System Flow - Visual Explanation

**Purpose:** Simple visual explanation of how data flows through the entire system

---

## 🎯 The Complete Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PATIENT SIDE                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                        Patient sends message
                        "How much is Botox?"
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  WhatsApp Business API │
                    │  (Meta Cloud)          │
                    └────────────────────────┘
                                 │
                          Webhook POST
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI PROCESSING LAYER                        │
└─────────────────────────────────────────────────────────────────┘
                    ┌────────────────────────┐
                    │   n8n Workflow Engine  │
                    │   (Your Teammate)      │
                    └────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌──────────────────┐
        │  Supabase DB      │    │  Pinecone RAG    │
        │  Get conversation │    │  Search clinic   │
        │  history          │    │  knowledge       │
        └───────────────────┘    └──────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                      Combined Context
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Groq Llama 3.3 70B   │
                    │   Generate Response    │
                    └────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌──────────────────┐
        │  Save to Database │    │  Check Takeover  │
        │  messages table   │    │  is_human_takeover│
        └───────────────────┘    └──────────────────┘
                                          │
                         ┌────────────────┴──────────────┐
                         │                               │
                    takeover = FALSE              takeover = TRUE
                         │                               │
                         ▼                               ▼
            ┌─────────────────────┐         ┌────────────────────┐
            │ Send AI Response    │         │ DON'T Send         │
            │ via WhatsApp API    │         │ (Receptionist will)│
            └─────────────────────┘         └────────────────────┘
                         │                               │
                         └────────────┬──────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RECEPTIONIST SIDE                          │
└─────────────────────────────────────────────────────────────────┘
                    ┌────────────────────────┐
                    │   Next.js Frontend     │
                    │   (Your Dashboard)     │
                    └────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌──────────────────┐
        │   Inbox Page      │    │ Appointments Page│
        │   View messages   │    │ Manage bookings  │
        │   Toggle takeover │    │                  │
        └───────────────────┘    └──────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                      API Routes (/api/*)
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Supabase Database    │
                    │   (PostgreSQL + RLS)   │
                    └────────────────────────┘
```

---

## 🔄 Detailed Flow Scenarios

### Scenario 1: AI Auto-Response (Normal Operation)

```
1. Patient: "How much is Botox?"
   ↓
2. WhatsApp → n8n webhook
   ↓
3. n8n saves message to database:
   INSERT INTO messages (conversation_id, content, direction)
   VALUES ('conv-123', 'How much is Botox?', 'inbound')
   ↓
4. n8n checks conversation status:
   SELECT is_human_takeover FROM conversations
   WHERE id = 'conv-123'
   Result: FALSE ✅
   ↓
5. n8n retrieves conversation history:
   SELECT content, direction FROM messages
   WHERE conversation_id = 'conv-123'
   ORDER BY created_at
   ↓
6. n8n queries Pinecone:
   Query: "How much is Botox?"
   Returns: [
     "Botox treatments at Zuri range from ₦180,000 to ₦300,000",
     "Botox reduces forehead lines",
     "Consultation required before treatment"
   ]
   ↓
7. n8n builds context for Llama:
   {
     system: "You are Zuri Clinic assistant. Tone: professional",
     history: [...previous messages],
     knowledge: [...from Pinecone],
     question: "How much is Botox?"
   }
   ↓
8. Groq Llama generates response:
   "Botox treatments at Zuri Aesthetic & Wellness Clinic
    range from ₦180,000 to ₦300,000 depending on the area
    treated. Would you like to schedule a consultation?"
   ↓
9. n8n saves AI response:
   INSERT INTO messages (conversation_id, content, direction, is_ai_generated)
   VALUES ('conv-123', '...', 'outbound', TRUE)
   ↓
10. n8n sends via WhatsApp API:
    POST https://graph.facebook.com/v18.0/{PHONE_ID}/messages
    {
      "to": "+234803...",
      "type": "text",
      "text": { "body": "..." }
    }
    ↓
11. Patient receives AI response ✅

RESULT: Patient gets instant AI response, receptionist doesn't need to intervene
```

---

### Scenario 2: Human Takeover Mode

```
1. Receptionist sees complex medical question
   ↓
2. Receptionist clicks "Human Takeover" toggle in inbox
   ↓
3. Frontend calls API:
   POST /api/chats/toggle-takeover
   { phone: "+234803...", takeover: true }
   ↓
4. API updates database:
   UPDATE conversations
   SET is_human_takeover = TRUE
   WHERE patient_phone = '+234803...'
   AND clinic_id = 'clinic-123'  ← Security: Multi-tenancy enforced
   ↓
5. Patient sends another message:
   "I have a skin condition, can I speak to doctor?"
   ↓
6. WhatsApp → n8n webhook
   ↓
7. n8n saves message to database
   ↓
8. n8n checks conversation status:
   SELECT is_human_takeover FROM conversations
   WHERE id = 'conv-123'
   Result: TRUE 🛑
   ↓
9. n8n SKIPS AI generation
   ↓
10. n8n DOES NOT send WhatsApp response
    ↓
11. Receptionist sees message in inbox immediately
    (Frontend polls or uses real-time subscription)
    ↓
12. Receptionist types manual response:
    "Of course! Dr. Adebayo specializes in sensitive skin.
     Can you describe your condition?"
    ↓
13. Frontend calls API:
    (Not implemented yet - will be in n8n)
    ↓
14. Message sent via WhatsApp manually

RESULT: AI is paused, receptionist has full control
```

---

### Scenario 3: Creating an Appointment

```
1. Receptionist clicks "New Appointment" button
   ↓
2. Modal opens with form
   ↓
3. Receptionist fills in:
   - Patient name: "Chioma Adebayo"
   - Phone: "+234 803 123 4567"
   - Procedure: "Botox Forehead"
   - Date: "2026-08-15 14:00"
   - Notes: "First-time patient, nervous"
   ↓
4. Frontend validates input:
   - Name length: 2-100 chars ✅
   - Phone format: E.164 ✅
   - Date: Not in past ✅
   ↓
5. Frontend calls API:
   POST /api/appointments/create
   {
     patient_name: "Chioma Adebayo",
     patient_phone: "+234 803 123 4567",
     procedure: "Botox Forehead",
     appointment_date: "2026-08-15T14:00:00Z",
     notes: "First-time patient, nervous",
     conversation_id: "conv-123"  ← Optional: link to chat
   }
   ↓
6. API validates again (server-side):
   - All input validation ✅
   - Authentication check ✅
   ↓
7. API gets user's clinic:
   SELECT clinic_id FROM users WHERE id = auth.uid()
   Result: 'clinic-abc'
   ↓
8. API creates appointment:
   INSERT INTO appointments (
     clinic_id,           ← Multi-tenancy: user's clinic
     conversation_id,
     patient_name,
     patient_phone,
     procedure,
     appointment_date,
     status,
     notes
   ) VALUES (
     'clinic-abc',        ← Locked to this clinic
     'conv-123',
     'Chioma Adebayo',
     '+234 803 123 4567',
     'Botox Forehead',
     '2026-08-15 14:00:00',
     'pending',
     'First-time patient, nervous'
   )
   ↓
9. RLS Policy checks:
   - Does appointment.clinic_id match user's clinic? ✅
   - Policy: clinic_id = get_user_clinic_id() ✅
   ↓
10. API updates conversation (if linked):
    UPDATE conversations
    SET status = 'booked'
    WHERE id = 'conv-123'
    AND clinic_id = 'clinic-abc'  ← Security check
    ↓
11. API returns success:
    {
      appointmentId: "appt-456",
      success: true
    }
    ↓
12. Frontend shows success message
    ↓
13. Appointment appears in calendar/list view

RESULT: Appointment created, linked to conversation, appears in UI
```

---

## 🔐 Security Flow Example

### What Happens When Clinic A Tries to Access Clinic B's Data?

```
┌──────────────────────────────────────────────────────────┐
│  Malicious Attempt: Clinic A tries to view Clinic B data │
└──────────────────────────────────────────────────────────┘

1. Clinic A receptionist is logged in
   auth.uid() = 'user-a-123'
   ↓
2. Clinic A user tries to access Clinic B's appointment:
   GET /api/appointments/list
   (Or tries to guess URL: /api/appointments/update?id=clinic-b-appt)
   ↓
3. API receives request
   ↓
4. API validates JWT token:
   const { data: { user } } = await supabase.auth.getUser()
   Result: user.id = 'user-a-123' ✅
   ↓
5. API looks up user's clinic:
   SELECT clinic_id FROM users WHERE id = 'user-a-123'
   Result: clinic_id = 'clinic-a-456'
   ↓
6. API queries database:
   SELECT * FROM appointments
   WHERE clinic_id = 'clinic-a-456'  ← Explicitly filtered!
   ↓
7. Database RLS Policy activates (BACKUP DEFENSE):
   get_user_clinic_id() returns 'clinic-a-456'
   RLS: ONLY show rows where clinic_id = 'clinic-a-456'
   ↓
8. Query result:
   ONLY Clinic A's appointments ✅
   Clinic B's data is INVISIBLE
   ↓
9. API returns:
   { appointments: [...only Clinic A data] }
   ↓
10. Clinic A user CANNOT see Clinic B's data 🛡️

RESULT: Cross-tenant access BLOCKED by 2 layers:
  1. Application code filters by clinic_id
  2. RLS policies enforce at database level
```

---

## 📊 Data Structure in Database

### How Everything Connects

```
┌─────────────┐
│   clinics   │
│  id (PK)    │───┐
│  name       │   │
│  email      │   │
└─────────────┘   │
                  │
                  │ clinic_id (FK)
                  │
        ┌─────────┴──────────┬──────────────┬──────────────┐
        │                    │              │              │
        ▼                    ▼              ▼              ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    users     │   │conversations │   │ appointments │   │  clinic_     │
│  id (PK)     │   │  id (PK)     │   │  id (PK)     │   │customizations│
│  clinic_id ──┤   │  clinic_id ──┤   │  clinic_id ──┤   │  clinic_id ──┤
│  email       │   │  patient_ph  │   │  patient_name│   │  catalog     │
│  role        │   │  status      │   │  procedure   │   │  faqs        │
└──────────────┘   │  takeover    │   │  date        │   │  prompts     │
                   └──────────────┘   │  status      │   └──────────────┘
                          │           └──────────────┘
                          │
                          │ conversation_id (FK)
                          │
                          ▼
                   ┌──────────────┐
                   │   messages   │
                   │  id (PK)     │
                   │  conv_id ────┤
                   │  content     │
                   │  direction   │
                   │  is_ai_gen   │
                   └──────────────┘

LEGEND:
  PK = Primary Key (unique identifier)
  FK = Foreign Key (references another table)
  ── = Relationship line
```

---

## 🎓 Key Concepts Simplified

### 1. Mock Data vs Real Data

**Mock Data (Current State):**

```javascript
// Hardcoded in component
const [threads] = useState([
  { id: 'chioma', name: 'Chioma', messages: [...] },
  { id: 'kelechi', name: 'Kelechi', messages: [...] }
]);
```

- Lives only in browser memory
- Disappears on page refresh
- Not shared between users
- Good for development/demo

**Real Data (Production):**

```javascript
// Fetched from API
const [threads, setThreads] = useState([]);

useEffect(() => {
  fetch("/api/conversations/list")
    .then((res) => res.json())
    .then((data) => setThreads(data.conversations));
}, []);
```

- Stored in Supabase database
- Persists across sessions
- Shared between users (same clinic only)
- Synced with WhatsApp in real-time

---

### 2. Authentication vs Authorization

**Authentication:** "Who are you?"

```
User logs in → Supabase Auth creates JWT token → Token stored in cookie
```

**Authorization:** "What can you access?"

```
Token → Extract user_id → Look up clinic_id → Filter data by clinic_id
```

**Example:**

```
User "john@clinica.com" logs in
  ↓
Supabase creates JWT: eyJhbGciOiJIUzI1NiIs...
  ↓
API extracts user_id from JWT: 'user-123'
  ↓
API queries: SELECT clinic_id FROM users WHERE id = 'user-123'
  ↓
Result: clinic_id = 'clinic-a'
  ↓
API filters all queries: WHERE clinic_id = 'clinic-a'
  ↓
User can ONLY see Clinic A's data
```

---

### 3. Human Takeover Explained

**Normal Mode (AI Active):**

```
Patient message → AI generates response → Sent automatically
Receptionist: Can view, but doesn't need to act
```

**Takeover Mode (Human Control):**

```
Patient message → AI silent → Receptionist must respond
Receptionist: Must manually type and send reply
```

**Why it matters:**

- Complex medical questions → Human needed
- Urgent cases → Direct human contact
- Angry customers → Personal touch
- Legal concerns → Doctor must respond

**How to implement:**

```
1. Receptionist sees concerning message
2. Clicks "Take Over" toggle
3. is_human_takeover = TRUE in database
4. AI stops auto-responding
5. Receptionist takes full control
6. When resolved, toggle back to AI
```

---

### 4. RAG (Retrieval Augmented Generation)

**Without RAG:**

```
Patient: "Do you offer parking?"
AI: "I don't have that information." ❌
```

**With RAG:**

```
Patient: "Do you offer parking?"
  ↓
Pinecone search: "parking"
  ↓
Found in knowledge base: "Yes, free parking at entrance"
  ↓
AI: "Yes! We provide free parking validation at our Lekki
     office entrance for all patients." ✅
```

**How it works:**

```
1. Clinic uploads documents to Google Drive
   - FAQ document
   - Price list
   - Policies
   ↓
2. n8n RAG Loader runs:
   - Reads documents
   - Splits into chunks
   - Generates embeddings (OpenAI)
   - Stores in Pinecone with clinic namespace
   ↓
3. Patient asks question:
   ↓
4. n8n queries Pinecone:
   - Converts question to embedding
   - Finds similar text chunks
   - Returns top 5 relevant pieces
   ↓
5. n8n sends to Llama:
   Context: [question + retrieved knowledge + history]
   ↓
6. Llama generates accurate response using clinic's knowledge
```

---

## 🚀 Your Next Steps

1. **Read:** `MOCK_TO_PRODUCTION_GUIDE.md` (full migration steps)
2. **Configure:** Follow `ENVIRONMENT_SETUP_GUIDE.md` (API keys)
3. **Deploy:** Database schema and RLS policies
4. **Test:** Create test clinic and verify data flow
5. **Launch:** Switch from mock to real data

**Estimated Time:** 4-6 hours (excluding n8n workflows)

---

**Questions?** You now understand:

- ✅ How patients interact via WhatsApp
- ✅ How AI generates responses
- ✅ How receptionist dashboard works
- ✅ How data flows through the system
- ✅ How security prevents cross-tenant access
- ✅ How to switch from mock to production

Ready to launch! 🎉
