# ⚡ Quick Start Guide - BassirAI

## 🎯 **30-Second Overview**

BassirAI = Smart AI receptionist for aesthetic clinics. Responds to patient WhatsApp messages in <1 second.

---

## 🚀 **Run in 3 Commands**

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000/login  
Login: `benson@zuri.clinic` (any password)

---

## 📱 **Test the Core Features**

### **1. View Dashboard** (5 seconds)

- ✅ See 4 stat cards (142 conversations, 91.4% AI rate, etc.)
- ✅ Check recent patient list

### **2. Manage Inbox** (30 seconds)

```
Steps:
1. Click "Open Live Inbox" button
2. Click on "Chioma Adebayo" thread
3. Toggle "Human Takeover" switch → Message input activates
4. Click "Simulate Message" → Select "How much is Botox?"
5. Watch AI auto-reply appear after 1.5s (if AI mode is ON)
```

### **3. Configure Settings** (2 minutes)

```
Steps:
1. Click "Settings" in sidebar
2. Click "+ Add Service" button
3. Fill in:
   - Name: "Botox Forehead"
   - Price: "₦180,000 - ₦300,000"
   - Description: "Reduces horizontal lines"
4. Click "Save Settings"
5. Success message appears
```

---

## 🔧 **Troubleshooting**

### **Problem:** "Cannot find module error"

```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Problem:** "Port 3000 already in use"

```bash
# Solution: Kill existing process
npx kill-port 3000
# OR run on different port
npm run dev -- -p 3001
```

### **Problem:** "Build fails"

```bash
# Solution: Check TypeScript errors
npx tsc --noEmit
# Fix any errors shown
```

---

## 📂 **Key Files to Know**

| File                                   | What It Does                          |
| -------------------------------------- | ------------------------------------- |
| `frontend/src/app/inbox/page.tsx`      | **CORE** - Chat management interface  |
| `frontend/src/utils/supabase/admin.ts` | Database connection with admin powers |
| `frontend/.env.local`                  | Secret keys (Supabase URLs, API keys) |
| `bassirai-mvp/database/schema.sql`     | Creates database tables               |
| `bassirai-mvp/database/seed.sql`       | Sample data for testing               |

---

## 🎓 **Learning Path**

### **Day 1: Explore UI**

- ✅ Log in and click around
- ✅ Test Human Takeover toggle
- ✅ Add a fake treatment in Settings

### **Day 2: Understand Database**

```sql
-- Open Supabase SQL Editor
SELECT * FROM clinics;
SELECT * FROM conversations;
SELECT * FROM messages;
```

### **Day 3: Modify Code**

```typescript
// Try changing colors in globals.css
// Try adding a new stat card in dashboard/page.tsx
// Try modifying AI tone in settings/page.tsx
```

---

## 🚀 **Deploy to Production**

### **Vercel (5 minutes):**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Add environment variables in Vercel dashboard:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **Railway (3 clicks):**

```
1. Push code to GitHub
2. Go to railway.app → "New Project" → "Deploy from GitHub"
3. Add environment variables
4. Click "Deploy"
```

---

## 📊 **Current Status**

| Feature         | Status      | Notes                                     |
| --------------- | ----------- | ----------------------------------------- |
| Login System    | ✅ Working  | Mock mode bypass available                |
| Dashboard       | ✅ Working  | Shows fake stats                          |
| Inbox UI        | ✅ Working  | 3 sample patient threads                  |
| Human Takeover  | ✅ Working  | Toggle AI/Human mode                      |
| Settings        | ✅ Working  | Saves to localStorage (mock) or DB (live) |
| Database Schema | ✅ Complete | 6 tables with RLS policies                |
| API Routes      | ✅ Complete | All endpoints implemented                 |
| WhatsApp API    | ⏳ Pending  | Needs n8n workflow setup                  |
| Groq AI         | ⏳ Pending  | Needs API key integration                 |
| Pinecone RAG    | ⏳ Pending  | Needs vector store setup                  |

---

## 🆘 **Get Help**

### **Read Detailed Guides:**

- [COMPREHENSIVE_GUIDE.md](./COMPREHENSIVE_GUIDE.md) - Explains every file in layman terms
- [ERRORS_FIXED_CHECKLIST.md](./ERRORS_FIXED_CHECKLIST.md) - Testing checklist
- [README.md](./README.md) - Full documentation

### **Check Common Errors:**

```bash
# TypeScript errors
npm run build

# Linting warnings
npx eslint src

# Module not found
npm install

# Database connection issues
# Check .env.local has correct SUPABASE_URL (no /rest/v1/ at end)
```

---

## 🎯 **Next Steps**

### **To Make It Production-Ready:**

1. **Connect Real WhatsApp** (2 hours)
   - Follow `bassirai-mvp/n8n-workflows/n8n_integration_guide.md`
   - Set up webhook in Meta Developer Portal
   - Deploy n8n instance on Railway

2. **Integrate Groq AI** (1 hour)
   - Get API key from groq.com
   - Add to n8n workflow
   - Test response generation

3. **Setup Pinecone RAG** (2 hours)
   - Create index at pinecone.io
   - Upload clinic documents (pricing PDFs)
   - Connect to n8n workflow

4. **Configure Cal.com** (30 minutes)
   - Create booking page
   - Add webhook to n8n
   - Test appointment sync

---

## 📝 **Cheat Sheet**

### **Important Commands:**

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check for errors
npm run lint

# Clear cache
rm -rf .next
```

### **Important URLs:**

- Dev: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Inbox: http://localhost:3000/inbox
- Settings: http://localhost:3000/settings

### **Mock Login Credentials:**

- Email: `benson@zuri.clinic` (Admin)
- Email: `temi@zuri.clinic` (Receptionist)
- Password: (anything works in mock mode)

---

**🎉 You're all set! Start with `npm run dev` and explore the inbox.**

---

## 💡 **Pro Tips**

1. **Always check browser console** (F12) for errors
2. **Use React DevTools** to inspect component state
3. **Check Network tab** to see API calls
4. **Use Supabase dashboard** to view database tables
5. **Read COMPREHENSIVE_GUIDE.md** for deep understanding

---

**Questions? Check the full docs or ask in the Discord community!**
