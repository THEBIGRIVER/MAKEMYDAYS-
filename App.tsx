import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { api } from './services/api.ts';

// Sound Assets
const ATMOSPHERE_URL = "https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-ambience-39.mp3"; 
const SPLASH_URL = "https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3";

const USER_STORAGE_KEY = 'makemydays_user_v1';

const triggerRipple = (e: React.MouseEvent | React.TouchEvent, color?: string, playSound = false) => {
  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  
  let x, y;
  if ('touches' in e) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }

  const ripple = document.createElement('span');
  ripple.className = 'ripple-wave';
  if (color) ripple.style.background = color;
  
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;

  container.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);

  if (playSound) {
    const splash = new Audio(SPLASH_URL);
    splash.volume = 0.2;
    splash.play().catch((err) => console.log("Splash sound blocked:", err));
  }
};

const ConnectionLogo = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 md:w-10 md:h-10 fill-current text-brand-red">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const ZenIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center gap-0.5 h-4">
    {[1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className={`w-1 rounded-full bg-current transition-all duration-500 ${
          active ? 'animate-bounce' : 'h-1'
        }`}
        style={{ 
          animationDelay: `${i * 0.1}s`,
          height: active ? `${Math.random() * 100 + 40}%` : '4px'
        }}
      />
    ))}
  </div>
);

