# BassirAI Environment Setup Guide

This guide walks you through setting up all required API keys and environment variables for production deployment.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Supabase project created
- ✅ Git repository access
- ✅ Access to your domain/hosting provider

---

## 🔐 Step 1: Secure Your Supabase Credentials

### URGENT: Your credentials are exposed in Git!

**Current Risk:** Your Supabase keys in `frontend/.env.local` are committed to git and publicly visible.

**Immediate Actions:**

```bash
# 1. Navigate to your project root
cd /path/to/bassirai

# 2. Remove the exposed file from git tracking
git rm --cached frontend/.env.local

# 3. Commit the removal
git commit -m "security: Remove exposed environment variables"

# 4. Push the change
git push

# 5. Rotate your Supabase keys immediately:
```

**To Rotate Supabase Keys:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kwqzlqpijmzxfudmorvn`
3. Navigate to **Settings → API**
4. Click **Regenerate API Keys**
5. Save the new keys securely (we'll use them in Step 3)

---

## 🔑 Step 2: Obtain Required API Keys

### A. OpenAI API Key (for Embeddings)

**Purpose:** Generates embeddings for RAG (Retrieval Augmented Generation)

**How to Get:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Name it: `BassirAI - Embeddings`
6. Copy the key (starts with `sk-proj-`)

**Cost Estimate:** ~$0.0001 per 1K tokens (very cheap for embeddings)

---

### B. Pinecone API Key (Vector Database)

**Purpose:** Stores and retrieves embeddings for AI knowledge base

**How to Get:**

1. Go to [pinecone.io](https://www.pinecone.io)
2. Sign up for free account (free tier includes 100K vectors)
3. Navigate to **API Keys** in dashboard
4. Copy your API key
5. Create a new index:
   - Index name: `bassirai-index`
   - Dimensions: `1536` (for OpenAI embeddings)
   - Metric: `cosine`
   - Region: Choose closest to your users (e.g., `us-east-1`)

**Important:** Save both the API key AND the index name (`bassirai-index`)

---

### C. Groq API Key (Llama Inference)

**Purpose:** Powers the AI chatbot responses using Llama models

**How to Get:**

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Name it: `BassirAI - Production`
6. Copy the key (starts with `gsk_`)

**Why Groq?** Ultra-fast Llama inference (10x faster than standard APIs)

---

### D. WhatsApp Cloud API Credentials

**Purpose:** Send and receive WhatsApp messages from patients

**How to Get:**

#### Option 1: Meta Business Suite (Production)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app or use existing
3. Add **WhatsApp** product
4. Go to **WhatsApp → Getting Started**
5. Generate a **Permanent Access Token**:
   - Temporary tokens expire in 24 hours
   - Permanent tokens are required for production
6. Copy:
   - **Access Token** (WHATSAPP_TOKEN)
   - **Phone Number ID** (WHATSAPP_PHONE_ID)

#### Option 2: Test with Demo Account (Development)

```
WHATSAPP_TOKEN=test_token_replace_later
WHATSAPP_PHONE_ID=test_phone_id_replace_later
```

**Important Notes:**

- You need a **verified Meta Business Account**
- Your WhatsApp Business number must be verified
- Follow [WhatsApp Business Platform Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

### E. n8n Configuration

**Purpose:** Workflow automation for AI responses and integrations

#### n8n Encryption Key

Generate a secure random key:

```bash
# On Mac/Linux:
openssl rand -hex 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the generated key - this encrypts sensitive data in n8n.

#### n8n Host URL

- **Local Development:** `http://localhost:5678`
- **Production:** Your deployed n8n instance URL (e.g., `https://n8n.yourdomain.com`)

**Setting up n8n:**

```bash
# Navigate to n8n docker folder
cd bassirai-mvp/docker

# Start n8n container
docker-compose up -d

# Access at http://localhost:5678
```

---

## 📝 Step 3: Configure Environment Files

### A. Backend Environment (`bassirai-mvp/.env`)

Create this file from the example:

```bash
cd bassirai-mvp
cp .env.example .env
```

Edit `.env` and fill in your keys:

```bash
# Database (Supabase PostgreSQL)
DB_USER=postgres
DB_PASSWORD=<your-supabase-db-password>
DB_NAME=postgres
DB_PORT=5432

# Supabase Integration
SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
SUPABASE_ANON_KEY=<your-NEW-anon-key-from-step-1>
SUPABASE_SERVICE_ROLE_KEY=<your-NEW-service-role-key-from-step-1>

# OpenAI Embeddings
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxx

# Pinecone Vector DB
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_INDEX_NAME=bassirai-index

# Groq Llama API
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp Cloud API
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345

# n8n Configuration
N8N_ENCRYPTION_KEY=<generated-key-from-step-2e>
N8N_HOST=http://localhost:5678
```

---

