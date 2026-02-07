
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
const AURA_STATES = ["TRUE", "SYNCED", "OPTIMAL", "PURE", "RESONATING", "FLUID", "DEEP"];

const PermissionWarning = () => (
  <div className="w-full bg-brand-red p-4 text-center animate-in slide-in-from-top duration-500">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
      <p className="text-white text-[11px] font-black uppercase tracking-widest">
        ⚠️ Firestore Rules: Missing Permissions. Data is restricted to local samples.
      </p>
      <button 
        onClick={() => {
          const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /events/{event} { allow read: if true; allow write: if request.auth != null; }\n    match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }\n    match /bookings/{booking} { allow read, write: if request.auth != null; }\n  }\n}`;
          navigator.clipboard.writeText(rules);
          alert("Safe Firestore Rules copied! Paste them in Firebase Console > Firestore > Rules");
        }}
        className="bg-white text-brand-red px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
      >
        Copy Fixed Rules
      </button>
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

const App: React.FC = () => {
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
  const [showAdmin, setShowAdmin] = useState(false);
  const [auraIndex, setAuraIndex] = useState(0);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      if (e.code === 'permission-denied') setPermissionError(true);
      console.error(e); 
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
      let matchCat = selectedCategory === 'All' || (selectedCategory === 'Community' ? e.hostPhone !== '917686924919' : e.category === selectedCategory);
      const query = searchQuery.toLowerCase();
      const matchText = e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query);
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      return matchCat && (aiRec ? matchAi : matchText);
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

  return (
    <div className="flex flex-col min-h-screen bg-black mesh-bg vibe-sunny text-slate-200">
      {permissionError && <PermissionWarning />}
      
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setShowDashboard(false); setAiRec(null); setSelectedCategory('All'); setSearchQuery(''); setUserMood(''); }}>
          <ConnectionLogo />
          <span className="text-xl font-black italic tracking-tighter uppercase">MakeMyDays</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleMusic} className={`w-11 h-11 flex items-center justify-center rounded-full border-2 transition-all ${isMusicPlaying ? 'bg-slate-900 border-brand-red' : 'bg-slate-800 border-white/10'}`}>
            <Visualizer isPlaying={isMusicPlaying} />
          </button>
          {currentUser ? (
            <button onClick={() => { setDashboardTab('bookings'); setShowDashboard(!showDashboard); }} className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest">Sanctuary</button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="px-6 py-2 bg-brand-red text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Login</button>
          )}
        </div>
      </nav>

      <main className="flex-1 pt-24 px-6 max-w-7xl mx-auto w-full">
        {showDashboard ? (
          <Dashboard events={events} bookings={globalBookings} initialTab={dashboardTab} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        ) : (
          <div className="space-y-16 pb-20">
            <header className="text-center space-y-10 pt-10">
              <h1 className="text-6xl md:text-9xl font-display font-black italic tracking-tighter leading-none uppercase">
                Find Your <span className="frequency-text-gradient">Frequency</span>
              </h1>
              <div className="max-w-3xl mx-auto space-y-6">
                 <div className="relative dark-glass-card rounded-[2.5rem] p-4 flex items-center gap-3">
                    <input type="text" placeholder="How is your energy today?" className="flex-1 bg-transparent px-6 text-slate-200 text-lg outline-none" value={userMood} onChange={(e) => { setUserMood(e.target.value); setSearchQuery(e.target.value); if(!e.target.value) setAiRec(null); }} />
                    <button onClick={() => handleMoodSearch(userMood)} className="bg-brand-red text-white px-10 py-4 rounded-3xl font-black uppercase text-[10px]">SEARCH</button>
                 </div>
                 <div className="flex flex-wrap justify-center gap-2">
                    {MOODS.map(m => (
                      <button key={m.label} onClick={() => { setUserMood(m.label); setSearchQuery(m.label); handleMoodSearch(m.label); }} className="bg-slate-900/40 border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all">
                        <span>{m.emoji}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </header>

            <section className="space-y-12">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-white border-white text-slate-900' : 'bg-transparent border-white/10 text-slate-500'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {filteredEvents.map(e => <EventCard key={e.id} event={e} onClick={setSelectedEvent} />)}
              </div>
            </section>
          </div>
        )}
      </main>

      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date, guestName, guestPhone) => {
          if (!currentUser) return;
          const booking: Booking = { id: Math.random().toString(36).substr(2, 9), eventId: selectedEvent.id, eventTitle: selectedEvent.title, category: selectedEvent.category, time: slot.time, eventDate: date, price: selectedEvent.price, bookedAt: new Date().toISOString(), userName: guestName, userPhone: guestPhone };
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
