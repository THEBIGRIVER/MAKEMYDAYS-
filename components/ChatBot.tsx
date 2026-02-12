import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService.ts';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "How can I help you discover something new today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    const response = await chatService.sendMessage(userMsg);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: response || "Something went wrong." }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white text-slate-800 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] md:w-80 h-[450px] bg-slate-900 border border-white/10 shadow-2xl flex flex-col animate-slide-up rounded-[2rem] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Assistant</span>
            <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-slate-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-4 py-3 text-xs leading-relaxed rounded-2xl ${
                  m.role === 'user' ? 'bg-brand-forest text-slate-200' : 'bg-slate-800 text-slate-200 border border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 text-[10px] font-bold uppercase text-slate-500 animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2 bg-black/40">
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me..."
              className="flex-1 bg-transparent text-xs outline-none text-slate-200 placeholder:text-slate-600"
            />
            <button type="submit" disabled={!input.trim()} className="text-[10px] font-bold uppercase tracking-widest text-slate-200 hover:text-brand-red disabled:opacity-20 transition-colors">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;