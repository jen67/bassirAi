-- seed.sql
-- Initial Seed Data for BassirAI Localized for African Context

-- 1. Insert Zuri Clinic Metadata
INSERT INTO clinics (id, name, email, phone, whatsapp_number, instagram_username, facebook_page_id, ai_mode, tone_of_voice, is_active)
VALUES (
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'Zuri Aesthetic & Wellness Clinic',
    'hello@zuri.clinic',
    '+234 1 234 5678',
    '+234 803 123 4567',
    'zuri.clinic.lekki',
    'zuri_aesthetic_page',
    TRUE,
    'professional',
    TRUE
);

-- 2. Insert Admins & Receptionist Users
INSERT INTO users (id, clinic_id, email, full_name, role, is_active)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'benson@zuri.clinic',
    'Babajide Benson',
    'clinic_admin',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000002',
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'temi@zuri.clinic',
    'Temiloluwa Adams',
    'receptionist',
    TRUE
);

-- 3. Insert Clinic customizations (FAQ overrides, Google Drive folder, Pinecone namespace)
INSERT INTO clinic_customizations (clinic_id, catalog, faqs, custom_prompt, google_drive_folder_id, pinecone_namespace)
VALUES (
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    '[
        {"name": "Botox forehead treatment", "price": "₦180,000 - ₦300,000", "description": "Reduces horizontal forehead lines"},
        {"name": "Lip Filler (Juvederm/Restylane)", "price": "₦450,000 - ₦600,000 per syringe", "description": "Plumps lips and defines borders"},
        {"name": "Laser Skin Resurfacing", "price": "₦250,000 per session", "description": "Improves skin texture and removes pigmentation"}
    ]'::jsonb,
    '[
        {"question": "Do you offer parking?", "answer": "Yes, we provide free parking validation for Zuri clients at our Lekki office entrance."},
        {"question": "What is the recovery time for Lip Fillers?", "answer": "Swelling typically subsides within 24-48 hours. Avoid alcohol or heavy workouts for 1 day."}
    ]'::jsonb,
    'You are a warm, helpful customer care agent representing Zuri Aesthetic & Wellness Clinic in Lekki, Lagos. Introduce yourself clearly. Ensure all prices are stated in Naira (₦). Encourage patients to book callback consultations.',
    'folder_drive_zuri_knowledge_123',
    'zuri-lekki-ns'
);

-- 4. Seed Inbound Conversations
INSERT INTO conversations (id, clinic_id, patient_phone, patient_name, channel, status)
VALUES 
(
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    '+234 803 123 4567',
    'Chioma Adebayo',
    'whatsapp',
    'new'
),
(
    'e08a8a47-c0f5-4de4-b7be-769efde0763b',
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    '+234 812 345 6789',
    'Kelechi Okafor',
    'whatsapp',
    'booked'
),
(
    'e08a8a47-c0f5-4de4-b7be-769efde0763c',
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    '+234 905 987 6543',
    'Babajide Balogun',
    'facebook',
    'new'
);

-- 5. Seed Message logs matching patient interactions
INSERT INTO messages (clinic_id, conversation_id, content, direction, is_ai_generated)
VALUES 
-- Chioma WhatsApp chat
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'Hello! I would like to know your clinic hours.',
    'inbound',
    FALSE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'Hello Chioma! We are open Monday through Saturday from 10:00 AM to 8:00 PM (WAT). We are closed on Sundays. Is there a specific service you are interested in booking?',
    'outbound',
    TRUE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'Hi, how much is the Botox treatment for forehead lines in Naira?',
    'inbound',
    FALSE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'Botox treatment at Zuri Aesthetic & Wellness Clinic is priced per area. For forehead lines, it typically ranges from ₦180,000 to ₦300,000 depending on the dosage needed, which is customized during your consultation in Lekki. Would you like to schedule a consultation with our practitioner?',
    'outbound',
    TRUE
),

-- Kelechi WhatsApp chat
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763b',
    'Hello, do you have space for lip filler in your Lekki clinic today?',
    'inbound',
    FALSE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763b',
    'Hello Kelechi! Welcome to Zuri Aesthetic & Wellness Clinic. Yes, we have a slot available today at 4:30 PM or tomorrow at 11:00 AM at our Lekki office. Which time works best for you?',
    'outbound',
    TRUE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763b',
    'Today at 4:30 PM is perfect.',
    'inbound',
    FALSE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763b',
    'Awesome! Your slot is booked for today at 4:30 PM for Lip Filler. We will send a confirmation link and directions to our Lekki clinic shortly. See you soon!',
    'outbound',
    TRUE
),

-- Babajide Facebook chat
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763c',
    'Hello, I booked a teeth whitening session for tomorrow at 2 PM.',
    'inbound',
    FALSE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763c',
    'Hi Babajide! That is wonderful. We look forward to seeing you at our Lekki clinic. Please remember to avoid coffee or dark beverages for 24 hours prior.',
    'outbound',
    TRUE
),
(
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763c',
    'Actually something came up, I need to reschedule my teeth whitening session.',
    'inbound',
    FALSE
);

-- 6. Seed callback appointment for Chioma
INSERT INTO appointments (clinic_id, conversation_id, patient_name, patient_phone, procedure, appointment_date, status, notes)
VALUES (
    'd8c47b56-c0c2-488f-a9eb-88fb7c8c3e80',
    'e08a8a47-c0f5-4de4-b7be-769efde0763a',
    'Chioma Adebayo',
    '+234 803 123 4567',
    'Botox Forehead lines consultation',
    NOW() + INTERVAL '2 hours',
    'pending',
    'Patient wants details on pricing and availability. Wants WhatsApp callback confirmation.'
);
