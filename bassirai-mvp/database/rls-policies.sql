-- rls-policies.sql
-- BassirAI Row Level Security (RLS) policies for multi-tenancy

-- ----------------------------------------------------
-- Recursion-safe helper function to get active user clinic_id
-- Runs with SECURITY DEFINER to bypass RLS recursion on 'users' table
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT clinic_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 1. clinics Policies
-- ----------------------------------------------------
CREATE POLICY select_clinic ON clinics
    FOR SELECT USING (id = get_user_clinic_id());

CREATE POLICY update_clinic ON clinics
    FOR UPDATE USING (id = get_user_clinic_id());

-- ----------------------------------------------------
-- 2. users Policies
-- ----------------------------------------------------
CREATE POLICY select_users ON users
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY insert_users ON users
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY update_users ON users
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY delete_users ON users
    FOR DELETE USING (clinic_id = get_user_clinic_id() AND role = 'clinic_admin');

-- ----------------------------------------------------
-- 3. clinic_customizations Policies
-- ----------------------------------------------------
CREATE POLICY select_customizations ON clinic_customizations
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY insert_customizations ON clinic_customizations
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY update_customizations ON clinic_customizations
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- ----------------------------------------------------
-- 4. conversations Policies
-- ----------------------------------------------------
CREATE POLICY select_conversations ON conversations
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY insert_conversations ON conversations
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY update_conversations ON conversations
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- ----------------------------------------------------
-- 5. messages Policies
-- ----------------------------------------------------
CREATE POLICY select_messages ON messages
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY insert_messages ON messages
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

-- ----------------------------------------------------
-- 6. appointments Policies
-- ----------------------------------------------------
CREATE POLICY select_appointments ON appointments
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY insert_appointments ON appointments
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY update_appointments ON appointments
    FOR UPDATE USING (clinic_id = get_user_clinic_id());
