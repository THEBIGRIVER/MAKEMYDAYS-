import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService.ts';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialQuery?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen, initialQuery }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "How can I help you discover something new today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && initialQuery && !hasSentInitial.current) {
      handleQuery(initialQuery);
      hasSentInitial.current = true;
    }
    if (!isOpen) {
      hasSentInitial.current = false;
    }
  }, [isOpen, initialQuery]);

  const handleQuery = async (query: string) => {
    if (!query.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsTyping(true);
    const response = await chatService.sendMessage(query);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: response || "Something went wrong." }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    handleQuery(userMsg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 md:bottom-24 right-0 md:right-8 z-[300] w-full md:w-96 h-[100dvh] md:h-[650px] bg-brand-navy md:border md:border-white/10 shadow-3xl flex flex-col animate-in slide-in-from-bottom duration-500 md:rounded-[2.5rem] overflow-hidden backdrop-blur-3xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-prime rounded-lg flex items-center justify-center text-brand-navy shadow-lg shadow-brand-prime/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a3 3 0 0 0 0 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a3 3 0 0 0 0-6Z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Experience</span>
            <span className="text-xs font-bold text-brand-beige uppercase tracking-widest">AI Concierge</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-brand-prime animate-pulse shadow-[0_0_10px_rgba(255,153,51,1)]" />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-brand-beige transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide bg-gradient-to-b from-transparent to-brand-navy/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed rounded-2xl shadow-xl ${
              m.role === 'user' 
                ? 'bg-brand-prime text-brand-navy font-medium rounded-tr-none' 
                : 'bg-white/5 text-brand-beige border border-white/10 backdrop-blur-md rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-brand-prime rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-brand-prime rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-brand-prime rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border-t border-white/5 flex gap-3 bg-black/40 shrink-0">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for an experience..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-brand-beige placeholder:text-slate-600 focus:border-brand-prime transition-all"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping} 
          className="w-11 h-11 bg-brand-prime text-brand-navy flex items-center justify-center rounded-xl shadow-lg shadow-brand-prime/20 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;