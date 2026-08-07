-- Enable Row Level Security (RLS) on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Security Policies: Scoped to authenticated user's clinic
CREATE POLICY "clinic_scope_select_conversations" ON conversations FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinic_scope_insert_conversations" ON conversations FOR INSERT
WITH CHECK (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinic_scope_select_messages" ON messages FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinic_scope_insert_messages" ON messages FOR INSERT
WITH CHECK (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinic_scope_select_appointments" ON appointments FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinic_scope_insert_appointments" ON appointments FOR INSERT
WITH CHECK (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));