# 🧪 n8n Integration Testing Guide

**Last Updated:** August 13, 2026  
**Purpose:** Verify end-to-end n8n integration works correctly

---

## 📋 Test Scenarios

### Test 1: Basic Webhook Reception ✅

**Objective:** Verify n8n receives and processes incoming messages

**Steps:**

1. Open n8n workflow
2. Click **Execute Workflow** button
3. Use this test payload:

```json
{
  "userId": "test-001",
  "name": "Test Patient",
  "phone": "+234803111222",
  "channel": "whatsapp",
  "language": "en",
  "message": "Hello, I need information about Botox"
}
```

**Expected Results:**

- ✅ Workflow executes successfully
- ✅ Intent classified (should be "faq" or "booking")
- ✅ AI response generated
- ✅ All nodes show green checkmarks

**If Failed:**

- Check Groq API credential
- Verify model name: `llama-3.3-70b-versatile`
- Check execution logs for error details

---

### Test 2: Intent Classification ✅

**Objective:** Verify AI correctly classifies different message types

**Test Cases:**

#### 2.1 Booking Intent

```json
{
  "userId": "test-002",
  "name": "Ahmed Ali",
  "phone": "+971501234567",
  "channel": "whatsapp",
  "language": "en",
  "message": "I want to book a Botox consultation for next Thursday at 2pm"
}
```

**Expected:** Intent = "booking"

#### 2.2 FAQ Intent

```json
{
  "userId": "test-003",
  "name": "Sara Mohammed",
  "phone": "+966501234567",
  "channel": "whatsapp",
  "language": "en",
  "message": "How much does lip filler cost?"
}
```

**Expected:** Intent = "faq"

#### 2.3 Greeting Intent

```json
{
  "userId": "test-004",
  "name": "John Smith",
  "phone": "+234805555666",
  "channel": "whatsapp",
  "language": "en",
  "message": "Hello, good morning!"
}
```

**Expected:** Intent = "greeting"

#### 2.4 Complaint Intent

```json
{
  "userId": "test-005",
  "name": "Mary Johnson",
  "phone": "+234806666777",
  "channel": "whatsapp",
  "language": "en",
  "message": "I've been waiting for 30 minutes and nobody has attended to me!"
}
```

**Expected:** Intent = "complaint"

#### 2.5 Human Support Intent

```json
{
  "userId": "test-006",
  "name": "David Brown",
  "phone": "+234807777888",
  "channel": "whatsapp",
  "language": "en",
  "message": "Can I speak to a real person please?"
}
```

**Expected:** Intent = "human_support"

**Verification:**

1. Check "Intent Router" node output
2. Verify correct path was taken
3. Review AI response appropriateness

---

### Test 3: Booking Extraction ✅

**Objective:** Verify booking information is correctly extracted

**Test Payload:**

```json
{
  "userId": "test-007",
  "name": "Fatima Hassan",
  "phone": "+234808888999",
  "channel": "whatsapp",
  "language": "en",
  "message": "Hi, I'd like to schedule a Botox treatment for August 20th at 10:00 AM at your Lekki clinic"
}
```

**Expected Extraction:**

```json
{
  "service": "Botox",
  "preferred_date": "2026-08-20",
  "preferred_time": "10:00 AM",
  "clinic_location": "Lekki",
  "language": "en",
  "notes": null,
  "needs_human": false
}
```

**Verify:**

1. Check "Groq AI - Booking Info Extractor" node output
2. Verify all fields extracted correctly
3. Check Google Sheets for new row
4. Verify date format is correct

---

### Test 4: Google Sheets Logging ✅

**Objective:** Verify bookings are logged to Google Sheets

**Steps:**

1. Execute a booking test (use Test 3 payload)
2. Open Google Sheets:
   ```
   https://docs.google.com/spreadsheets/d/1BvdRD14OzxVmGgESN1HAvOt_UwxeAPUYgtq4SkMWM7w/edit
   ```
3. Check latest row

**Expected Columns:**

