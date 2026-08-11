-- performance-indexes.sql
-- BassirAI Performance Optimization Indexes
-- Run this AFTER schema.sql and rls-policies.sql

-- ============================================
-- CRITICAL INDEXES FOR PRODUCTION PERFORMANCE
-- ============================================

-- 1. Appointments - Most frequently queried table
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date 
  ON appointments(clinic_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status 
  ON appointments(clinic_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_status_date 
  ON appointments(status, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_conversation 
  ON appointments(conversation_id) 
  WHERE conversation_id IS NOT NULL;

-- 2. Conversations - Real-time inbox queries
CREATE INDEX IF NOT EXISTS idx_conversations_clinic_phone 
  ON conversations(clinic_id, patient_phone);

CREATE INDEX IF NOT EXISTS idx_conversations_clinic_status 
  ON conversations(clinic_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_clinic_channel 
  ON conversations(clinic_id, channel);

CREATE INDEX IF NOT EXISTS idx_conversations_takeover 
  ON conversations(clinic_id, is_human_takeover) 
  WHERE is_human_takeover = TRUE;

-- 3. Messages - Chat history queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_clinic_created 
  ON messages(clinic_id, created_at DESC);

-- 4. Users - Authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_clinic 
  ON users(clinic_id) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);

-- 5. Clinic Customizations - Settings lookups
CREATE INDEX IF NOT EXISTS idx_customizations_clinic 
  ON clinic_customizations(clinic_id);

-- 6. Clinics - Active clinics only
CREATE INDEX IF NOT EXISTS idx_clinics_active 
  ON clinics(id) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_clinics_email 
  ON clinics(email) 
  WHERE is_active = TRUE;

-- ============================================
-- ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================
ANALYZE clinics;
ANALYZE users;
ANALYZE clinic_customizations;
ANALYZE conversations;
ANALYZE messages;
ANALYZE appointments;

-- ============================================
-- VERIFY INDEX CREATION
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('clinics', 'users', 'clinic_customizations', 
                     'conversations', 'messages', 'appointments')
ORDER BY tablename, indexname;
