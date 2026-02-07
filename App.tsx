
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
  <div className="fixed top-0 left-0 right-0 z-[1000] bg-brand-red p-4 shadow-2xl animate-in slide-in-from-top duration-500 border-b border-white/20">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p className="text-white text-xs font-black uppercase tracking-widest leading-none">Database Protocol Locked</p>
          <p className="text-white/70 text-[9px] font-bold uppercase mt-1 tracking-wider">Deploying in Offline Demo Mode. Update Firestore Rules to enable live hosting.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /events/{event} { allow read: if true; allow write: if request.auth != null; }\n    match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }\n    match /bookings/{booking} { allow read, write: if request.auth != null; }\n  }\n}`;
            navigator.clipboard.writeText(rules);
            alert("Rules copied! Paste them in Firebase Console > Firestore > Rules");
          }}
          className="bg-white text-brand-red px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Get Rules
        </button>
        <button onClick={onDismiss} className="text-white/60 hover:text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
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
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);
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
    <div className="flex flex-col min-h-screen bg-black mesh-bg vibe-sunny text-slate-200">
      {permissionError && !dismissedWarning && <PermissionWarning onDismiss={() => setDismissedWarning(true)} />}
      
      <nav className={`fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/10 flex items-center justify-between px-6 transition-all ${permissionError && !dismissedWarning ? 'mt-16' : ''}`}>
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

      <main className={`flex-1 px-6 max-w-7xl mx-auto w-full transition-all ${permissionError && !dismissedWarning ? 'pt-40' : 'pt-24'}`}>
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