- Booking ID (auto-generated)
- Patient ID: `test-007`
- Patient Name: `Fatima Hassan`
- Phone: `+234808888999`
- Service: `Botox`
- Preferred Date: `2026-08-20`
- Preferred Time: `10:00 AM`
- Clinic Location: `Lekki`
- Language: `en`
- Channel: `whatsapp`
- Created At: (current timestamp)

**If Failed:**

- Check Google Sheets credential
- Verify sheet ID matches
- Ensure sheet is shared with correct account
- Check "Append to Google Sheets" node configuration

---

### Test 5: Email Notifications ✅

**Objective:** Verify email sent when `needs_human = true`

**Test Payload:**

```json
{
  "userId": "test-008",
  "name": "Ibrahim Adekunle",
  "phone": "+234809999000",
  "channel": "whatsapp",
  "language": "en",
  "message": "I need a special consultation for a complicated case involving previous surgery complications"
}
```

**Expected:**

- `needs_human` should be `true`
- Email sent to clinic staff
- Email contains all booking details

**Verify Email Contents:**

- **Subject:** "New Booking Requires Manual Review - Ibrahim Adekunle"
- **Body includes:**
  - Patient name
  - Phone number
  - Service requested
  - Full message text
  - Link to inbox

**If Failed:**

- Check Gmail credential
- Verify recipient email address
- Check spam folder
- Review "Notify Clinic Staff" node configuration

---

### Test 6: Multi-Language Support ✅

**Objective:** Verify Arabic language handling

**Test Payload:**

```json
{
  "userId": "test-009",
  "name": "محمد علي",
  "phone": "+966502345678",
  "channel": "whatsapp",
  "language": "ar",
  "message": "مرحبا، أريد حجز موعد لعلاج البوتوكس"
}
```

**Expected:**

- Intent classified correctly
- AI response in Arabic
- Booking extracted properly
- Google Sheets shows Arabic text correctly

**Verification:**

1. Check AI response language
2. Verify Arabic text rendering in sheets
3. Ensure no encoding issues

---

### Test 7: Database Sync ✅

**Objective:** Verify messages sync to Supabase database

**Steps:**

1. **Send test message via n8n:**

```bash
curl -X POST https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-010",
    "name": "Test Database Sync",
    "phone": "+234800111222",
    "channel": "whatsapp",
    "language": "en",
    "message": "Testing database sync",
    "clinicId": "YOUR_CLINIC_ID"
  }'
```

2. **Check Supabase database:**

```sql
-- Check conversations table
SELECT * FROM conversations
WHERE patient_phone = '+234800111222'
ORDER BY created_at DESC
LIMIT 1;

-- Check messages table
SELECT * FROM messages
WHERE conversation_id = (
  SELECT id FROM conversations
  WHERE patient_phone = '+234800111222'
  LIMIT 1
)
ORDER BY created_at DESC;
```

**Expected:**

- ✅ Conversation created/updated
- ✅ Inbound message saved
- ✅ Outbound AI message saved
- ✅ Timestamps correct
- ✅ `is_ai_generated = true` for AI messages

**If Failed:**

- Check `N8N_WEBHOOK_URL` in frontend `.env.local`
- Verify `/api/webhooks/n8n-incoming` endpoint is accessible
- Check Supabase RLS policies
- Review n8n "Notify Frontend API" node (if added)

---

### Test 8: Frontend Inbox Integration ✅

**Objective:** Verify messages appear in frontend inbox

**Steps:**

1. **Open inbox:** `http://localhost:3000/inbox`

2. **Simulate inbound message:**
   - Click "Simulate Message"
   - Select "Botox Cost Inquiry"

3. **Wait 2 seconds**

**Expected:**

- ✅ Patient message appears
- ✅ AI response appears within 2 seconds
- ✅ Messages display correctly
- ✅ Timestamps shown
- ✅ Real-time update (no refresh needed)

**Additional Tests:**

#### 8.1 Human Takeover

1. Toggle "Human Takeover" ON
2. Type manual message: "Hello, I'm Dr. Smith"
3. Click Send

**Expected:**

- ✅ Message sent via `/api/messages/send`
- ✅ Message forwarded to n8n
- ✅ Message appears in inbox immediately
- ✅ AI stops auto-responding

#### 8.2 Real-time Updates

1. Open inbox in two browser tabs
2. Send message from Tab 1
3. Check Tab 2

