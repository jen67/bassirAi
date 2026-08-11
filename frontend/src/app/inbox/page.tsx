'use client'

import { useState, useEffect } from 'react'
import SidebarLayout from '@/components/SidebarLayout'
import { createClient } from '@/utils/supabase/client'

interface Message {
  sender: 'patient' | 'ai' | 'human'
  text: string
  time: string
}

interface ChatThread {
  id: string
  name: string
  phone: string
  takeover: boolean
  messages: Message[]
}

const MOCK_THREADS: ChatThread[] = [
  {
    id: 'chioma',
    name: 'Chioma Adebayo',
    phone: '+234 803 111 2222',
    takeover: false, // Changed to false so simulator triggers automatically on first load!
    messages: [
      { sender: 'patient', text: 'Hi, I want to book Botox for next week Thursday', time: '10:15 AM' },
      { sender: 'ai', text: 'Hello Chioma! Botox treatments at Zuri Clinic range from ₦180,000 to ₦300,000. I can schedule a slot for you. Do you prefer morning or afternoon?', time: '10:16 AM' },
      { sender: 'patient', text: 'Morning is fine, but I have a special skin condition. Can I speak to a doctor?', time: '10:18 AM' }
    ]
  },
  {
    id: 'kelechi',
    name: 'Kelechi Okafor',
    phone: '+234 812 333 4444',
    takeover: false,
    messages: [
      { sender: 'patient', text: 'Where is your clinic located in Lekki?', time: 'Yesterday' },
      { sender: 'ai', text: 'We are located in Lekki Phase 1, Lagos. We provide free parking validation right in front of the clinic entrance for all patients!', time: 'Yesterday' }
    ]
  },
  {
    id: 'babajide',
    name: 'Babajide Balogun',
    phone: '+234 905 555 6666',
    takeover: false,
    messages: [
      { sender: 'patient', text: 'How much is lip filler?', time: 'Yesterday' },
      { sender: 'ai', text: 'Lip Fillers (Juvederm) at Zuri Clinic cost ₦450,000 - ₦600,000 per syringe depending on density. Would you like to schedule a session?', time: 'Yesterday' }
    ]
  }
]

