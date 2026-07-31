'use client'

import { useState } from 'react'
import SidebarLayout from '@/components/SidebarLayout'

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

export default function InboxPage() {
  // Mock chats matches seed database
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'chioma',
      name: 'Chioma Adebayo',
      phone: '+234 803 111 2222',
      takeover: true,
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
  ])

  const [activeThreadId, setActiveThreadId] = useState('chioma')
  const [inputText, setInputText] = useState('')

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0]

  // Toggle Human Takeover Handler
  const toggleTakeover = async (threadId: string) => {
    // 1. Update client state
    const updated = threads.map(t => {
      if (t.id === threadId) {
        return { ...t, takeover: !t.takeover }
      }
      return t
    })
    setThreads(updated)

    // 2. Database Sync in live mode (Bypassed in Mock mode)
    try {
      const target = updated.find(t => t.id === threadId)
      await fetch('/api/chats/toggle-takeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: target?.phone, takeover: target?.takeover }),
      })
    } catch {
      // Ignore database connection failures in mock mode
    }
  }

  // Send Manual Message
  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      sender: 'human',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updated = threads.map(t => {
      if (t.id === activeThread.id) {
        // Enforce human takeover if receptionist manually intervenes
        return {
          ...t,
          takeover: true,
          messages: [...t.messages, newMessage]
        }
      }
      return t
    })

    setThreads(updated)
    setInputText('')
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
            {threads.map((thread) => {
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
            })}
          </div>
        </div>

        {/* Right Column: Active Chat pane */}
        <div className="flex-1 bg-slate-900/40 border border-slate-900/60 rounded-2xl flex flex-col overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-200">{activeThread.name}</h3>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{activeThread.phone}</p>
            </div>

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

        </div>

      </div>
    </SidebarLayout>
  )
}
