
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Event, Category, Booking, AIRecommendation, User, Slot } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import ChatBot from './components/ChatBot.tsx';
import LegalModal, { PolicyType } from './components/LegalModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import { api } from './services/api.ts';
import { auth } from './services/firebase.ts';
// Fixed: Changed from 'firebase/auth' to '@firebase/auth' to resolve export resolution issues in TypeScript
import { onAuthStateChanged } from '@firebase/auth';
import { INITIAL_EVENTS } from './constants.ts';

const FOREST_SOUNDS_URL = "https://cdn.pixabay.com/audio/2022/03/10/audio_f8396555cc.mp3";

const MOODS = [
  { label: "Grounded", emoji: "🌲", color: "brand-forest" },
  { label: "Wild", emoji: "🌿", color: "brand-moss" },
  { label: "Lush", emoji: "🍀", color: "emerald-500" },
  { label: "Earthy", emoji: "🍂", color: "amber-700" }
];

const CATEGORIES: (Category | 'All' | 'Community')[] = ['All', 'Community', 'Shows', 'Activity', 'MMD Originals', 'Mindfulness', 'Workshop', 'Therapy'];

const ConnectionLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} fill-current text-brand-moss active:scale-95 transition-transform duration-500`}>
    <path d="M50 15 C30 35 15 55 15 75 C15 88 28 95 50 95 C72 95 85 88 85 75 C85 55 70 35 50 15 Z" fill="none" stroke="currentColor" strokeWidth="5" />
    <circle cx="50" cy="60" r="10" fill="currentColor" />
    <path d="M50 70 L50 88" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Visualizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-center justify-center gap-[1.5px] h-3.5">
    {[0.2, 0.5, 0.8, 0.4, 0.6].map((delay, i) => (
      <div 
        key={i} 
        className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'bg-brand-moss animate-music-visualizer' : 'bg-slate-300 h-2'}`}
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </div>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | 'Community'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'bookings' | 'hosting' | 'settings'>('bookings');
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async (userUid?: string) => {
    try {
      const evs = await api.getEvents();
      setEvents(evs);
      if (userUid) {
        const bks = await api.getBookings(userUid);
        setGlobalBookings(bks);
      }
    } catch (e: any) { 
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Explorer',
          email: firebaseUser.email || '',
          bookings: [], 
          role: firebaseUser.email === 'admin@makemydays.com' ? 'admin' : 'user'
        };
        setCurrentUser(user);
        await api.syncUserProfile(user);
        fetchData(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [fetchData]);

  useEffect(() => {
    audioRef.current = new Audio(FOREST_SOUNDS_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.12;
    return () => { audioRef.current?.pause(); };
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

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) { setAiRec(null); return; }
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) { 
      setAiRec(null);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      let matchCat = selectedCategory === 'All' || (selectedCategory === 'Community' ? (e.hostPhone !== '917686924919' && e.hostPhone !== '7686924919') : e.category === selectedCategory);
      const query = searchQuery.toLowerCase();
      const matchText = e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query);
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      return matchCat && (aiRec ? matchAi : matchText);
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

  return (
    <div className="flex flex-col min-h-screen selection:bg-brand-moss/30">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none safe-top">
        <div className="floating-island-nav h-14 md:h-16 flex items-center justify-between px-4 md:px-8 pointer-events-auto">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setShowDashboard(false); setAiRec(null); setSelectedCategory('All'); setSearchQuery(''); setUserMood(''); window.scrollTo({top:0, behavior:'smooth'}); }}>
            <ConnectionLogo className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110" />
            <span className="text-[15px] md:text-lg font-display uppercase tracking-tighter text-brand-forest truncate max-w-[140px] md:max-w-none">MAKEMYDAYS</span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={toggleMusic} className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full transition-all bg-emerald-50/80 border border-emerald-100/50 shadow-sm hover:bg-emerald-100 active:scale-90">
              <Visualizer isPlaying={isMusicPlaying} />
            </button>
            {currentUser ? (
              <button onClick={() => { setDashboardTab('bookings'); setShowDashboard(!showDashboard); }} className="px-4 md:px-6 h-10 md:h-11 bg-brand-forest text-white rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md">Portal</button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-5 md:px-6 h-10 md:h-11 bg-brand-moss text-white rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-brand-moss/10">Join</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 md:px-10 max-w-7xl mx-auto w-full pt-28 md:pt-44">
        {showDashboard ? (
          <Dashboard events={events} bookings={globalBookings} initialTab={dashboardTab} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        ) : (
          <div className="space-y-16 md:space-y-32 pb-32">
            <header className="text-center space-y-10 md:space-y-14">
              <div className="space-y-6">
                <span className="text-brand-moss text-[10px] md:text-[12px] font-black uppercase tracking-[0.45em] block animate-pulse-soft">PRIMAL FREQUENCY</span>
                <h1 className="text-4xl sm:text-7xl md:text-[10.5rem] font-display font-black leading-[1.05] md:leading-[0.85] tracking-[-0.055em] uppercase text-brand-forest">
                  SYNC WITH <br className="hidden sm:block" /> <span className="liquid-text italic">THE WILD</span>
                </h1>
                <p className="text-slate-500 text-[11px] md:text-sm font-medium uppercase tracking-[0.12em] max-w-[280px] md:max-w-lg mx-auto leading-relaxed">
                  Curating grounded experiences for the restless modern spirit. 
                  <span className="hidden md:inline"> Recalibrate your inner rhythm.</span>
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                 <div className="nexus-input rounded-[2.2rem] md:rounded-[4.5rem] p-2 md:p-3 flex items-center gap-2 md:gap-4 group ring-0 focus-within:ring-4 ring-brand-moss/10 transition-all">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-moss/10 rounded-full flex items-center justify-center shrink-0 transition-transform group-focus-within:scale-110">
                      <svg className="w-4 h-4 md:w-7 md:h-7 text-brand-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input type="text" placeholder="Breathe. Your current vibe?" className="flex-1 bg-transparent text-lg md:text-3xl font-medium outline-none placeholder:text-slate-300 text-brand-forest h-14 md:h-20" value={userMood} onChange={(e) => { setUserMood(e.target.value); setSearchQuery(e.target.value); if(!e.target.value) setAiRec(null); }} onKeyPress={(e) => e.key === 'Enter' && handleMoodSearch(userMood)} />
                    <button onClick={() => handleMoodSearch(userMood)} className="bg-brand-forest text-white h-12 md:h-16 px-6 md:px-12 rounded-[1.8rem] md:rounded-[3.5rem] font-black uppercase text-[10px] md:text-[12px] tracking-widest active:scale-95 transition-all shadow-lg hover:bg-brand-moss">SYNC</button>
                 </div>
                 
                 <div className="flex flex-wrap justify-center gap-2.5 md:gap-4">
                    {MOODS.map(m => (
                      <button key={m.label} onClick={() => { setUserMood(m.label); setSearchQuery(m.label); handleMoodSearch(m.label); }} className="bg-white/70 backdrop-blur-lg border border-brand-moss/10 px-4.5 py-3 md:px-8 md:py-4.5 rounded-full flex items-center gap-2.5 md:gap-4 hover:border-brand-moss/30 hover:bg-white hover:shadow-2xl hover:translate-y-[-2px] transition-all active:scale-95 group">
                        <span className="text-xl group-hover:scale-125 transition-transform duration-500">{m.emoji}</span>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-brand-forest">{m.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </header>

            <section className="space-y-10 md:space-y-20">
              <div className="flex items-center gap-2.5 md:gap-5 overflow-x-auto scrollbar-hide py-3 px-1 -mx-4 px-4 md:mx-0">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-6 py-3.5 md:px-10 md:py-5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95 ${selectedCategory === cat ? 'bg-brand-forest border-brand-forest text-white shadow-xl translate-y-[-2px]' : 'bg-white/80 border-brand-moss/10 text-slate-400 hover:border-brand-moss/30 hover:text-brand-forest'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
                {filteredEvents.map(e => <EventCard key={e.id} event={e} onClick={setSelectedEvent} />)}
              </div>
              
              {filteredEvents.length === 0 && (
                <div className="py-24 text-center space-y-6">
                  <div className="text-5xl md:text-7xl opacity-20 animate-pulse">🍃</div>
                  <p className="text-slate-400 font-display uppercase text-[10px] md:text-xs tracking-[0.4em]">RESONANCE UNDETECTED IN THIS AREA</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot: Slot, date, guestName, guestPhone) => {
          if (!currentUser) return;
          const booking: Booking = { id: Math.random().toString(36).substr(2, 9), eventId: selectedEvent.id, eventTitle: selectedEvent.title, category: selectedEvent.category, time: slot.time, eventDate: date, price: selectedEvent.price, bookedAt: new Date().toISOString(), userName: guestName, userPhone: guestPhone, userUid: currentUser.uid };
          await api.saveBooking(booking, currentUser.uid);
          fetchData(currentUser.uid);
          setSelectedEvent(null);
      }} />}
      
      {showAuthModal && <AuthModal onSuccess={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)} />}
      {activePolicy && <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
      <ChatBot />
    </div>
  );
};

export default App;