export default function InboxPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [inputText, setInputText] = useState('')
  const [showSimMenu, setShowSimMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(true)

  const supabase = createClient()
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || {
    id: '',
    name: 'No active thread',
    phone: '',
    takeover: false,
    messages: []
  }

  // Check mode and load initial threads
  useEffect(() => {
    async function initInbox() {
      const isMock = typeof document !== 'undefined' && document.cookie.includes('sb-mock-session=true')
      setIsMockMode(isMock)

      if (isMock) {
        setThreads(MOCK_THREADS)
        setActiveThreadId('chioma')
        setLoading(false)
        return
      }

      try {
        // Fetch live user and clinic ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('clinic_id')
          .eq('id', user.id)
          .single()

        if (!profile?.clinic_id) {
          setLoading(false)
          return
        }

        setClinicId(profile.clinic_id)

        // Load active conversations from Supabase
        const { data: convs, error: convErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('clinic_id', profile.clinic_id)
          .order('last_message_at', { ascending: false })

        if (convErr || !convs) {
          setLoading(false)
          return
        }

        const threadsList: ChatThread[] = []

        for (const conv of convs) {
          // Fetch messages for each conversation
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true })

          threadsList.push({
            id: conv.id,
            name: conv.patient_name || conv.patient_phone,
            phone: conv.patient_phone,
            takeover: conv.is_human_takeover,
            messages: (msgs || []).map(m => ({
              sender: m.direction === 'inbound' ? 'patient' : (m.is_ai_generated ? 'ai' : 'human'),
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          })
        }

        setThreads(threadsList)
        if (threadsList.length > 0) {
          setActiveThreadId(threadsList[0].id)
        }
      } catch (err) {
        console.error('Error loading inbox data:', err)
      } finally {
        setLoading(false)
      }
    }

    initInbox()
  }, [])

  // Subscribe to Realtime Postgres insertions for messages & conversations
  useEffect(() => {
    if (isMockMode || !clinicId) return

    const subscription = supabase
      .channel('live-inbox-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `clinic_id=eq.${clinicId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new
            const senderType = newMsg.direction === 'inbound' 
              ? 'patient' 
              : (newMsg.is_ai_generated ? 'ai' : 'human')

            const formattedMsg: Message = {
              sender: senderType,
              text: newMsg.content,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            setThreads(prev => prev.map(t => {
              if (t.id === newMsg.conversation_id) {
                return {
                  ...t,
                  messages: [...t.messages, formattedMsg]
                }
              }
              return t
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `clinic_id=eq.${clinicId}`
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedConv = payload.new
            setThreads(prev => prev.map(t => {
              if (t.id === updatedConv.id) {
                return {
                  ...t,
                  takeover: updatedConv.is_human_takeover
                }
              }
              return t
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [clinicId, isMockMode])

  // Simulate Inbound Message (Mock Mode Only)
  const simulateInbound = (text: string, isArabic = false) => {
    const incomingMsg: Message = {
      sender: 'patient',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          messages: [...t.messages, incomingMsg]
        }
      }
      return t
    }))

    // If AI auto-response is active, reply after 1.5 seconds
    if (!activeThread.takeover) {
      setTimeout(() => {
        let aiReply = "Thank you for contacting Zuri Aesthetic! Our practitioner will contact you shortly. Would you like to schedule a callback?";
        if (isArabic) {
          aiReply = "أهلاً بك في عيادة زوري للتجميل في ليكي! سيقوم طبيبنا بالتواصل معك قريباً. هل تود حجز موعد للاتصال بك؟";
        } else if (text.toLowerCase().includes('botox')) {
          aiReply = "Botox treatments at Zuri Clinic range from ₦180,000 to ₦300,000. Would you like to book a consultation session?";
        } else if (text.toLowerCase().includes('filler') || text.includes('فيلر')) {
          aiReply = "Lip Filler (Juvederm) at Zuri Clinic is ₦450,000 - ₦600,000 per syringe. Shall I check available callback times?";
        }

        const aiMsg: Message = {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setThreads(current => current.map(t => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              messages: [...t.messages, aiMsg]
            }
          }
          return t
        }))
      }, 1500)
    }
  }

  // Toggle Human Takeover Handler (Both Modes)
  const toggleTakeover = async (threadId: string) => {
    const target = threads.find(t => t.id === threadId)
    if (!target) return

    const nextState = !target.takeover

    // 1. Update client state
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, takeover: nextState }
      }
      return t
    }))

    // 2. Database Sync in Live Mode
    if (!isMockMode) {
      try {
        await fetch('/api/chats/toggle-takeover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: target.phone, takeover: nextState }),
        })
      } catch (err) {
        console.error('Failed to sync takeover status:', err)
      }
    }
  }

  // Send Manual Message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const textToSend = inputText
    setInputText('')

    // 1. In Mock Mode, append locally
    if (isMockMode) {
      const newMessage: Message = {
        sender: 'human',
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setThreads(prev => prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            takeover: true,
            messages: [...t.messages, newMessage]
          }
        }
        return t
      }))
      return
    }

    // 2. In Live Mode, write to database
    if (!clinicId || !activeThread.id) return

    try {
      // Force Human Takeover if not already set (receptionist manually intervening)
      if (!activeThread.takeover) {
        await toggleTakeover(activeThread.id)
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          clinic_id: clinicId,
          conversation_id: activeThread.id,
          content: textToSend,
          direction: 'outbound',
          is_ai_generated: false
        })

      if (error) {
        console.error('Database write failed:', error.message)
      }
    } catch (err) {
      console.error('Failed to send outbound message:', err)
    }
  }

  return (
    <SidebarLayout>
      <div className="h-[calc(100vh-130px)] flex flex-col md:flex-row gap-6">
        
        {/* Left Column: Threads list */}
        <div className="w-full md:w-80 bg-slate-900/40 border border-slate-900/60 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-850">
            <h2 className="text-sm font-bold tracking-wider text-[#D4AF37] uppercase">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-xs text-slate-500">
                Loading conversations...
              </div>
            ) : threads.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-xs text-slate-500 text-center">
                No active conversations.<br />Scan the QR code to connect WhatsApp.
              </div>
            ) : (
              threads.map((thread) => {
                const active = thread.id === activeThread.id
                const lastMsg = thread.messages[thread.messages.length - 1]
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                      active ? 'bg-slate-900/80' : 'hover:bg-slate-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-slate-200">{thread.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        thread.takeover 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {thread.takeover ? 'Human' : 'AI Active'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate w-full">{lastMsg ? lastMsg.text : 'No messages'}</p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat pane */}
        <div className="flex-1 bg-slate-900/40 border border-slate-900/60 rounded-2xl flex flex-col overflow-hidden">
          {threads.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-xs">
              <svg className="w-12 h-12 text-slate-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">{activeThread.name}</h3>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{activeThread.phone}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Simulator Action dropdown (Only visible in Mock Mode to keep live clean) */}
                  {isMockMode && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSimMenu(!showSimMenu)}
                        className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-[#D4AF37]/50 text-slate-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                        Simulate Message
                      </button>

                      {showSimMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 py-2 divide-y divide-slate-800">
                          <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Simulate Patient Inbound
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                simulateInbound("Hi, how much is Botox?", false);
                                setShowSimMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              🇺🇸 English: "How much is Botox?"
                            </button>
                            <button
                              onClick={() => {
                                simulateInbound("مرحبا، كم سعر فيلر الشفاه؟", true);
                                setShowSimMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              🇸🇦 Arabic: "مرحبا، كم سعر الفيلر؟"
                            </button>
                            <button
                              onClick={() => {
                                simulateInbound("Can I speak to a clinic receptionist please?", false);
                                setShowSimMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              📞 Support: "Speak to receptionist"
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human Takeover Toggle Switch */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-400 font-bold">Human Takeover</span>
                    <button
                      type="button"
                      onClick={() => toggleTakeover(activeThread.id)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none ${
                        activeThread.takeover ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform transform ${
                        activeThread.takeover ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Warnings and status banners */}
              <div className="px-4 py-2 border-b border-slate-850">
                {activeThread.takeover ? (
                  <div className="bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-[10px] font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ⚠️ AI Auto-responder disabled. Manual Control active.
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-[10px] font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ⚡ AI Auto-responder is monitoring & replying.
                  </div>
                )}
              </div>

              {/* Message History pane */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20">
                {activeThread.messages.map((msg, idx) => {
                  const fromPatient = msg.sender === 'patient'
                  const fromAI = msg.sender === 'ai'
                  return (
                    <div key={idx} className={`flex ${fromPatient ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-1 max-w-[75%]">
                        <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                          fromPatient 
                            ? 'bg-[#D4AF37] text-slate-950 font-medium' 
                            : fromAI 
                              ? 'bg-slate-900 border border-slate-800 text-slate-200' 
                              : 'bg-blue-600/10 border border-blue-500/20 text-blue-300'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-500 self-end pr-1 mt-0.5">{msg.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message composer input footer */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-850 flex gap-2">
                <input
                  type="text"
                  placeholder={activeThread.takeover ? "Type your message here..." : "Turn on Human Takeover to send manual message..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={!activeThread.takeover}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!activeThread.takeover || !inputText.trim()}
                  className="bg-[#D4AF37] text-slate-950 text-xs font-bold px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </SidebarLayout>
  )
}