**Expected:**

- ✅ Message appears in Tab 2 automatically
- ✅ No page refresh needed
- ✅ Supabase Realtime working

---

### Test 9: Error Handling ✅

**Objective:** Verify graceful error handling

#### 9.1 Invalid Phone Number

```json
{
  "userId": "test-011",
  "name": "Invalid Test",
  "phone": "invalid-phone",
  "channel": "whatsapp",
  "language": "en",
  "message": "Test message"
}
```

**Expected:**

- Workflow should handle gracefully
- Error logged but not crash
- User receives generic error message

#### 9.2 Groq API Failure

**Simulation:**

1. Temporarily use invalid Groq API key
2. Execute workflow

**Expected:**

- Fallback to template responses
- User still receives reply
- Error logged for monitoring

#### 9.3 Google Sheets Unavailable

**Simulation:**

1. Temporarily revoke Google Sheets access
2. Execute booking workflow

**Expected:**

- Booking still processed
- Email sent with booking details
- Error logged but workflow continues

---

### Test 10: Performance & Load ✅

**Objective:** Verify system handles concurrent requests

**Steps:**

1. **Use n8n's load testing:**

```bash
# Install Apache Bench
apt-get install apache2-utils

# Send 100 requests, 10 concurrent
ab -n 100 -c 10 -p test-payload.json -T application/json \
  https://your-n8n-domain.railway.app/webhook/d4cee446-c445-49f7-b402-e7f27e4827a3
```

**Expected Metrics:**

- ✅ Average response time: <2 seconds
- ✅ 99% success rate
- ✅ No crashes
- ✅ All messages processed

**Monitor:**

- n8n execution logs
- Database connection pool
- Groq API rate limits
- Memory usage

---

## 🎯 Integration Testing Checklist

### Pre-Deployment

- [ ] All Test 1-10 scenarios passed
- [ ] Intent classification accuracy >90%
- [ ] Booking extraction working
- [ ] Google Sheets logging functional
- [ ] Email notifications received
- [ ] Database sync verified
- [ ] Frontend inbox displaying messages
- [ ] Real-time updates working
- [ ] Error handling tested
- [ ] Performance acceptable

### Post-Deployment

- [ ] WhatsApp webhook receiving messages
- [ ] Instagram webhook receiving messages
- [ ] Facebook webhook receiving messages
- [ ] Production n8n URL accessible
- [ ] SSL/HTTPS working
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation updated

---

## 📊 Success Metrics

**Target KPIs:**

| Metric          | Target | Current |
| --------------- | ------ | ------- |
| Response Time   | <2s    | \_\_    |
| Intent Accuracy | >90%   | \_\_    |
| Uptime          | >99%   | \_\_    |
| Error Rate      | <1%    | \_\_    |
| Database Sync   | 100%   | \_\_    |

---

## 🐛 Common Issues & Fixes

### Issue: Slow Response Times

**Diagnosis:**

```bash
# Check n8n execution time
# Go to Executions → click execution → check node times
```

**Fixes:**

- Increase Railway resources
- Optimize Groq API calls
- Add caching for frequent queries

### Issue: Messages Not Syncing

**Diagnosis:**

```bash
# Check webhook endpoint
curl http://localhost:3000/api/webhooks/n8n-incoming -v
```

**Fixes:**

- Verify N8N_WEBHOOK_URL
- Check Supabase connection
- Review RLS policies

### Issue: Intent Misclassification

**Diagnosis:**

- Review n8n execution logs
- Check classifier prompt
- Analyze misclassified examples

**Fixes:**

- Update classifier system prompt
- Add more examples
- Adjust temperature (currently 0)

---

## 📞 Support

**Test Failed? Need Help?**

1. **Check n8n Execution Logs**
   - Go to Executions tab
   - Review failed execution
   - Check error messages

2. **Review Documentation**
   - `N8N_INTEGRATION_COMPLETE_GUIDE.md`
   - `N8N_DEPLOYMENT_GUIDE.md`

3. **Contact Support**
   - Email: tsd@naskamireglobal.com
   - Include: error logs, test case, expected vs actual

---

**Last Updated:** August 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
