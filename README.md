# 🏥 BassirAI - AI Patient Communication Platform

**Smart, multilingual AI receptionist for aesthetic clinics in Africa**

[![Status](https://img.shields.io/badge/Status-MVP_Complete-success)](/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-black)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-Groq_Llama_3.3-purple)](https://groq.com)

---

## 🎯 **What is BassirAI?**

BassirAI is an **AI-powered patient communication system** for aesthetic medical clinics. When patients message on WhatsApp asking "How much is Botox?", an AI responds **in under 1 second** with accurate pricing in Naira (₦). If the AI can't handle a complex question, a human receptionist takes over seamlessly.

### **Key Features:**

- 🤖 **Sub-second AI responses** via Groq Llama 3.3 70B
- 💬 **Unified inbox** for WhatsApp, Instagram, Facebook
- 🌍 **Built for Africa:** Lagos/Lekki context, Naira pricing
- 🔄 **Human takeover** toggle for complex inquiries
- 📊 **Real-time dashboard** with conversion metrics
- 💰 **$0/month** hosting cost (free-tier tools)

---

## 📸 **Screenshots**

### Dashboard

<img src="docs/dashboard-preview.png" alt="Dashboard" width="800"/>

### Unified Inbox

<img src="docs/inbox-preview.png" alt="Inbox" width="800"/>

---

## 🚀 **Quick Start**

### **Prerequisites:**

- Node.js 20+
- npm or yarn
- (Optional) Supabase account

### **1. Clone & Install:**

```bash
git clone <your-repo-url>
cd bassirai
cd frontend
npm install
```

### **2. Configure Environment:**

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
```

### **3. Run Development Server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **4. Test in Mock Mode:**

- Go to `/login`
- Enter: `benson@zuri.clinic` (any password)
- Explore dashboard, inbox, settings!

---

## 📁 **Project Structure**

```
bassirai/
├── bassirai-mvp/                 ← Database & n8n workflow files
│   ├── database/
│   │   ├── schema.sql            ← PostgreSQL table definitions
│   │   ├── rls-policies.sql      ← Row-level security rules
│   │   └── seed.sql              ← Sample data (Zuri Clinic)
│   ├── n8n-workflows/            ← WhatsApp → AI automation
│   └── docker/                   ← Local dev environment
│
├── frontend/                     ← Main Next.js application
│   ├── src/
│   │   ├── app/                  ← Pages & API routes
│   │   │   ├── login/            ← Authentication
│   │   │   ├── dashboard/        ← Analytics overview
│   │   │   ├── inbox/            ← Chat management (CORE)
│   │   │   ├── settings/         ← Configuration
│   │   │   └── api/              ← Backend endpoints
│   │   ├── components/           ← React components
│   │   │   └── SidebarLayout.tsx ← Navigation wrapper
│   │   └── utils/                ← Helper functions
│   │       └── supabase/         ← Database clients
│   ├── public/                   ← Static assets
│   ├── package.json              ← Dependencies
│   └── .env.local                ← Environment variables
│
├── bassirai-figma-design/        ← HTML/CSS prototype
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── COMPREHENSIVE_GUIDE.md        ← Layman explanations of every file
├── ERRORS_FIXED_CHECKLIST.md     ← Testing & verification guide
└── README.md                     ← This file
```

---

## 🗄️ **Database Schema**

### **Core Tables:**

| Table                   | Purpose             | Key Fields                                |
| ----------------------- | ------------------- | ----------------------------------------- |
| `clinics`               | Clinic profiles     | name, email, phone, ai_mode               |
| `users`                 | Staff accounts      | clinic_id, email, role                    |
| `conversations`         | Patient threads     | patient_phone, channel, is_human_takeover |
| `messages`              | Individual messages | content, direction, is_ai_generated       |
| `clinic_customizations` | AI settings         | catalog (JSONB), faqs (JSONB)             |
| `appointments`          | Booking records     | patient_name, procedure, status           |

### **Setup:**

```bash
# 1. Create Supabase project at supabase.com
# 2. Run SQL in Supabase SQL Editor:
cat bassirai-mvp/database/schema.sql | pbcopy
# Paste into Supabase SQL Editor → Run

# 3. Apply RLS policies:
cat bassirai-mvp/database/rls-policies.sql | pbcopy
# Paste → Run

# 4. Seed sample data:
cat bassirai-mvp/database/seed.sql | pbcopy
# Paste → Run
```

---

## 🔐 **Environment Variables**

Create `frontend/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional: Groq AI (for production)
GROQ_API_KEY=gsk_...

# Optional: n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

**Important:** Never commit `.env.local` to Git!

---

## 🧪 **Testing**

### **Manual Testing:**

```bash
# 1. Login
Visit: http://localhost:3000/login
Email: benson@zuri.clinic
Password: (anything in mock mode)

# 2. Dashboard
✅ Verify 4 stat cards display
✅ Check recent conversations list

# 3. Inbox
✅ Click 3 patient threads
✅ Toggle "Human Takeover" switch
✅ Use "Simulate Message" button
✅ Type manual reply (when Human mode ON)

# 4. Settings
✅ Add treatment to catalog
✅ Add FAQ entry
✅ Save settings
```

### **Automated Testing:**

```bash
# Type check
npm run build

# Lint check
npx eslint src

# (TODO) Unit tests
npm run test
```

---

## 🌐 **Deployment**

### **Option 1: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
```

### **Option 2: Railway**

```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Railway dashboard
# 3. Add environment variables
# 4. Deploy
```

### **Option 3: Docker**

```bash
cd frontend
docker build -t bassirai .
docker run -p 3000:3000 bassirai
```

---

## 🔌 **Integrations**

### **WhatsApp Business API**

1. Get credentials from [Meta for Developers](https://developers.facebook.com/)
2. Set up webhook in n8n (see `bassirai-mvp/n8n-workflows/`)
3. Configure in Settings page

### **Groq AI (Llama 3.3)**

```bash
# Get API key from groq.com
export GROQ_API_KEY=gsk_...

# Add to n8n workflow:
# - Groq Chat Model node
# - Model: llama-3.3-70b-versatile
# - Temperature: 0.7
```

### **Pinecone (RAG Vector Store)**

```bash
# 1. Create index at pinecone.io
# 2. Upload clinic documents (pricing PDFs, FAQs)
# 3. Connect to n8n:
#    - Pinecone Vector Store node
#    - Namespace: zuri-lekki-ns
```

### **Cal.com (Booking)**

```bash
# 1. Create account at cal.com
# 2. Get API key
# 3. Set booking URL in Settings page
```

---

## 📊 **Architecture Flow**

```
┌─────────────────┐
│  Patient sends  │
│  WhatsApp msg   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  n8n Webhook    │ ← Receives POST from WhatsApp Cloud API
│  (Automation)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check DB:      │ ← Is is_human_takeover = true?
│  Human mode?    │
└────────┬────────┘
         │
     ┌───┴───┐
     │       │
     │   ┌───▼─────────────┐
     │   │  Groq API       │ ← AI generates reply
     │   │  (Llama 3.3)    │
     │   └───┬─────────────┘
     │       │
     │       ▼
     │   ┌─────────────────┐
     │   │  Pinecone RAG   │ ← Searches clinic knowledge
     │   │  (Vector Store) │
     │   └───┬─────────────┘
     │       │
     │   ┌───▼─────────────┐
     │   │  Send AI reply  │
     │   │  via WhatsApp   │
     │   └─────────────────┘
     │
     ▼
┌─────────────────┐
│  Queue for      │ ← Notify receptionist in Unified Inbox
│  Human Reply    │
└─────────────────┘
```

---

## 🛠️ **API Reference**

### **POST /api/chats/toggle-takeover**

Toggle AI/Human mode for a conversation.

**Request:**

```json
{
  "phone": "+234 803 123 4567",
  "takeover": true
}
```

**Response:**

```json
{
  "success": true,
  "is_human_takeover": true
}
```

---

### **POST /api/clinics/register**

Create a new clinic during registration.

**Request:**

```json
{
  "clinicName": "Zuri Aesthetic Clinic",
  "adminEmail": "admin@zuri.clinic"
}
```

**Response:**

```json
{
  "clinicId": "uuid-here",
  "success": true
}
```

---

### **POST /api/users/register**

Link auth user to clinic after signup.

**Request:**

```json
{
  "userId": "auth-user-id",
  "clinicId": "clinic-uuid",
  "email": "user@clinic.com",
  "fullName": "John Doe",
  "role": "clinic_admin"
}
```

**Response:**

```json
{
  "success": true
}
```

---

### **POST /api/clinics/onboard**

Save clinic settings (catalog, FAQs, etc.).

**Request:**

```json
{
  "userId": "auth-user-id",
  "clinicName": "Zuri Clinic",
  "aiTone": "professional",
  "catalog": [
    { "name": "Botox", "price": "₦180,000-300,000", "description": "..." }
  ],
  "faqs": [
    { "question": "Do you offer parking?", "answer": "Yes, free parking..." }
  ]
}
```

**Response:**

```json
{
  "success": true
}
```

---

## 📚 **Resources**

### **Documentation:**

- [Complete Layman Guide](./COMPREHENSIVE_GUIDE.md) - Explains every file
- [Errors Fixed Checklist](./ERRORS_FIXED_CHECKLIST.md) - Testing guide
- [MVP Blueprint PDF](./docs/mvp-bassirai.pdf) - Original spec

### **External Tools:**

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Groq API](https://console.groq.com/docs)
- [n8n Workflows](https://n8n.io/workflows)
- [Pinecone](https://docs.pinecone.io)

---

## 🤝 **Contributing**

### **How to Contribute:**

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Coding Standards:**

- Use TypeScript strict mode
- Follow ESLint rules
- Add comments for complex logic
- Write tests for new features

---

## 📝 **Changelog**

### **v1.0.0 - MVP Complete** (Current)

- ✅ Login system with mock mode
- ✅ Dashboard with analytics
- ✅ Unified Inbox with chat threads
- ✅ Human takeover toggle
- ✅ Settings page (catalog, FAQs)
- ✅ Responsive design
- ✅ Database schema & RLS policies
- ✅ API routes for all operations

### **v1.1.0 - Planned**

- ⏳ Real WhatsApp integration
- ⏳ Groq AI connection
- ⏳ Pinecone RAG setup
- ⏳ Cal.com booking flow
- ⏳ Real-time inbox updates

---

## 🐛 **Known Issues**

1. **No real-time updates** - Inbox requires manual refresh (waiting for Supabase Realtime integration)
2. **Mock mode data persistence** - Clears on logout (use Supabase for production)
3. **No pagination** - Inbox shows all conversations (add infinite scroll)
4. **No search** - Can't search conversations by patient name (add search bar)

---

## 📜 **License**

This project is licensed under the MIT License.

```
Copyright (c) 2026 BassirAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 **Acknowledgments**

- **Design Inspiration:** modmed.com, hyro.ai, healthtap.com
- **AI Provider:** Groq (Llama 3.3 70B inference)
- **Database:** Supabase (PostgreSQL + Auth)
- **Automation:** n8n (WhatsApp webhooks)
- **Hosting:** Railway/Vercel (free tier)

---

## 📞 **Support**

- 📧 Email: support@bassirai.com
- 💬 Discord: [Join Community](#)
- 🐦 Twitter: [@BassirAI](#)
- 📖 Docs: [bassirai.com/docs](#)

---

**🎉 Built with ❤️ for aesthetic clinics in Africa**

```
Made in Lagos 🇳🇬 | Powered by AI 🤖 | $0/month cost 💰
```