const ShapeIcon: React.FC<{ type: string; color: string; active: boolean }> = ({ type, color, active }) => {
  const icons: Record<string, React.ReactNode> = {
    all: <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="6 6" />,
    mountain: <path d="M15 80 L45 20 L60 50 L85 80 Z M35 80 L50 45 L70 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinejoin="round" />,
    ball: <g><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="5" fill="none" /><path d="M30 35 Q50 50 30 65 M70 35 Q50 50 70 65" stroke="currentColor" strokeWidth="3" fill="none" /></g>,
    boat: <path d="M10 65 Q50 90 90 65 L80 50 L20 50 Z M50 10 V50 M35 30 H50" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />,
    horse: <path d="M25 80 Q25 40 50 25 Q75 10 75 40 Q75 65 50 80 M50 25 L40 15" stroke="currentColor" strokeWidth="5" fill="none" strokeLinejoin="round" />,
    racket: <g><ellipse cx="50" cy="35" rx="22" ry="28" stroke="currentColor" strokeWidth="5" fill="none" /><path d="M50 63 V90 M40 90 H60" stroke="currentColor" strokeWidth="5" fill="none" /></g>,
    bat: <path d="M44 15 H56 L62 70 H38 Z M50 70 V90" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-700 ${active ? 'scale-110 drop-shadow-lg' : 'scale-90 opacity-40 group-hover:opacity-100 group-hover:scale-100'}`} style={{ color }}>
      {icons[type] || icons.all}
    </svg>
  );
};

const CategoryItem: React.FC<{
  label: string;
  shape: string;
  color: string;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = ({ label, shape, color, active, onClick }) => (
  <button 
    onClick={(e) => {
      triggerRipple(e, `${color}44`, true);
      onClick(e);
    }}
    className="flex flex-col items-center gap-3 group transition-all shrink-0 snap-center pb-4 focus:outline-none ripple-container"
  >
    <div className={`relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-500 ${
      active ? 'scale-110' : 'hover:-translate-y-1 active:scale-95'
    }`}>
      {active && (
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20 animate-pulse" style={{ backgroundColor: color }}></div>
      )}
      <div className={`absolute inset-0 rounded-[2rem] border-2 transition-all duration-500 ${
        active ? 'bg-white shadow-2xl rotate-2' : 'bg-slate-50 border-transparent group-hover:bg-white group-hover:border-slate-100'
      }`} style={{ borderColor: active ? color : 'transparent' }}></div>
      <div className="relative w-10 h-10 md:w-12 md:h-12 z-10">
        <ShapeIcon type={shape} color={color} active={active} />
      </div>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
      active ? 'text-slate-900 scale-105' : 'text-slate-400 group-hover:text-slate-600'
    }`}>
      {label}
    </span>
  </button>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [globalBookings, setGlobalBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingHistoryOpen, setIsBookingHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'profile'>('home');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ name: '', phone: '', isAdmin: false, accessCode: '' });
  const logoClickCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingBookingRef = useRef<{ slot: Slot } | null>(null);

  const refreshData = async () => {
    setIsDataLoading(true);
    try {
      const [fetchedEvents, fetchedBookings] = await Promise.all([
        api.getEvents(),
        api.getBookings()
      ]);
      setEvents(fetchedEvents);
      setGlobalBookings(fetchedBookings);
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    refreshData();
    audioRef.current = new Audio(ATMOSPHERE_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0;
  }, []);

  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    return globalBookings.filter(b => b.userPhone === currentUser.phone);
  }, [globalBookings, currentUser]);

  const toggleZenMode = (e: React.MouseEvent) => {
    const nextState = !isZenMode;
    triggerRipple(e, '#06B6D444', true);
    setIsZenMode(nextState);
    if (!audioRef.current) return;
    if (nextState) {
      audioRef.current.play().then(() => {
        let vol = 0;
        const fadeIn = setInterval(() => {
          if (audioRef.current && audioRef.current.volume < 0.3) {
            audioRef.current.volume = Math.min(0.3, audioRef.current.volume + 0.05);
          } else { clearInterval(fadeIn); }
        }, 50);
      }).catch(err => console.log("Audio play failed:", err));
    } else {
      let vol = audioRef.current.volume;
      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.02) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = 0;
          }
          clearInterval(fadeOut);
        }
      }, 50);
    }
  };

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickCount.current === 5) {
      setIsAdminPanelOpen(true);
      logoClickCount.current = 0;
    }
    setTimeout(() => { logoClickCount.current = 0; }, 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = loginForm.isAdmin && loginForm.accessCode === '2576';
    const newUser: User = {
      name: loginForm.name,
      phone: loginForm.phone,
      bookings: [],
      role: isAdmin ? 'admin' : 'user'
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);

    // Automatically open Admin Panel if correct passkey was used
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    }

    // If there was a pending booking, complete it
    if (pendingBookingRef.current) {
      handleBookingConfirm(pendingBookingRef.current.slot, newUser);
      pendingBookingRef.current = null;
    }
  };

  const handleLogout = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.volume = 0; }
    setIsZenMode(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    setCurrentView('home');
    setLoginForm({ name: '', phone: '', isAdmin: false, accessCode: '' });
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleBookingConfirm = async (slot: Slot, userOverride?: User) => {
    const user = userOverride || currentUser;
    if (!selectedEvent) return;

    if (!user) {
      pendingBookingRef.current = { slot };
      setIsAuthModalOpen(true);
      return;
    }

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      category: selectedEvent.category,
      time: slot.time,
      bookedAt: new Date().toISOString(),
      userName: user.name,
      userPhone: user.phone
    };
    
    setGlobalBookings([newBooking, ...globalBookings]);
    setSelectedEvent(null);

    try {
      await api.saveBooking(newBooking);
    } catch (err) {
      console.error("Failed to save booking", err);
    }
  };

  const askAI = async (mood?: string) => {
    const query = mood || searchQuery;
    if (!query.trim()) return;
    if (mood) {
      setSearchQuery(mood);
      setSelectedCategory('All');
      setCurrentView('home');
    }
    setIsAiLoading(true);
    setAiRecommendation(null);
    try {
      const result = await api.getRecommendations(query, events);
      setAiRecommendation(result);
    } catch (err) {
      console.error("Mood matching failed", err);
    } finally {
      setIsAiLoading(false);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const categories = [
    { label: 'All', shape: 'all', color: '#F84464' },
    { label: 'Adventure', shape: 'mountain', color: '#3B82F6' },
    { label: 'Activity', shape: 'ball', color: '#F59E0B' },
    { label: 'Team Building', shape: 'boat', color: '#06B6D4' },
    { label: 'Wellness', shape: 'horse', color: '#8B5CF6' },
    { label: 'Creative Arts', shape: 'racket', color: '#EF4444' },
    { label: 'Mindfulness', shape: 'bat', color: '#10B981' }
  ];

  const quickMoods = ["Stressed", "Bored", "Energetic", "Creative", "Tired", "Adventurous"];

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-brand-red rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">Booting Ecosystem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleLogoClick}>
            <ConnectionLogo />
            <h1 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">MAKEMYDAYS</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUser?.role === 'admin' && (
              <button
                onClick={(e) => { triggerRipple(e, '#10B98144', true); setIsAdminPanelOpen(true); }}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all ripple-container"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
              </button>
            )}

            <button
              onClick={toggleZenMode}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-500 ripple-container ${
                isZenMode ? 'bg-cyan-50 text-cyan-600 shadow-inner' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <ZenIcon active={isZenMode} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Zen Waves</span>
            </button>

            {currentUser ? (
              <button 
                onClick={(e) => { triggerRipple(e); setCurrentView(currentView === 'profile' ? 'home' : 'profile'); }}
                className={`relative p-2.5 rounded-2xl shadow-lg active:scale-90 transition-all flex items-center justify-center ripple-container ${
                  currentView === 'profile' ? 'bg-brand-red text-white' : 'bg-slate-900 text-white'
                }`}
                title="Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              >
                Join
              </button>
            )}
          </div>
        </div>
        
        {currentView === 'home' && (
          <div className="mt-4 relative group animate-in fade-in duration-300">
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder={`How are you feeling${currentUser ? ', ' + currentUser.name.split(' ')[0] : ''}?`}
              className="w-full bg-slate-100/50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-red transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAI()}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </header>

      {currentView === 'home' ? (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white px-5 py-8 overflow-x-auto scrollbar-hide snap-x flex gap-8 items-end">
            {categories.map((cat) => (
              <CategoryItem 
                key={cat.label} label={cat.label} shape={cat.shape} color={cat.color}
                active={selectedCategory === cat.label}
                onClick={() => { setSelectedCategory(cat.label as Category | 'All'); setAiRecommendation(null); setSearchQuery(''); }}
              />
            ))}
          </div>

          <div className="px-5 pb-6 bg-white overflow-x-auto scrollbar-hide flex gap-3">
            {quickMoods.map((mood) => (
              <button
                key={mood}
                onClick={(e) => { triggerRipple(e, '#F8446444', true); askAI(mood); }}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0 ripple-container ${
                  searchQuery === mood 
                    ? 'bg-brand-red text-white border-brand-red shadow-xl scale-105' 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-brand-red hover:text-brand-red active:scale-95'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          {(aiRecommendation || isAiLoading) && (
            <section className="px-5 py-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 blur-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-brand-red text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg animate-pulse">AI Curator Insight</span>
                </div>
                {isAiLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 border-4 border-white/5 border-t-brand-red rounded-full animate-spin"></div>
                    <p className="mt-6 text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Analyzing your vibe...</p>
                  </div>
                ) : aiRecommendation && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-2xl md:text-3xl font-black italic mb-12 leading-tight max-w-2xl">"{aiRecommendation.reasoning}"</p>
                    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
                      {events.filter(e => aiRecommendation.suggestedEventIds.includes(e.id)).map(e => (
                        <div key={e.id} className="min-w-[200px] w-[200px] snap-center">
                          <EventCard event={e} onClick={setSelectedEvent} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <main className="px-5 py-8">
            <div className="flex items-end justify-between mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-brand-red text-[9px] font-black uppercase tracking-[0.3em]">Discovery</span>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                  {searchQuery ? `Vibes for "${searchQuery}"` : selectedCategory === 'All' ? 'Experience Feed' : `${selectedCategory}`}
                </h2>
              </div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{filteredEvents.length} Items</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
              {filteredEvents.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)}
            </div>
          </main>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <Dashboard user={{ ...currentUser!, bookings: userBookings }} onLogout={handleLogout} onOpenAdmin={() => setIsAdminPanelOpen(true)} />
        </div>
      )}

      {isAdminPanelOpen && <AdminPanel events={events} bookings={globalBookings} onClose={() => setIsAdminPanelOpen(false)} onRefresh={refreshData} />}

      {/* Footer Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-xl border border-slate-100 rounded-full px-8 py-4 shadow-2xl z-[100] gap-10 md:hidden">
        <button 
          onClick={(e) => { triggerRipple(e, '#F8446444', true); setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); setAiRecommendation(null); }}
          className={`flex flex-col items-center gap-1 transition-colors ripple-container rounded-lg px-2 ${currentView === 'home' && !searchQuery ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${currentView === 'home' && !searchQuery ? 'bg-brand-red shadow-[0_0_8px_#F84464]' : 'bg-transparent'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={(e) => { triggerRipple(e, '#F8446444', true); setCurrentView('home'); setTimeout(() => { searchInputRef.current?.focus(); }, 100); }}
          className={`flex flex-col items-center gap-1 transition-colors ripple-container rounded-lg px-2 ${currentView === 'home' && searchQuery ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${currentView === 'home' && searchQuery ? 'bg-brand-red shadow-[0_0_8px_#F84464]' : 'bg-transparent'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Mood</span>
        </button>
        <button 
          onClick={(e) => { 
            if (!currentUser) { setIsAuthModalOpen(true); return; }
            triggerRipple(e, '#F8446444', true); setIsBookingHistoryOpen(true); 
          }}
          className={`flex flex-col items-center gap-1 transition-colors relative ripple-container rounded-lg px-2 ${isBookingHistoryOpen ? 'text-slate-900' : 'text-slate-400'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isBookingHistoryOpen ? 'bg-brand-red shadow-[0_0_8px_#F84464]' : 'bg-transparent'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
          {userBookings.length > 0 && (
            <div className="absolute -top-1 -right-2 w-4 h-4 bg-brand-red rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[8px] text-white font-black">{userBookings.length}</span>
            </div>
          )}
        </button>
      </div>

      {selectedEvent && <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={handleBookingConfirm} />}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-all" onClick={() => setIsAuthModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-[3rem] md:rounded-[3rem] p-10 animate-in slide-in-from-bottom duration-500 shadow-3xl">
            <div className="flex flex-col items-center text-center mb-8">
              <ConnectionLogo />
              <h2 className="mt-4 text-2xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Join the Sanctuary</h2>
              <p className="mt-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">Sign up with your phone to secure your spot</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <input required type="text" placeholder="Your name" value={loginForm.name}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-brand-red focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                  onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                <input required type="tel" placeholder="+91 00000 00000" value={loginForm.phone}
                  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-brand-red focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                  onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                />
              </div>
              <div className="pt-2 px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={loginForm.isAdmin}
                      onChange={(e) => setLoginForm({...loginForm, isAdmin: e.target.checked})}
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">I am the Owner</span>
                </label>
              </div>
              {loginForm.isAdmin && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 ml-4">Owner Passkey</label>
                  <input required type="password" placeholder="Enter owner passkey" value={loginForm.accessCode}
                    className="w-full bg-emerald-50/50 border-2 border-emerald-50 focus:border-emerald-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                    onChange={(e) => setLoginForm({...loginForm, accessCode: e.target.value})}
                  />
                </div>
              )}
              <button type="submit" className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-[0.98] transition-all mt-4 bg-slate-900 text-white">Continue to Checkout</button>
            </form>
          </div>
        </div>
      )}

      {isBookingHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-all duration-700" onClick={() => setIsBookingHistoryOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full animate-in slide-in-from-right duration-500 shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Your Selections</h3>
              <button onClick={() => setIsBookingHistoryOpen(false)} className="p-2 bg-slate-100 rounded-full active:scale-90 transition-transform"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {userBookings.map(b => (
                <div key={b.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <span className="text-[10px] font-black text-brand-red uppercase mb-1 block tracking-widest">{b.category}</span>
                  <h4 className="text-lg font-black italic mb-2 leading-tight">{b.eventTitle}</h4>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      {b.time}
                    </span>
                    <button 
                      onClick={async (e) => { triggerRipple(e, '#F8446444', true); await api.cancelBooking(b.id); refreshData(); }}
                      className="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity font-black uppercase text-[10px] ripple-container p-1 rounded"
                    >Remove</button>
                  </div>
                </div>
              ))}
              {userBookings.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic opacity-40">
                  <p className="font-bold uppercase tracking-widest text-[10px]">Your experience cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;