### B. Frontend Environment (`frontend/.env.local`)

Create a new `.env.local` file (DO NOT use the old one):

```bash
cd frontend
rm .env.local  # Remove the exposed file
touch .env.local  # Create new file
```

Add these variables:

```bash
# Supabase (Public - safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://kwqzlqpijmzxfudmorvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-NEW-anon-key-from-step-1>

# Supabase Service Role (Private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=<your-NEW-service-role-key-from-step-1>

# AI Keys (Private - server-side only)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxx
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_INDEX_NAME=bassirai-index
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp (Private - server-side only)
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345

# n8n
N8N_ENCRYPTION_KEY=<generated-key-from-step-2e>
N8N_HOST=http://localhost:5678
```

**Security Note:** Only variables with `NEXT_PUBLIC_` prefix are exposed to the browser. Keep API keys private by NOT using this prefix.

---

### C. Docker Environment (`bassirai-mvp/docker/.env`)

This file is for running n8n via Docker:

```bash
cd bassirai-mvp/docker
```

Edit `.env` file:

```bash
N8N_ENCRYPTION_KEY=<generated-key-from-step-2e>
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

# Database connection for n8n
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<your-supabase-host>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=<your-supabase-db-password>
```

---

## ✅ Step 4: Verify Configuration

### Test Environment Variables

```bash
# In frontend directory
cd frontend

# Check if variables are loaded
npm run dev

# You should see no errors about missing environment variables
```

### Test API Connectivity

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-08-11T...",
  "components": {
    "database": "connected",
    "api": "healthy"
  }
}
```

### Test Supabase Connection

```bash
# Test clinic registration (in browser console or Postman)
POST http://localhost:3000/api/clinics/register
{
  "clinicName": "Test Clinic",
  "adminEmail": "test@example.com"
}

# Should return: { "clinicId": "...", "success": true }
```

---

## 🔒 Step 5: Secure Your Configuration

### Add to .gitignore

Verify these files are in `.gitignore`:

```bash
# Environment files (NEVER commit these!)
.env
.env.local
.env*.local
bassirai-mvp/.env
bassirai-mvp/docker/.env
frontend/.env.local

# Database credentials
*.pem
*.key
*.cert
```

### Use Environment Variable Management

#### Development:

- Store variables in `.env.local` (already done)

#### Production (Vercel):

1. Go to your project in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable one by one
4. Mark sensitive keys as **Sensitive** (they'll be encrypted)

#### Production (Other hosts):

- Use host-provided environment variable management
- Or use tools like [Doppler](https://doppler.com) or [Infisical](https://infisical.com)

---

## 🧪 Step 6: Test Each Integration

### Test OpenAI Embeddings

```bash
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Test embedding",
    "model": "text-embedding-ada-002"
  }'
```

### Test Pinecone

```bash
curl https://YOUR_INDEX-YOUR_PROJECT.svc.YOUR_ENV.pinecone.io/describe_index_stats \
  -H "Api-Key: YOUR_PINECONE_API_KEY"
```

### Test Groq

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Test WhatsApp

Follow [Meta's test guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#send-test-message)

---

## 🚨 Common Issues

### "Missing environment variable" error

- **Cause:** Variable not in `.env.local` or typo in variable name
- **Fix:** Check file exists and variable names match exactly

### "Invalid API key" error

- **Cause:** Expired or incorrect key
- **Fix:** Regenerate key from provider dashboard

### "Database connection failed"

- **Cause:** Wrong Supabase credentials or RLS blocking access
- **Fix:** Verify `SUPABASE_URL` and regenerated keys

### n8n workflows not triggering

- **Cause:** n8n not running or wrong N8N_HOST
- **Fix:** Ensure Docker container is running: `docker ps | grep n8n`

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Pinecone Quickstart](https://docs.pinecone.io/docs/quickstart)
- [Groq Documentation](https://console.groq.com/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [n8n Documentation](https://docs.n8n.io)

---

## ✅ Checklist

- [ ] Removed exposed `.env.local` from git
- [ ] Rotated Supabase API keys
- [ ] Obtained OpenAI API key
- [ ] Created Pinecone index and got API key
- [ ] Got Groq API key
- [ ] Set up WhatsApp Business API
- [ ] Generated n8n encryption key
- [ ] Created `bassirai-mvp/.env` file
- [ ] Created new `frontend/.env.local` file
- [ ] Configured `bassirai-mvp/docker/.env` file
- [ ] Verified all variables in `.gitignore`
- [ ] Tested health endpoint
- [ ] Tested database connection
- [ ] Tested OpenAI API
- [ ] Tested Pinecone API
- [ ] Tested Groq API
- [ ] Tested WhatsApp API (optional for dev)

---

**Next Steps:** Once all API keys are configured, proceed to `PRODUCTION_READY_CHECKLIST.md` for security hardening and deployment preparation.
