import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Event, Category, Booking, AIRecommendation, User } from './types';
import EventCard from './components/EventCard';
import BookingModal from './components/BookingModal';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import LegalModal, { PolicyType } from './components/LegalModal';
import AuthModal from './components/AuthModal';
import { api } from './services/api';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { INITIAL_EVENTS } from './constants';

const CATEGORIES: Category[] = ['Activity', 'Shows', 'MMD Originals', 'Mindfulness', 'Workshop', 'Therapy'];

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
          <span className="bg-brand-prime text-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] rounded-md shadow-lg shadow-brand-prime/20">Featured</span>
          <span className="text-slate-300/80 text-sm font-bold tracking-wide uppercase">{activeEvent.category}</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-display font-extrabold leading-[1.05] text-white drop-shadow-2xl tracking-tighter">
          {activeEvent.title}
        </h1>
        
        <p className="text-slate-200/90 text-sm md:text-xl font-medium leading-relaxed line-clamp-2 md:line-clamp-3 max-w-xl">
          {activeEvent.description}
        </p>
        
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => onBook(activeEvent)}
            className="px-8 md:px-14 h-12 md:h-16 bg-brand-prime text-white rounded-xl font-bold text-base md:text-xl hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-brand-prime/20"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
            Book Now
          </button>
          
          <button 
            onClick={() => onToggleFavorite(activeEvent.id)}
            className={`w-12 h-12 md:w-16 md:h-16 backdrop-blur-2xl rounded-xl font-bold flex items-center justify-center transition-all border-2 shadow-2xl ${isFav ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
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
            className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-10 bg-brand-prime shadow-[0_0_15px_rgba(0,168,225,0.6)]' : 'w-5 bg-white/20'}`}
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
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
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

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) { setAiRec(null); return; }
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch { setAiRec(null); }
  };

  const openDashboardTab = (tab: 'bookings' | 'hosting' | 'settings') => {
    if (!currentUser) { setShowAuthModal(true); return; }
    setDashboardTab(tab);
    setShowDashboard(true);
  };

  const getRowEvents = (category: Category) => {
    return events.filter(e => {
      const matchCat = e.category === category;
      const matchSearch = searchQuery.toLowerCase() === '' || 
                         e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      const matchFav = showFavoritesOnly ? favorites.includes(e.id) : true;
      return matchCat && (aiRec ? matchAi : matchSearch) && matchFav;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-navy pb-[80px] md:pb-0 selection:bg-brand-prime/30">
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 h-16 md:h-24 flex items-center justify-between ${isScrolled ? 'bg-brand-navy/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-6 md:gap-14">
          <span className="text-2xl md:text-3xl font-display font-black text-white tracking-tighter cursor-pointer flex items-center gap-2 group" onClick={() => { setShowDashboard(false); setShowFavoritesOnly(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-prime rounded-lg group-hover:rotate-12 transition-transform duration-500 flex items-center justify-center text-white text-lg font-black italic">M</div>
            MAKE<span className="text-brand-prime">MYDAYS</span>
          </span>
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
            <button className={`${!showDashboard && !showFavoritesOnly ? 'text-white border-b-2 border-brand-prime' : 'hover:text-white'} h-24 flex items-center transition-all`} onClick={() => { setShowDashboard(false); setShowFavoritesOnly(false); }}>Home</button>
            <button className={`${showFavoritesOnly ? 'text-white border-b-2 border-brand-prime' : 'hover:text-white'} h-24 flex items-center transition-all`} onClick={() => { setShowDashboard(false); setShowFavoritesOnly(true); }}>Watchlist</button>
            <button className="hover:text-white h-24 flex items-center">Store</button>
            <button className="hover:text-white h-24 flex items-center">Categories</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl focus-within:bg-white/10 focus-within:border-brand-prime transition-all duration-300">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
              <input 
                type="text" placeholder="Search frequencies..." 
                className="bg-transparent border-none outline-none text-sm w-48 text-white placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           {currentUser ? (
              <button onClick={() => openDashboardTab('settings')} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center font-black text-sm hover:border-brand-prime hover:bg-brand-prime/10 transition-all">
                {currentUser.name.charAt(0)}
              </button>
           ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-7 h-11 bg-brand-prime text-white rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-brand-prime/20">Sign In</button>
           )}
        </div>
      </nav>

      {showDashboard ? (
        <main className="pt-24 px-6 md:px-12 animate-fade-in">
          <Dashboard initialTab={dashboardTab} events={events} bookings={globalBookings} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        </main>
      ) : (
        <main className="flex-1 animate-fade-in">
          {!showFavoritesOnly && <HeroBillboard trendingEvents={events.slice(0,5)} onBook={setSelectedEvent} favorites={favorites} onToggleFavorite={toggleFavorite} />}

          <div className={`relative z-10 px-6 md:px-12 space-y-16 md:space-y-24 ${showFavoritesOnly ? 'pt-32' : '-mt-16 md:mt-0'} pb-32`}>
            {showFavoritesOnly && favorites.length === 0 && (
              <div className="py-32 text-center text-slate-500 space-y-6">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center">
                  <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-extrabold text-white">Your list is quiet</h2>
                  <p className="max-w-md mx-auto">Calibrate your future self by adding the experiences that move you to your watchlist.</p>
                </div>
                <button onClick={() => setShowFavoritesOnly(false)} className="px-10 py-4 bg-brand-prime text-white rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-brand-prime/20 active:scale-95 transition-all">Explore Experience</button>
              </div>
            )}
            
            {CATEGORIES.map(category => {
              const rowEvents = getRowEvents(category);
              if (rowEvents.length === 0) return null;
              
              return (
                <div key={category} className="space-y-6 md:space-y-8 animate-slide-up">
                  <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                      <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-white">
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
                          onClick={setSelectedEvent} 
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
              <div className="py-24 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/10 px-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-prime/5 blur-[120px] pointer-events-none rounded-full" />
                <div className="relative z-10 max-w-3xl space-y-8">
                  <div className="space-y-4">
                    <span className="text-brand-prime text-xs font-black uppercase tracking-[0.3em] inline-block mb-2">Personalized Discovery</span>
                    <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white leading-tight">What's your energy today?</h3>
                    <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">Our Gemini AI curator will sync your current emotional state with the perfect physical frequency.</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch pt-6">
                      <input 
                        type="text" placeholder="I feel energetic and want to create something..." 
                        className="bg-brand-navy/60 border border-white/10 px-8 h-16 rounded-2xl text-lg w-full md:w-[500px] outline-none focus:border-brand-prime transition-all backdrop-blur-md placeholder:text-slate-600 shadow-2xl"
                        value={userMood}
                        onChange={(e) => setUserMood(e.target.value)}
                      />
                      <button onClick={() => handleMoodSearch(userMood)} className="h-16 bg-brand-prime text-white px-12 rounded-2xl font-bold text-lg uppercase tracking-widest active:scale-95 shadow-2xl shadow-brand-prime/20 transition-all hover:brightness-110">Sync AI</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Modern Sticky Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-[200] bg-[#1A242E]/80 backdrop-blur-3xl border border-white/10 h-16 rounded-[2rem] flex items-center justify-around px-2 shadow-2xl shadow-black/50">
        <button onClick={() => { setShowDashboard(false); setShowFavoritesOnly(false); }} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${!showDashboard && !showFavoritesOnly ? 'bg-brand-prime text-white' : 'text-slate-500 hover:text-white'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        </button>
        <button className="flex items-center justify-center w-12 h-12 rounded-2xl text-slate-500 hover:text-white transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
        </button>
        <button onClick={() => openDashboardTab('hosting')} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showDashboard && dashboardTab === 'hosting' ? 'bg-brand-prime text-white' : 'text-slate-500 hover:text-white'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5"/></svg>
        </button>
        <button onClick={() => { setShowDashboard(false); setShowFavoritesOnly(true); }} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showFavoritesOnly ? 'bg-brand-prime text-white' : 'text-slate-500 hover:text-white'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
        <button onClick={() => openDashboardTab('bookings')} className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${showDashboard && dashboardTab === 'bookings' ? 'bg-brand-prime text-white' : 'text-slate-500 hover:text-white'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2.5"/></svg>
        </button>
      </nav>

      {selectedEvent && (
        <BookingModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
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
      <ChatBot />
    </div>
  );
};

export default App;