# 🚀 n8n Deployment & Integration Guide

**Last Updated:** August 13, 2026  
**Status:** Production Ready  
**Estimated Time:** 15 minutes

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] GitHub account (for Railway deployment)
- [ ] Google account (for Sheets & Gmail)
- [ ] Groq API account ([console.groq.com](https://console.groq.com))
- [ ] Meta Developer account (for WhatsApp/Instagram/Facebook)
- [ ] Access to your Supabase project

---

## 🎯 Deployment Options

### Option 1: Railway (Recommended - 5 minutes)

**Why Railway?**

- One-click deployment
- Automatic HTTPS
- Free tier available
- Easy environment variables management

**Steps:**

1. **Deploy n8n to Railway**

   ```
   1. Go to: https://railway.app
   2. Click "New Project" → "Deploy n8n"
   3. Connect your GitHub account
   4. Click "Deploy"
   ```

2. **Configure Environment Variables**

   In Railway dashboard, add these variables:

   ```env
   N8N_ENCRYPTION_KEY=generate-random-32-char-key
   N8N_HOST=your-app-name.railway.app
   WEBHOOK_URL=https://your-app-name.railway.app
   N8N_EDITOR_BASE_URL=https://your-app-name.railway.app
   EXECUTIONS_DATA_SAVE_ON_ERROR=all
   EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
   EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
   ```

3. **Get Your Railway URL**

   After deployment, Railway will provide:

   ```
   https://your-app-name.railway.app
   ```

4. **Access n8n**

   Open the URL and create your admin account.

---

### Option 2: Docker (Self-hosted - 10 minutes)

**Why Docker?**

- Full control
- Run on your own server
- No external dependencies

**Steps:**

1. **Navigate to Docker folder**

   ```bash
   cd bassirai-mvp/docker
   ```

2. **Update .env file**

   ```bash
   # Edit bassirai-mvp/docker/.env
   N8N_HOST=your-domain.com
   N8N_PORT=5678
   N8N_ENCRYPTION_KEY=your-random-key
   ```

3. **Start Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Access n8n**
   ```
   http://localhost:5678
   ```

---

## 🔧 Configure n8n Workflow

### Step 1: Import Workflow

1. Open n8n web interface
2. Click **Workflows** → **Import from File**
3. Select: `bassirai-mvp/n8n-workflows/BassirAI-n8n.json`
4. Click **Import**

### Step 2: Add Credentials

#### 2.1 Groq API Credential

1. In n8n, go to **Credentials** → **New**
2. Search for "HTTP Header Auth"
3. Name: `Groq API`
4. Add header:
   - **Name:** `Authorization`
   - **Value:** `Bearer YOUR_GROQ_API_KEY`
5. Get API key from: https://console.groq.com/keys
6. Click **Save**

#### 2.2 Google Sheets OAuth2

1. Go to **Credentials** → **New**
2. Search for "Google Sheets API"
3. Click **Connect my account**
4. Authorize with your Google account
5. Share this sheet with your account:
   ```
   https://docs.google.com/spreadsheets/d/1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w/edit
   ```

#### 2.3 Gmail OAuth2

1. Go to **Credentials** → **New**
2. Search for "Gmail"
3. Click **Connect my account**
4. Authorize with your Gmail account

### Step 3: Configure Workflow Nodes

1. **Open the imported workflow**
2. **For each Groq AI node:**
   - Click the node
   - Select credential: "Groq API"
   - Verify model: `llama-3.3-70b-versatile`

3. **For Google Sheets node:**
   - Click the node
   - Select credential: "Google Sheets account"
   - Verify Sheet ID: `1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w`

4. **For Gmail node:**
   - Click the node
   - Select credential: "Gmail account"
   - Update recipient: `your-clinic-email@example.com`

### Step 4: Activate Workflow

1. Click the **toggle switch** at top right
2. Status should change to "Active"
3. Note the webhook URL (you'll need this next)

---

## 🔗 Connect to Frontend

### Step 1: Get Webhook URL

1. In n8n workflow, click "Incoming Message Webhook" node
2. Copy the **Production URL**:
   ```
   https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
   ```

### Step 2: Update Frontend Environment

1. **Edit** `frontend/.env.local`:

   ```env
   # n8n Integration
   N8N_WEBHOOK_URL=https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
   ```

2. **Restart your Next.js app:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📱 Configure Meta Platforms

### WhatsApp Business API

1. **Go to Meta Developer Console**
   - Visit: https://developers.facebook.com
   - Select your app

2. **Navigate to WhatsApp Configuration**
   - Click **WhatsApp** → **Configuration**

3. **Set Webhook**
   - **Callback URL:** `https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3`
   - **Verify Token:** `bassir_ai_verify_token_2026`
   - Click **Verify and Save**

4. **Subscribe to Events**
   - Enable: `messages`
   - Enable: `message_status`

### Instagram Messaging

1. **In Meta Developer Console**
   - Select your app → **Instagram** → **Configuration**

2. **Set Webhook**
   - Use the SAME webhook URL from WhatsApp
   - **Verify Token:** `bassir_ai_verify_token_2026`

3. **Subscribe to Events**
   - Enable: `messages`
   - Enable: `messaging_postbacks`

### Facebook Messenger

1. **In Meta Developer Console**
   - Select your app → **Messenger** → **Settings**

2. **Set Webhook**
   - Use the SAME webhook URL
   - **Verify Token:** `bassir_ai_verify_token_2026`

3. **Subscribe to Events**
   - Enable: `messages`
   - Enable: `messaging_postbacks`

---

## 🧪 Test Integration

### Test 1: Manual Webhook Test

In n8n:

1. Click **Execute Workflow** button
2. Paste this test payload:

```json
{
  "userId": "test-patient-123",
  "name": "Ahmed Ali",
  "phone": "+971501234567",
  "channel": "whatsapp",
  "language": "en",
  "message": "Hello, I want to book a Botox consultation for next Thursday."
}
```

3. Click **Execute**

**Expected Result:**

- ✅ Intent classified as "booking"
- ✅ Booking details extracted
- ✅ Row added to Google Sheets
- ✅ AI response generated
- ✅ Message saved to database

### Test 2: From Inbox UI

1. **Open your app:** `http://localhost:3000/inbox`
2. **Click:** "Simulate Message" → "Botox Cost Inquiry"
3. **Verify:**
   - Message appears in inbox
   - AI responds within 2 seconds
   - Message saved to database

### Test 3: Real WhatsApp Message

1. **Send a test message** to your WhatsApp Business number:

   ```
   Hi, how much is Botox?
   ```

2. **Check n8n execution log**
   - Go to n8n → **Executions**
   - Verify successful execution

3. **Check your inbox**
   - Message should appear in frontend
   - AI response should be generated

---

## 📊 Monitor & Debug

### n8n Execution Logs

**View all executions:**

1. Go to n8n → **Executions** tab
2. Filter by success/error
3. Click any execution to see:
   - Input data
   - Output data
   - Node execution details

**Enable debug mode:**

```env
# Add to Railway environment variables
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
N8N_LOG_LEVEL=debug
```

### Google Sheets Dashboard

Track all bookings:
https://docs.google.com/spreadsheets/d/1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w/edit

**Columns tracked:**

- Booking ID
- Patient Name
- Phone Number
- Service
- Preferred Date/Time
- Status
- Channel
- Created At

### Database Monitoring

**Check messages in Supabase:**

```sql
-- View recent messages
SELECT
  m.*,
  c.patient_name,
  c.patient_phone,
  c.channel
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE m.created_at > NOW() - INTERVAL '1 hour'
ORDER BY m.created_at DESC;
```

**Check conversation status:**

```sql
-- View active conversations
SELECT *
FROM conversations
WHERE status = 'active'
AND last_message_at > NOW() - INTERVAL '24 hours'
ORDER BY last_message_at DESC;
```

---

## 🐛 Troubleshooting

### Issue: Webhook not receiving messages

**Solution:**

1. **Verify webhook is active**
   - Check workflow toggle is ON in n8n
   - Test webhook directly:
     ```bash
     curl -X POST https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3 \
       -H "Content-Type: application/json" \
       -d '{"message":"test"}'
     ```

2. **Check Meta webhook configuration**
   - Verify callback URL is correct
   - Ensure verify token matches: `bassir_ai_verify_token_2026`
   - Check app is in **Production mode** (not Development)

3. **Review n8n logs**
   - Go to Executions → filter by errors
   - Check webhook trigger logs

### Issue: Groq API errors

**Solution:**

1. **Verify API key**
   - Check key at: https://console.groq.com/keys
   - Ensure key has not expired
   - Test with curl:
     ```bash
     curl https://api.groq.com/openai/v1/chat/completions \
       -H "Authorization: Bearer YOUR_KEY" \
       -H "Content-Type: application/json" \
       -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"test"}]}'
     ```

2. **Check rate limits**
   - Free tier: 30 requests/minute
   - Upgrade if hitting limits

3. **Verify model name**
   - Must be: `llama-3.3-70b-versatile`
   - Check for typos in workflow

### Issue: Messages not syncing to database

**Solution:**

1. **Verify N8N_WEBHOOK_URL in frontend**

   ```bash
   # Check frontend/.env.local
   cat frontend/.env.local | grep N8N_WEBHOOK_URL
   ```

2. **Test webhook endpoint**

   ```bash
   curl http://localhost:3000/api/webhooks/n8n-incoming \
     -H "Content-Type: application/json" \
     -d '{"patient_phone":"+234","channel":"whatsapp","message":"test","clinic_id":"YOUR_CLINIC_ID"}'
   ```

3. **Check Supabase RLS policies**
   - Ensure service role can insert
   - Verify clinic_id matches

### Issue: Google Sheets access denied

**Solution:**

1. **Re-authenticate credential**
   - Go to n8n → Credentials
   - Delete old Google Sheets credential
   - Add new credential
   - Re-authorize

2. **Share sheet with correct account**
   - Open sheet
   - Click Share
   - Add the email used for n8n OAuth

3. **Verify sheet ID**
   - Should be: `1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w`

---

## ✅ Production Checklist

Before going live, verify:

### n8n Configuration

- [ ] Workflow imported successfully
- [ ] All 3 credentials configured (Groq, Sheets, Gmail)
- [ ] Workflow activated (toggle is ON)
- [ ] Test execution passed
- [ ] Production URL noted

### Frontend Integration

- [ ] `N8N_WEBHOOK_URL` set in `.env.local`
- [ ] Frontend restarted after env change
- [ ] Test from inbox UI passed
- [ ] Real-time updates working

### Meta Platforms

- [ ] WhatsApp webhook configured
- [ ] Instagram webhook configured
- [ ] Facebook webhook configured
- [ ] All apps in Production mode
- [ ] Test messages sent and received

### Database

- [ ] Messages table has recent entries
- [ ] Conversations updating correctly
- [ ] RLS policies working
- [ ] Real-time subscriptions active

### Monitoring

- [ ] Google Sheets tracking bookings
- [ ] Email notifications working
- [ ] n8n execution logs accessible
- [ ] Database queries optimized

---

## 🎉 Success!

Your n8n integration is now complete and production-ready!

**What you've achieved:**

- ✅ Automated patient communication on WhatsApp/Instagram/Facebook
- ✅ AI-powered intent classification and response generation
- ✅ Automatic booking extraction and logging
- ✅ Real-time inbox updates
- ✅ Seamless human takeover capability

**Next steps:**

1. Monitor first few conversations
2. Adjust AI prompts if needed
3. Add custom FAQs for your clinic
4. Train staff on human takeover feature

---

## 📞 Support

**Need help?**

- n8n Documentation: https://docs.n8n.io
- Groq API Docs: https://console.groq.com/docs
- BassirAI Support: tsd@naskamireglobal.com

**Common Resources:**

- n8n Community: https://community.n8n.io
- Meta Developer Docs: https://developers.facebook.com/docs
- Railway Support: https://railway.app/help

---

**Last Updated:** August 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
