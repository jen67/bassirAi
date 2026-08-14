# BassirAI Missing Features & Enhancement Roadmap

**Date:** August 11, 2026  
**Status:** MVP Complete, Enhancement Phase Needed

---

## 🎯 Overview

You're right - the current MVP focuses on core functionality but is missing important **setup, management, and team collaboration** features. This document outlines what's missing and how to implement them.

---

## 🔴 CRITICAL MISSING FEATURES

### 1. Platform Integration Selection (Registration/Onboarding)

**Current State:**

- Onboarding asks for clinic name and WhatsApp only
- No option to select which platforms to integrate
- Hardcoded channel support (WhatsApp, Instagram, Facebook)

**What's Needed:**

```
Registration/Onboarding should ask:
  ☐ Which platforms do you want to integrate?
    □ WhatsApp Business
    □ Instagram DM
    □ Facebook Messenger
    □ (Future) Telegram
    □ (Future) SMS

  For each selected platform:
    □ Platform-specific credentials
    □ Business account details
    □ API tokens
```

**Database Schema Addition:**

```sql
-- Add to clinics table
ALTER TABLE clinics ADD COLUMN enabled_channels JSONB DEFAULT '[]';
ALTER TABLE clinics ADD COLUMN instagram_username TEXT;
ALTER TABLE clinics ADD COLUMN instagram_access_token TEXT;
ALTER TABLE clinics ADD COLUMN facebook_page_id TEXT;
ALTER TABLE clinics ADD COLUMN facebook_access_token TEXT;

-- Example data structure
enabled_channels: ["whatsapp", "instagram", "facebook"]
```

---

### 2. Complete Onboarding Flow

**Current State:**

- Basic onboarding with clinic name, AI tone, catalog, FAQs
- Missing: Location, hours, team setup, payment info, etc.

**Enhanced Onboarding Should Include:**

#### Step 1: Business Information ✅ (Partially Done)

- [x] Clinic name
- [x] Business email
- [ ] **Phone number (main line)**
- [ ] **Physical address** (street, city, state, country)
- [ ] **Location coordinates** (for maps integration)
- [ ] **Business hours** (Mon-Sun, opening/closing times)
- [ ] **Timezone** (for appointment scheduling)
- [ ] **Website URL**
- [ ] **Business registration number** (optional)

#### Step 2: Platform Integrations 🔴 (Missing)

- [ ] Select platforms to integrate
- [ ] Add credentials for each platform
- [ ] Test connectivity
- [ ] Verify webhooks

#### Step 3: AI Configuration ✅ (Partially Done)

- [x] AI tone of voice
- [x] Primary language
- [ ] **Secondary languages** (multilingual support)
- [ ] **Response time preference** (instant, within 5 min, etc.)
- [ ] **Operating hours for AI** (24/7 or business hours only)
- [ ] **Escalation triggers** (keywords that force human takeover)

#### Step 4: Services & Pricing ✅ (Done)

- [x] Catalog (treatments/services)
- [x] Pricing

#### Step 5: Knowledge Base ✅ (Done)

- [x] FAQs
- [ ] **Google Drive folder selection** (for RAG)
- [ ] **Upload policy documents**
- [ ] **Upload consent forms**

#### Step 6: Team Management 🔴 (Missing)

- [ ] Invite team members
- [ ] Assign roles and permissions
- [ ] Set up departments (if applicable)

#### Step 7: Booking Configuration 🔴 (Missing)

- [ ] Set appointment duration defaults
- [ ] Configure booking buffer times
- [ ] Set up appointment types
- [ ] Define cancellation policy

#### Step 8: Payment & Billing 🔴 (Missing)

- [ ] Add payment method (if paid plan)
- [ ] Select subscription tier
- [ ] Billing information

---

### 3. Team & User Management

**Current State:**

- Database supports `users` table with roles
- No UI to invite/manage team members
- Only 2 roles: `clinic_admin` and `receptionist`

**What's Needed:**

#### Roles & Permissions System

