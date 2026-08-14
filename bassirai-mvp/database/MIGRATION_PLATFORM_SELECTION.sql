-- MIGRATION: Add Platform Selection Support
-- Run this if you already have an existing database from the old schema

-- Add new platform-related columns to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS enabled_platforms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_phone_id TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS facebook_access_token TEXT;

-- Migrate existing clinics to have whatsapp enabled by default if they have whatsapp_number
UPDATE clinics 
SET enabled_platforms = '["whatsapp"]'::jsonb 
WHERE whatsapp_number IS NOT NULL AND enabled_platforms = '[]'::jsonb;

-- Add instagram to enabled platforms if instagram_username exists
UPDATE clinics 
SET enabled_platforms = enabled_platforms || '["instagram"]'::jsonb
WHERE instagram_username IS NOT NULL 
  AND NOT enabled_platforms ? 'instagram';

-- Add facebook to enabled platforms if facebook_page_id exists
UPDATE clinics 
SET enabled_platforms = enabled_platforms || '["facebook"]'::jsonb
WHERE facebook_page_id IS NOT NULL 
  AND NOT enabled_platforms ? 'facebook';

-- Verify migration
SELECT 
  id,
  name,
  enabled_platforms,
  whatsapp_number IS NOT NULL as has_whatsapp,
  instagram_username IS NOT NULL as has_instagram,
  facebook_page_id IS NOT NULL as has_facebook
FROM clinics;
