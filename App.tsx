import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Event, Category, Booking, User } from './types';
import EventCard from './components/EventCard';
import BookingModal from './components/BookingModal';
import Dashboard from './components/Dashboard';
import LegalModal, { PolicyType } from './components/LegalModal';
import AuthModal from './components/AuthModal';
import ChatBot from './components/ChatBot';
import { api } from './services/api';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { INITIAL_EVENTS } from './constants';

const CATEGORIES: Category[] = ['Activity', 'Shows', 'MMD Originals', 'Mindfulness', 'Workshop', 'Therapy'];

const MOODS = [
  { label: 'Energetic', icon: '⚡', query: 'I feel energetic and want to do something high-intensity' },
  { label: 'Stressed', icon: '🧘', query: 'I am stressed and need to calm my mind' },
  { label: 'Bored', icon: '🎲', query: 'I am bored and looking for something unique and fun' },
  { label: 'Creative', icon: '🎨', query: 'I feel creative and want to learn or build something' },
  { label: 'Tired', icon: '🌙', query: 'I am tired and need some gentle somatic healing' },
  { label: 'Social', icon: '🥂', query: 'I am feeling social and want to meet people' }
];

const RhythmTuner = ({ events, onSelect }: { events: Event[], onSelect: (e: Event) => void }) => {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [suggestedEvent, setSuggestedEvent] = useState<Event | null>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const handleTap = () => {
    const now = Date.now();
    const newTaps = [...taps, now].slice(-5);
    setTaps(newTaps);

    if (rippleRef.current) {
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 rounded-full border-2 border-brand-prime animate-ping opacity-70';
      rippleRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }

    if (newTaps.length >= 4) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      setBpm(calculatedBpm);
      
      if (newTaps.length === 5) {
        setIsCalibrated(true);
        let filtered = events;
        if (calculatedBpm > 110) filtered = events.filter(e => ['Activity', 'Shows'].includes(e.category));
        else if (calculatedBpm < 90) filtered = events.filter(e => ['Mindfulness', 'Therapy'].includes(e.category));
        
        setSuggestedEvent(filtered[Math.floor(Math.random() * filtered.length)] || events[0]);
      }
    }
  };

  const reset = () => {
    setTaps([]);
    setBpm(null);
    setIsCalibrated(false);
    setSuggestedEvent(null);
  };

  return (
    <div className="w-full h-full p-4 flex flex-col items-center gap-4 relative overflow-hidden">
      <div className="text-center space-y-0.5">
        <span className="text-brand-prime text-[7px] font-black uppercase tracking-[0.3em]">Somatic Pulse</span>
        <h4 className="text-base font-display font-black text-brand-beige italic leading-none">Rhythm Tuner</h4>
      </div>

      {!isCalibrated ? (
        <div className="flex flex-col items-center gap-3">
          <div 
            ref={rippleRef}
            onClick={handleTap}
            className="relative w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center cursor-pointer active:scale-95 transition-all group"
          >
            <div className="absolute inset-2.5 rounded-full border border-white/5 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-lg animate-pulse">💓</span>
          </div>
          <div className="text-center">
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Tap 5 times</p>
            {bpm && <p className="text-brand-prime font-black text-[9px] mt-0.5">{bpm} BPM</p>}
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3 animate-in zoom-in-95 duration-500">
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Pulse: {bpm} BPM</p>
            <h5 className="text-lg font-display font-black tracking-tighter italic text-brand-prime leading-none">
              {bpm! > 110 ? 'High Freq' : bpm! < 90 ? 'Deep Resonance' : 'Balanced'}
            </h5>
          </div>
          {suggestedEvent && (
            <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-2">
              <img src={suggestedEvent.image} className="w-10 h-10 rounded-md object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <span className="text-[6px] font-black uppercase text-brand-prime">{suggestedEvent.category}</span>
                <p className="text-brand-beige text-[10px] font-bold truncate">{suggestedEvent.title}</p>
              </div>
              <button onClick={() => onSelect(suggestedEvent)} className="p-1.5 bg-brand-prime text-brand-beige rounded-md active:scale-90 transition-transform">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          )}
          <button onClick={reset} className="w-full text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-brand-beige transition-colors">Reset</button>
        </div>
      )}
    </div>
  );
};