```sql
-- Enhance user_role enum
ALTER TYPE user_role ADD VALUE 'doctor';
ALTER TYPE user_role ADD VALUE 'manager';
ALTER TYPE user_role ADD VALUE 'viewer';

-- Add permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission TEXT NOT NULL,
    UNIQUE(role, permission)
);

-- Seed permissions
INSERT INTO role_permissions (role, permission) VALUES
('clinic_admin', 'manage_users'),
('clinic_admin', 'manage_settings'),
('clinic_admin', 'view_analytics'),
('clinic_admin', 'manage_appointments'),
('clinic_admin', 'manage_conversations'),
('clinic_admin', 'manage_billing'),
('manager', 'view_analytics'),
('manager', 'manage_appointments'),
('manager', 'manage_conversations'),
('doctor', 'manage_appointments'),
('doctor', 'view_conversations'),
('receptionist', 'manage_appointments'),
('receptionist', 'manage_conversations'),
('viewer', 'view_analytics');
```

#### Team Management UI Features

```
Settings → Team Management

Features needed:
  ☐ List all team members
  ☐ Invite new member (send email invite)
  ☐ Edit member details
  ☐ Change member role
  ☐ Deactivate/reactivate member
  ☐ Remove member
  ☐ View member activity log
  ☐ Set working hours per member
  ☐ Assign conversations to specific members
```

---

### 4. Location & Business Hours Management

**Current State:**

- No location fields in database
- No business hours configuration
- AI doesn't know when clinic is open/closed

**Database Schema Needed:**

```sql
-- Add to clinics table
ALTER TABLE clinics ADD COLUMN address_street TEXT;
ALTER TABLE clinics ADD COLUMN address_city TEXT;
ALTER TABLE clinics ADD COLUMN address_state TEXT;
ALTER TABLE clinics ADD COLUMN address_country TEXT;
ALTER TABLE clinics ADD COLUMN address_postal_code TEXT;
ALTER TABLE clinics ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE clinics ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE clinics ADD COLUMN timezone TEXT DEFAULT 'Africa/Lagos';

-- Create business_hours table
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    UNIQUE(clinic_id, day_of_week)
);

-- Example data
INSERT INTO business_hours (clinic_id, day_of_week, opens_at, closes_at)
VALUES
('clinic-id', 1, '09:00', '18:00'),  -- Monday
('clinic-id', 2, '09:00', '18:00'),  -- Tuesday
('clinic-id', 3, '09:00', '18:00'),  -- Wednesday
('clinic-id', 4, '09:00', '18:00'),  -- Thursday
('clinic-id', 5, '09:00', '18:00'),  -- Friday
('clinic-id', 6, '10:00', '14:00'),  -- Saturday
('clinic-id', 0, NULL, NULL, TRUE);  -- Sunday (closed)
```

#### UI Components Needed

```
Settings → Business Information

☐ Address form with autocomplete (Google Places API)
☐ Map widget showing clinic location
☐ Weekly schedule editor:
    Monday    [09:00 AM] to [06:00 PM]  [Closed checkbox]
    Tuesday   [09:00 AM] to [06:00 PM]  [Closed checkbox]
    ...
☐ Special hours (holidays, vacation)
☐ Timezone selector
```

---

### 5. Enhanced Settings Page Structure

**Current State:**

- Settings page has basic fields
- Everything on one page (cluttered)
- Missing many configuration options

**Proposed Settings Navigation:**

```
Settings (with tabs/sections)

├── Business Profile
│   ├── Basic Information (name, email, phone)
│   ├── Location & Hours
│   └── Business Details (reg number, website)
│
├── Platform Integrations
│   ├── WhatsApp Business
│   ├── Instagram DM
│   ├── Facebook Messenger
│   └── Future Integrations
│
├── AI Configuration
│   ├── Tone & Language
│   ├── Response Settings
│   ├── Escalation Rules
│   └── Operating Hours
│
├── Knowledge Base
│   ├── Services & Pricing
│   ├── FAQs
│   ├── Document Library (Google Drive)
│   └── Custom Prompts
│
├── Team Management
│   ├── Team Members
│   ├── Roles & Permissions
│   └── Invitations
│
├── Appointments
│   ├── Booking Settings
│   ├── Appointment Types
│   ├── Cancellation Policy
│   └── Reminders
│
├── Notifications
│   ├── Email Alerts
│   ├── SMS Notifications
│   └── Webhook Settings
│
└── Billing & Subscription
    ├── Current Plan
    ├── Payment Method
    ├── Billing History
    └── Upgrade/Downgrade
```

