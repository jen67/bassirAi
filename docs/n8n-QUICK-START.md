# ⚡ n8n Integration - Quick Start

**🎯 Goal:** Get your AI-powered inbox running in 15 minutes

---

## Step 1: Deploy n8n (5 min)

### Railway (Recommended):

1. Go to: https://railway.app/template/n8n
2. Click "Deploy" → Connect GitHub
3. Add environment variables:
   ```
   N8N_ENCRYPTION_KEY=your-random-32-char-key
   N8N_HOST=your-app.railway.app
   WEBHOOK_URL=https://your-app.railway.app
   ```
4. Wait for deployment
5. Open URL and create admin account

---

## Step 2: Import Workflow (3 min)

1. In n8n, click **Workflows** → **Import**
2. Select: `bassirai-mvp/n8n-workflows/BassirAI-n8n.json`
3. Click **Save**

---

## Step 3: Add Credentials (5 min)

### Groq API:

1. Get key from: https://console.groq.com/keys
2. In n8n: **Credentials** → **New** → **HTTP Header Auth**
3. Name: `Authorization`, Value: `Bearer YOUR_KEY`

### Google Sheets:

1. **Credentials** → **New** → **Google Sheets**
2. Click **Connect my account**
3. Share this sheet: https://docs.google.com/spreadsheets/d/1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w/edit

### Gmail:

1. **Credentials** → **New** → **Gmail**
2. Click **Connect my account**

---

## Step 4: Update Frontend (2 min)

1. Edit `frontend/.env.local`:

   ```env
   N8N_WEBHOOK_URL=https://your-n8n.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
   ```

2. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Step 5: Test (1 min)

1. Open inbox: http://localhost:3000/inbox
2. Click "Simulate Message" → "Botox Cost Inquiry"
3. ✅ AI should respond within 2 seconds

---

## ✅ You're Done!

Your AI inbox is now powered by n8n!

**Next:** Configure Meta webhooks for real WhatsApp/Instagram/Facebook messages

**See:** `bassirai-mvp/n8n-workflows/N8N_DEPLOYMENT_GUIDE.md`

---

## 🐛 Troubleshooting

**Webhook not working?**

- Check workflow is activated (toggle ON)
- Verify N8N_WEBHOOK_URL in `.env.local`

**Groq API error?**

- Verify API key at console.groq.com
- Check rate limits (30 req/min on free tier)

**Messages not syncing?**

- Check Supabase connection
- Verify RLS policies allow inserts

---

## 📚 Full Documentation

- Complete guide: `bassirai-mvp/n8n-workflows/N8N_INTEGRATION_COMPLETE_GUIDE.md`
- Testing guide: `docs/N8N_TESTING_GUIDE.md`
- Integration summary: `docs/N8N_INTEGRATION_SUMMARY.md`

---

**🎉 Happy automating!**