const AuraScanner = ({ events, onSelect }: { events: Event[], onSelect: (e: Event) => void }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [result, setResult] = useState<{ aura: string, color: string, event: Event } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScan = () => {
    if (result) return;
    setIsHolding(true);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          finishScan();
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const stopScan = () => {
    setIsHolding(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progress < 100) setProgress(0);
  };

  const finishScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const auraProfiles = [
      { aura: 'NEON VELOCITY', color: 'text-brand-prime' },
      { aura: 'OBSIDIAN SILENCE', color: 'text-brand-beige' },
      { aura: 'SOLAR FLARE', color: 'text-orange-500' },
      { aura: 'CHRONO STATIC', color: 'text-purple-500' }
    ];
    const profile = auraProfiles[Math.floor(Math.random() * auraProfiles.length)];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setResult({ ...profile, event: randomEvent });
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="w-full h-full p-4 flex flex-col items-center gap-4 relative overflow-hidden">
      <div className="text-center space-y-0.5">
        <span className="text-brand-prime text-[7px] font-black uppercase tracking-[0.3em]">Biometric Sync</span>
        <h4 className="text-base font-display font-black text-brand-beige italic leading-none">Aura Scan</h4>
      </div>

      {!result ? (
        <div className="flex flex-col items-center gap-3">
          <div 
            onMouseDown={startScan}
            onMouseUp={stopScan}
            onMouseLeave={stopScan}
            onTouchStart={startScan}
            onTouchEnd={stopScan}
            className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 ${isHolding ? 'border-brand-prime scale-110 shadow-[0_0_20px_rgba(255,153,51,0.4)]' : 'border-white/10 hover:border-white/30'}`}
          >
            <div className="absolute inset-1 rounded-full border border-white/5 animate-spin-slow" />
            <svg className="w-6 h-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
            </svg>
            <div 
              className="absolute inset-0 rounded-full border-2 border-brand-prime opacity-0 transition-opacity" 
              style={{ 
                opacity: isHolding ? 1 : 0,
                clipPath: `inset(${100 - progress}% 0 0 0)`
              }} 
            />
          </div>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            {isHolding ? 'Syncing...' : 'Hold Scan'}
          </p>
        </div>
      ) : (
        <div className="w-full space-y-3 animate-in zoom-in-95 duration-500">
          <div className="text-center">
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Detected</p>
            <h5 className={`text-lg font-display font-black tracking-tighter italic leading-none ${result.color}`}>{result.aura}</h5>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-2">
            <img src={result.event.image} className="w-10 h-10 rounded-md object-cover" alt="" />
            <div className="flex-1 min-w-0">
              <span className="text-[6px] font-black uppercase text-brand-prime">{result.event.category}</span>
              <p className="text-brand-beige text-[10px] font-bold truncate">{result.event.title}</p>
            </div>
            <button onClick={() => onSelect(result.event)} className="p-1.5 bg-brand-prime text-brand-beige rounded-md active:scale-90 transition-transform">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
          <button onClick={reset} className="w-full text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-brand-beige transition-colors">Recalibrate</button>
        </div>
      )}
    </div>
  );
};

const HeroBillboard = ({ trendingEvents, onBook, favorites, onToggleFavorite }: { 
  trendingEvents: Event[], 
  onBook: (e: Event) => void,
  favorites: string[],
  onToggleFavorite: (id: string) => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingEvents.length);
      setIsTransitioning(false);
    }, 600);
  }, [trendingEvents.length]);

  useEffect(() => {
    const timer = setInterval(handleNext, 8000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const activeEvent = trendingEvents[currentIndex];
  if (!activeEvent) return null;

  const isFav = favorites.includes(activeEvent.id);

  return (
    <div className="relative w-full h-[65vh] md:h-[90vh] overflow-hidden bg-brand-navy">
      <div className={`absolute inset-0 transition-all duration-1000 transform ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
        <img 
          src={activeEvent.image} 
          className="w-full h-full object-cover object-center" 
          alt={activeEvent.title}
        />
      </div>
      
      <div className="absolute inset-0 prime-hero-gradient hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 md:via-transparent to-transparent" />
      
      <div className={`absolute bottom-[10%] md:top-[22%] left-[6%] md:left-[6%] max-w-[90%] md:max-w-[45%] space-y-4 md:space-y-7 transition-all duration-700 z-10 ${isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-3">
          <span className="bg-brand-prime text-brand-beige px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] rounded-md shadow-lg shadow-brand-prime/20">Featured</span>
          <span className="text-slate-300/80 text-[10px] font-bold tracking-widest uppercase">{activeEvent.category}</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-display font-extrabold leading-[1.05] text-brand-beige drop-shadow-2xl tracking-tighter">
          {activeEvent.title}
        </h1>
        
        <p className="text-slate-200/90 text-sm md:text-xl font-medium leading-relaxed line-clamp-2 md:line-clamp-3 max-w-xl">
          {activeEvent.description}
        </p>
        
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => onBook(activeEvent)}
            className="px-8 md:px-14 h-12 md:h-16 bg-brand-prime text-brand-beige rounded-xl font-bold text-base md:text-xl hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-brand-prime/20"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
            Book Now
          </button>
          
          <button 
            onClick={() => onToggleFavorite(activeEvent.id)}
            className={`w-12 h-12 md:w-16 md:h-16 backdrop-blur-2xl rounded-xl font-bold flex items-center justify-center transition-all border-2 shadow-2xl ${isFav ? 'bg-red-500 border-red-500 text-brand-beige' : 'bg-white/10 border-white/10 text-brand-beige hover:bg-white/20'}`}
          >
            <svg className={`w-7 h-7 ${isFav ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 right-[6%] flex items-center gap-2 z-20">
        {trendingEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-10 bg-brand-prime shadow-[0_0_15px_rgba(255,153,51,0.6)]' : 'w-5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'bookings' | 'hosting' | 'settings'>('bookings');
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState('');

  const fetchData = useCallback(async (userUid?: string) => {
    try {
      const evs = await api.getEvents();
      setEvents(evs);
      if (userUid) {
        const bks = await api.getBookings(userUid);
        setGlobalBookings(bks);
      }
    } catch { 
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state) {
        setSelectedEvent(null);
        setShowDashboard(false);
        setShowFavoritesOnly(false);
        setActivePolicy(null);
        setShowAuthModal(false);
        setIsChatOpen(false);
      } else {
        if (event.state.view === 'home') {
          setSelectedEvent(null);
          setShowDashboard(false);
          setIsChatOpen(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ view: 'home' }, '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    window.history.pushState({ view: 'event', id: event.id }, '');
  };

  const handleCloseEvent = () => {
    if (window.history.state?.view === 'event') {
      window.history.back();
    } else {
      setSelectedEvent(null);
    }
  };

  const handleOpenDashboard = (tab: 'bookings' | 'hosting' | 'settings') => {
    if (!currentUser) { setShowAuthModal(true); return; }
    setDashboardTab(tab);
    setShowDashboard(true);
    window.history.pushState({ view: 'dashboard', tab }, '');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to terminate this experience broadcast? It will be removed for everyone.")) {
      try {
        await api.deleteEvent(eventId, currentUser.uid);
        fetchData(currentUser.uid);
      } catch (err) {
        alert("Action disrupted. Verification failed.");
      }
    }
  };

  useEffect(() => {
    const savedFavs = localStorage.getItem('mmd_wishlist');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = { uid: firebaseUser.uid, name: firebaseUser.displayName || 'Explorer', email: firebaseUser.email || '', bookings: [], role: firebaseUser.email === 'admin@makemydays.com' ? 'admin' : 'user' };
        setCurrentUser(user);
        await api.syncUserProfile(user);
        fetchData(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        fetchData();
      }
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchData]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('mmd_wishlist', JSON.stringify(newFavs));
  };

  const triggerAIChat = (query: string) => {
    if (!query.trim()) {
      setIsChatOpen(true);
      return;
    }
    setChatInitialQuery(query);
    setIsChatOpen(true);
  };

  const getRowEvents = (category: Category) => {
    return events.filter(e => {
      const matchCat = e.category === category;
      const matchSearch = searchQuery.toLowerCase() === '' || 
                         e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav = showFavoritesOnly ? favorites.includes(e.id) : true;
      return matchCat && matchSearch && matchFav;
    });
  };

  const topRatedEvents = events
    .filter(e => (e.averageRating || 0) > 0)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 8)
    .filter(e => {
      const matchSearch = searchQuery.toLowerCase() === '' || 
                         e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav = showFavoritesOnly ? favorites.includes(e.id) : true;
      return matchSearch && matchFav;
    });

  return (
    <div className="flex flex-col min-h-screen bg-brand-navy pb-[80px] md:pb-0 selection:bg-brand-prime/30">
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 h-16 md:h-24 flex items-center justify-between ${isScrolled ? 'bg-brand-navy/80 backdrop-blur-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] border-b border-white/10' : 'bg-transparent backdrop-blur-sm'}`}>
        <div className="flex items-center gap-6 md:gap-14">
          <div className="bg-black/20 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 group transition-all hover:bg-black/40 cursor-pointer shadow-xl" onClick={() => { 
            if (showDashboard) window.history.back();
            setShowFavoritesOnly(false); 
            window.scrollTo({top:0, behavior:'smooth'}); 
          }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-prime rounded-lg group-hover:rotate-12 transition-transform duration-500 flex items-center justify-center text-brand-beige shadow-lg shadow-brand-prime/30">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a3 3 0 0 0 0 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a3 3 0 0 0 0-6Z" />
              </svg>
            </div>
            <span className="text-2xl md:text-3xl font-display font-black text-brand-beige tracking-tighter">
              MAKE<span className="text-brand-prime">MYDAYS</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
            <button className={`${!showDashboard && !showFavoritesOnly ? 'text-brand-beige border-b-2 border-brand-prime' : 'hover:text-brand-beige'} h-24 flex items-center transition-all`} onClick={() => { 
              if (showDashboard) window.history.back();
              setShowFavoritesOnly(false); 
            }}>Home</button>
            <button className={`${showFavoritesOnly ? 'text-brand-beige border-b-2 border-brand-prime' : 'hover:text-brand-beige'} h-24 flex items-center transition-all`} onClick={() => { 
              if (showDashboard) window.history.back();
              setShowFavoritesOnly(true); 
            }}>Watchlist</button>
            <button className="hover:text-brand-beige h-24 flex items-center">Store</button>
            <button className="hover:text-brand-beige h-24 flex items-center">Categories</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-3 bg-brand-prime/10 border border-brand-prime/20 px-5 py-2.5 rounded-xl focus-within:bg-brand-prime/20 focus-within:border-brand-prime transition-all duration-300 backdrop-blur-md">
              <button onClick={() => triggerAIChat(searchQuery)} className="p-1 text-brand-prime hover:scale-110 transition-transform outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625 14.875 18.375l2.625.75.75 2.625.75 2.625.75-2.625 2.625-.75-2.625-.75-.75-2.625zM16.5 3.5l.75 2.625 2.625.75-2.625.75-.75 2.625-.75-2.625-2.625-.75 2.625-.75.75-2.625z" /></svg>
              </button>
              <input 
                type="text" placeholder="Ask AI Concierge..." 
                className="bg-transparent border-none outline-none text-sm w-48 text-brand-beige placeholder:text-brand-prime/40 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && triggerAIChat(searchQuery)}
              />
           </div>
           {currentUser ? (
              <button onClick={() => handleOpenDashboard('settings')} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center font-black text-sm hover:border-brand-prime hover:bg-brand-prime/10 transition-all text-brand-beige backdrop-blur-md">
                {currentUser.name.charAt(0)}
              </button>
           ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-7 h-11 bg-brand-prime text-brand-beige rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-brand-prime/20">Sign In</button>
           )}
        </div>
      </nav>

      {showDashboard ? (
        <main className="pt-24 px-6 md:px-12 animate-fade-in">
          <Dashboard initialTab={dashboardTab} events={events} bookings={globalBookings} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        </main>
      ) : (
        <main className="flex-1 animate-fade-in">
          {!showFavoritesOnly && <HeroBillboard trendingEvents={events.slice(0,5)} onBook={handleOpenEvent} favorites={favorites} onToggleFavorite={toggleFavorite} />}

          <div className={`relative z-10 px-6 md:px-12 space-y-10 md:space-y-12 ${showFavoritesOnly ? 'pt-32' : 'mt-12 md:mt-20'} pb-32`}>
            {showFavoritesOnly && favorites.length === 0 && (
              <div className="py-32 text-center text-slate-500 space-y-6">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-extrabold text-brand-beige">Your list is quiet</h2>
                  <p className="max-w-md mx-auto">Calibrate your future self by adding the experiences that move you to your watchlist.</p>
                </div>
                <button onClick={() => setShowFavoritesOnly(false)} className="px-10 py-4 bg-brand-prime text-brand-beige rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-brand-prime/20 active:scale-95 transition-all">Explore Experience</button>
              </div>
            )}

            {/* Top Rated Section */}
            {topRatedEvents.length > 0 && (
              <div className="space-y-6 md:space-y-8 animate-slide-up">
                <div className="flex items-end justify-between px-2">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-brand-prime italic">
                      Top Rated Resonance
                    </h2>
                    <div className="h-1 w-20 bg-brand-prime rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 -mx-6 px-6 scrollbar-hide snap-x">
                  {topRatedEvents.map((e) => (
                    <div key={e.id} className="min-w-[300px] md:min-w-[440px] snap-center">
                      <EventCard 
                        event={e} 
                        onClick={handleOpenEvent} 
                        isFavorite={favorites.includes(e.id)} 
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {CATEGORIES.map(category => {
              const rowEvents = getRowEvents(category);
              if (rowEvents.length === 0) return null;
              
              return (
                <div key={category} className="space-y-6 md:space-y-8 animate-slide-up">
                  <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-brand-beige">
                        {category}
                      </h2>
                      <div className="h-1 w-12 bg-brand-prime rounded-full"></div>
                    </div>
                    <button className="text-brand-prime text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">View All</button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-8 -mx-6 px-6 scrollbar-hide snap-x">
                    {rowEvents.map((e) => (
                      <div key={e.id} className="min-w-[300px] md:min-w-[440px] snap-center">
                        <EventCard 
                          event={e} 
                          onClick={handleOpenEvent} 
                          isFavorite={favorites.includes(e.id)} 
                          onToggleFavorite={toggleFavorite}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {!showFavoritesOnly && (
              <div className="py-8 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-prime/5 blur-[80px] pointer-events-none rounded-full" />
                <div className="relative z-10 w-full max-w-7xl">
                  
                  <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-3 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-3 lg:gap-4 w-full scrollbar-hide">
                    
                    {/* Personalized Discovery Card */}
                    <div className="min-w-[75vw] md:min-w-[320px] lg:min-w-0 snap-center p-4 flex flex-col justify-center items-center gap-4 text-center">
                      <div className="space-y-0.5">
                        <span className="text-brand-prime text-[7px] font-black uppercase tracking-[0.3em]">AI Concierge</span>
                        <h3 className="text-lg font-display font-black tracking-tight text-brand-beige leading-none italic">Experience Sync</h3>
                        <p className="text-slate-500 text-[8px] font-medium leading-relaxed max-w-[200px] mx-auto mt-1">What's your energy today?</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 w-full">
                        {MOODS.map((mood) => (
                          <button
                            key={mood.label}
                            onClick={() => triggerAIChat(mood.query)}
                            className="group flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-prime/50 hover:bg-brand-prime/10 transition-all active:scale-95"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform">{mood.icon}</span>
                            <span className="text-[6px] font-black uppercase tracking-widest text-slate-500 group-hover:text-brand-beige">{mood.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full group">
                        <input 
                          type="text" 
                          placeholder="Describe feel..." 
                          className="bg-brand-navy/60 border border-white/10 px-3 h-9 rounded-lg text-[10px] w-full outline-none focus:border-brand-prime focus:bg-brand-navy/80 transition-all backdrop-blur-md placeholder:text-slate-700 text-brand-beige"
                          value={userMood}
                          onChange={(e) => setUserMood(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && triggerAIChat(userMood)}
                        />
                        <button 
                          onClick={() => triggerAIChat(userMood)} 
                          className="absolute right-1 top-1 bottom-1 px-2.5 bg-brand-prime text-brand-beige rounded-md font-black text-[7px] uppercase tracking-widest active:scale-95 transition-all"
                        >
                          Sync
                        </button>
                      </div>
                    </div>

                    {/* Biometric Sync Card */}
                    <div className="min-w-[75vw] md:min-w-[320px] lg:min-w-0 snap-center">
                      <AuraScanner events={events} onSelect={handleOpenEvent} />
                    </div>

                    {/* Somatic Pulse Card */}
                    <div className="min-w-[75vw] md:min-w-[320px] lg:min-w-0 snap-center">
                      <RhythmTuner events={events} onSelect={handleOpenEvent} />
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </main>
      )}

      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-[200] bg-[#1A242E]/80 backdrop-blur-3xl border border-white/10 h-16 rounded-[2rem] flex items-center justify-around px-2 shadow-2xl shadow-black/50 text-brand-beige">
        <button onClick={() => { 
          if (showDashboard) window.history.back();
          setShowFavoritesOnly(false); 
        }} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${!showDashboard && !showFavoritesOnly ? 'bg-brand-prime text-brand-beige' : 'text-slate-500 hover:text-brand-beige'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        </button>
        <button onClick={() => setIsChatOpen(true)} className="flex items-center justify-center w-12 h-12 rounded-2xl text-slate-500 hover:text-brand-prime transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625 14.875 18.375l2.625.75.75 2.625.75 2.625.75-2.625 2.625-.75-2.625-.75-.75-2.625zM16.5 3.5l.75 2.625 2.625.75-2.625.75-.75 2.625-.75-2.625-2.625-.75 2.625-.75.75-2.625z" /></svg>
        </button>
        <button onClick={() => handleOpenDashboard('hosting')} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showDashboard && dashboardTab === 'hosting' ? 'bg-brand-prime text-brand-beige' : 'text-slate-500 hover:text-brand-beige'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5"/></svg>
        </button>
        <button onClick={() => { 
          if (showDashboard) window.history.back();
          setShowFavoritesOnly(true); 
        }} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showFavoritesOnly ? 'bg-brand-prime text-brand-beige' : 'text-slate-500 hover:text-brand-beige'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
        <button onClick={() => handleOpenDashboard('bookings')} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showDashboard && dashboardTab === 'bookings' ? 'bg-brand-prime text-brand-beige' : 'text-slate-500 hover:text-brand-beige'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2.5"/></svg>
        </button>
      </nav>

      {selectedEvent && (
        <BookingModal 
          event={selectedEvent} 
          onClose={handleCloseEvent} 
          onConfirm={async (slot, date, guestName, guestPhone) => {
            if (!currentUser) { setShowAuthModal(true); return; }
            const booking: Booking = { id: Math.random().toString(36).slice(2, 11), eventId: selectedEvent.id, eventTitle: selectedEvent.title, category: selectedEvent.category, time: slot.time, eventDate: date, price: selectedEvent.price, bookedAt: new Date().toISOString(), userName: guestName, userPhone: guestPhone, hostPhone: selectedEvent.hostPhone, userUid: currentUser.uid };
            await api.saveBooking(booking, currentUser.uid);
            fetchData(currentUser.uid);
          }} 
        />
      )}
      
      {showAuthModal && <AuthModal onSuccess={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)} />}
      {activePolicy && <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
      
      <ChatBot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        initialQuery={chatInitialQuery} 
      />
    </div>
  );
};

export default App;