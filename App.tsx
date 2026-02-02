
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ChatBot from './components/ChatBot.tsx';
import LegalModal, { PolicyType } from './components/LegalModal.tsx';
import OnboardingTour from './components/OnboardingTour.tsx';
import AuthModal from './components/AuthModal.tsx'; 
import { api } from './services/api.ts';

const MOOD_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3";
const USER_STORAGE_KEY = 'makemydays_user_v1';

const MOODS = [
  { label: "Joyful", emoji: "🌈", glow: "rgba(248,68,100,0.5)", bg: "bg-brand-red" },
  { label: "Chill", emoji: "🧘", glow: "rgba(0,245,255,0.5)", bg: "bg-brand-accent" },
  { label: "Energetic", emoji: "⚡", glow: "rgba(223,255,0,0.5)", bg: "bg-brand-lime" },
  { label: "Inspired", emoji: "✨", glow: "rgba(139,92,246,0.5)", bg: "bg-brand-purple" },
  { label: "Peaceful", emoji: "🍃", glow: "rgba(16,185,129,0.5)", bg: "bg-emerald-500" }
];

const CATEGORIES: (Category | 'All')[] = ['All', 'Shows', 'Activity', 'MMD Originals', 'Mindfulness', 'Workshop'];
const AURA_STATES = ["TRUE", "SYNCED", "OPTIMAL", "PURE", "RESONATING", "FLUID", "DEEP"];

const ConnectionLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} fill-current text-brand-red cursor-pointer active:scale-95 transition-transform`}>
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-center justify-center gap-[1.5px] h-3">
    {[0.2, 0.5, 0.8, 0.4, 0.6].map((delay, i) => (
      <div 
        key={i} 
        className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-brand-red animate-music-visualizer' : 'bg-slate-700 h-1'}`}
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </div>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [auraIndex, setAuraIndex] = useState(0);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MOOD_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25;
    const interval = setInterval(() => setAuraIndex(p => (p + 1) % AURA_STATES.length), 4500);
    return () => { audioRef.current?.pause(); clearInterval(interval); };
  }, []);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  const fetchData = useCallback(async () => {
    try {
      const [evs, bks] = await Promise.all([api.getEvents(), api.getBookings()]);
      setEvents(evs || []);
      setGlobalBookings(bks || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) setCurrentUser(JSON.parse(stored));
  }, [fetchData]);

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) return;
    setIsAiLoading(true);
    setAiRec(null);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) { console.error(err); } 
    finally { setIsAiLoading(false); }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      return matchCat && matchSearch && matchAi;
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

  return (
    <div className={`flex flex-col min-h-screen bg-black mesh-bg vibe-sunny selection:bg-brand-red selection:text-slate-200`}>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setShowDashboard(false); setShowAdmin(false); setAiRec(null); setSelectedCategory('All'); }}>
            <ConnectionLogo />
            <span className="text-xl font-black italic tracking-tighter text-slate-200 group-hover:text-brand-red transition-all">MakeMyDays</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <button onClick={toggleMusic} aria-label="Toggle Atmosphere" className={`relative group w-11 h-11 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${isMusicPlaying ? 'bg-slate-900 border-brand-red shadow-lg' : 'bg-slate-800 border-white/10 hover:border-white/30'}`}>
                {isMusicPlaying && <div className="absolute inset-0 rounded-full border border-brand-red/40 animate-music-pulse" />}
                <div className="relative z-10 transition-transform group-hover:scale-110"><Visualizer isPlaying={isMusicPlaying} /></div>
               </button>
            </div>

            {currentUser ? (
              <button id="user-sanctuary-trigger" onClick={() => setShowDashboard(!showDashboard)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black italic text-lg shadow-lg hover:bg-slate-200 transition-colors">
                {currentUser.name[0]}
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-2 bg-slate-100 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-brand-red hover:text-slate-200 transition-all">Join</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 px-6 max-w-7xl mx-auto w-full">
        {showAdmin && currentUser?.role === 'admin' ? (
          <AdminPanel events={events} bookings={globalBookings} onClose={() => setShowAdmin(false)} onRefresh={fetchData} />
        ) : showDashboard && currentUser ? (
          <Dashboard 
            user={currentUser} events={events} bookings={globalBookings}
            onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); }} 
            onOpenAdmin={() => setShowAdmin(true)} onOpenPolicy={setActivePolicy} onRefreshEvents={fetchData}
          />
        ) : (
          <div className="space-y-12 pb-20">
            <section className="text-center space-y-10">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-brand-lime/10 blur-xl"></div>
                <div className="relative glass-card px-4 py-1 rounded-full border border-white/10 animate-float">
                  <span className="text-slate-200 text-[9px] font-black uppercase tracking-[0.3em] italic">Aura: {AURA_STATES[auraIndex]}</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-black italic tracking-tighter leading-none text-slate-200 uppercase">
                Find Your <br /><span className="frequency-text-gradient animate-freq-pulse">Frequency</span>
              </h1>
              
              <div id="mood-search-container" className="w-full max-w-3xl mx-auto space-y-12">
                 <div className="relative dark-glass-card rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-3 ai-glow overflow-hidden group">
                    <div className="flex-1 w-full px-5 py-3 flex items-center gap-4 z-10">
                       <input 
                         type="text" placeholder="How is your energy today?..."
                         className="w-full bg-transparent border-none text-slate-200 text-lg font-medium placeholder:text-slate-600 focus:outline-none"
                         value={userMood} onChange={(e) => setUserMood(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                       />
                    </div>
                    <button onClick={() => handleMoodSearch(userMood)} className="w-full md:w-auto px-10 py-4 bg-blue-600 text-slate-200 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-blue-500 hover:text-slate-200 shadow-2xl shadow-blue-600/40">
                      {isAiLoading ? 'Calibrating...' : 'SEARCH 🔍'}
                    </button>
                 </div>

                 <div className="flex flex-wrap justify-center gap-3">
                    {MOODS.map(mood => {
                      const isActive = userMood === mood.label;
                      return (
                        <button 
                          key={mood.label} 
                          onClick={() => { setUserMood(mood.label); handleMoodSearch(mood.label); }} 
                          className={`group relative flex flex-col items-center justify-center p-0.5 rounded-[1.5rem] transition-all duration-500 hover:-translate-y-1 ${isActive ? 'scale-105' : ''}`} 
                          style={{ minWidth: '80px' }}
                        >
                          <div className={`absolute inset-0 rounded-[1.5rem] blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-30 ${isActive ? 'opacity-50' : ''}`} style={{ backgroundColor: mood.glow }}></div>
                          <div className={`relative z-10 w-full h-full p-2.5 rounded-[1.5rem] backdrop-blur-xl border transition-all duration-300 flex flex-col items-center gap-1.5 ${isActive ? `${mood.bg} border-transparent shadow-lg` : 'bg-slate-900/40 border-white/10'}`}>
                            <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-bounce' : ''}`}>{mood.emoji}</span>
                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] italic ${isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'}`}>{mood.label}</span>
                          </div>
                        </button>
                      );
                    })}
                 </div>

                 {aiRec && (
                   <div className="animate-in slide-in-from-top-6 duration-700 pt-4">
                     <div className="relative glass-card rounded-[3rem] p-8 border border-white/10 shadow-3xl flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shrink-0 shadow-2xl relative"><span className="text-2xl animate-pulse">✨</span></div>
                        <div className="flex-1 text-center md:text-left"><p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-red mb-2 italic">Frequency Harmonization</p><p className="text-lg font-bold italic text-slate-100 leading-tight">"{aiRec.reasoning}"</p></div>
                        <button onClick={() => setAiRec(null)} className="p-3 text-slate-400 hover:text-brand-red transition-all transform hover:rotate-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                     </div>
                   </div>
                 )}
              </div>
            </section>

            <section id="event-grid-container" className="space-y-10">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${selectedCategory === cat ? 'bg-slate-100 border-slate-100 text-slate-800 shadow-xl translate-y-[-2px]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredEvents.map(event => (<EventCard key={event.id} event={event} onClick={setSelectedEvent} />))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase italic">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="text-slate-300">MAKEMYDAYS © 2024</span>
            <span className="text-slate-500">MADE WITH <span className="text-brand-red scale-110 inline-block">❤️</span> BY BENEME INC.</span>
          </div>
          <div className="flex gap-8">
            {['Terms', 'Privacy'].map(l => (<button key={l} className="hover:text-brand-red transition-colors">{l}</button>))}
          </div>
        </div>
      </footer>

      {activePolicy && <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date) => {
          if (!selectedEvent || !currentUser) return;
          const booking: Booking = { id: Math.random().toString(36).substr(2, 9), eventId: selectedEvent.id, eventTitle: selectedEvent.title, category: selectedEvent.category, time: slot.time, eventDate: date, price: selectedEvent.price, bookedAt: new Date().toISOString(), userName: currentUser.name, userPhone: currentUser.phone };
          await api.saveBooking(booking);
          const updatedUser = { ...currentUser, bookings: [booking, ...currentUser.bookings] };
          setCurrentUser(updatedUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          setGlobalBookings(prev => [booking, ...prev]);
          setSelectedEvent(null);
      }} />}
      {showAuthModal && <AuthModal onSuccess={(u) => { setCurrentUser(u); localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u)); setShowAuthModal(false); }} onClose={() => setShowAuthModal(false)} />}
      <ChatBot />
    </div>
  );
};

export default App;
