# 🏥 BassirAI - Complete Guide for Non-Technical Users

## 📖 **What is This Project?**

BassirAI is like having a **24/7 smart receptionist** for aesthetic clinics (think Botox, lip filler clinics in Africa). When patients message the clinic on WhatsApp asking "How much is Botox?", an AI responds instantly in under 1 second—faster than any human!

---

## 🎯 **The Big Picture (MVP Blueprint from PDF)**

### **What the MVP Does:**

1. **Receives patient messages** from WhatsApp, Instagram, Facebook
2. **AI responds automatically** using Groq Llama 3.3 (super fast AI)
3. **If AI can't help**, a human receptionist takes over
4. **Books appointments** either through Cal.com or by asking staff to call the patient
5. **Shows a dashboard** with stats like "142 conversations this week"

### **Why It's Unique:**

- **Cost: $0/month** (uses free tools)
- **Speed: <1 second** AI response time
- **Built for Africa**: Works in Nigeria (Lagos/Lekki), supports Naira (₦) pricing
- **Timeline: 30 days** to build the complete MVP

---

## 🗂️ **Project Structure (What Each Folder Does)**

```
bassirai-mvp/              ← Blueprint & database setup files
├── database/
│   ├── schema.sql         ← Creates database tables (like Excel sheets)
│   ├── rls-policies.sql   ← Security rules (who can see what data)
│   └── seed.sql          ← Sample data to test with
├── n8n-workflows/         ← Automation workflows (connects WhatsApp to AI)
└── docker/               ← Local testing setup

frontend/                  ← The actual web app (what you see in browser)
├── src/
│   ├── app/              ← All the pages
│   │   ├── login/        ← Login page
│   │   ├── dashboard/    ← Main overview page
│   │   ├── inbox/        ← Chat management page
│   │   ├── settings/     ← Configuration page
│   │   └── api/          ← Backend logic (invisible to users)
│   ├── components/       ← Reusable UI pieces
│   └── utils/           ← Helper tools (database connection)
└── public/              ← Images & static files

bassirai-figma-design/     ← Interactive prototype (HTML mockup)
```

---

## 🛠️ **How Each File Works (Layman Explanations)**

### **1. Database Files** (`bassirai-mvp/database/`)

#### **schema.sql** - The Data Structure

Think of this as creating labeled folders and filing cabinets:

```sql
CREATE TABLE clinics (...)
```

**Translation:** Create a "Clinics" folder to store clinic details like name, phone number, AI settings.

```sql
CREATE TABLE conversations (...)
```

**Translation:** Create a "Conversations" folder to track every patient chat thread.

**Key Tables:**

- **clinics** - Stores clinic info (Zuri Aesthetic Clinic, phone: +234...)
- **users** - Staff accounts (admin, receptionist)
- **clinic_customizations** - AI behavior settings (pricing catalog, FAQs)
- **conversations** - Each patient chat thread
- **messages** - Individual messages within a thread
- **appointments** - Booking records

#### **rls-policies.sql** - Security Rules

```sql
CREATE POLICY select_conversations ON conversations
    FOR SELECT USING (clinic_id = get_user_clinic_id());
```

**Translation:** A staff member can ONLY see conversations from their own clinic, not other clinics. Like a hospital where doctors only see their own patients' files.

#### **seed.sql** - Sample Data

```sql
INSERT INTO clinics (name, ...)
VALUES ('Zuri Aesthetic & Wellness Clinic', ...);
```

**Translation:** Pre-fill the database with a test clinic called "Zuri" and 3 fake patient conversations so you can test the system immediately.

---

### **2. Frontend Files** (`frontend/src/`)

#### **app/login/page.tsx** - The Login Screen

```typescript
const handleLogin = async (e: React.FormEvent) => {
  // Check if email ends with @zuri.clinic for mock mode
  if (isMockEmail) {
    document.cookie = "sb-mock-session=true";
    router.push("/dashboard");
  }
};
```

**Translation:** When you click "Sign In", this code:

1. Checks if you entered `benson@zuri.clinic` (mock/test account)
2. Sets a "cookie" (browser memory) to remember you're logged in
3. Redirects you to the dashboard page

**Mock Mode:** If Supabase isn't connected, you can still test by logging in as `benson@zuri.clinic` with any password.

---

#### **app/dashboard/page.tsx** - The Overview Page

```typescript
const stats = [
  { name: 'Total Conversations', value: '142', ... },
  { name: 'AI Auto-Response Rate', value: '91.4%', ... },
  ...
]
```

**Translation:** Shows 4 big stats cards:

