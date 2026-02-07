
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ChatBot from './components/ChatBot.tsx';
import LegalModal, { PolicyType } from './components/LegalModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import { api } from './services/api.ts';
import { auth } from './services/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { INITIAL_EVENTS } from './constants.ts';

const MOOD_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3";

const MOODS = [
  { label: "Joyful", emoji: "🌈", glow: "rgba(248,68,100,0.5)", bg: "bg-brand-red" },
  { label: "Chill", emoji: "🧘", glow: "rgba(0,245,255,0.5)", bg: "bg-brand-accent" },
  { label: "Energetic", emoji: "⚡", glow: "rgba(223,255,0,0.5)", bg: "bg-brand-lime" },
  { label: "Inspired", emoji: "✨", glow: "rgba(139,92,246,0.5)", bg: "bg-brand-purple" },
  { label: "Peaceful", emoji: "🍃", glow: "rgba(16,185,129,0.5)", bg: "bg-emerald-500" }
];

const CATEGORIES: (Category | 'All' | 'Community')[] = ['All', 'Community', 'Shows', 'Activity', 'MMD Originals', 'Mindfulness', 'Workshop'];

const PermissionWarning = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="fixed top-0 left-0 right-0 z-[1000] bg-brand-red p-3 md:p-4 shadow-2xl animate-in slide-in-from-top duration-500 border-b border-white/20">
    <div className="max-w-5xl mx-auto flex flex-col md:row items-center justify-between gap-3 md:gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse shrink-0">
           <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">Database Protocol Locked</p>
          <p className="text-white/70 text-[8px] md:text-[9px] font-bold uppercase mt-1 tracking-wider leading-tight">Offline Demo Mode enabled. Update Firestore Rules for live hosting.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={() => {
            const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /events/{event} { allow read: if true; allow write: if request.auth != null; }\n    match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }\n    match /bookings/{booking} { allow read, write: if request.auth != null; }\n  }\n}`;
            navigator.clipboard.writeText(rules);
            alert("Rules copied! Paste them in Firebase Console > Firestore > Rules");
          }}
          className="flex-1 md:flex-none bg-white text-brand-red px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Get Rules
        </button>
        <button onClick={onDismiss} className="text-white/60 hover:text-white px-3 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

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

const ThemeToggle = ({ theme, toggle }: { theme: 'dark' | 'light', toggle: () => void }) => (
  <button 
    onClick={toggle}
    className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
  >
    {theme === 'dark' ? (
      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
    ) : (
      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
    )}
  </button>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('mmd_theme') as any) || 'dark');
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | 'Community'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'bookings' | 'hosting' | 'settings'>('bookings');
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('mmd_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchData = useCallback(async (userUid?: string) => {
    try {
      setPermissionError(false);
      const evs = await api.getEvents();
      setEvents(evs);
      if (userUid) {
        const bks = await api.getBookings(userUid);
        setGlobalBookings(bks);
      }
    } catch (e: any) { 
      if (e.message === 'permission-denied' || e.code === 'permission-denied') {
        setPermissionError(true);
      }
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
    audioRef.current = new Audio(MOOD_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25;
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
    setIsAiLoading(true);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) { 
      setAiRec(null);
    } finally { 
      setIsAiLoading(false); 
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
    <div className={`flex flex-col min-h-screen bg-black mesh-bg vibe-sunny ${theme === 'light' ? 'light-mode' : ''} text-slate-200 selection:bg-brand-red selection:text-white`}>
      {permissionError && !dismissedWarning && <PermissionWarning onDismiss={() => setDismissedWarning(true)} />}
      
      <nav className={`fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/10 flex items-center justify-between px-4 md:px-6 transition-all ${permissionError && !dismissedWarning ? 'mt-28 md:mt-16' : ''}`}>
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => { setShowDashboard(false); setAiRec(null); setSelectedCategory('All'); setSearchQuery(''); setUserMood(''); }}>
          <ConnectionLogo className="w-6 h-6 md:w-8 md:h-8" />
          <span className={`text-lg md:text-xl font-black italic tracking-tighter uppercase leading-none ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>MakeMyDays</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button onClick={toggleMusic} className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full border-2 transition-all ${isMusicPlaying ? 'bg-slate-900 border-brand-red' : 'bg-slate-800/30 border-white/10'}`}>
            <Visualizer isPlaying={isMusicPlaying} />
          </button>
          {currentUser ? (
            <button onClick={() => { setDashboardTab('bookings'); setShowDashboard(!showDashboard); }} className={`px-4 md:px-6 py-1.5 md:py-2 ${theme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all`}>Sanctuary</button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="px-4 md:px-6 py-1.5 md:py-2 bg-brand-red text-white rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Login</button>
          )}
        </div>
      </nav>

      <main className={`flex-1 px-4 md:px-6 max-w-7xl mx-auto w-full transition-all ${permissionError && !dismissedWarning ? 'pt-44 md:pt-24' : 'pt-24'}`}>
        {showDashboard ? (
          <Dashboard events={events} bookings={globalBookings} initialTab={dashboardTab} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        ) : (
          <div className="space-y-12 md:space-y-16 pb-20">
            <header className="text-center space-y-8 md:space-y-10 pt-6 md:pt-10">
              <h1 className={`text-5xl sm:text-6xl md:text-9xl font-display font-black italic tracking-tighter leading-[0.9] md:leading-none uppercase ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Find Your <br className="md:hidden" /><span className="frequency-text-gradient">Frequency</span>
              </h1>
              <div className="max-w-3xl mx-auto space-y-6">
                 <div className="relative dark-glass-card rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-4 flex items-center gap-2 md:gap-3 shadow-2xl">
                    <input type="text" placeholder="How is your energy today?" className={`flex-1 bg-transparent px-4 md:px-6 ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'} text-sm md:text-lg outline-none placeholder:text-slate-500`} value={userMood} onChange={(e) => { setUserMood(e.target.value); setSearchQuery(e.target.value); if(!e.target.value) setAiRec(null); }} />
                    <button onClick={() => handleMoodSearch(userMood)} className="bg-brand-red text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-widest active:scale-95 transition-all shadow-xl">SEARCH</button>
                 </div>
                 <div className="flex flex-wrap justify-center gap-2 px-2">
                    {MOODS.map(m => (
                      <button key={m.label} onClick={() => { setUserMood(m.label); setSearchQuery(m.label); handleMoodSearch(m.label); }} className={`bg-slate-900/40 border border-white/10 px-4 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 ${theme === 'light' ? 'bg-white border-slate-200' : ''}`}>
                        <span className="text-xs md:text-base">{m.emoji}</span>
                        <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{m.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </header>

            <section className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-2 px-1 -mx-4 md:mx-0">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? (theme === 'light' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-white text-slate-900') : (theme === 'light' ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30')}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredEvents.map(e => <EventCard key={e.id} event={e} onClick={setSelectedEvent} />)}
              </div>
              {filteredEvents.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="text-4xl">🛸</div>
                  <p className="text-slate-500 font-black italic uppercase text-xs tracking-widest">No matching frequencies detected in this zone.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date, guestName, guestPhone) => {
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
