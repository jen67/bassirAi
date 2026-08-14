# 🔄 BassirAI System Flowchart

## 📊 **Complete Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PATIENT SIDE                                 │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────┐
│  Patient opens│
│  WhatsApp     │
└───────┬───────┘
        │
        │ Types: "How much is Botox?"
        │
        ▼
┌───────────────┐
│  WhatsApp     │
│  Business API │  ← Meta Cloud API
└───────┬───────┘
        │
        │ POST webhook
        │
        ▼

┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATION LAYER (n8n)                            │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│  1. Webhook Trigger       │  ← Receives POST from WhatsApp
│     - Extract phone       │
│     - Extract message     │
│     - Extract timestamp   │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  2. Lookup Conversation   │
│     in Supabase           │
│     - Find by phone       │
│     - Get clinic_id       │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  3. Check Takeover Mode   │
│     SELECT is_human_      │
│     takeover FROM         │
│     conversations         │
└───────────┬───────────────┘
            │
            ├───────────┐
            │           │
      ┌─────▼─────┐ ┌──▼───────────┐
      │  AI Mode  │ │ Human Mode   │
      │  (false)  │ │ (true)       │
      └─────┬─────┘ └──┬───────────┘
            │           │
            │           │ Skip AI
            │           │
            │           ▼
            │    ┌─────────────────┐
            │    │ 4b. Queue for   │
            │    │     Human Reply │
            │    │     (Inbox)     │
            │    └─────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│  4a. AI Processing Pipeline             │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Load Clinic Customizations       │ │
│  │ - Fetch catalog (JSONB)          │ │
│  │ - Fetch FAQs (JSONB)             │ │
│  │ - Fetch custom_prompt            │ │
│  └──────────────┬───────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌──────────────────────────────────┐ │
│  │ Build Dynamic System Prompt      │ │
│  │ Template:                        │ │
│  │ "You are a {tone} assistant for  │ │
│  │ {clinic_name}. Pricing: {catalog}│ │
│  │ FAQs: {faqs}. Always reply in    │ │
│  │ {language}."                     │ │
│  └──────────────┬───────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌──────────────────────────────────┐ │
│  │ Pinecone Vector Search (RAG)     │ │
│  │ - Query: "Botox pricing"         │ │
│  │ - Return: Relevant docs          │ │
│  └──────────────┬───────────────────┘ │
│                 │                      │
│                 ▼                      │
│  ┌──────────────────────────────────┐ │
│  │ Groq API Call                    │ │
│  │ - Model: llama-3.3-70b-versatile │ │
│  │ - Temperature: 0.7               │ │
│  │ - Max Tokens: 500                │ │
│  └──────────────┬───────────────────┘ │
│                 │                      │
│                 │ Returns: "Botox    │ │
│                 │ treatment ranges   │ │
│                 │ from ₦180,000..."  │ │
│                 │                      │
└─────────────────┼──────────────────────┘
                  │
                  ▼
┌───────────────────────────┐
│  5. Save AI Reply to DB   │
│     INSERT INTO messages  │
│     - direction: outbound │
│     - is_ai_generated:    │
│       true                │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  6. Send via WhatsApp API │
│     POST /messages        │
│     - to: {patient_phone} │
│     - body: {ai_reply}    │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│  Patient receives reply   │
│  in WhatsApp chat         │
└───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   RECEPTIONIST DASHBOARD                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ Supabase Realtime    │  ← Listens for INSERT on messages table
│ Subscription         │
└──────────┬───────────┘
           │
           │ Broadcasts: New message event
           │
           ▼
