-- schema.sql
-- BassirAI Database Schema (Multi-tenant)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE user_role AS ENUM ('clinic_admin', 'receptionist');
CREATE TYPE msg_channel AS ENUM ('whatsapp', 'instagram', 'facebook');
CREATE TYPE conv_status AS ENUM ('new', 'active', 'booked', 'closed');
CREATE TYPE msg_dir AS ENUM ('inbound', 'outbound');
CREATE TYPE appt_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 1. clinics Table
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Platform Integration Fields
    enabled_platforms JSONB DEFAULT '[]'::jsonb, -- ["whatsapp", "instagram", "facebook"]
    whatsapp_number TEXT,
    whatsapp_phone_id TEXT,
    whatsapp_token TEXT,
    instagram_username TEXT,
    instagram_access_token TEXT,
    facebook_page_id TEXT,
    facebook_access_token TEXT,
    
    ai_mode BOOLEAN DEFAULT TRUE,
    tone_of_voice TEXT DEFAULT 'professional',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. users Table (Supports clinic admins and receptionists)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. clinic_customizations Table (Integrates structural FAQs and teammate's Google Drive/Pinecone RAG)
CREATE TABLE clinic_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
    catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_prompt TEXT,
    google_drive_folder_id TEXT,
    pinecone_namespace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_phone TEXT NOT NULL,
    patient_name TEXT,
    channel msg_channel NOT NULL,
    status conv_status DEFAULT 'new',
    is_human_takeover BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (clinic_id, patient_phone, channel)
);

-- 5. messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    direction msg_dir NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    procedure TEXT NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status appt_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Timestamp Update Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER trg_clinics_updated
    BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_clinic_customizations_updated
    BEFORE UPDATE ON clinic_customizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