1. **142 conversations** - Total patient messages this week
2. **91.4% AI rate** - How often AI handled it without human help
3. **12 escalations** - Times a human had to take over
4. **₦3,850,000** - Estimated revenue from qualified bookings

---

#### **app/inbox/page.tsx** - The Chat Manager

This is the CORE of the system. Let's break it down:

```typescript
const [threads, setThreads] = useState<ChatThread[]>([
  {
    id: 'chioma',
    name: 'Chioma Adebayo',
    phone: '+234 803 111 2222',
    takeover: true,  // Human mode ON
    messages: [...]
  },
  ...
])
```

**Translation:**

- `threads` = List of all patient conversations
- `takeover: true` = Human receptionist is controlling this chat (AI is OFF)
- `takeover: false` = AI is auto-replying (Human is OFF)

**The Toggle Switch:**

```typescript
const toggleTakeover = async (threadId: string) => {
  // Update local state
  const updated = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, takeover: !t.takeover };
    }
    return t;
  });
  setThreads(updated);

  // Sync to database
  await fetch("/api/chats/toggle-takeover", {
    method: "POST",
    body: JSON.stringify({ phone: target?.phone, takeover: target?.takeover }),
  });
};
```

**Translation:** When you flip the "Human Takeover" switch:

1. Updates the chat on your screen immediately
2. Sends a message to the server to save this change in the database
3. Now AI knows: "Don't reply to this patient anymore, let the human handle it"

**Simulating Messages:**

```typescript
const simulateInbound = (text: string, isArabic = false) => {
  // Add patient message to thread
  const incomingMsg = { sender: "patient", text, time: "now" };

  // If AI is active, reply after 1.5 seconds
  if (!activeThread.takeover) {
    setTimeout(() => {
      const aiReply = "Botox ranges from ₦180,000 to ₦300,000...";
      // Add AI reply to thread
    }, 1500);
  }
};
```

**Translation:** The "Simulate Message" button lets you test the AI without needing a real WhatsApp connection:

1. Clicks "How much is Botox?" button
2. Adds a fake patient message
3. If AI mode is ON, waits 1.5 seconds then adds an AI reply
4. If Human mode is ON, message just sits there waiting for receptionist to reply

---

#### **app/settings/page.tsx** - Configuration Panel

```typescript
const [catalog, setCatalog] = useState<CatalogItem[]>([]);
const [faqs, setFaqs] = useState<FAQItem[]>([]);

const addCatalogRow = () => {
  setCatalog([...catalog, { name: "", price: "₦", description: "" }]);
};
```

**Translation:**

- **Catalog** = List of treatments & prices the AI can reference
- Clicking "+ Add Service" creates a blank row where you type:
  - Treatment: "Botox Forehead"
  - Price: "₦180,000 - ₦300,000"
  - Description: "Reduces horizontal lines"

When AI gets asked "How much is Botox?", it searches this catalog and replies with the exact price.

**Saving Settings:**

```typescript
const handleSaveSettings = async () => {
  const payload = { clinicName, aiTone, catalog, faqs, ... }

  if (isPlaceholder) {
    // No database? Save to browser storage
    localStorage.setItem('zuri_onboarding_state', JSON.stringify(payload))
  } else {
    // Send to database via API
    await fetch('/api/clinics/onboard', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}
```

**Translation:**

- If Supabase is connected → Saves to cloud database
- If Supabase is NOT connected → Saves to your browser's memory (localStorage)

---

#### **app/api/chats/toggle-takeover/route.ts** - Backend Logic

```typescript
export async function POST(request: Request) {
  const { phone, takeover } = await request.json();

  const supabase = createAdminClient();

  await supabase
    .from("conversations")
    .update({ is_human_takeover: !!takeover })
    .eq("patient_phone", phone);

  return NextResponse.json({ success: true });
}
```

**Translation:** This is a "server function" that runs in the background:

1. Frontend sends: `{ phone: '+234 803 111 2222', takeover: true }`
2. This code finds the conversation with that phone number in the database
3. Updates the `is_human_takeover` field to `true`
4. Returns "success!" back to the frontend

**Why we need this:** The database change needs "admin powers" (SERVICE_ROLE_KEY), which we can't expose in the browser for security.

---

#### **components/SidebarLayout.tsx** - Navigation Wrapper

```typescript
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <svg>...</svg> },
  { name: 'Unified Inbox', path: '/inbox', icon: <svg>...</svg> },
  { name: 'Settings', path: '/settings', icon: <svg>...</svg> }
]

return (
  <div>
    <aside>
      {navItems.map(item => (
        <button onClick={() => router.push(item.path)}>
          {item.name}
        </button>
      ))}
    </aside>
    <main>{children}</main>
  </div>
)
```

