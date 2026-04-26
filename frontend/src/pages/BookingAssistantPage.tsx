import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, CalendarCheck, MapPin, Clock, Users } from 'lucide-react';
import { bookingApi, type SlotSuggestion } from '../services/bookingApi';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  suggestions?: SlotSuggestion[];
}

const WELCOME: Message = {
  id: 0,
  role: 'bot',
  text: 'Hi! I\'m your Smart Booking Assistant 🎓\n\nI know every hall and lab across both buildings:\n• Main Building (Blocks A & B) — 7 floors, rooms A101–B706\n• New Building  (Blocks F & G) — 14 floors, rooms F101–G1408\n\nTry asking me:\n• "I need a lab for 2 hours tomorrow"\n• "Find a lecture hall in Block A, Floor 3 for 3 hours"\n• "Book a hall in the New Building for 50 people"\n• "I want a lab in Block F on Floor 5 for 1 hour"\n\nJust tell me what you need and I\'ll find the best available spot!',
};

export default function BookingAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await bookingApi.chat(text, user?.id);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: data.reply,
        suggestions: data.suggestions,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Sorry, I could not connect to the server. Make sure the backend is running on port 8084.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slot: SlotSuggestion) => {
    if (!user) {
      alert('Please log in to make a booking.');
      return;
    }
    try {
      const { data } = await bookingApi.create({
        resourceId: slot.resourceId,
        startTime: slot.startTime.replace(' ', 'T'),
        endTime: slot.endTime.replace(' ', 'T'),
        partySize: 1,
        purpose: 'Booked via Smart Assistant',
      });
      setBookedId(data.id);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'bot',
        text: `Booking confirmed for **${slot.resourceName}** (${slot.resourceCode}) from ${slot.startTime} to ${slot.endTime}.\nBooking ID: ${data.id}\nStatus: ${data.status}`,
      }]);
    } catch {
      alert('Booking failed. The slot may no longer be available.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Smart Booking Assistant</h1>
            <p className="text-indigo-200 text-sm font-medium">AI-powered campus resource finder</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 justify-end">
            {[
              { label: 'Block A/B', sub: 'Main · 7 floors' },
              { label: 'Block F/G', sub: 'New · 14 floors' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center bg-white/15 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold">{b.label}</span>
                <span className="text-[10px] text-indigo-200">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md
              ${msg.role === 'bot'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
              {msg.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
            </div>

            <div className={`max-w-[75%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm
                ${msg.role === 'bot'
                  ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                  : 'text-white rounded-tr-sm'}`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
                {msg.text}
              </div>

              {/* Suggestion cards */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="space-y-2 w-full">
                  {msg.suggestions.map((s, i) => (
                    <div key={i}
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                              {s.resourceCode}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">{s.resourceName}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                              {s.building}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              {s.startTime} → {s.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              {s.capacity} seats
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic">{s.note}</p>
                        </div>

                        <button
                          onClick={() => handleBook(s)}
                          disabled={bookedId !== null}
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="e.g. I want a lab for 2 hours tomorrow afternoon..."
          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none font-medium px-2"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
