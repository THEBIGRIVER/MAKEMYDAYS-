
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
import { DEFAULT_HOST } from './constants.ts';

const MOOD_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3";
const USER_STORAGE_KEY = 'makemydays_user_session_v1';

const MOODS = [
  { label: "Joyful", emoji: "🌈", glow: "rgba(248,68,100,0.5)", bg: "bg-brand-red" },
  { label: "Chill", emoji: "🧘", glow: "rgba(0,245,255,0.5)", bg: "bg-brand-accent" },
  { label: "Energetic", emoji: "⚡", glow: "rgba(223,255,0,0.5)", bg: "bg-brand-lime" },
  { label: "Inspired", emoji: "✨", glow: "rgba(139,92,246,0.5)", bg: "bg-brand-purple" },
  { label: "Peaceful", emoji: "🍃", glow: "rgba(16,185,129,0.5)", bg: "bg-emerald-500" }
];

const CATEGORIES: (Category | 'All' | 'Community')[] = ['All', 'Community', 'Shows', 'Activity', 'MMD Originals', 'Mindfulness', 'Workshop'];
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

const CommunityPulseTicker = ({ eventsCount }: { eventsCount: number }) => {
  const [pulseIdx, setPulseIdx] = useState(0);
  const pulses = [
    `NEW RESONANCE: Explorer +91 98*** just launched a new Workshop`,
    `BOOKING CONFIRMED: Someone anchored for Midnight Forest Bathing`,
    `LIVE PULSE: ${eventsCount} active streams currently broadcasting globally`,
    `COMMUNITY CHOICE: Secret Rooftop Sunset Jam trending in high-energy`
  ];

  useEffect(() => {
    const interval = setInterval(() => setPulseIdx(p => (p + 1) % pulses.length), 5000);
    return () => clearInterval(interval);
  }, [pulses.length]);

  return (
    <div className="w-full bg-brand-lime/10 border-y border-brand-lime/5 py-2 overflow-hidden flex whitespace-nowrap">
      <div className="animate-marquee flex items-center gap-12">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-lime">
               ● {pulses[pulseIdx]}
            </span>
            <div className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-ping" />
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | 'Community'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'bookings' | 'hosting' | 'settings'>('bookings');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [auraIndex, setAuraIndex] = useState(0);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [evs, bks] = await Promise.all([api.getEvents(), api.getBookings()]);
      const sortedEvents = (evs || []).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setEvents(sortedEvents);
      setGlobalBookings(bks || []);
      setAiRec(null);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(MOOD_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25;
    const interval = setInterval(() => setAuraIndex(p => (p + 1) % AURA_STATES.length), 4500);
    fetchData();
    
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) setCurrentUser(JSON.parse(stored));

    return () => { audioRef.current?.pause(); clearInterval(interval); };
  }, [fetchData]);

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

  const handleLaunchClick = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setDashboardTab('hosting');
      setShowDashboard(true);
    }
  };

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) {
      setAiRec(null);
      return;
    }
    setIsAiLoading(true);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) { 
      console.error(err); 
      setAiRec(null);
    } finally { 
      setIsAiLoading(false); 
    }
  };

  const handleSearchInputChange = (val: string) => {
    setUserMood(val);
    setSearchQuery(val);
    if (!val.trim()) {
      setAiRec(null);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      let matchCat = false;
      if (selectedCategory === 'All') {
        matchCat = true;
      } else if (selectedCategory === 'Community') {
        matchCat = e.hostPhone !== DEFAULT_HOST;
      } else {
        matchCat = e.category === selectedCategory;
      }

      const query = searchQuery.toLowerCase();
      const matchText = e.title.toLowerCase().includes(query) || 
                        e.category.toLowerCase().includes(query) ||
                        e.description.toLowerCase().includes(query);
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      const finalSearchMatch = aiRec ? matchAi : matchText;
      return matchCat && finalSearchMatch;
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

  const featuredEvents = useMemo(() => {
    return [...events].slice(0, 4);
  }, [events]);

  return (
    <div className={`flex flex-col min-h-screen bg-black mesh-bg vibe-sunny selection:bg-brand-red selection:text-slate-200`}>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { 
            setShowDashboard(false); 
            setShowAdmin(false); 
            setAiRec(null); 
            setSelectedCategory('All'); 
            setUserMood('');
            setSearchQuery('');
            fetchData(); 
          }}>
            <ConnectionLogo />
            <span className="text-xl font-black italic tracking-tighter text-slate-200 group-hover:text-brand-red transition-all">MakeMyDays</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLaunchClick}
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-brand-red text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-red transition-all shadow-lg active:scale-95"
            >
              Launch Wave
            </button>

            <button onClick={toggleMusic} aria-label="Toggle Atmosphere" className={`relative group w-11 h-11 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${isMusicPlaying ? 'bg-slate-900 border-brand-red shadow-lg' : 'bg-slate-800 border-white/10 hover:border-white/30'}`}>
              {isMusicPlaying && <div className="absolute inset-0 rounded-full border border-brand-red/40 animate-music-pulse" />}
              <div className="relative z-10 transition-transform group-hover:scale-110"><Visualizer isPlaying={isMusicPlaying} /></div>
            </button>

            {currentUser ? (
              <button id="user-sanctuary-trigger" onClick={() => { setDashboardTab('bookings'); setShowDashboard(!showDashboard); }} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black italic text-lg shadow-lg hover:bg-slate-200 transition-colors">
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
            initialTab={dashboardTab}
            onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); setShowDashboard(false); }} 
            onOpenAdmin={() => setShowAdmin(true)} onOpenPolicy={setActivePolicy} onRefreshEvents={fetchData}
          />
        ) : (
          <div className="space-y-16 pb-20">
            {/* Hero Section */}
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
                         type="text" 
                         placeholder="How is your energy? Or search by name..."
                         className="w-full bg-transparent border-none text-slate-200 text-lg font-medium placeholder:text-slate-600 focus:outline-none"
                         value={userMood} 
                         onChange={(e) => handleSearchInputChange(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                       />
                    </div>
                    <button 
                      onClick={() => handleMoodSearch(userMood)} 
                      disabled={isAiLoading || !userMood.trim()}
                      className={`w-full md:w-auto px-10 py-4 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-2 ${
                        isAiLoading || !userMood.trim() 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-brand-red text-slate-200 hover:bg-slate-100 hover:text-brand-red shadow-brand-red/40'
                      }`}
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Calibrating...
                        </>
                      ) : 'SEARCH 🔍'}
                    </button>
                 </div>

                 <div className="flex flex-wrap justify-center gap-3">
                    {MOODS.map(mood => {
                      const isActive = userMood.toLowerCase() === mood.label.toLowerCase();
                      return (
                        <button 
                          key={mood.label} 
                          onClick={() => { handleSearchInputChange(mood.label); handleMoodSearch(mood.label); }} 
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
                        <div className="flex-1 text-center md:text-left">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-red mb-2 italic">Frequency Harmonization</p>
                          <p className="text-lg font-bold italic text-slate-100 leading-tight">"{aiRec.reasoning}"</p>
                        </div>
                        <button onClick={() => { setAiRec(null); setUserMood(''); setSearchQuery(''); }} className="p-3 text-slate-400 hover:text-brand-red transition-all transform hover:rotate-90">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </div>
                   </div>
                 )}
              </div>
            </section>

            {/* Community Pulse Ticker */}
            <div className="relative z-10 -mx-6">
               <CommunityPulseTicker eventsCount={events.length} />
            </div>

            {/* Prime Resonance - Featured Scroller */}
            {!searchQuery && !aiRec && (
              <section className="space-y-6">
                <div className="flex items-end justify-between px-2">
                  <div className="space-y-1">
                    <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.4em]">Prime Resonance</span>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-200">Recently Calibrated</h2>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x px-2">
                  {featuredEvents.map(event => (
                    <div key={event.id} className="min-w-[280px] md:min-w-[320px] snap-center">
                      <EventCard event={event} onClick={setSelectedEvent} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Global Discovery Feed Section */}
            <section id="event-grid-container" className="space-y-12 relative">
              {/* Subtle grid decoration */}
              <div className="absolute inset-0 -z-10 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="flex flex-col space-y-10 border-b border-white/5 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-brand-accent text-[11px] font-black uppercase tracking-[0.5em] drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]">Peer-to-Peer Network</span>
                      <div className="h-0.5 w-12 bg-brand-accent/30 rounded-full"></div>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-100 leading-[0.9]">
                      Global Discovery <br /> <span className="text-brand-accent">Feed</span>
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-white/10 shadow-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Sanctuary Active</span>
                       </div>
                       <div className="h-5 w-[1px] bg-white/10"></div>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">{events.length}</span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Frequencies</span>
                       </div>
                    </div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 italic">Synchronized across 12 region nodes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setSelectedCategory(cat); setAiRec(null); }} 
                      className={`whitespace-nowrap px-8 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                        selectedCategory === cat 
                        ? 'bg-slate-100 border-slate-100 text-slate-900 shadow-[0_15px_40px_rgba(255,255,255,0.15)] translate-y-[-4px]' 
                        : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {/* Community Host CTA Card */}
                {!searchQuery && (selectedCategory === 'All' || selectedCategory === 'Community') && (
                  <div 
                    onClick={handleLaunchClick}
                    className="group cursor-pointer animate-slide-up flex flex-col items-center justify-center gap-8 glass-card p-10 rounded-[3rem] border-2 border-dashed border-white/10 hover:border-brand-accent hover:bg-slate-900/60 transition-all shadow-xl bg-slate-900/30 min-h-[400px]"
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-brand-accent/50 group-hover:scale-110 transition-all shadow-inner">
                       <svg className="w-10 h-10 text-brand-accent group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                       </svg>
                    </div>
                    <div className="text-center space-y-3">
                       <h4 className="text-lg font-black italic uppercase tracking-tighter text-slate-100 group-hover:text-brand-accent transition-colors">Broadcast Your Wave</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed px-4">Anyone can host a sanctuary. Join the global peer-to-peer network today.</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-black text-brand-accent uppercase tracking-[0.3em] group-hover:animate-pulse">Initialize Node</span>
                      <div className="w-8 h-1 bg-brand-accent/20 rounded-full transition-all group-hover:w-16 group-hover:bg-brand-accent"></div>
                    </div>
                  </div>
                )}

                {filteredEvents.map(event => (
                  <div key={event.id} className="animate-slide-up">
                    <EventCard event={event} onClick={setSelectedEvent} />
                  </div>
                ))}
              </div>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-32 bg-slate-950/40 rounded-[5rem] border-2 border-dashed border-white/5 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8">
                     <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <p className="text-slate-500 text-base font-black uppercase tracking-[0.2em] italic">No active frequencies detected in this stream.</p>
                  <button onClick={() => { setAiRec(null); setUserMood(''); setSearchQuery(''); setSelectedCategory('All'); }} className="mt-10 px-10 py-5 bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-red hover:text-white transition-all transform active:scale-95 shadow-2xl">Reset Satellite Link</button>
                </div>
              )}
              
              <div className="pt-24 text-center space-y-10">
                 <div className="flex justify-center items-center gap-6">
                    <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white/10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700 italic">Ethereal End of Stream</p>
                    <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white/10"></div>
                 </div>
                 <div className="flex justify-center gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-slate-800 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
                    ))}
                 </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="py-20 px-6 border-t border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[11px] font-black tracking-[0.4em] text-slate-500 uppercase italic">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4">
              <ConnectionLogo className="w-8 h-8 opacity-60" />
              <span className="text-slate-300 tracking-[0.2em]">MAKEMYDAYS — SANCTUARY NETWORK © 2024</span>
            </div>
            <span className="text-slate-800 hidden md:block text-2xl">|</span>
            <div className="flex flex-col md:flex-row items-center gap-3">
               <span className="text-slate-600">INFRASTRUCTURE:</span>
               <span className="text-brand-accent drop-shadow-[0_0_5px_rgba(0,245,255,0.3)]">BENEME PROTOCOL 2.5</span>
            </div>
          </div>
          <div className="flex gap-12">
            {['Terms', 'Privacy', 'Refund'].map(l => (
              <button key={l} className="hover:text-brand-red transition-all hover:tracking-[0.6em] duration-500">{l}</button>
            ))}
          </div>
        </div>
      </footer>

      {activePolicy && <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date) => {
          if (!selectedEvent) return;
          const booking: Booking = { 
            id: Math.random().toString(36).substr(2, 9), 
            eventId: selectedEvent.id, 
            eventTitle: selectedEvent.title, 
            category: selectedCategory === 'Community' ? selectedEvent.category : selectedEvent.category, 
            time: slot.time, 
            eventDate: date, 
            price: selectedEvent.price, 
            bookedAt: new Date().toISOString(), 
            userName: currentUser?.name || 'Anonymous Guest', 
            userPhone: currentUser?.phone || 'Guest Line' 
          };
          await api.saveBooking(booking);
          if (currentUser) {
            const updatedUser = { ...currentUser, bookings: [booking, ...currentUser.bookings] };
            setCurrentUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          }
          setGlobalBookings(prev => [booking, ...prev]);
          setSelectedEvent(null);
      }} />}
      {showAuthModal && <AuthModal onSuccess={(u) => { setCurrentUser(u); localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u)); setShowAuthModal(false); }} onClose={() => setShowAuthModal(false)} />}
      <ChatBot />
    </div>
  );
};

export default App;