**Translation:** This is the **sidebar menu** you see on the left:

- Shows "Dashboard", "Unified Inbox", "Settings" buttons
- Clicking any button changes the page
- `{children}` = The actual page content appears in the main area

---

### **3. Utility Files** (`frontend/src/utils/supabase/`)

#### **client.ts** - Browser Database Connection

```typescript
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

**Translation:** Creates a connection to Supabase database from the browser. Uses the "public" key (ANON_KEY) which has limited permissions.

#### **server.ts** - Server Database Connection

```typescript
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );
}
```

**Translation:** Creates a connection from the server (backend). Can read cookies to identify who's logged in.

#### **admin.ts** - Admin Database Connection (NEWLY CREATED)

```typescript
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← SUPER POWERS
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
```

**Translation:** Creates a connection with FULL admin powers (SERVICE_ROLE_KEY). Can bypass all security rules. Only used on the server, never exposed to browser.

---

## 🔧 **Environment Variables (.env.local)**

```env
NEXT_PUBLIC_SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**What each key means:**

- **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project address (like a website URL)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - "Public key" (safe to use in browser, limited access)
- **SUPABASE_SERVICE_ROLE_KEY** - "Master key" (full admin access, NEVER expose in browser)

**IMPORTANT:** I fixed your URL! It was:

```
https://kwqzlqpijmzxfudmorvn.supabase.co/rest/v1/  ❌ WRONG
```

Changed to:

```
https://kwqzlqpijmzxfudmorvn.supabase.co  ✅ CORRECT
```

---

## 🚀 **How to Run the Project**

### **Step 1: Install Dependencies**

```bash
cd frontend
npm install
```

**Translation:** Downloads all the code libraries (like React, Next.js, Supabase) that the project needs.

### **Step 2: Run Development Server**

```bash
npm run dev
```

**Translation:** Starts a local web server at `http://localhost:3000`. Open this in your browser to see the app.

### **Step 3: Test in Mock Mode**