┌──────────────────────────────────┐
│ Frontend Inbox (React State)    │
│ - useEffect subscribes           │
│ - Adds new message to thread     │
│ - Shows notification badge       │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   HUMAN TAKEOVER FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│ Receptionist clicks       │
│ "Human Takeover" toggle   │
│ in Inbox UI               │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ POST /api/chats/toggle-   │
│ takeover                  │
│ Body: { phone, takeover } │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Server-side API Route     │
│ - Uses admin client       │
│ - UPDATE conversations    │
│   SET is_human_takeover=  │
│   true                    │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ n8n checks DB before      │
│ sending AI reply          │
│ - If takeover = true,     │
│   skip Groq API           │
│ - Queue for manual reply  │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Receptionist types reply  │
│ in Inbox input field      │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Save to DB + Send via     │
│ WhatsApp API              │
│ - direction: outbound     │
│ - is_ai_generated: false  │
└───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   BOOKING FLOW (Dual Strategy)                       │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Strategy A: Qualify & Handoff                                 │
│                                                               │
│ Patient: "I want to book Botox"                              │
│    ↓                                                          │
│ AI: "Great! What's your preferred date and time?"            │
│    ↓                                                          │
│ Patient: "Thursday 3pm"                                       │
│    ↓                                                          │
│ AI: "Perfect! A receptionist will call you to confirm."      │
│    ↓                                                          │
│ INSERT INTO appointments (status: 'pending')                  │
│    ↓                                                          │
│ Receptionist sees task in Dashboard                          │
│    ↓                                                          │
│ Receptionist calls patient → Confirms → Updates status       │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Strategy B: Cal.com Self-Service                             │
│                                                               │
│ Patient: "I want to book lip filler"                         │
│    ↓                                                          │
│ AI: "You can book directly here: cal.com/zuri-clinic/filler" │
│    ↓                                                          │
│ Patient clicks link → Selects time → Pays deposit            │
│    ↓                                                          │
│ Cal.com webhook → n8n → INSERT INTO appointments             │
│    ↓                                                          │
│ Auto-confirmation sent via WhatsApp                          │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   DATABASE SCHEMA (Supabase)                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│   clinics    │─────│    users     │     │ clinic_customizations│
│              │ 1:N │              │     │                      │
│ id (PK)      │←────│ clinic_id(FK)│     │ clinic_id (FK, UQ)   │
│ name         │     │ email        │     │ catalog (JSONB)      │
│ email        │     │ role         │     │ faqs (JSONB)         │
│ phone        │     │ full_name    │     │ custom_prompt        │
│ ai_mode      │     │              │     │                      │
└──────┬───────┘     └──────────────┘     └──────────────────────┘
       │
       │ 1:N
       │
┌──────▼────────────┐     ┌──────────────┐
│  conversations    │─────│   messages   │
│                   │ 1:N │              │
│ id (PK)           │◄────│ conversation │
│ clinic_id (FK)    │     │ _id (FK)     │
│ patient_phone     │     │ content      │
│ patient_name      │     │ direction    │
│ channel           │     │ is_ai_       │
│ is_human_takeover │     │ generated    │
└───────────────────┘     └──────────────┘
       │
       │ 1:N
       │
