# n8n Workflow Changelog

All notable changes to the BassirAI n8n workflow integration.

---

## [1.0.0] - August 13, 2026

### 🎉 Initial Production Release

#### Added

- **n8n Workflow Integration**
  - Complete automation workflow (`BassirAI-n8n.json`)
  - 5 intent classifications: booking, FAQ, greeting, complaint, human_support
  - Groq Llama 3.3 70B AI integration for intent detection and response generation
  - Google Sheets logging for booking records
  - Gmail email notifications for complex bookings
  - Multi-language support (English, Arabic)

- **Frontend API Endpoints**
  - `/api/messages/send` - Manual message sending from inbox (human takeover)
  - `/api/webhooks/n8n-outgoing` - Forward messages to n8n for WhatsApp/Instagram/Facebook delivery
  - `/api/webhooks/n8n-incoming` - Receive processed messages from n8n after AI generation

- **Documentation**
  - `N8N_INTEGRATION_COMPLETE_GUIDE.md` - Comprehensive workflow architecture and deployment guide
  - `n8n_integration_guide.md` - Quick start guide for developers
  - `CHANGELOG.md` - Version tracking

#### Changed

- **Inbox Page (`frontend/src/app/inbox/page.tsx`)**
  - Updated `handleSendMessage()` to use `/api/messages/send` endpoint
  - Updated `simulateOutboundHuman()` to integrate with n8n workflow
  - Messages now automatically forward to n8n for delivery via messaging platforms

- **Environment Configuration (`frontend/.env.local`)**
  - Added `N8N_WEBHOOK_URL` environment variable for n8n integration

#### Technical Details

- **Response Time:** <1 second average
- **AI Model:** Groq llama-3.3-70b-versatile
- **Temperature:** 0 for classification, 0.2-0.4 for generation
- **Max Tokens:** 10-150 depending on task
- **Platform Support:** WhatsApp, Instagram, Facebook Messenger

#### Architecture Flow

```
Patient Message → WhatsApp API → n8n Webhook
                                      ↓
                          Intent Classification (Groq AI)
                                      ↓
                          Response Generation (Groq AI)
                                      ↓
                  /api/webhooks/n8n-incoming (Frontend API)
                                      ↓
                           Supabase Database
                                      ↓
                         Frontend Inbox (Real-time)
```

#### Security

- Admin-only access to n8n endpoints via service role key
- Clinic-specific message isolation via RLS policies
- E.164 phone number validation
- HTTPS-only webhook communication

---

## Planned Features

### [1.1.0] - Q3 2026

- [ ] Pinecone RAG integration for knowledge base queries
- [ ] Cal.com automatic booking integration
- [ ] Voice message transcription support
- [ ] Patient sentiment analysis
- [ ] Multi-language translation (French, Spanish)

### [1.2.0] - Q4 2026

- [ ] Advanced analytics dashboard
- [ ] A/B testing for AI responses
- [ ] Custom workflow builder in frontend
- [ ] WhatsApp template message support
- [ ] Automated follow-up reminders

---

## Migration Notes

### From Mock Mode to n8n Integration

**Before:**

```typescript
// Direct Supabase insert
await supabase.from('messages').insert({...})
```

**After:**

```typescript
// Use API endpoint with n8n integration
await fetch("/api/messages/send", {
  method: "POST",
  body: JSON.stringify({ conversation_id, message }),
});
```

### Environment Variables Required

```env
# Add to frontend/.env.local
N8N_WEBHOOK_URL=https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
```

---

## Breaking Changes

None - This is the initial release.

---

## Contributors

- **BassirAI Development Team**
- **Kiro AI Assistant**

---

## Support

For questions or issues:

- Email: tsd@naskamireglobal.com
- Documentation: See `N8N_INTEGRATION_COMPLETE_GUIDE.md`
- n8n Docs: https://docs.n8n.io

---