---

## 🟡 IMPORTANT MISSING FEATURES

### 6. Department/Specialization Management

**For larger clinics with multiple departments:**

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_departments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, department_id)
);
```

**Use Cases:**

- Dermatology department
- Cosmetic surgery department
- General consultations
- Each department can have its own:
  - Team members
  - Services
  - Booking rules

---

### 7. Advanced Appointment Features

**Current State:**

- Basic CRUD for appointments
- No appointment types
- No recurring appointments
- No buffer times

**Enhancements Needed:**

```sql
-- Appointment types
CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2),
    color TEXT, -- For calendar color coding
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2),
    cancellation_hours INTEGER DEFAULT 24
);

-- Add to appointments table
ALTER TABLE appointments ADD COLUMN appointment_type_id UUID REFERENCES appointment_types(id);
ALTER TABLE appointments ADD COLUMN assigned_to UUID REFERENCES users(id);
ALTER TABLE appointments ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN recurrence_rule TEXT; -- RRULE format
```

**UI Features:**

```
Appointment Types:
  - Consultation (30 min) - ₦50,000
  - Botox Treatment (45 min) - ₦200,000
  - Laser Session (60 min) - ₦300,000

Booking Settings:
  - Buffer time before: 10 minutes
  - Buffer time after: 15 minutes
  - Allow same-day booking: Yes/No
  - Require deposit: Yes/No
  - Send reminders: 24h before, 2h before

Assign to Team Member:
  - Auto-assign by availability
  - Manual assignment
  - Round-robin distribution
```

---

### 8. Analytics & Reporting Dashboard

**Current State:**

- Dashboard shows mock stats
- No real analytics

**Analytics Needed:**

```
Dashboard → Analytics

Metrics to Track:
  ☐ Total conversations (by channel)
  ☐ AI response rate
  ☐ Human takeover rate
  ☐ Average response time
  ☐ Patient satisfaction (if feedback collected)
  ☐ Appointment conversion rate
  ☐ Revenue by service type
  ☐ Busiest hours/days
  ☐ Most common inquiries
  ☐ Team performance metrics

Visualizations:
  ☐ Line charts (trends over time)
  ☐ Pie charts (channel distribution)
  ☐ Bar charts (service popularity)
  ☐ Heat maps (busy hours)
  ☐ Funnel (conversation → booking conversion)

Filters:
  ☐ Date range
  ☐ Channel
  ☐ Team member
  ☐ Service type
  ☐ Export to CSV/PDF
```

---

### 9. Patient Management System

**Current State:**

- Patients exist only in conversations
- No patient profiles
- No patient history

**Patient CRM Features:**

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history JSONB,
    allergies TEXT[],
    notes TEXT,
    tags TEXT[], -- VIP, first-time, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, phone)
);

-- Link conversations to patients
ALTER TABLE conversations ADD COLUMN patient_id UUID REFERENCES patients(id);

-- Patient notes/interactions log
CREATE TABLE patient_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Patient Profile UI:**

```
Patient: Chioma Adebayo

  Basic Info:
    Phone: +234 803 123 4567
    Email: chioma@example.com
    DOB: 1990-05-15 (36 years old)
    Gender: Female

  Medical History:
    - Sensitive skin
    - Previous treatments: None
    - Allergies: None reported

  Appointment History:
    1. Botox Consultation - Aug 15, 2026 - Completed
    2. Botox Treatment - Aug 22, 2026 - Confirmed
    3. Follow-up - Sep 5, 2026 - Pending

  Conversation History:
    - WhatsApp: 12 messages (Last: Aug 10, 2026)
    - Instagram: 3 messages (Last: July 28, 2026)

  Notes:
    - First-time patient, nervous about procedure
    - Prefers morning appointments
    - Referred by friend

  Tags: [VIP] [First-time] [Sensitive-skin]