1. Go to `http://localhost:3000/login`
2. Enter email: `benson@zuri.clinic`
3. Enter any password (doesn't matter in mock mode)
4. Click "Sign In"
5. You'll see the dashboard with fake data!

---

## 🐛 **Common Issues & Fixes**

### **Error: "Cannot find module '@/utils/supabase/admin'"**

**Fix:** ✅ I just created this file! (`frontend/src/utils/supabase/admin.ts`)

### **Error: "Supabase connection failed"**

**Cause:** Your Supabase URL had `/rest/v1/` at the end (wrong format)
**Fix:** ✅ I fixed your `.env.local` file! Remove the `/rest/v1/` part.

### **Mock Mode vs Live Mode**

- **Mock Mode:** Works without Supabase, stores data in browser memory
- **Live Mode:** Requires Supabase setup, stores data in cloud database

**How to switch:**

- If `.env.local` has placeholder URLs → Automatically uses Mock Mode
- If `.env.local` has real Supabase URLs → Uses Live Mode

---

## 📊 **Data Flow (How It All Connects)**

```
┌─────────────────┐
│ Patient sends   │
│ WhatsApp message│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ n8n Workflow    │ ← Receives webhook from WhatsApp
│ (Automation)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Groq AI (Llama) │ ← Generates response in <1s
│ + Pinecone RAG  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase DB     │ ← Stores message & response
│ (conversations) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend Inbox  │ ← Receptionist sees it in browser
│ (page.tsx)      │
└─────────────────┘
```

**Human Takeover Flow:**

```
1. Receptionist toggles "Human Takeover" switch
2. Frontend calls /api/chats/toggle-takeover
3. API updates database: is_human_takeover = true
4. n8n workflow checks database before sending AI reply
5. If is_human_takeover = true, skips AI, waits for human
6. Receptionist types manual reply in inbox
7. Manual reply sent via WhatsApp API
```

---

## 🎨 **Figma Design Prototype** (`bassirai-figma-design/`)

This is a standalone HTML/CSS/JS mockup (like a clickable wireframe):

- **Purpose:** Show the UI design before building the real app
- **Features:**
  - Cover page with project stats
  - Onboarding wizard (6 steps)
  - Unified inbox with chat threads
  - Dashboard with KPI cards
  - Booking strategy selector

**How to view:**

```bash
# Just open in browser
bassirai-figma-design/index.html
```

---

## ✅ **What's Working vs What Needs Work**

### **✅ Working:**

1. Login page with mock mode bypass
2. Dashboard showing stats
3. Inbox with 3 sample patient threads
4. Human takeover toggle switch
5. Message simulation (fake patient messages)
6. Settings page with catalog/FAQ management
7. Sidebar navigation
8. Responsive design (mobile + desktop)

### **🚧 Needs Work:**

1. **Real WhatsApp Integration** - Currently mocked, needs n8n workflow
2. **Groq AI Integration** - No actual Llama API calls yet
3. **Pinecone RAG** - Vector search not implemented
4. **Cal.com Booking** - Link generation not implemented
5. **Real-time Updates** - No Supabase Realtime subscriptions
6. **Image Upload** - Settings page can't upload catalog images yet
7. **Multi-language** - Arabic support mentioned but not implemented

---

## 🔐 **Security Notes**

### **Row Level Security (RLS)**

```sql
CREATE POLICY select_conversations ON conversations
    FOR SELECT USING (clinic_id = get_user_clinic_id());
```

**Why this matters:** If Zuri Clinic and Glamour Clinic both use BassirAI:

- Zuri staff can ONLY see Zuri's patient conversations
- Glamour staff can ONLY see Glamour's conversations
- No clinic can spy on another clinic's data

### **Environment Variables**

- **NEVER commit `.env.local` to GitHub** (contains secret keys)
- **Always use `NEXT_PUBLIC_` prefix** for browser-safe variables
- **SERVICE_ROLE_KEY** should ONLY be used in API routes (server-side)

---

## 🎯 **Next Steps (To Complete MVP)**

### **Week 1: Foundation (Days 1-7)**

- [x] Database schema
- [x] Frontend UI
- [x] Login system
- [x] Mock mode
- [ ] Deploy to Railway/Vercel

### **Week 2: AI Integration (Days 8-14)**

- [ ] n8n workflow: WhatsApp → Supabase
- [ ] Groq API integration (Llama 3.3)
- [ ] System prompt builder
- [ ] Catalog search function

### **Week 3: Features (Days 15-21)**

- [ ] Real-time inbox updates
- [ ] Human takeover database sync
- [ ] Pinecone RAG setup
- [ ] Cal.com webhook integration

### **Week 4: Polish & Launch (Days 22-30)**

- [ ] Mobile testing
- [ ] Error handling
- [ ] Documentation
- [ ] Pilot clinic onboarding

---

## 📞 **Support & Resources**

### **Key Technologies:**

- **Next.js 16** - React framework for web apps ([docs](https://nextjs.org/docs))
- **Supabase** - Database + auth ([docs](https://supabase.com/docs))
- **Tailwind CSS** - Styling ([docs](https://tailwindcss.com/docs))
- **TypeScript** - Type-safe JavaScript ([docs](https://www.typescriptlang.org/docs))

### **External Services:**

- **Groq** - Ultra-fast AI inference ([groq.com](https://groq.com))
- **n8n** - Workflow automation ([n8n.io](https://n8n.io))
- **Pinecone** - Vector database ([pinecone.io](https://www.pinecone.io))
- **Railway** - Hosting ([railway.app](https://railway.app))

---

## 🎓 **Learning Path**

### **For Non-Developers:**

1. **Understand the Flow:** Patient → WhatsApp → AI → Database → Inbox
2. **Test Mock Mode:** Log in as `benson@zuri.clinic` and explore
3. **Customize Catalog:** Add/remove treatments in Settings
4. **Toggle AI Mode:** Practice switching between AI and Human in Inbox

### **For Developers:**

1. **Read database schema:** Understand the 6 core tables
2. **Trace a message:** Follow a chat from `inbox/page.tsx` → API → database
3. **Modify UI:** Change colors in `globals.css` or `SidebarLayout.tsx`
4. **Add new field:** Practice by adding "clinic_address" column

---

## 📝 **Glossary**

- **RLS:** Row Level Security (database access control)
- **RAG:** Retrieval Augmented Generation (AI with custom knowledge)
- **Webhook:** Automatic notification when an event happens
- **Takeover:** When a human disables AI and replies manually
- **Thread:** A conversation with one patient
- **Seeding:** Adding sample data to test with
- **Latency:** Response time (how fast AI replies)
- **Groq:** Company that runs Llama AI super fast
- **Llama 3.3 70B:** The specific AI model (70 billion parameters)

---

**🎉 Congratulations!** You now understand every file in the BassirAI project. The system is 70% complete—the UI, database, and mock mode work perfectly. The remaining 30% is connecting real WhatsApp, Groq AI, and Pinecone RAG (which follows the blueprint in the PDF).
