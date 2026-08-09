# BassirAI n8n Workflow Database Integration Guide

This guide defines the database queries, states, and insertions that the n8n automation engine must perform when handling incoming messages. This keeps the Next.js Unified Inbox and database synchronized.

---

## Inbound Message Loop Flowchart

```
[Inbound Webhook Received]
          │
          ▼
[1. Resolve Conversation] ──► (Exists?)
          │                      │
          │ (No)                 │ (Yes)
          ▼                      ▼
[Insert new row into]     [Retrieve conversation_id]
[  conversations    ]     [and is_human_takeover   ]
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
[2. Log Inbound Message in messages table]
                     │
                     ▼
[3. Check is_human_takeover] ──► (Takeover is TRUE?) ──► [Stop Flow (AI Silent)]
                     │
                     │ (Takeover is FALSE)
                     ▼
[4. Run RAG & Dynamic Translator]
                     │
                     ▼
[5. Send WhatsApp Message & Log Outbound AI reply]
```

---

## 1. Step-by-Step SQL Queries / n8n Database Nodes

### Step 1: Resolve the Conversation
When an incoming message arrives, check if a conversation already exists for the clinic and patient.

**Select Query:**
```sql
SELECT id, is_human_takeover 
FROM conversations 
WHERE clinic_id = '{{ $json.clinic_id }}' 
  AND patient_phone = '{{ $json.from_phone }}' 
  AND channel = 'whatsapp';
```

#### If no conversation exists (Insert New):
Insert a new record to create the conversation session.
```sql
INSERT INTO conversations (
  clinic_id, 
  patient_phone, 
  patient_name, 
  channel, 
  status, 
  is_human_takeover
) 
VALUES (
  '{{ $json.clinic_id }}', 
  '{{ $json.from_phone }}', 
  '{{ $json.profile_name }}', 
  'whatsapp', 
  'new', 
  false
) 
RETURNING id, is_human_takeover;
```

---

### Step 2: Log the Inbound Message
Write the incoming patient message to the `messages` table. This causes it to instantly show up in the Next.js Inbox.

**Insert Query:**
```sql
INSERT INTO messages (
  clinic_id, 
  conversation_id, 
  content, 
  direction, 
  is_ai_generated
) 
VALUES (
  '{{ $json.clinic_id }}', 
  '{{ $json.conversation_id }}', 
  '{{ $json.message_text }}', 
  'inbound', 
  false
);
```

---

### Step 3: Check Takeover State (Conditional Switch)
In n8n, use an **"IF" or "Switch" node** to evaluate the value of `is_human_takeover`:
* **If `is_human_takeover` is `true`**: Terminate the workflow immediately. Do not query RAG or reply. This allows receptionist takeover.
* **If `is_human_takeover` is `false`**: Proceed to generate the AI response.

---

### Step 4: Log the Outbound AI Response
Once the AI generates a reply and dispatches it via the WhatsApp Send node, log the reply.

**Insert Query:**
```sql
INSERT INTO messages (
  clinic_id, 
  conversation_id, 
  content, 
  direction, 
  is_ai_generated
) 
VALUES (
  '{{ $json.clinic_id }}', 
  '{{ $json.conversation_id }}', 
  '{{ $json.ai_response_text }}', 
  'outbound', 
  true
);
```

---

### Step 5: Update last_message_at Timestamp
Update the parent conversation timestamp to push it to the top of the receptionist's inbox list.

**Update Query:**
```sql
UPDATE conversations 
SET last_message_at = NOW() 
WHERE id = '{{ $json.conversation_id }}';
```

---

## 2. Table Schemas for Reference

### `conversations`
* `id` (UUID, Primary Key)
* `clinic_id` (UUID, References clinics)
* `patient_phone` (TEXT)
* `patient_name` (TEXT)
* `channel` (ENUM: `'whatsapp'`, `'instagram'`, `'facebook'`)
* `status` (ENUM: `'new'`, `'active'`, `'booked'`, `'closed'`)
* `is_human_takeover` (BOOLEAN, Default: `false`)
* `last_message_at` (TIMESTAMPTZ, Default: `NOW()`)

### `messages`
* `id` (UUID, Primary Key)
* `clinic_id` (UUID, References clinics)
* `conversation_id` (UUID, References conversations)
* `content` (TEXT)
* `direction` (ENUM: `'inbound'`, `'outbound'`)
* `is_ai_generated` (BOOLEAN, Default: `false`)
* `created_at` (TIMESTAMPTZ, Default: `NOW()`)