┌──────▼────────────┐
│  appointments     │
│                   │
│ id (PK)           │
│ clinic_id (FK)    │
│ conversation_id(FK│
│ patient_name      │
│ procedure         │
│ appointment_date  │
│ status            │
└───────────────────┘

Legend:
─── : Foreign Key Relationship
PK  : Primary Key
FK  : Foreign Key
UQ  : Unique Constraint
1:N : One-to-Many Relationship

┌─────────────────────────────────────────────────────────────────────┐
│                   SECURITY MODEL (RLS)                               │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Row Level Security Policy Example:                             │
│                                                                │
│ CREATE POLICY select_conversations ON conversations            │
│     FOR SELECT USING (clinic_id = get_user_clinic_id());      │
│                                                                │
│ Translation:                                                   │
│ "A user can only SELECT conversations where the clinic_id     │
│  matches their own clinic_id (fetched from users table)"      │
│                                                                │
│ Result:                                                        │
│ - Zuri Clinic staff ONLY see Zuri conversations              │
│ - Glamour Clinic staff ONLY see Glamour conversations        │
│ - No cross-clinic data leakage possible                       │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│ Groq API Call Fails       │
│ (Rate limit / Timeout)    │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ n8n Error Handler Node    │
│ - Retry 3 times (2s delay)│
└───────────┬───────────────┘
            │
     ┌──────┴──────┐
     │             │
   Success      Still Fails
     │             │
     ▼             ▼
  Continue    ┌───────────────────────────┐
              │ Fallback: Generic Reply   │
              │ "Thanks for your message. │
              │ A team member will reply  │
              │ shortly."                 │
              └───────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │ Auto-enable Human Takeover│
              │ UPDATE is_human_takeover= │
              │ true                      │
              └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   ANALYTICS PIPELINE                                 │
└─────────────────────────────────────────────────────────────────────┘

Every hour, n8n scheduled trigger runs:

SELECT
  COUNT(*) as total_messages,
  SUM(CASE WHEN is_ai_generated THEN 1 ELSE 0 END) as ai_messages,
  SUM(CASE WHEN NOT is_ai_generated THEN 1 ELSE 0 END) as human_messages
FROM messages
WHERE created_at > NOW() - INTERVAL '1 day';

↓

Calculate AI auto-response rate:
ai_rate = (ai_messages / total_messages) * 100

↓

UPDATE dashboard_stats SET ai_rate = {calculated_value}

↓

Frontend fetches updated stats on page load

┌─────────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                         Production Setup                        │
│                                                                │
│  ┌──────────────┐         ┌──────────────┐                   │
│  │   Vercel     │         │   Railway    │                   │
│  │  (Frontend)  │         │   (n8n)      │                   │
│  │              │         │              │                   │
│  │  - Next.js   │◄────────│  - Webhook   │                   │
│  │  - SSR       │  HTTPS  │  - Workflows │                   │
│  │  - Edge Fns  │         │              │                   │
│  └──────┬───────┘         └──────┬───────┘                   │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌──────────────────────────────────────┐                   │
│  │         Supabase (Database)          │                   │
│  │  - PostgreSQL                        │                   │
│  │  - Realtime subscriptions            │                   │
│  │  - Auth                              │                   │
│  │  - Storage (for images)              │                   │
│  └──────────────────────────────────────┘                   │
│                                                                │
│  ┌──────────────┐         ┌──────────────┐                   │
│  │   Groq AI    │         │   Pinecone   │                   │
│  │  (Inference) │         │   (Vectors)  │                   │
│  └──────────────┘         └──────────────┘                   │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   MESSAGE LATENCY BREAKDOWN                          │
└─────────────────────────────────────────────────────────────────────┘

Patient sends message → Receptionist sees reply
Total Target: <3 seconds

┌────────────────────────────────────────────┐
│ WhatsApp → n8n webhook         │  ~200ms   │
│ Database lookup                │  ~50ms    │
│ Pinecone vector search         │  ~150ms   │
│ Groq API inference             │  ~400ms   │  ← Fastest part!
│ Save to database               │  ~50ms    │
│ Send via WhatsApp API          │  ~300ms   │
│ Realtime push to frontend      │  ~100ms   │
├────────────────────────────────┼───────────┤
│ TOTAL                          │  ~1.25s   │ ✅ Under target!
└────────────────────────────────┴───────────┘

Traditional chatbot (OpenAI GPT-4): ~5-8 seconds
BassirAI advantage: 4-6x faster! 🚀

┌─────────────────────────────────────────────────────────────────────┐
│                   SCALABILITY CONSIDERATIONS                         │
└─────────────────────────────────────────────────────────────────────┘

Current MVP handles: ~100 conversations/day

To scale to 10,000 conversations/day:

1. Add Message Queue (BullMQ/Redis)
   ┌──────────────┐
   │  WhatsApp    │
   │  Webhook     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Redis Queue │  ← Buffers messages
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Worker Pool │  ← 10 parallel workers
   │  (5-10 nodes)│
   └──────────────┘

2. Database Connection Pooling
   - Use Supabase connection pooler
   - Max connections: 100

3. Groq API Rate Limits
   - Free tier: 30 req/min
   - Paid tier: 14,400 req/day
   - Solution: Implement token bucket algorithm

4. CDN for Static Assets
   - Use Vercel Edge Network
   - Cache catalog images

┌─────────────────────────────────────────────────────────────────────┐
│                   MONITORING & OBSERVABILITY                         │
└─────────────────────────────────────────────────────────────────────┘

Recommended Tools:

┌──────────────────────────────────────────────────────────┐
│ Sentry (Error Tracking)                                  │
│ - Capture frontend exceptions                            │
│ - Capture API route errors                               │
│ - Alert on critical failures                             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Vercel Analytics (Performance)                           │
│ - Page load times                                        │
│ - API response times                                     │
│ - Geo-distributed metrics                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Supabase Dashboard (Database Health)                     │
│ - Query performance                                      │
│ - Connection pool usage                                  │
│ - Storage usage                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Custom Dashboard (Business Metrics)                      │
│ - Conversations per day                                  │
│ - AI success rate                                        │
│ - Human takeover frequency                               │
│ - Booking conversion rate                                │
└──────────────────────────────────────────────────────────┘

```

---

## 🎯 **Key Takeaways**

1. **Message flow:** WhatsApp → n8n → Check takeover → AI or Human → Reply
2. **Data security:** RLS ensures clinic data isolation
3. **Performance:** <1.25s total latency (Groq advantage)
4. **Scalability:** Message queue + worker pool for high volume
5. **Monitoring:** Sentry + Vercel Analytics + Custom metrics

---

**This flowchart represents the COMPLETE system once all integrations are connected!**