```

---

### 10. Notification System

**Current State:**

- No email notifications
- No SMS reminders
- No webhook integrations

**Notification Features Needed:**

```sql
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- appointment_confirmed, appointment_reminder, etc.
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    email_template TEXT,
    sms_template TEXT,
    UNIQUE(clinic_id, event_type)
);

CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_phone TEXT,
    notification_type TEXT,
    channel TEXT, -- email, sms, whatsapp
    status TEXT, -- sent, failed, pending
    sent_at TIMESTAMPTZ,
    error_message TEXT
);
```

**Notification Types:**

```
Patient Notifications:
  ☐ Appointment confirmation
  ☐ Appointment reminder (24h, 2h before)
  ☐ Appointment rescheduled
  ☐ Appointment cancelled
  ☐ Payment reminder
  ☐ Follow-up reminder

Staff Notifications:
  ☐ New conversation requiring attention
  ☐ Appointment booked
  ☐ AI escalation (human takeover triggered)
  ☐ Payment received
  ☐ Review received

Admin Notifications:
  ☐ New team member joined
  ☐ Subscription expiring
  ☐ System issues
  ☐ Daily/weekly summary report
```

---

## 🟢 NICE-TO-HAVE FEATURES

### 11. Multi-Location Support

For clinics with multiple branches

```sql
CREATE TABLE clinic_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    address TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);
```

### 12. Payment Integration

Integrate with payment gateways (Paystack, Flutterwave for Nigeria)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    patient_phone TEXT,
    amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'NGN',
    status TEXT,
    payment_method TEXT,
    transaction_ref TEXT,
    paid_at TIMESTAMPTZ
);
```

### 13. Review & Rating System

Collect patient feedback

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 14. Email Marketing / Campaigns

Send newsletters, promotions to patients

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    sent_to INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ
);
```

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Critical (Next 2 Weeks)

1. ✅ **Platform Integration Selection** (registration/onboarding)
2. ✅ **Complete Onboarding Flow** (business info, location, hours)
3. ✅ **Team Management UI** (invite, manage roles)
4. ✅ **Enhanced Settings Page** (organized tabs)

### Phase 2: Important (Weeks 3-4)

5. ✅ **Business Hours Management**
6. ✅ **Appointment Types & Advanced Booking**
7. ✅ **Patient Management System** (basic CRM)
8. ✅ **Notification System** (reminders, alerts)

### Phase 3: Enhancement (Month 2)

9. ✅ **Analytics Dashboard** (real metrics)
10. ✅ **Department Management** (for large clinics)
11. ✅ **Advanced Permissions** (granular access control)
12. ✅ **Audit Logging** (track changes)

### Phase 4: Scale (Month 3+)

13. ☐ **Multi-Location Support**
14. ☐ **Payment Integration**
15. ☐ **Review System**
16. ☐ **Email Marketing**
17. ☐ **Mobile App** (React Native)
18. ☐ **White-Label Solution** (resell platform)

---

## 🎯 Immediate Next Steps

### Week 1: Enhanced Onboarding

```
Day 1-2: Platform Integration Selection
  - Update registration page UI
  - Add multi-platform credential inputs
  - Create platform connection testing

Day 3-4: Complete Business Info
  - Add location fields (address, coordinates)
  - Add business hours editor
  - Add timezone selector

Day 5: Team Invitation System
  - Create invite UI
  - Implement email invitation flow
  - Add role selection
```

### Week 2: Settings Overhaul

```
Day 1-2: Reorganize Settings
  - Create tabbed interface
  - Move existing fields to proper tabs
  - Add missing configuration options

Day 3-4: Team Management
  - List all team members
  - Edit member details
  - Change roles
  - Deactivate/remove members

Day 5: Testing & Polish
  - Test all new flows
  - Fix bugs
  - Update documentation
```

---

Would you like me to:

1. **Start implementing Phase 1 features** (platform selection, enhanced onboarding)?
2. **Create detailed UI mockups** for the new features?
3. **Write the database migration scripts** for all new tables?
4. **Build the team management interface** first?

Let me know which direction you want to go and I'll build it out! 🚀
