/* BassirAI Figma Design System & Prototype Logic */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  /* ==========================================
     APP STATE & LAYOUT TEMPLATES
     ========================================== */
  const state = {
    activePage: 'cover',
    zoom: 0.85,
    selectedElement: null,
    theme: 'dark',
    presentationMode: 'desktop', // 'desktop' or 'mobile'
    demoLanguage: 'en', // 'en' (African context - multilingual out of scope)
    
    // Interactive Demo Data
    onboardingStep: 1,
    clinicName: 'Zuri Aesthetic & Wellness Clinic',
    clinicTone: 'professional',
    clinicLang: 'en',
    calComUrl: 'cal.com/zuri-clinic/consultation',
    bookingStrategy: 'handoff', // 'calcom' or 'handoff'
    
    patients: [
      {
        id: 'chioma',
        name: 'Chioma Adebayo',
        phone: '+234 803 123 4567',
        channel: 'whatsapp',
        lastMessage: 'Hi, how much is the Botox treatment for forehead lines in Naira?',
        time: '2m ago',
        status: 'new',
        aiMode: true,
        procedure: 'Botox Forehead',
        notes: 'Inquired about forehead pricing. AI handled automatically.',
        messages: [
          { sender: 'patient', text: 'Hello! I would like to know your clinic hours.' },
          { sender: 'ai', text: 'Hello Chioma! We are open Monday through Saturday from 10:00 AM to 8:00 PM (West Africa Time). We are closed on Sundays. Is there a specific service you are interested in booking?', latency: '0.8s' },
          { sender: 'patient', text: 'Hi, how much is the Botox treatment for forehead lines in Naira?' },
          { sender: 'ai', text: 'Botox treatment at Zuri Aesthetic & Wellness Clinic is priced per area. For forehead lines, it typically ranges from ₦180,000 to ₦300,000 depending on the dosage needed, which is customized during your consultation in Lekki. Would you like to schedule a consultation with our practitioner?', latency: '0.9s' }
        ]
      },
      {
        id: 'kelechi',
        name: 'Kelechi Okafor',
        phone: '+234 812 345 6789',
        channel: 'whatsapp',
        lastMessage: 'Hello, do you have space for lip filler in your Lekki clinic today?',
        time: '15m ago',
        status: 'booked',
        aiMode: true,
        procedure: 'Lip Filler',
        notes: 'Inquired about Lekki clinic slot. Automatically booked via AI.',
        messages: [
          { sender: 'patient', text: 'Hello, do you have space for lip filler in your Lekki clinic today?' },
          { sender: 'ai', text: 'Hello Kelechi! Welcome to Zuri Aesthetic & Wellness Clinic. Yes, we have a slot available today at 4:30 PM or tomorrow at 11:00 AM at our Lekki office. Which time works best for you?', latency: '0.7s' },
          { sender: 'patient', text: 'Today at 4:30 PM is perfect.' },
          { sender: 'ai', text: 'Awesome! Your slot is booked for today at 4:30 PM for Lip Filler. We will send a confirmation link and directions to our Lekki clinic shortly. See you soon!', latency: '0.8s' }
        ]
      },
      {
        id: 'babajide',
        name: 'Babajide Balogun',
        phone: '+234 905 987 6543',
        channel: 'facebook',
        lastMessage: 'I need to reschedule my teeth whitening session.',
        time: '1h ago',
        status: 'new',
        aiMode: false, // Human Mode
        procedure: 'Teeth Whitening',
        notes: 'Requires manual human handoff due to rescheduling request.',
        messages: [
          { sender: 'patient', text: 'Hello, I booked a teeth whitening session for tomorrow at 2 PM.' },
          { sender: 'ai', text: 'Hi Babajide! That is wonderful. We look forward to seeing you at our Lekki clinic. Please remember to avoid coffee or dark beverages for 24 hours prior.', latency: '0.9s' },
          { sender: 'patient', text: 'Actually something came up, I need to reschedule my teeth whitening session.' },
          { sender: 'system', text: '⚠️ Conversation handed off to Receptionist (AI Mode Disabled).' }
        ]
      }
    ],
    activePatientId: 'chioma',

    // Dashboard data
    analytics: {
      totalMessages: 1420,
      confirmedBookings: 184,
      conversionRate: '13.0%',
      avgResponse: '0.85s',
      liveFeed: [
        { patient: 'Chioma Adebayo', action: 'Inquired Botox pricing on WhatsApp', handler: 'AI Agent', time: '2m ago' },
        { patient: 'Kelechi Okafor', action: 'Confirmed Lip Filler appointment', handler: 'AI Agent (Cal.com)', time: '15m ago' },
        { patient: 'Babajide Balogun', action: 'Handed off to Receptionist', handler: 'System Trigger', time: '1h ago' }
      ]
    }
  };

  /* ==========================================
     CANVAS HTML TEMPLATES (FIGMA SCREENS)
     ========================================== */

  // ❖ Page: Cover & References
  const templateCover = `
    <div class="canvas-cover-page figma-selectable" data-name="Cover Page Frame" data-type="Frame" data-width="900" data-height="600" data-x="100" data-y="100" data-radius="0" data-color="#0B0F19" data-module="General" data-notes="Introductory cover sheet detailing Design reference sites.">
      <div class="cover-badge">BassirAI Platform MVP</div>
      <h1 class="cover-title">AI Patient Agent<br>for Aesthetic Clinics</h1>
      <p class="cover-subtitle">A high-fidelity Figma Design Specification and interactive prototype simulated in React-equivalent HTML/CSS showing Onboarding, Unified Inbox, and Dashboard analytics, inspired by healthtap.com, modmed.com, and hyro.ai.</p>
      
      <div class="cover-meta-grid">
        <div class="cover-meta-card">
          <div class="cover-meta-num">30 Days</div>
          <div class="cover-meta-label">MVP Launch Timeline</div>
        </div>
        <div class="cover-meta-card">
          <div class="cover-meta-num">₦0/mo</div>
          <div class="cover-meta-label">Total Hosting Cost</div>
        </div>
        <div class="cover-meta-card">
          <div class="cover-meta-num">English</div>
          <div class="cover-meta-label">African Clinic Setup</div>
        </div>
        <div class="cover-meta-card">
          <div class="cover-meta-num">&lt; 1.0s</div>
          <div class="cover-meta-label">Groq Llama Latency</div>
        </div>
      </div>

      <div class="references-section">
        <h2 style="font-size:16px; text-transform:uppercase; color:var(--bassirai-gold); margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">Design References</h2>
        <div class="ref-row">
          <div class="ref-card">
            <h3>modmed.com</h3>
            <p>EHR information density, clear grids, sidebar dashboards, clinical tabular cards, and structured client appointment logs.</p>
          </div>
          <div class="ref-card">
            <h3>hyro.ai</h3>
            <p>Conversational AI settings, AI-to-Human takeover switch logic, sub-second latency tags, and dynamic prompt construction logs.</p>
          </div>
          <div class="ref-card">
            <h3>healthtap.com</h3>
            <p>Clean patient card summaries, simple color-coded badges, health chat interface guidelines, and active online statuses.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // ❖ Page: Design System Spec
  const templateDesignSystem = `
    <div class="design-system-spec">
      <div class="ds-header">
        <h1>BassirAI Core Design System Tokens</h1>
        <p>Predefined styles, palettes, and components for aesthetic medical clinics.</p>
      </div>
      
      <div class="ds-grid">
        <div class="ds-section">
          <h2>Color Swatches</h2>
          <div class="swatch-grid">
            <div class="swatch-card">
              <div class="swatch-color" style="background-color: #0B0F19;"></div>
              <div class="swatch-info">
                <span class="swatch-name">Luxury Navy (Dark BG)</span>
                <span class="swatch-hex">#0B0F19</span>
              </div>
            </div>
            <div class="swatch-card">
              <div class="swatch-color" style="background-color: #162032;"></div>
              <div class="swatch-info">
                <span class="swatch-name">Slate (Card BG)</span>
                <span class="swatch-hex">#162032</span>
              </div>
            </div>
            <div class="swatch-card">
              <div class="swatch-color" style="background-color: #C5A880;"></div>
              <div class="swatch-info">
                <span class="swatch-name">Champagne Gold</span>
                <span class="swatch-hex">#C5A880</span>
              </div>
            </div>
            <div class="swatch-card">
              <div class="swatch-color" style="background-color: #0D9488;"></div>
              <div class="swatch-info">
                <span class="swatch-name">Jade Teal</span>
                <span class="swatch-hex">#0D9488</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ds-section">
          <h2>Typography Styles</h2>
          <div class="typo-spec-item">
            <div class="typo-spec-left">
              <span class="typo-spec-name">Heading 1 (DM Serif)</span>
              <span class="typo-spec-sample" style="font-family:var(--font-serif); font-size: 28px; font-weight:700;">Zuri Aesthetic Clinic</span>
            </div>
            <span class="typo-spec-details">DM Serif / 28px / Bold</span>
          </div>
          <div class="typo-spec-item">
            <div class="typo-spec-left">
              <span class="typo-spec-name">Body Text (Outfit)</span>
              <span class="typo-spec-sample" style="font-family:var(--font-sans); font-size: 13px;">Manage client messages across WhatsApp and Facebook.</span>
            </div>
            <span class="typo-spec-details">Outfit / 13px / Light</span>
          </div>
          <div class="typo-spec-item">
            <div class="typo-spec-left">
              <span class="typo-spec-name">Monospace Code</span>
              <span class="typo-spec-sample" style="font-family:var(--font-mono); font-size: 11px;">groq_api_key: Llama3-70B-Versatile</span>
            </div>
            <span class="typo-spec-details">SFMono / 11px / Regular</span>
          </div>
        </div>

        <div class="ds-section">
          <h2>Button Components</h2>
          <div class="btn-samples">
            <button class="ds-btn primary figma-selectable" data-name="Button Primary" data-type="Button" data-width="120" data-height="36" data-x="40" data-y="300" data-radius="6" data-color="#C5A880" data-font="Outfit" data-fontsize="13px" data-fontweight="Medium" data-module="UI Kit" data-notes="Primary brand action button.">Gold Brand</button>
            <button class="ds-btn secondary figma-selectable" data-name="Button Outline" data-type="Button" data-width="120" data-height="36" data-x="180" data-y="300" data-radius="6" data-color="Transparent" data-font="Outfit" data-fontsize="13px" data-fontweight="Medium" data-module="UI Kit" data-notes="Secondary outlined action button.">Gold Outline</button>
            <button class="ds-btn teal-btn figma-selectable" data-name="Button Teal" data-type="Button" data-width="120" data-height="36" data-x="320" data-y="300" data-radius="6" data-color="#0D9488" data-font="Outfit" data-fontsize="13px" data-fontweight="Medium" data-module="UI Kit" data-notes="Success-equivalent clinical action button.">Teal Safe</button>
          </div>
        </div>

        <div class="ds-section">
          <h2>Status Indicators</h2>
          <div style="display:flex; gap:10px;">
            <span class="inbox-badge new">New Inbound</span>
            <span class="inbox-badge booked">Booked Session</span>
            <span class="inbox-badge ai-mode">AI Agent Mode</span>
            <span class="inbox-badge human-mode">Receptionist Handoff</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // ❖ Page: M1 - Auth & Onboarding
  const templateOnboarding = `
    <!-- Desktop Artboard -->
    <div class="figma-frame desktop-size selected-element-parent" id="frameOnboardingDesktop">
      <div class="figma-frame-title">Onboarding Wizard — Desktop <span class="res-badge">1200 x 750</span></div>
      
      <div class="app-container">
        <!-- App Header -->
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="clinic-badge">
            <span class="clinic-dot"></span>
            <span>Setup In Progress</span>
          </div>
        </header>

        <div class="app-body">
          <div class="app-content" style="display:flex; align-items:center; justify-content:center;">
            
            <div class="onboarding-wizard figma-selectable" data-name="Onboarding Wizard Card" data-type="Card" data-width="600" data-height="450" data-x="300" data-y="120" data-radius="16" data-color="#162032" data-module="M1: Onboarding" data-notes="Multi-step onboarding form to collect clinic details, upload pricing sheets, connect social profiles, and configure Llama tone.">
              <!-- Wizard Timeline -->
              <div class="wizard-steps-timeline">
                <div class="timeline-step completed">
                  <div class="step-number">1</div>
                  <span class="step-label">Identity</span>
                </div>
                <div class="timeline-step active">
                  <div class="step-number">2</div>
                  <span class="step-label">Channels</span>
                </div>
                <div class="timeline-step">
                  <div class="step-number">3</div>
                  <span class="step-label">Catalog</span>
                </div>
                <div class="timeline-step">
                  <div class="step-number">4</div>
                  <span class="step-label">FAQs</span>
                </div>
                <div class="timeline-step">
                  <div class="step-number">5</div>
                  <span class="step-label">Booking</span>
                </div>
                <div class="timeline-step">
                  <div class="step-number">6</div>
                  <span class="step-label">Test</span>
                </div>
              </div>

              <!-- Wizard Content -->
              <div class="wizard-content-pane active">
                <h2 class="wizard-pane-title">Configure Communication Channels</h2>
                <p class="wizard-pane-subtitle">Enable BassirAI to intercept message streams on WhatsApp, Instagram, and Facebook.</p>
                
                <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                  <div class="channel-selector-row">
                    <div class="channel-info wa"><i data-lucide="phone"></i> <span>WhatsApp Cloud API</span></div>
                    <label class="switch-control">
                      <input type="checkbox" checked disabled>
                      <span class="slider-round"></span>
                    </label>
                  </div>
                  
                  <div class="channel-selector-row">
                    <div class="channel-info ig"><i data-lucide="instagram"></i> <span>Instagram Graph API</span></div>
                    <label class="switch-control">
                      <input type="checkbox" checked disabled>
                      <span class="slider-round"></span>
                    </label>
                  </div>

                  <div class="channel-selector-row">
                    <div class="channel-info fb"><i data-lucide="facebook"></i> <span>Facebook Graph API</span></div>
                    <label class="switch-control">
                      <input type="checkbox" disabled>
                      <span class="slider-round"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Wizard Footer -->
              <div class="wizard-footer">
                <button class="ds-btn secondary" style="opacity:0.5;">Back</button>
                <button class="ds-btn primary">Next Step</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Artboard -->
    <div class="figma-frame mobile-size" id="frameOnboardingMobile">
      <div class="figma-frame-title">Wizard — Mobile <span class="res-badge">360 x 640</span></div>
      
      <div class="app-container" style="padding:16px; justify-content:center;">
        <div class="onboarding-wizard" style="margin:0; padding:20px; width:100%;">
          <h2 class="wizard-pane-title" style="font-size:16px;">Link WhatsApp</h2>
          <p class="wizard-pane-subtitle" style="font-size:11px;">Input your business line ID</p>
          <input type="text" class="wizard-input" value="wa_id_982348" style="margin-top:12px; font-size:12px;" readonly>
          <button class="ds-btn primary" style="width:100%; margin-top:20px; font-size:12px;">Link Number</button>
        </div>
      </div>
    </div>
  `;

  // ❖ Page: M3 - Unified Inbox
  const templateInbox = `
    <!-- Desktop Artboard -->
    <div class="figma-frame desktop-size selected-element-parent" id="frameInboxDesktop">
      <div class="figma-frame-title">Unified Inbox — Desktop <span class="res-badge">1200 x 750</span></div>
      
      <div class="app-container">
        <!-- App Header -->
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="app-nav">
            <span class="nav-link active">Unified Inbox</span>
            <span class="nav-link">Analytics</span>
            <span class="nav-link">AI Customizer</span>
            <span class="nav-link">Settings</span>
          </div>
          <div class="app-header-right">
            <div class="clinic-badge">
              <div class="clinic-dot"></div>
              <span>Zuri Clinic (Active)</span>
            </div>
          </div>
        </header>

        <!-- App Body -->
        <div class="app-body">
          <div class="inbox-layout">
            
            <!-- Chat List Sidebar -->
            <aside class="inbox-chats-sidebar">
              <div class="inbox-search-container">
                <div class="search-input-wrap">
                  <i data-lucide="search"></i>
                  <input type="text" placeholder="Search chats..." disabled>
                </div>
              </div>
              <div class="chat-list">
                <div class="chat-item active">
                  <div class="avatar-container">CA<span class="channel-badge whatsapp"><i data-lucide="phone"></i></span></div>
                  <div class="chat-item-content">
                    <div class="chat-item-top">
                      <span class="chat-patient-name">Chioma Adebayo</span>
                      <span class="chat-time">2m ago</span>
                    </div>
                    <p class="chat-message-preview">Hi, how much is the Botox treatment...</p>
                    <div class="chat-badge-row">
                      <span class="inbox-badge new">New</span>
                      <span class="inbox-badge ai-mode">AI ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div class="chat-item">
                  <div class="avatar-container">KO<span class="channel-badge whatsapp"><i data-lucide="phone"></i></span></div>
                  <div class="chat-item-content">
                    <div class="chat-item-top">
                      <span class="chat-patient-name">Kelechi Okafor</span>
                      <span class="chat-time">15m ago</span>
                    </div>
                    <p class="chat-message-preview">Today at 4:30 PM is perfect.</p>
                    <div class="chat-badge-row">
                      <span class="inbox-badge booked">Booked</span>
                      <span class="inbox-badge ai-mode">AI ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div class="chat-item">
                  <div class="avatar-container">BB<span class="channel-badge facebook"><i data-lucide="facebook"></i></span></div>
                  <div class="chat-item-content">
                    <div class="chat-item-top">
                      <span class="chat-patient-name">Babajide Balogun</span>
                      <span class="chat-time">1h ago</span>
                    </div>
                    <p class="chat-message-preview">I need to reschedule my teeth...</p>
                    <div class="chat-badge-row">
                      <span class="inbox-badge human-mode">HUMAN ONLY</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Chat View Window -->
            <section class="inbox-chat-view">
              <header class="chat-header">
                <div class="active-chat-details">
                  <span class="active-chat-name">Chioma Adebayo</span>
                  <span class="active-chat-phone">+234 803 123 4567</span>
                </div>
                
                <!-- HYRO.AI INSPIRED AI TAKEOVER SWITCH -->
                <div class="mode-toggle-container figma-selectable" data-name="AI Handoff Switcher" data-type="Toggle" data-width="170" data-height="34" data-x="680" data-y="70" data-radius="20" data-color="#162032" data-module="M3: Unified Inbox" data-notes="Crucial switch allowing receptionists to disable AI chatbot answering dynamically per thread, converting to manual reply mode.">
                  <button class="mode-toggle-btn ai-active"><i data-lucide="cpu"></i> AI Agent</button>
                  <button class="mode-toggle-btn"><i data-lucide="user"></i> Human</button>
                </div>
              </header>

              <!-- Chat messages area -->
              <div class="chat-messages-area">
                <div class="message-bubble-wrapper patient">
                  <span class="message-sender-meta">Patient (Chioma)</span>
                  <div class="message-bubble">Hello! I would like to know your clinic hours.</div>
                </div>

                <div class="message-bubble-wrapper ai">
                  <span class="message-sender-meta"><i data-lucide="cpu" style="width:10px; color:var(--bassirai-gold);"></i> BassirAI Agent</span>
                  <div class="message-bubble">Hello Chioma! We are open Monday through Saturday from 10:00 AM to 8:00 PM (WAT). We are closed on Sundays. Is there a specific service you are interested in booking?</div>
                  <span class="ai-latency-tag">AI Response: 0.8s via Llama 3.3</span>
                </div>

                <div class="message-bubble-wrapper patient">
                  <span class="message-sender-meta">Patient (Chioma)</span>
                  <div class="message-bubble">Hi, how much is the Botox treatment for forehead lines in Naira?</div>
                </div>

                <div class="message-bubble-wrapper ai">
                  <span class="message-sender-meta"><i data-lucide="cpu" style="width:10px; color:var(--bassirai-gold);"></i> BassirAI Agent</span>
                  <div class="message-bubble">Botox treatment at Zuri Aesthetic & Wellness Clinic is priced per area. For forehead lines, it typically ranges from ₦180,000 to ₦300,000 depending on the dosage needed, which is customized during your consultation in Lekki. Would you like to schedule a consultation with our practitioner?</div>
                  <span class="ai-latency-tag">AI Response: 0.9s via Llama 3.3</span>
                </div>
              </div>

              <!-- Input bar -->
              <div class="chat-input-bar">
                <input type="text" class="chat-input-field" value="Type a reply... (Disabled in AI Mode)" disabled>
                <button class="chat-send-btn"><i data-lucide="send"></i></button>
              </div>
            </section>

            <!-- Patient Context Side Panel (Healthtap Inspired) -->
            <aside class="inbox-patient-context figma-selectable" data-name="Patient Context Card" data-type="Panel" data-width="240" data-height="600" data-x="960" data-y="70" data-radius="0" data-color="#162032" data-module="M3: Unified Inbox" data-notes="Context board detailing customer records, booking info, and fast actions.">
              <div class="patient-profile-mini">
                <div class="big-avatar">CA</div>
                <span class="patient-name-big">Chioma Adebayo</span>
                <span style="font-size:10px; color:var(--color-success); font-weight:600; margin-top:4px;">● Patient Online</span>
              </div>
              
              <div class="patient-context-info">
                <div class="context-section-title">Context Card</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span class="info-row-label">Region:</span>
                  <span class="info-row-val" style="margin-left:auto;">Lagos, NG</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span class="info-row-label">Topic:</span>
                  <span class="info-row-val" style="margin-left:auto;">Botox Treatment</span>
                </div>
              </div>

              <div class="patient-context-info">
                <div class="context-section-title">AI Prompt Override</div>
                <div class="context-booking-details" style="font-size:10px; font-family:var(--font-mono);">
                  Tone: PROFESSIONAL<br>
                  Pricing context: loaded<br>
                  FAQ database: connected
                </div>
              </div>

              <div class="action-buttons-stack">
                <button class="inbox-action-btn gold">Qualify & Book Handoff</button>
                <button class="inbox-action-btn outline">Disable AI Mode</button>
              </div>
            </aside>

          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Artboard -->
    <div class="figma-frame mobile-size" id="frameInboxMobile">
      <div class="figma-frame-title">WhatsApp Interface — Mobile <span class="res-badge">360 x 640</span></div>
      
      <div class="phone-screen">
        <!-- WhatsApp Header -->
        <header class="wa-header">
          <span class="wa-header-back"><i data-lucide="chevron-left"></i></span>
          <div class="wa-avatar">Z</div>
          <div class="wa-name-col">
            <span class="wa-name">Zuri Aesthetic Clinic</span>
            <span class="wa-status">Online • BassirAI Agent</span>
          </div>
        </header>

        <!-- Messages -->
        <div class="wa-messages-area">
          <div class="wa-msg inbound">
            Hello, do you have space for lip filler in your Lekki clinic today?
            <span class="wa-msg-time">11:02 AM</span>
          </div>
          <div class="wa-msg outbound">
            Hello Kelechi! Welcome to Zuri Aesthetic & Wellness Clinic. We have a slot available today at 4:30 PM or tomorrow at 11:00 AM at our Lekki office. Which time works best for you?
            <span class="wa-msg-time">11:03 AM</span>
          </div>
        </div>

        <!-- WA Input -->
        <div class="wa-input-bar">
          <div class="wa-input-wrap">
            <input type="text" value="Today at 4:30 PM is perfect." readonly>
          </div>
          <button class="wa-send-btn"><i data-lucide="send"></i></button>
        </div>
      </div>
    </div>
  `;

  // ❖ Page: M5 - Clinic Dashboard
  const templateDashboard = `
    <!-- Desktop Artboard -->
    <div class="figma-frame desktop-size selected-element-parent" id="frameDashboardDesktop">
      <div class="figma-frame-title">Clinic Dashboard — Desktop <span class="res-badge">1200 x 750</span></div>
      
      <div class="app-container">
        <!-- Header -->
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="app-nav">
            <span class="nav-link">Unified Inbox</span>
            <span class="nav-link active">Analytics</span>
            <span class="nav-link">AI Customizer</span>
            <span class="nav-link">Settings</span>
          </div>
          <div class="app-header-right">
            <div class="clinic-badge">
              <div class="clinic-dot"></div>
              <span>Zuri Clinic Dashboard</span>
            </div>
          </div>
        </header>

        <div class="app-body">
          <!-- Left menu -->
          <aside class="app-nav-sidebar">
            <a href="#" class="app-nav-item active"><i data-lucide="bar-chart-2"></i> Overview</a>
            <a href="#" class="app-nav-item"><i data-lucide="calendar"></i> Booking Metrics</a>
            <a href="#" class="app-nav-item"><i data-lucide="users"></i> Patient Database</a>
            <a href="#" class="app-nav-item"><i data-lucide="settings"></i> Configurations</a>
          </aside>

          <div class="app-content">
            <!-- KPI statistics (ModMed design style) -->
            <div class="dashboard-kpi-grid">
              
              <div class="kpi-card figma-selectable" data-name="KPI Card: Total Messages" data-type="Card" data-width="220" data-height="110" data-x="220" data-y="70" data-radius="12" data-color="#162032" data-module="M5: Analytics Dashboard" data-notes="Aggregates inbound messages across WhatsApp, Instagram and Facebook.">
                <div class="kpi-header">
                  <span>Total Messages</span>
                  <div class="kpi-icon-wrap"><i data-lucide="message-square"></i></div>
                </div>
                <div class="kpi-value">1,420</div>
                <div class="kpi-change positive"><i data-lucide="trending-up"></i> +12% vs last week</div>
              </div>

              <div class="kpi-card figma-selectable" data-name="KPI Card: Bookings" data-type="Card" data-width="220" data-height="110" data-x="460" data-y="70" data-radius="12" data-color="#162032" data-module="M5: Analytics Dashboard" data-notes="Count of confirmed clinic visits automatically arranged by AI or synced from Cal.com.">
                <div class="kpi-header">
                  <span>Confirmed Bookings</span>
                  <div class="kpi-icon-wrap"><i data-lucide="calendar"></i></div>
                </div>
                <div class="kpi-value">184</div>
                <div class="kpi-change positive"><i data-lucide="trending-up"></i> +8% all-time</div>
              </div>

              <div class="kpi-card figma-selectable" data-name="KPI Card: Conv. Rate" data-type="Card" data-width="220" data-height="110" data-x="700" data-y="70" data-radius="12" data-color="#162032" data-module="M5: Analytics Dashboard" data-notes="Inquiry-to-booking success rate.">
                <div class="kpi-header">
                  <span>Conversion Rate</span>
                  <div class="kpi-icon-wrap"><i data-lucide="award"></i></div>
                </div>
                <div class="kpi-value">13.0%</div>
                <div class="kpi-change positive"><i data-lucide="trending-up"></i> Target: 10%</div>
              </div>

              <div class="kpi-card figma-selectable" data-name="KPI Card: Latency" data-type="Card" data-width="220" data-height="110" data-x="940" data-y="70" data-radius="12" data-color="#162032" data-module="M5: Analytics Dashboard" data-notes="Sub-second response speed achieved using Llama 3.3 via Groq API.">
                <div class="kpi-header">
                  <span>Avg Response Time</span>
                  <div class="kpi-icon-wrap"><i data-lucide="zap"></i></div>
                </div>
                <div class="kpi-value">0.85s</div>
                <div class="kpi-change positive" style="color:var(--bassirai-gold);"><i data-lucide="cpu"></i> Groq Llama 3.3</div>
              </div>

            </div>

            <!-- Charts (Modmed Layout) -->
            <div class="dashboard-row-2">
              <div class="chart-card">
                <div class="card-title-row">
                  <div>
                    <h3 class="card-title">Message Volume Over Time</h3>
                    <span class="card-subtitle-small">Aggregated channel performance</span>
                  </div>
                </div>
                <!-- Line Chart placeholder SVG -->
                <svg class="chart-placeholder-svg" viewBox="0 0 500 200">
                  <path d="M 0 160 Q 50 150 100 120 T 200 90 T 300 100 T 400 40 T 500 20" fill="none" stroke="var(--bassirai-gold)" stroke-width="3" />
                  <path d="M 0 160 Q 50 150 100 120 T 200 90 T 300 100 T 400 40 T 500 20 L 500 200 L 0 200 Z" fill="rgba(197,168,128,0.05)" />
                  <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                  <text x="10" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Mon</text>
                  <text x="110" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Tue</text>
                  <text x="210" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Wed</text>
                  <text x="310" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Thu</text>
                  <text x="410" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Fri</text>
                </svg>
              </div>

              <div class="live-feed-card">
                <div class="card-title-row">
                  <h3 class="card-title">Real-time Activity</h3>
                </div>
                <div class="activity-list">
                  <div class="activity-item">
                    <div class="activity-icon"><i data-lucide="message-square"></i></div>
                    <div>
                      <strong>Chioma A.</strong> asked about Botox pricing
                      <div class="activity-time">2m ago</div>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon" style="color:var(--color-success);"><i data-lucide="check"></i></div>
                    <div>
                      <strong>Kelechi O.</strong> booked Lip Filler
                      <div class="activity-time">15m ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Artboard -->
    <div class="figma-frame mobile-size" id="frameDashboardMobile">
      <div class="figma-frame-title">Dashboard — Mobile <span class="res-badge">360 x 640</span></div>
      
      <div class="app-container" style="padding:12px;">
        <h3 class="card-title" style="margin-bottom:10px;">Total Messages</h3>
        <div class="kpi-card" style="margin-bottom:10px;">
          <div class="kpi-value" style="font-size:20px;">1,420</div>
          <span style="font-size:10px; color:var(--color-success);">+12% vs last week</span>
        </div>
        <h3 class="card-title" style="margin-bottom:10px;">Bookings</h3>
        <div class="kpi-card">
          <div class="kpi-value" style="font-size:20px;">184</div>
        </div>
      </div>
    </div>
  `;

  // ❖ Page: M4 - Booking Handoff
  const templateBooking = `
    <!-- Desktop Artboard -->
    <div class="figma-frame desktop-size selected-element-parent" id="frameBookingDesktop">
      <div class="figma-frame-title">Booking Setup — Desktop <span class="res-badge">1200 x 750</span></div>
      
      <div class="app-container">
        <!-- Header -->
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="app-nav">
            <span class="nav-link">Unified Inbox</span>
            <span class="nav-link">Analytics</span>
            <span class="nav-link">AI Customizer</span>
            <span class="nav-link active">Settings</span>
          </div>
          <div class="app-header-right">
            <div class="clinic-badge">
              <div class="clinic-dot"></div>
              <span>Zuri Clinic Booking Setup</span>
            </div>
          </div>
        </header>

        <div class="app-body">
          <aside class="app-nav-sidebar">
            <a href="#" class="app-nav-item"><i data-lucide="bar-chart-2"></i> Overview</a>
            <a href="#" class="app-nav-item active"><i data-lucide="calendar"></i> Booking Metrics</a>
            <a href="#" class="app-nav-item"><i data-lucide="users"></i> Patient Database</a>
            <a href="#" class="app-nav-item"><i data-lucide="settings"></i> Configurations</a>
          </aside>

          <div class="app-content">
            <h2 class="card-title" style="font-size:18px; margin-bottom:16px;">Dual Booking Strategies</h2>
            
            <div class="booking-strategy-grid">
              
              <!-- Strategy A -->
              <div class="strategy-card selected figma-selectable" data-name="Strategy Card: Handoff" data-type="Card" data-width="450" data-height="180" data-x="220" data-y="100" data-radius="12" data-color="#162032" data-module="M4: Booking System" data-notes="Bot collects details (phone, procedure) and leaves a task in the inbox for the receptionist to finalize. Best for high-ticket surgeries.">
                <div class="strategy-title-row">
                  <h3 class="card-title">Strategy A: Qualify & Handoff</h3>
                  <span class="strategy-pill">Active</span>
                </div>
                <p class="ref-desc">BassirAI collects treatment preferences and phone details from the patient, then triggers a task in the Unified Inbox for receptionist follow-up.</p>
                <div style="font-size:11px; color:var(--bassirai-gold); font-weight:600;"><i data-lucide="cpu" style="width:12px; vertical-align:middle;"></i> AI Lead Qualification Enabled</div>
              </div>

              <!-- Strategy B -->
              <div class="strategy-card figma-selectable" data-name="Strategy Card: Cal.com" data-type="Card" data-width="450" data-height="180" data-x="690" data-y="100" data-radius="12" data-color="#162032" data-module="M4: Booking System" data-notes="Bot checks availability and sends direct self-service Cal.com booking link.">
                <div class="strategy-title-row">
                  <h3 class="card-title">Strategy B: Self-Service Cal.com</h3>
                  <span class="strategy-pill" style="opacity:0.5;">Inactive</span>
                </div>
                <p class="ref-desc">Automatically sends a booking url in the chat when the patient expresses intent to secure an appointment immediately.</p>
                <input type="text" class="wizard-input" value="https://cal.com/zuri-clinic/consultation" style="font-size:11px; padding:6px 10px;" readonly>
              </div>

            </div>

            <!-- Booking list table -->
            <div class="pending-bookings-card">
              <h3 class="card-title">Pending Human Review & Confirmation</h3>
              <table class="bookings-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Procedure</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Chioma Adebayo</td>
                    <td>Botox Forehead</td>
                    <td>Today (ASAP)</td>
                    <td><span class="inbox-badge new" style="background-color:rgba(245, 158, 11, 0.15); color:var(--color-warning);">Awaiting Review</span></td>
                    <td class="booking-actions">
                      <button class="action-btn-small confirm">Confirm</button>
                      <button class="action-btn-small cancel">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Artboard -->
    <div class="figma-frame mobile-size" id="frameBookingMobile">
      <div class="figma-frame-title">Booking — Mobile <span class="res-badge">360 x 640</span></div>
      <div class="app-container" style="padding:16px;">
        <h3 class="card-title" style="margin-bottom:10px;">Select Strategy</h3>
        <div class="strategy-card selected" style="padding:12px;">
          <h4 style="font-size:12px; color:#FFFFFF;">Qualify & Handoff</h4>
          <p style="font-size:10px; color:var(--bassirai-text-light-muted); margin-top:4px;">Receptionist calls patient directly to book.</p>
        </div>
      </div>
    </div>
  `;

  // Layer Tree definitions for each page
  const layersData = {
    'cover': [
      { name: 'Cover Page Frame', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'Cover Badge Pill', type: 'Frame', indent: 24, icon: 'tag' },
      { name: 'Header Title Text', type: 'Type', indent: 24, icon: 'type' },
      { name: 'Sub-description', type: 'Type', indent: 24, icon: 'type' },
      { name: 'KPI Meta Grid', type: 'Group', indent: 24, icon: 'grid' },
      { name: 'Meta Card 1 (Timeline)', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Meta Card 2 (Cost)', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Meta Card 3 (Bilingual)', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Meta Card 4 (Groq Speed)', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Design References Title', type: 'Type', indent: 24, icon: 'type' },
      { name: 'Reference Site row', type: 'Group', indent: 24, icon: 'columns' },
      { name: 'modmed.com Info Card', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'hyro.ai Info Card', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'healthtap.com Info Card', type: 'Frame', indent: 40, icon: 'square' }
    ],
    'design-system': [
      { name: 'Design System Workspace', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'Header Block', type: 'Group', indent: 24, icon: 'columns' },
      { name: 'Color Swatches Section', type: 'Group', indent: 24, icon: 'grid' },
      { name: 'Swatch: Navy', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Swatch: Card Navy', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Swatch: Rose Gold', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Swatch: Jade Teal', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Typography Specifications', type: 'Group', indent: 24, icon: 'type' },
      { name: 'Button Components Samples', type: 'Group', indent: 24, icon: 'component' },
      { name: 'Status Indicator Pill Badges', type: 'Group', indent: 24, icon: 'tag' }
    ],
    'm1-onboarding': [
      { name: 'Onboarding Desktop Viewport', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'App Header Bar', type: 'Frame', indent: 24, icon: 'credit-card' },
      { name: 'Onboarding Wizard Card', type: 'Frame', indent: 24, icon: 'square' },
      { name: 'Steps Horizontal Timeline', type: 'Group', indent: 40, icon: 'columns' },
      { name: 'Step 1: Identity Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Step 2: Channels Badge (Active)', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Step 3: Catalog Upload Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Step 4: FAQs Form Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Step 5: Booking Setup Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Step 6: Test Playground Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Wizard Body Container', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Channel List Group', type: 'Group', indent: 56, icon: 'grid' },
      { name: 'WhatsApp Toggle Row', type: 'Frame', indent: 72, icon: 'square' },
      { name: 'Instagram Toggle Row', type: 'Frame', indent: 72, icon: 'square' },
      { name: 'Facebook Toggle Row', type: 'Frame', indent: 72, icon: 'square' },
      { name: 'Wizard Nav Footer', type: 'Frame', indent: 40, icon: 'credit-card' },
      { name: 'Button Back (Secondary)', type: 'Button', indent: 56, icon: 'arrow-left' },
      { name: 'Button Next Step (Primary)', type: 'Button', indent: 56, icon: 'arrow-right' },
      { name: 'Onboarding Mobile Device View', type: 'Frame', indent: 8, icon: 'smartphone' }
    ],
    'm3-inbox': [
      { name: 'Unified Inbox Desktop Viewport', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'App Header Navigation', type: 'Frame', indent: 24, icon: 'credit-card' },
      { name: 'Workspace Body Layout', type: 'Group', indent: 24, icon: 'columns' },
      { name: 'Inbox Chat List Sidebar', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Search Input Box', type: 'Frame', indent: 56, icon: 'search' },
      { name: 'Patient Chat Item: Chioma Adebayo', type: 'Frame', indent: 56, icon: 'square' },
      { name: 'Patient Chat Item: Kelechi Okafor', type: 'Frame', indent: 56, icon: 'square' },
      { name: 'Patient Chat Item: Babajide Balogun', type: 'Frame', indent: 56, icon: 'square' },
      { name: 'Active Chat view Panel', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Chat View Header Bar', type: 'Frame', indent: 56, icon: 'square' },
      { name: 'AI Handoff Switcher', type: 'Toggle', indent: 72, icon: 'toggle-left' },
      { name: 'Message Streams Area', type: 'Frame', indent: 56, icon: 'message-square' },
      { name: 'Patient Message Bubble', type: 'Frame', indent: 72, icon: 'message-circle' },
      { name: 'BassirAI Automated Response', type: 'Frame', indent: 72, icon: 'cpu' },
      { name: 'Inquiry Input Bar', type: 'Frame', indent: 56, icon: 'credit-card' },
      { name: 'Inquiry Input Field', type: 'Frame', indent: 72, icon: 'type' },
      { name: 'Button Send Reply', type: 'Button', indent: 72, icon: 'send' },
      { name: 'Patient Context Card', type: 'Panel', indent: 40, icon: 'square' },
      { name: 'Big Avatar Badge', type: 'Frame', indent: 56, icon: 'circle' },
      { name: 'Details Section List', type: 'Group', indent: 56, icon: 'list' },
      { name: 'Button Qualify & Book', type: 'Button', indent: 56, icon: 'calendar' },
      { name: 'Button Disable AI Mode', type: 'Button', indent: 56, icon: 'user-check' },
      { name: 'WhatsApp Mobile Device View', type: 'Frame', indent: 8, icon: 'smartphone' }
    ],
    'm5-dashboard': [
      { name: 'Clinic Dashboard Desktop Viewport', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'App Header Nav Bar', type: 'Frame', indent: 24, icon: 'credit-card' },
      { name: 'Dashboard Body Layout', type: 'Group', indent: 24, icon: 'columns' },
      { name: 'App Sidebar Navigation Menu', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Dashboard Content Area', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'KPI Statistics Cards Grid', type: 'Group', indent: 56, icon: 'grid' },
      { name: 'KPI Card: Total Messages', type: 'Card', indent: 72, icon: 'message-square' },
      { name: 'KPI Card: Bookings', type: 'Card', indent: 72, icon: 'calendar' },
      { name: 'KPI Card: Conv. Rate', type: 'Card', indent: 72, icon: 'award' },
      { name: 'KPI Card: Latency', type: 'Card', indent: 72, icon: 'zap' },
      { name: 'Analytics Row 2', type: 'Group', indent: 56, icon: 'columns' },
      { name: 'Volume Chart Container', type: 'Frame', indent: 72, icon: 'trending-up' },
      { name: 'Chart Line Path', type: 'Vector', indent: 88, icon: 'activity' },
      { name: 'Real-time Activity Feed Card', type: 'Frame', indent: 72, icon: 'square' },
      { name: 'Activity List Feed', type: 'Group', indent: 88, icon: 'list' },
      { name: 'Dashboard Mobile Device View', type: 'Frame', indent: 8, icon: 'smartphone' }
    ],
    'm4-booking': [
      { name: 'Booking Desktop Viewport', type: 'Frame', indent: 8, icon: 'layout' },
      { name: 'App Header Menu Bar', type: 'Frame', indent: 24, icon: 'credit-card' },
      { name: 'Booking Main Body Layout', type: 'Group', indent: 24, icon: 'columns' },
      { name: 'App Sidebar Navigation', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Booking Content Panel', type: 'Frame', indent: 40, icon: 'square' },
      { name: 'Strategy Cards Row', type: 'Group', indent: 56, icon: 'columns' },
      { name: 'Strategy Card: Handoff', type: 'Card', indent: 72, icon: 'square' },
      { name: 'Strategy Card: Cal.com', type: 'Card', indent: 72, icon: 'square' },
      { name: 'Review Bookings Card', type: 'Frame', indent: 56, icon: 'square' },
      { name: 'Bookings Data Table', type: 'Frame', indent: 72, icon: 'table' },
      { name: 'Booking Mobile Device View', type: 'Frame', indent: 8, icon: 'smartphone' }
    ]
  };

  /* ==========================================
     CORE CANVAS RENDERER & ACTIONS
     ========================================== */

  // Load selected Page Content into Figma Canvas
  function loadPage(pageName) {
    state.activePage = pageName;
    
    // Update active class on left sidebar page items
    document.querySelectorAll('#pagesList .page-item').forEach(item => {
      if (item.getAttribute('data-page') === pageName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Populate Layers tree
    populateLayers(pageName);

    // Reset element selection
    clearElementSelection();

    // Render workspace contents based on selected page
    const wrapper = document.getElementById('canvasContentWrapper');
    if (pageName === 'cover') {
      wrapper.innerHTML = templateCover;
    } else if (pageName === 'design-system') {
      wrapper.innerHTML = templateDesignSystem;
    } else if (pageName === 'm1-onboarding') {
      wrapper.innerHTML = templateOnboarding;
    } else if (pageName === 'm3-inbox') {
      wrapper.innerHTML = templateInbox;
    } else if (pageName === 'm5-dashboard') {
      wrapper.innerHTML = templateDashboard;
    } else if (pageName === 'm4-booking') {
      wrapper.innerHTML = templateBooking;
    }

    // Refresh Lucide icons for dynamic templates
    lucide.createIcons();

    // Add click listeners to selectable elements on the newly loaded artboards
    const selectables = wrapper.querySelectorAll('.figma-selectable');
    selectables.forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid parent selection triggers
        selectElement(elem);
      });
    });
  }

  // Populate layers sidebar list based on pages
  function populateLayers(pageName) {
    const list = document.getElementById('layersTree');
    list.innerHTML = '';
    
    const layers = layersData[pageName] || [];
    layers.forEach(layer => {
      const li = document.createElement('li');
      li.className = 'layer-item';
      li.style.setProperty('--indent', `${layer.indent}px`);
      li.setAttribute('data-layer-name', layer.name);
      
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', layer.icon);
      
      const span = document.createElement('span');
      span.textContent = layer.name;
      
      li.appendChild(icon);
      li.appendChild(span);
      list.appendChild(li);

      // Sync layer item click back to canvas selection
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove active layer styles
        document.querySelectorAll('#layersTree .layer-item').forEach(i => i.classList.remove('active'));
        li.classList.add('active');

        // Find corresponding canvas element and select it
        const canvasElem = document.querySelector(`[data-name="${layer.name}"]`);
        if (canvasElem) {
          selectElement(canvasElem, false); // select without clicking layer again
        }
      });
    });

    lucide.createIcons({
      attrs: {
        class: ['layer-icon-class']
      }
    });
  }

  // Handle Figma element selection on canvas
  function selectElement(elem, syncLayerTree = true) {
    // Clear previous selection
    clearElementSelection();

    // Add selected class
    state.selectedElement = elem;
    elem.classList.add('selected');

    // Read attributes
    const name = elem.getAttribute('data-name') || 'Unnamed Element';
    const type = elem.getAttribute('data-type') || 'Instance';
    const w = elem.getAttribute('data-width') || '-';
    const h = elem.getAttribute('data-height') || '-';
    const x = elem.getAttribute('data-x') || '-';
    const y = elem.getAttribute('data-y') || '-';
    const radius = elem.getAttribute('data-radius') || '-';
    const color = elem.getAttribute('data-color') || '#FFFFFF';
    const font = elem.getAttribute('data-font') || 'Outfit';
    const fontsize = elem.getAttribute('data-fontsize') || '13px';
    const fontweight = elem.getAttribute('data-fontweight') || 'Regular';
    const module = elem.getAttribute('data-module') || '-';
    const notes = elem.getAttribute('data-notes') || '-';

    // Update Right Inspector Sidebar UI
    document.getElementById('inspectElementName').textContent = name;
    document.getElementById('inspectElementType').textContent = type;
    document.getElementById('inspectGeoX').value = `${x}px`;
    document.getElementById('inspectGeoY').value = `${y}px`;
    document.getElementById('inspectGeoW').value = `${w}px`;
    document.getElementById('inspectGeoH').value = `${h}px`;
    document.getElementById('inspectGeoR').value = radius !== '-' ? `${radius}px` : '0px';
    document.getElementById('inspectColorHex').value = color;
    document.getElementById('inspectColorPreview').style.backgroundColor = color === 'Transparent' ? 'transparent' : color;
    
    // Typo details
    const typoSection = document.getElementById('inspectTypographySection');
    if (elem.getAttribute('data-font')) {
      typoSection.style.display = 'block';
      document.getElementById('inspectFontFamily').textContent = font;
      document.getElementById('inspectFontSize').textContent = fontsize;
      document.getElementById('inspectFontWeight').textContent = fontweight;
    } else {
      typoSection.style.display = 'none';
    }

    // Update inspect code block
    const cssSpec = `/* CSS Specs for .${name.toLowerCase().replace(/[^a-z0-9]/g, '-')} */
position: absolute;
left: ${x}px;
top: ${y}px;
width: ${w}px;
height: ${h}px;
background: ${color};
border-radius: ${radius !== '-' ? radius + 'px' : '0px'};
${elem.getAttribute('data-font') ? `font-family: '${font}';\nfont-size: ${fontsize};\nfont-weight: ${fontweight === 'Bold' ? '700' : fontweight === 'Medium' ? '500' : '400'};` : ''}
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);`;
    
    document.getElementById('inspectCssCode').textContent = cssSpec;

    // Component details
    document.getElementById('inspectMetaModule').textContent = module;
    document.getElementById('inspectMetaNotes').textContent = notes;

    // Sync to left layer list
    if (syncLayerTree) {
      document.querySelectorAll('#layersTree .layer-item').forEach(item => {
        if (item.getAttribute('data-layer-name') === name) {
          item.classList.add('active');
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          item.classList.remove('active');
        }
      });
    }
  }

  function clearElementSelection() {
    if (state.selectedElement) {
      state.selectedElement.classList.remove('selected');
      state.selectedElement = null;
    }
    document.getElementById('inspectElementName').textContent = 'None selected';
    document.getElementById('inspectElementType').textContent = 'Select any element on the canvas to inspect it';
    document.getElementById('inspectGeoX').value = '-';
    document.getElementById('inspectGeoY').value = '-';
    document.getElementById('inspectGeoW').value = '-';
    document.getElementById('inspectGeoH').value = '-';
    document.getElementById('inspectGeoR').value = '-';
    document.getElementById('inspectColorHex').value = '#FFFFFF';
    document.getElementById('inspectColorPreview').style.backgroundColor = 'transparent';
    document.getElementById('inspectTypographySection').style.display = 'none';
    document.getElementById('inspectCssCode').textContent = '/* Select an element on the canvas to view its CSS specifications */';
    document.getElementById('inspectMetaModule').textContent = '-';
    document.getElementById('inspectMetaNotes').textContent = '-';
  }

  // Zoom controls
  function applyZoom(zoomVal) {
    state.zoom = Math.max(0.2, Math.min(2.0, zoomVal));
    document.getElementById('canvasContainer').style.transform = `scale(${state.zoom})`;
    document.getElementById('zoomPercent').textContent = `${Math.round(state.zoom * 100)}%`;
  }

  document.getElementById('zoomInBtn').addEventListener('click', () => applyZoom(state.zoom + 0.1));
  document.getElementById('zoomOutBtn').addEventListener('click', () => applyZoom(state.zoom - 0.1));
  document.getElementById('zoomResetBtn').addEventListener('click', () => applyZoom(0.85));

  // Switch Figma Pages list
  document.querySelectorAll('#pagesList .page-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      loadPage(page);
    });
  });

  // Switch Right Sidebar tabs (Design, Prototype, Inspect)
  document.querySelectorAll('.right-sidebar-tabs .sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.right-sidebar-tabs .sidebar-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-tab');
      document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${targetTab}TabContent`).classList.add('active');
    });
  });

  // Copy CSS Spec Code button
  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('inspectCssCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyCodeBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check"></i> Copied!`;
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalText;
        lucide.createIcons();
      }, 1500);
    });
  });

  // Theme Toggler for Figma Workspace Shell
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const body = document.body;
    if (state.theme === 'dark') {
      body.classList.remove('figma-dark-theme');
      body.classList.add('figma-light-theme');
      state.theme = 'light';
      document.getElementById('themeToggleBtn').innerHTML = `<i data-lucide="moon"></i>`;
    } else {
      body.classList.remove('figma-light-theme');
      body.classList.add('figma-dark-theme');
      state.theme = 'dark';
      document.getElementById('themeToggleBtn').innerHTML = `<i data-lucide="sun"></i>`;
    }
    lucide.createIcons();
  });


  /* ==========================================
     PRESENT / PROTOTYPE INTERACTIVE PLAYGROUND
     ========================================== */

  const playOverlay = document.getElementById('prototypePlayerOverlay');
  const desktopFrame = document.getElementById('desktopDeviceFrame');
  const mobileFrame = document.getElementById('mobileDeviceFrame');

  // Trigger Play Present Mode
  document.getElementById('playPrototypeBtn').addEventListener('click', () => {
    playOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    launchDemo();
  });

  // Exit Presentation Mode
  document.getElementById('exitPlayerBtn').addEventListener('click', () => {
    playOverlay.style.display = 'none';
  });

  // Selector Desktop / Mobile Simulator Mode
  document.querySelectorAll('.play-mode-pill button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.play-mode-pill button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const mode = btn.getAttribute('data-pmode');
      state.presentationMode = mode;
      
      if (mode === 'desktop') {
        desktopFrame.style.display = 'flex';
        mobileFrame.style.display = 'none';
        document.getElementById('playerTipsContent').innerHTML = `You are currently looking at the <strong>Aesthetics Admin Portal</strong>. Toggle "Mobile" in the header to chat as a patient and watch the AI respond under 1s!`;
        renderDesktopApp();
      } else {
        desktopFrame.style.display = 'none';
        mobileFrame.style.display = 'flex';
        document.getElementById('playerTipsContent').innerHTML = `You are currently in the <strong>Patient WhatsApp Simulator</strong>. Send a message to query Zuri Aesthetic & Wellness Clinic, and see BassirAI answer instantly in under 1s.`;
        renderMobileApp();
      }
    });
  });

  // Demo controls
  document.getElementById('demoRestartBtn').addEventListener('click', () => {
    state.onboardingStep = 1;
    state.activePatientId = 'chioma';
    state.patients[0].messages = state.patients[0].messages.slice(0, 4); // Reset Chioma
    state.patients[1].messages = state.patients[1].messages.slice(0, 4); // Reset Kelechi
    state.patients[2].messages = state.patients[2].messages.slice(0, 3); // Reset Babajide
    state.analytics.confirmedBookings = 184; // Reset bookings count
    
    launchDemo();
  });

  document.getElementById('demoToggleTone').addEventListener('click', () => {
    if (state.clinicTone === 'professional') {
      state.clinicTone = 'luxury';
      document.getElementById('currentDemoToneText').textContent = 'Tone: Luxury';
    } else if (state.clinicTone === 'luxury') {
      state.clinicTone = 'friendly';
      document.getElementById('currentDemoToneText').textContent = 'Tone: Friendly';
    } else {
      state.clinicTone = 'professional';
      document.getElementById('currentDemoToneText').textContent = 'Tone: Professional';
    }
    if (state.presentationMode === 'desktop') renderDesktopApp();
  });

  // Launch Demo depending on current wizard steps or screens
  function launchDemo() {
    if (state.presentationMode === 'desktop') {
      renderDesktopApp();
    } else {
      renderMobileApp();
    }
  }

  /* ==========================================
     SIMULATOR ENGINE 1: DESKTOP ADMIN APP
     ========================================== */

  function renderDesktopApp() {
    const viewport = document.getElementById('desktopBrowserViewport');
    
    if (state.onboardingStep <= 5) {
      renderDesktopOnboarding(viewport);
    } else {
      renderDesktopDashboard(viewport);
    }
  }

  // Render setup screens
  function renderDesktopOnboarding(container) {
    let stepTitle = '';
    let stepDesc = '';
    let stepBodyHTML = '';

    switch(state.onboardingStep) {
      case 1:
        stepTitle = 'Establish Clinic Identity';
        stepDesc = 'Configure basic profile metadata for clinic branding.';
        stepBodyHTML = `
          <div class="form-row">
            <div class="form-group">
              <label>Clinic Name</label>
              <input type="text" class="wizard-input" id="setupClinicName" value="${state.clinicName}">
            </div>
            <div class="form-group">
              <label>Primary Language</label>
              <select class="wizard-input" id="setupClinicLang" style="background-color:#1E293B;">
                <option value="en" selected>English (West Africa)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>AI Tone of Voice</label>
              <select class="wizard-input" id="setupClinicTone" style="background-color:#1E293B;">
                <option value="professional" ${state.clinicTone === 'professional' ? 'selected' : ''}>Professional & Caring</option>
                <option value="luxury" ${state.clinicTone === 'luxury' ? 'selected' : ''}>Luxurious & Premium</option>
                <option value="friendly" ${state.clinicTone === 'friendly' ? 'selected' : ''}>Friendly & Welcoming</option>
              </select>
            </div>
            <div class="form-group">
              <label>Main Clinic Line ID</label>
              <input type="text" class="wizard-input" value="+234 803 123 4567" readonly>
            </div>
          </div>
        `;
        break;
      case 2:
        stepTitle = 'Channel API Connections';
        stepDesc = 'Activate webhook endpoints for social channels.';
        stepBodyHTML = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="channel-selector-row">
              <div class="channel-info wa"><i data-lucide="phone"></i> <span>WhatsApp Cloud API (n8n Webhook Linked)</span></div>
              <label class="switch-control">
                <input type="checkbox" checked>
                <span class="slider-round"></span>
              </label>
            </div>
            <div class="channel-selector-row">
              <div class="channel-info ig"><i data-lucide="instagram"></i> <span>Instagram DM Integration</span></div>
              <label class="switch-control">
                <input type="checkbox" checked>
                <span class="slider-round"></span>
              </label>
            </div>
            <div class="channel-selector-row">
              <div class="channel-info fb"><i data-lucide="facebook"></i> <span>Facebook Page integration</span></div>
              <label class="switch-control">
                <input type="checkbox">
                <span class="slider-round"></span>
              </label>
            </div>
          </div>
        `;
        break;
      case 3:
        stepTitle = 'Pricing & Procedure Catalog';
        stepDesc = 'Upload pricing guides. Llama uses this catalog to answers price inquiries directly.';
        stepBodyHTML = `
          <div class="dropzone-mockup" id="catalogDropzone">
            <i data-lucide="upload-cloud"></i>
            <span style="font-size:12px; font-weight:600; color:#FFFFFF;">Upload Catalog JSON / CSV</span>
            <span style="font-size:10px; color:var(--bassirai-text-light-muted);">Or drag and drop your procedures and price sheets.</span>
          </div>
          <div class="catalog-list-preview">
            <span style="font-size:10px; text-transform:uppercase; font-weight:700; color:var(--bassirai-gold);">Active Services List</span>
            <div class="catalog-item-row">
              <span>Botox treatment (forehead)</span>
              <strong>₦180,000 - ₦300,000</strong>
            </div>
            <div class="catalog-item-row">
              <span>Lip Filler (Juvederm/Restylane)</span>
              <strong>₦450,000 - ₦600,000 per syringe</strong>
            </div>
            <div class="catalog-item-row">
              <span>Laser Skin Resurfacing</span>
              <strong>₦250,000 per session</strong>
            </div>
          </div>
        `;
        break;
      case 4:
        stepTitle = 'Knowledge Base FAQ Setup';
        stepDesc = 'Provide specific answers to custom patient questions.';
        stepBodyHTML = `
          <div class="faq-list-setup">
            <div class="form-group">
              <label>FAQ Question 1</label>
              <input type="text" class="wizard-input" value="Do you offer parking at your clinic?" readonly>
              <label style="margin-top:4px;">BassirAI Answer</label>
              <textarea class="wizard-input" rows="2" style="font-size:12px; resize:none;" readonly>Yes, we provide complimentary parking validation for all Zuri patients at our Lekki office.</textarea>
            </div>
            <div class="form-group">
              <label>FAQ Question 2</label>
              <input type="text" class="wizard-input" value="What is the recovery time for Lip Fillers?" readonly>
              <label style="margin-top:4px;">BassirAI Answer</label>
              <textarea class="wizard-input" rows="2" style="font-size:12px; resize:none;" readonly>Swelling is normal and typically resolves within 24-48 hours. Avoid strenuous exercise for the first day.</textarea>
            </div>
          </div>
        `;
        break;
      case 5:
        stepTitle = 'Booking Integration Setup';
        stepDesc = 'Decide how appointments are booked.';
        stepBodyHTML = `
          <div class="booking-strategy-grid" style="grid-template-columns:1fr; gap:12px;">
            <div class="strategy-card ${state.bookingStrategy === 'handoff' ? 'selected' : ''}" style="cursor:pointer;" id="strategyHandoffBtn">
              <div class="strategy-title-row">
                <h4 style="font-size:12px; color:#FFFFFF;">Qualify & Receptionist Handoff (Recommended for high-value clinics)</h4>
                <input type="radio" name="bstrat" ${state.bookingStrategy === 'handoff' ? 'checked' : ''} style="accent-color:var(--bassirai-gold);">
              </div>
              <p style="font-size:11px; color:var(--bassirai-text-light-muted); margin-top:6px;">BassirAI qualifies patient interest, retrieves their phone number, and schedules a phone callback trigger directly in your Inbox.</p>
            </div>
            
            <div class="strategy-card ${state.bookingStrategy === 'calcom' ? 'selected' : ''}" style="cursor:pointer;" id="strategyCalcomBtn">
              <div class="strategy-title-row">
                <h4 style="font-size:12px; color:#FFFFFF;">Cal.com Self-scheduling Link Sync</h4>
                <input type="radio" name="bstrat" ${state.bookingStrategy === 'calcom' ? 'checked' : ''} style="accent-color:var(--bassirai-gold);">
              </div>
              <p style="font-size:11px; color:var(--bassirai-text-light-muted); margin-top:6px;">Provide patients with your clinic self-booking page link automatically when they are ready to schedule.</p>
              <input type="text" class="wizard-input" id="setupCalComUrl" value="${state.calComUrl}" style="font-size:11px; padding:6px 10px; margin-top:6px;">
            </div>
          </div>
        `;
        break;
    }

    container.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="clinic-badge">
            <span class="clinic-dot"></span>
            <span>Setup In Progress</span>
          </div>
        </header>
        <div class="app-body">
          <div class="app-content" style="display:flex; align-items:center; justify-content:center;">
            
            <div class="onboarding-wizard" style="margin: 0; width: 100%;">
              <div class="wizard-steps-timeline">
                <div class="timeline-step ${state.onboardingStep > 1 ? 'completed' : state.onboardingStep === 1 ? 'active' : ''}">
                  <div class="step-number">1</div>
                  <span class="step-label">Identity</span>
                </div>
                <div class="timeline-step ${state.onboardingStep > 2 ? 'completed' : state.onboardingStep === 2 ? 'active' : ''}">
                  <div class="step-number">2</div>
                  <span class="step-label">Channels</span>
                </div>
                <div class="timeline-step ${state.onboardingStep > 3 ? 'completed' : state.onboardingStep === 3 ? 'active' : ''}">
                  <div class="step-number">3</div>
                  <span class="step-label">Catalog</span>
                </div>
                <div class="timeline-step ${state.onboardingStep > 4 ? 'completed' : state.onboardingStep === 4 ? 'active' : ''}">
                  <div class="step-number">4</div>
                  <span class="step-label">FAQs</span>
                </div>
                <div class="timeline-step ${state.onboardingStep > 5 ? 'completed' : state.onboardingStep === 5 ? 'active' : ''}">
                  <div class="step-number">5</div>
                  <span class="step-label">Booking</span>
                </div>
                <div class="timeline-step ${state.onboardingStep > 6 ? 'completed' : state.onboardingStep === 6 ? 'active' : ''}">
                  <div class="step-number">6</div>
                  <span class="step-label">Launch</span>
                </div>
              </div>

              <div class="wizard-content-pane active">
                <h2 class="wizard-pane-title">${stepTitle}</h2>
                <p class="wizard-pane-subtitle">${stepDesc}</p>
                <div style="margin-top:15px; display:flex; flex-direction:column; gap:14px;">
                  ${stepBodyHTML}
                </div>
              </div>

              <div class="wizard-footer">
                <button class="ds-btn secondary" id="wizardBackBtn" ${state.onboardingStep === 1 ? 'style="opacity:0.3; pointer-events:none;"' : ''}>Back</button>
                <button class="ds-btn primary" id="wizardNextBtn">${state.onboardingStep === 5 ? 'Launch Agent!' : 'Next Step'}</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Event handlers for onboarding inputs
    if (state.onboardingStep === 1) {
      document.getElementById('setupClinicName').addEventListener('input', (e) => {
        state.clinicName = e.target.value;
      });
      document.getElementById('setupClinicLang').addEventListener('change', (e) => {
        state.clinicLang = e.target.value;
      });
      document.getElementById('setupClinicTone').addEventListener('change', (e) => {
        state.clinicTone = e.target.value;
      });
    }

    if (state.onboardingStep === 5) {
      document.getElementById('strategyHandoffBtn').addEventListener('click', () => {
        state.bookingStrategy = 'handoff';
        renderDesktopOnboarding(container);
      });
      document.getElementById('strategyCalcomBtn').addEventListener('click', () => {
        state.bookingStrategy = 'calcom';
        renderDesktopOnboarding(container);
      });
      const calInput = document.getElementById('setupCalComUrl');
      if (calInput) {
        calInput.addEventListener('input', (e) => {
          state.calComUrl = e.target.value;
        });
      }
    }

    document.getElementById('wizardBackBtn').addEventListener('click', () => {
      if (state.onboardingStep > 1) {
        state.onboardingStep--;
        renderDesktopOnboarding(container);
      }
    });

    document.getElementById('wizardNextBtn').addEventListener('click', () => {
      state.onboardingStep++;
      if (state.onboardingStep === 6) {
        // Go straight to dashboard loaded
        renderDesktopDashboard(container);
      } else {
        renderDesktopOnboarding(container);
      }
    });
  }

  // Render Dashboard + Unified Inbox (Core Platform View)
  let adminSubPage = 'inbox'; // 'inbox' or 'analytics' or 'booking'
  
  function renderDesktopDashboard(container) {
    let subpageHTML = '';

    if (adminSubPage === 'inbox') {
      // Inbox UI
      const activePatient = state.patients.find(p => p.id === state.activePatientId);
      
      let messagesHTML = '';
      activePatient.messages.forEach(msg => {
        if (msg.sender === 'patient') {
          messagesHTML += `
            <div class="message-bubble-wrapper patient">
              <span class="message-sender-meta">${activePatient.name}</span>
              <div class="message-bubble">${msg.text}</div>
            </div>
          `;
        } else if (msg.sender === 'ai') {
          messagesHTML += `
            <div class="message-bubble-wrapper ai">
              <span class="message-sender-meta"><i data-lucide="cpu" style="width:10px; color:var(--bassirai-gold);"></i> BassirAI Agent</span>
              <div class="message-bubble">${msg.text}</div>
              <span class="ai-latency-tag">AI Response: ${msg.latency} via Groq Llama</span>
            </div>
          `;
        } else if (msg.sender === 'receptionist') {
          messagesHTML += `
            <div class="message-bubble-wrapper receptionist">
              <span class="message-sender-meta">Receptionist</span>
              <div class="message-bubble">${msg.text}</div>
            </div>
          `;
        } else if (msg.sender === 'system') {
          messagesHTML += `
            <div style="align-self:center; font-size:10px; color:var(--color-warning); background-color:rgba(245, 158, 11, 0.1); padding:4px 10px; border-radius:4px; margin: 4px 0;">
              ${msg.text}
            </div>
          `;
        }
      });

      let chatItemsHTML = '';
      state.patients.forEach(pat => {
        const isActive = pat.id === state.activePatientId;
        chatItemsHTML += `
          <div class="chat-item ${isActive ? 'active' : ''}" data-patid="${pat.id}">
            <div class="avatar-container">
              ${pat.name.split(' ').map(n => n[0]).join('')}
              <span class="channel-badge ${pat.channel}"><i data-lucide="${pat.channel === 'whatsapp' ? 'phone' : pat.channel === 'instagram' ? 'instagram' : 'facebook'}"></i></span>
            </div>
            <div class="chat-item-content">
              <div class="chat-item-top">
                <span class="chat-patient-name">${pat.name}</span>
                <span class="chat-time">${pat.time}</span>
              </div>
              <p class="chat-message-preview">${pat.lastMessage}</p>
              <div class="chat-badge-row">
                ${pat.status === 'new' ? '<span class="inbox-badge new">New</span>' : ''}
                ${pat.status === 'booked' ? '<span class="inbox-badge booked">Booked</span>' : ''}
                ${pat.aiMode ? '<span class="inbox-badge ai-mode">AI ACTIVE</span>' : '<span class="inbox-badge human-mode">HUMAN ONLY</span>'}
              </div>
            </div>
          </div>
        `;
      });

      subpageHTML = `
        <div class="inbox-layout">
          <!-- Chat sidebar -->
          <aside class="inbox-chats-sidebar">
            <div class="inbox-search-container">
              <div class="search-input-wrap">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Search chats..." id="inboxSearchInput">
              </div>
            </div>
            <div class="chat-list" id="inboxChatList">
              ${chatItemsHTML}
            </div>
          </aside>

          <!-- Chat window -->
          <section class="inbox-chat-view">
            <header class="chat-header">
              <div class="active-chat-details">
                <span class="active-chat-name">${activePatient.name}</span>
                <span class="active-chat-phone">${activePatient.phone}</span>
              </div>
              
              <!-- AI Handoff Switcher -->
              <div class="mode-toggle-container">
                <button class="mode-toggle-btn ${activePatient.aiMode ? 'ai-active' : ''}" id="toggleModeAIBtn"><i data-lucide="cpu"></i> AI Agent</button>
                <button class="mode-toggle-btn ${!activePatient.aiMode ? 'human-active' : ''}" id="toggleModeHumanBtn"><i data-lucide="user"></i> Receptionist</button>
              </div>
            </header>

            <div class="chat-messages-area" id="inboxMessagesArea">
              ${messagesHTML}
            </div>

            <div class="chat-input-bar">
              <input type="text" class="chat-input-field" id="inboxMessageInput" placeholder="${activePatient.aiMode ? 'AI is managing this thread. Toggle Receptionist to reply manually.' : 'Type your message here...'}" ${activePatient.aiMode ? 'disabled' : ''}>
              <button class="chat-send-btn" id="inboxSendBtn" ${activePatient.aiMode ? 'disabled style="opacity:0.5;"' : ''}><i data-lucide="send"></i></button>
            </div>
          </section>

          <!-- Patient details -->
          <aside class="inbox-patient-context">
            <div class="patient-profile-mini">
              <div class="big-avatar">${activePatient.name.split(' ').map(n => n[0]).join('')}</div>
              <span class="patient-name-big">${activePatient.name}</span>
              <span style="font-size:10px; color:var(--color-success); font-weight:600; margin-top:4px;">● Inbound Active</span>
            </div>
            
            <div class="patient-context-info">
              <div class="context-section-title">Context Card</div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span class="info-row-label">Phone:</span>
                <span class="info-row-val">${activePatient.phone}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span class="info-row-label">Desired Treatment:</span>
                <span class="info-row-val">${activePatient.procedure}</span>
              </div>
            </div>

            <div class="patient-context-info">
              <div class="context-section-title">AI Custom Prompt Rules</div>
              <div class="context-booking-details" style="font-size:10px; font-family:var(--font-mono); line-height:1.4;">
                Tone: ${state.clinicTone.toUpperCase()}<br>
                Service database: ONLINE<br>
                Target Booking: ${state.bookingStrategy === 'calcom' ? 'CAL.COM LINK' : 'HANDOFF TO STAFF'}
              </div>
            </div>

            <div class="action-buttons-stack">
              ${activePatient.status !== 'booked' ? `<button class="inbox-action-btn gold" id="forceBookPatientBtn">Mark as Booked</button>` : `<span style="text-align:center; font-size:11px; color:var(--color-success); font-weight:600;"><i data-lucide="check"></i> Booking Confirmed</span>`}
              <button class="inbox-action-btn outline" id="inboxToggleModeBtn">${activePatient.aiMode ? 'Switch to Human Control' : 'Switch to AI Control'}</button>
            </div>
          </aside>
        </div>
      `;
    } else if (adminSubPage === 'analytics') {
      // Analytics UI
      let activityItemsHTML = '';
      state.analytics.liveFeed.forEach(feed => {
        activityItemsHTML += `
          <div class="activity-item">
            <div class="activity-icon"><i data-lucide="${feed.handler.includes('AI') ? 'cpu' : 'user'}"></i></div>
            <div>
              <strong>${feed.patient}</strong> - ${feed.action}
              <div style="font-size:9px; color:var(--bassirai-text-light-muted); margin-top:2px;">Handled by: ${feed.handler}</div>
              <div class="activity-time">${feed.time}</div>
            </div>
          </div>
        `;
      });

      subpageHTML = `
        <div style="padding: 24px; overflow-y:auto; height:100%;">
          <h2 class="card-title" style="font-size:20px; margin-bottom:16px; font-family:var(--font-serif);">Clinic Analytics Overview</h2>
          
          <div class="dashboard-kpi-grid">
            <div class="kpi-card">
              <div class="kpi-header">
                <span>Total Inbound Chats</span>
                <div class="kpi-icon-wrap"><i data-lucide="message-square"></i></div>
              </div>
              <div class="kpi-value">${state.analytics.totalMessages}</div>
              <div class="kpi-change positive"><i data-lucide="trending-up"></i> +12% this week</div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-header">
                <span>Confirmed Bookings</span>
                <div class="kpi-icon-wrap"><i data-lucide="calendar"></i></div>
              </div>
              <div class="kpi-value" id="kpiBookingsCount">${state.analytics.confirmedBookings}</div>
              <div class="kpi-change positive"><i data-lucide="trending-up"></i> Conversion up 1.5%</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <span>Conversation Conversion</span>
                <div class="kpi-header-right"></div>
              </div>
              <div class="kpi-value">${state.analytics.conversionRate}</div>
              <div style="font-size:11px; color:var(--color-success);">Industry Avg: 8%</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <span>Avg Latency (Groq API)</span>
                <div class="kpi-icon-wrap"><i data-lucide="zap"></i></div>
              </div>
              <div class="kpi-value">${state.analytics.avgResponse}</div>
              <div class="kpi-change positive" style="color:var(--bassirai-gold);"><i data-lucide="cpu"></i> Llama 3.3 70B</div>
            </div>
          </div>

          <div class="dashboard-row-2">
            <div class="chart-card">
              <div class="card-title-row">
                <h3 class="card-title">Message Inflow Volume</h3>
              </div>
              <svg class="chart-placeholder-svg" viewBox="0 0 500 200">
                <path d="M 0 160 Q 50 150 100 120 T 200 90 T 300 100 T 400 40 T 500 20" fill="none" stroke="var(--bassirai-gold)" stroke-width="3" />
                <path d="M 0 160 Q 50 150 100 120 T 200 90 T 300 100 T 400 40 T 500 20 L 500 200 L 0 200 Z" fill="rgba(197,168,128,0.05)" />
                <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                <text x="10" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Mon</text>
                <text x="110" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Tue</text>
                <text x="210" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Wed</text>
                <text x="310" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Thu</text>
                <text x="410" y="190" fill="var(--bassirai-text-light-muted)" font-size="10">Fri</text>
              </svg>
            </div>

            <div class="live-feed-card">
              <h3 class="card-title">Activity Feed</h3>
              <div class="activity-list">
                ${activityItemsHTML}
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (adminSubPage === 'booking') {
      // Booking Strategy & setup
      let pendingRowsHTML = '';
      state.patients.forEach(pat => {
        if (pat.status === 'new') {
          pendingRowsHTML += `
            <tr>
              <td><strong>${pat.name}</strong><br><span style="font-size:10px; color:var(--bassirai-text-light-muted);">${pat.phone}</span></td>
              <td>${pat.procedure}</td>
              <td>${pat.time}</td>
              <td><span class="inbox-badge new" style="background-color:rgba(245, 158, 11, 0.15); color:var(--color-warning);">Awaiting Review</span></td>
              <td class="booking-actions">
                <button class="action-btn-small confirm" data-patid="${pat.id}">Confirm Booking</button>
                <button class="action-btn-small cancel" data-patid="${pat.id}">Reject</button>
              </td>
            </tr>
          `;
        }
      });

      if (pendingRowsHTML === '') {
        pendingRowsHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--bassirai-text-light-muted);">All booked! No pending handoffs to review.</td></tr>`;
      }

      subpageHTML = `
        <div style="padding: 24px; overflow-y:auto; height:100%;">
          <h2 class="card-title" style="font-size:20px; margin-bottom:16px; font-family:var(--font-serif);">Booking Integration Configuration</h2>
          
          <div class="booking-strategy-grid">
            <div class="strategy-card ${state.bookingStrategy === 'handoff' ? 'selected' : ''}" style="cursor:pointer;" id="pageStratHandoff">
              <div class="strategy-title-row">
                <h3 class="card-title">Strategy A: Qualify & Handoff</h3>
                <span class="strategy-pill">${state.bookingStrategy === 'handoff' ? 'Active' : 'Enable'}</span>
              </div>
              <p class="ref-desc">Bot collects details and creates callback triggers in your dashboard list. Ideal for consultations and surgical bookings.</p>
            </div>

            <div class="strategy-card ${state.bookingStrategy === 'calcom' ? 'selected' : ''}" style="cursor:pointer;" id="pageStratCalcom">
              <div class="strategy-title-row">
                <h3 class="card-title">Strategy B: Self-Service Cal.com</h3>
                <span class="strategy-pill">${state.bookingStrategy === 'calcom' ? 'Active' : 'Enable'}</span>
              </div>
              <p class="ref-desc">Bot directly offers scheduling links dynamically. Best for filler, botox, and quick clinical procedures.</p>
              <input type="text" class="wizard-input" value="${state.calComUrl}" style="font-size:11px; padding:6px 10px; margin-top:6px;" readonly>
            </div>
          </div>

          <div class="pending-bookings-card" style="margin-top:20px;">
            <h3 class="card-title">Patient Booking Handoff Requests</h3>
            <table class="bookings-table">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Requested Treatment</th>
                  <th>Inquiry Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="pendingBookingsTableBody">
                ${pendingRowsHTML}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="app-container">
        <!-- Main Navbar -->
        <header class="app-header">
          <div class="app-logo">
            <div class="app-logo-icon">B</div>
            <span>Bassir<span>AI</span></span>
          </div>
          <div class="app-nav">
            <button class="nav-link ${adminSubPage === 'inbox' ? 'active' : ''}" id="navSubInbox">Unified Inbox</button>
            <button class="nav-link ${adminSubPage === 'analytics' ? 'active' : ''}" id="navSubAnalytics">Analytics</button>
            <button class="nav-link ${adminSubPage === 'booking' ? 'active' : ''}" id="navSubBooking">Booking Config</button>
          </div>
          <div class="app-header-right">
            <div class="clinic-badge">
              <div class="clinic-dot"></div>
              <span>${state.clinicName}</span>
            </div>
          </div>
        </header>

        <!-- Body -->
        <div class="app-body">
          <aside class="app-nav-sidebar">
            <button class="app-nav-item ${adminSubPage === 'inbox' ? 'active' : ''}" id="asideSubInbox"><i data-lucide="message-square"></i> Messages</button>
            <button class="app-nav-item ${adminSubPage === 'analytics' ? 'active' : ''}" id="asideSubAnalytics"><i data-lucide="bar-chart-2"></i> Analytics</button>
            <button class="app-nav-item ${adminSubPage === 'booking' ? 'active' : ''}" id="asideSubBooking"><i data-lucide="calendar"></i> Appointments</button>
            <div class="app-nav-footer">
              <div style="font-size:10px; color:var(--bassirai-text-light-muted); padding-left:12px;">Tone: ${state.clinicTone.toUpperCase()}</div>
              <div style="font-size:10px; color:var(--bassirai-text-light-muted); padding-left:12px; margin-top:4px;">Lang: ${state.clinicLang.toUpperCase()}</div>
            </div>
          </aside>

          <main class="browser-viewport" style="flex:1;">
            ${subpageHTML}
          </main>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Attach sub-navigation listeners
    const triggerSubPage = (sub) => {
      adminSubPage = sub;
      renderDesktopDashboard(container);
    };

    document.getElementById('navSubInbox').addEventListener('click', () => triggerSubPage('inbox'));
    document.getElementById('navSubAnalytics').addEventListener('click', () => triggerSubPage('analytics'));
    document.getElementById('navSubBooking').addEventListener('click', () => triggerSubPage('booking'));
    document.getElementById('asideSubInbox').addEventListener('click', () => triggerSubPage('inbox'));
    document.getElementById('asideSubAnalytics').addEventListener('click', () => triggerSubPage('analytics'));
    document.getElementById('asideSubBooking').addEventListener('click', () => triggerSubPage('booking'));

    // Attach Inbox message handlers if inbox is active
    if (adminSubPage === 'inbox') {
      const activePatient = state.patients.find(p => p.id === state.activePatientId);

      // Select patient row
      document.querySelectorAll('#inboxChatList .chat-item').forEach(row => {
        row.addEventListener('click', () => {
          state.activePatientId = row.getAttribute('data-patid');
          renderDesktopDashboard(container);
        });
      });

      // Toggle AI Mode button logic
      const toggleMode = (newModeVal) => {
        activePatient.aiMode = newModeVal;
        
        // Push notification simulation message in chat
        activePatient.messages.push({
          sender: 'system',
          text: newModeVal ? '🤖 BassirAI Mode Enabled - Chatbot is responding automatically.' : '👤 Receptionist Took Over - AI automatic response disabled.'
        });
        
        renderDesktopDashboard(container);
      };

      document.getElementById('toggleModeAIBtn').addEventListener('click', () => toggleMode(true));
      document.getElementById('toggleModeHumanBtn').addEventListener('click', () => toggleMode(false));
      document.getElementById('inboxToggleModeBtn').addEventListener('click', () => toggleMode(!activePatient.aiMode));

      // Human sending message manually
      if (!activePatient.aiMode) {
        const sendBtn = document.getElementById('inboxSendBtn');
        const inputField = document.getElementById('inboxMessageInput');

        const handleSend = () => {
          const textVal = inputField.value.trim();
          if (textVal) {
            activePatient.messages.push({
              sender: 'receptionist',
              text: textVal
            });
            activePatient.lastMessage = textVal;
            activePatient.time = 'Just now';
            renderDesktopDashboard(container);
          }
        };

        sendBtn.addEventListener('click', handleSend);
        inputField.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleSend();
        });
      }

      // Mark as Booked force button
      const forceBookBtn = document.getElementById('forceBookPatientBtn');
      if (forceBookBtn) {
        forceBookBtn.addEventListener('click', () => {
          activePatient.status = 'booked';
          state.analytics.confirmedBookings++;
          state.analytics.liveFeed.unshift({
            patient: activePatient.name,
            action: `Confirmed ${activePatient.procedure} appointment`,
            handler: 'Receptionist (Manual)',
            time: 'Just now'
          });
          renderDesktopDashboard(container);
        });
      }
    }

    // Attach Booking Confirmation action handlers
    if (adminSubPage === 'booking') {
      document.getElementById('pageStratHandoff').addEventListener('click', () => {
        state.bookingStrategy = 'handoff';
        renderDesktopDashboard(container);
      });
      document.getElementById('pageStratCalcom').addEventListener('click', () => {
        state.bookingStrategy = 'calcom';
        renderDesktopDashboard(container);
      });

      document.querySelectorAll('#pendingBookingsTableBody .confirm').forEach(btn => {
        btn.addEventListener('click', () => {
          const patid = btn.getAttribute('data-patid');
          const pat = state.patients.find(p => p.id === patid);
          pat.status = 'booked';
          state.analytics.confirmedBookings++;
          state.analytics.liveFeed.unshift({
            patient: pat.name,
            action: `Confirmed booking for ${pat.procedure}`,
            handler: 'Receptionist (Manual Confirmation)',
            time: 'Just now'
          });
          renderDesktopDashboard(container);
        });
      });

      document.querySelectorAll('#pendingBookingsTableBody .cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          const patid = btn.getAttribute('data-patid');
          const pat = state.patients.find(p => p.id === patid);
          pat.status = 'rejected';
          renderDesktopDashboard(container);
        });
      });
    }
  }


  /* ==========================================
     SIMULATOR ENGINE 2: MOBILE PATIENT CHAT
     ========================================== */

  function renderMobileApp() {
    const viewport = document.getElementById('mobilePhoneViewport');
    const activePatient = state.patients.find(p => p.id === state.activePatientId);

    // Build chat message log for patient mobile simulation
    let chatMsgHTML = '';
    activePatient.messages.forEach(msg => {
      if (msg.sender === 'system') return; // Hide system warnings on patient screen

      const isPatient = msg.sender === 'patient';
      chatMsgHTML += `
        <div class="wa-msg ${isPatient ? 'inbound' : 'outbound'}">
          ${msg.text}
          <span class="wa-msg-time">${msg.sender === 'ai' ? 'AI Response' : '11:03 AM'}</span>
        </div>
      `;
    });

    // Check if Arabic demo or English demo
    const isRtl = state.demoLanguage === 'ar';
    let headerSubtitle = activePatient.aiMode ? 'Online • BassirAI Assistant' : 'Online • Receptionist';
    if (isRtl) {
      headerSubtitle = activePatient.aiMode ? 'متصل • مساعد الذكاء الاصطناعي' : 'متصل • موظف الاستقبال';
    }

    viewport.innerHTML = `
      <div class="phone-screen ${isRtl ? 'rtl-lang' : ''}">
        <!-- WhatsApp Header -->
        <header class="wa-header">
          <span class="wa-header-back"><i data-lucide="chevron-left"></i></span>
          <div class="wa-avatar">A</div>
          <div class="wa-name-col">
            <span class="wa-name">${state.clinicName}</span>
            <span class="wa-status">${headerSubtitle}</span>
          </div>
        </header>

        <!-- Messages stream -->
        <div class="wa-messages-area" id="waMessagesArea">
          ${chatMsgHTML}
          <div id="waTypingIndicator" style="display:none; align-self:flex-end; font-size:10px; color:#8696A0; background-color:#202C33; padding:6px 10px; border-radius:8px;">
            BassirAI Agent typing...
          </div>
        </div>

        <!-- WhatsApp Input Box -->
        <div class="wa-input-bar">
          <div class="wa-input-wrap">
            <input type="text" id="waInputText" placeholder="${isRtl ? 'اكتب رسالة تجميلية...' : 'Ask about prices or bookings...'}">
          </div>
          <button class="wa-send-btn" id="waSendBtn"><i data-lucide="send"></i></button>
        </div>
      </div>
    `;

    lucide.createIcons();

    // Scroll to bottom
    const msgsArea = document.getElementById('waMessagesArea');
    msgsArea.scrollTop = msgsArea.scrollHeight;

    // Send click listener
    const handlePatientSend = () => {
      const input = document.getElementById('waInputText');
      const textVal = input.value.trim();
      if (!textVal) return;

      // Add to patient messages log
      activePatient.messages.push({
        sender: 'patient',
        text: textVal
      });
      activePatient.lastMessage = textVal;
      activePatient.time = 'Just now';

      // Re-render mobile messages
      renderMobileApp();

      // IF AI Mode is active on thread, simulate sub-second Groq API Llama 3.3 reply!
      if (activePatient.aiMode) {
        const typing = document.getElementById('waTypingIndicator');
        if (typing) typing.style.display = 'block';
        msgsArea.scrollTop = msgsArea.scrollHeight;

        setTimeout(() => {
          // Generate simulated AI reply based on content and language
          let aiResponse = '';
          const lowercaseText = textVal.toLowerCase();

          if (isRtl) {
            if (lowercaseText.includes('سعر') || lowercaseText.includes('بكم') || lowercaseText.includes('تكلفة')) {
              aiResponse = 'أسعارنا تنافسية للغاية! يكلف فيلر الشفاه ما بين 550 و 700 دولار لكل حقنة. ويكلف الفيلر الجلدي الآخر حوالي 600 دولار. هل ترغبين في حجز استشارة مجانية مع طبيب الجلدية؟';
            } else if (lowercaseText.includes('حجز') || lowercaseText.includes('موعد')) {
              if (state.bookingStrategy === 'calcom') {
                aiResponse = `لحجز موعدك فوراً، يمكنك استخدام رابط الخدمة الذاتية الخاص بنا: ${state.calComUrl}`;
              } else {
                aiResponse = 'أنا هنا لمساعدتك في الحجز! ما هو رقم الهاتف المفضل لديك والاسم الكامل، وما هو العلاج الذي ترغبين فيه لتحديد موعد اتصال؟';
              }
            } else {
              aiResponse = 'شكراً لك على رسالتك. عيادة أورا للتجميل توفر خدمات الفيلر، البوتوكس والليزر. كيف يمكن لذكائنا الاصطناعي مساعدتك اليوم؟';
            }
          } else {
            // English
            if (lowercaseText.includes('price') || lowercaseText.includes('cost') || lowercaseText.includes('much') || lowercaseText.includes('naira')) {
              aiResponse = 'We have transparent pricing! Botox is ₦180,000 - ₦300,000 per area, and Lip Fillers are ₦450,000 - ₦600,000 per syringe. Would you like to schedule a quick consultation at Zuri Clinic Lekki?';
            } else if (lowercaseText.includes('book') || lowercaseText.includes('appointment') || lowercaseText.includes('sched')) {
              if (state.bookingStrategy === 'calcom') {
                aiResponse = `Sure! You can book immediately using our online scheduler here: ${state.calComUrl}`;
              } else {
                aiResponse = 'I can help you qualify for a callback booking! Could you please share your full name, best contact phone number, and preferred date?';
              }
            } else {
              aiResponse = 'Thank you for contacting Zuri Aesthetic & Wellness Clinic. We offer specialized laser treatments, dermal fillers, and Botox at our Lekki office. Let me know how I can help you today!';
            }
          }

          // Push AI answer
          activePatient.messages.push({
            sender: 'ai',
            text: aiResponse,
            latency: '0.78s'
          });
          activePatient.lastMessage = aiResponse;

          // Update feed
          state.analytics.totalMessages++;
          state.analytics.liveFeed.unshift({
            patient: activePatient.name,
            action: `Sent WhatsApp inquiry: "${textVal.substring(0, 20)}..."`,
            handler: 'AI Agent (Groq Llama)',
            time: 'Just now'
          });

          // Re-render
          renderMobileApp();
        }, 800); // 800ms simulates Sub-Second Latency!
      }
    };

    document.getElementById('waSendBtn').addEventListener('click', handlePatientSend);
    document.getElementById('waInputText').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handlePatientSend();
    });
  }

  // Load the initial page default cover
  loadPage('cover');

});
