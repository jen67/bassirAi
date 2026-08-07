-- 1. Create Extensions & ENUM Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('clinic_admin', 'receptionist');
CREATE TYPE msg_channel AS ENUM ('whatsapp', 'instagram', 'facebook');
CREATE TYPE conv_status AS ENUM ('new', 'active', 'booked', 'closed');
CREATE TYPE msg_dir AS ENUM ('inbound', 'outbound');
CREATE TYPE appt_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 2. Create Core Tables
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  instagram_username TEXT,
  facebook_page_id TEXT,
  ai_mode BOOLEAN DEFAULT TRUE,
  default_language TEXT DEFAULT 'ar' CHECK (default_language IN ('ar', 'en')),
  tone_of_voice TEXT DEFAULT 'professional',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics (id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clinic_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics (id) ON DELETE CASCADE UNIQUE,
  catalog JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  custom_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics (id) ON DELETE CASCADE,
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  channel msg_channel NOT NULL,
  status conv_status DEFAULT 'new',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id, patient_phone, channel)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics (id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  direction msg_dir NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics (id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  procedure TEXT NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  status appt_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);