
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

// Fix: Completed the App component to resolve truncation and type errors
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
  
  const atmosphereRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [evs, bks] = await Promise.all([
        api.getEvents(),
        api.getBookings()
      ]);
      setEvents(evs || []);
      setGlobalBookings(bks || []);
    };
    fetchData();

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) return;
    setIsAiLoading(true);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBooking = (event: Event) => {
    setSelectedEvent(event);
  };

  const confirmBooking = async (slot: Slot) => {
    if (!selectedEvent) return;
    
    let user = currentUser;
    if (!user) {
      const name = prompt("Please enter your name for the booking:") || "Guest";
      const phone = prompt("Please enter your phone number:") || "9999999999";
      user = { name, phone, bookings: [], role: 'user' };
      setCurrentUser(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    const booking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      category: selectedEvent.category,
      time: slot.time,
      price: selectedEvent.price,
      bookedAt: new Date().toISOString(),
      userName: user.name,
      userPhone: user.phone
    };

    await api.saveBooking(booking);
    
    const updatedUser = { ...user, bookings: [booking, ...user.bookings] };
    setCurrentUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    
    setGlobalBookings(prev => [booking, ...prev]);
    setSelectedEvent(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-brand-red selection:text-white pb-20">
      <audio ref={atmosphereRef} src={ATMOSPHERE_URL} loop />
      
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setShowDashboard(false);
              setShowAdmin(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ConnectionLogo />
            <span className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-brand-red transition-colors">
              MakeMyDays.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                if (atmosphereRef.current) {
                  if (atmosphereRef.current.paused) atmosphereRef.current.play();
                  else atmosphereRef.current.pause();
                }
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
            >
              <ZenIcon active={true} />
              <span className="text-[9px] font-black uppercase tracking-widest">Atmosphere</span>
            </button>
            
            {currentUser ? (
              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-slate-900/20 active:scale-90 transition-transform"
              >
                {currentUser.name[0]}
              </button>
            ) : (
              <button 
                onClick={() => {
                  const name = prompt("Name:") || "Demo";
                  const phone = prompt("Phone:") || "123";
                  const newUser: User = { name, phone, bookings: [], role: 'admin' };
                  setCurrentUser(newUser);
                  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-brand-red transition-colors"
              >
                Join Flow
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAdmin ? (
        <AdminPanel 
          events={events} 
          bookings={globalBookings} 
          onClose={() => setShowAdmin(false)} 
          onRefresh={async () => setEvents(await api.getEvents())} 
        />
      ) : showDashboard && currentUser ? (
        <div className="pt-24">
          <Dashboard user={currentUser} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} />
        </div>
      ) : (
        <main className="pt-32 px-6 max-w-7xl mx-auto">
          <section className="mb-20 text-center space-y-8">
             <div className="inline-block px-4 py-1.5 bg-brand-red/10 rounded-full border border-brand-red/5 mb-4 animate-bounce">
                <span className="text-brand-red text-[10px] font-black uppercase tracking-widest italic">Curated by Intelligence</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] text-slate-900">
               Design Your <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-500">Perfect Moment.</span>
             </h1>
             
             <div className="max-w-2xl mx-auto relative group pt-8">
                <input 
                  type="text"
                  placeholder="How are you feeling right now?"
                  value={userMood}
                  onChange={(e) => setUserMood(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                  className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] px-10 py-8 text-lg font-bold italic outline-none focus:border-brand-red shadow-2xl shadow-slate-200/50 transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={() => handleMoodSearch(userMood)}
                  disabled={isAiLoading}
                  className="absolute right-4 top-[3.3rem] w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  )}
                </button>
             </div>

             {aiRec && (
               <div className="max-w-2xl mx-auto mt-8 p-6 bg-white border border-brand-red/10 rounded-3xl shadow-xl animate-in zoom-in duration-500">
                 <p className="text-slate-900 font-black italic text-lg leading-tight mb-2">{aiRec.reasoning}</p>
                 <button 
                    onClick={() => setAiRec(null)}
                    className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-red transition-colors"
                 >
                   Clear Recommendation
                 </button>
               </div>
             )}
          </section>

          <section className="mb-16 overflow-x-auto no-scrollbar -mx-6 px-6">
            <div className="flex gap-6 md:justify-center min-w-max pb-4">
              <CategoryItem label="All" shape="all" color="#0f172a" active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
              <CategoryItem label="Team Building" shape="bat" color="#ef4444" active={selectedCategory === 'Team Building'} onClick={() => setSelectedCategory('Team Building')} />
              <CategoryItem label="Activity" shape="ball" color="#f97316" active={selectedCategory === 'Activity'} onClick={() => setSelectedCategory('Activity')} />
              <CategoryItem label="Wellness" shape="boat" color="#10b981" active={selectedCategory === 'Wellness'} onClick={() => setSelectedCategory('Wellness')} />
              <CategoryItem label="Mindfulness" shape="horse" color="#6366f1" active={selectedCategory === 'Mindfulness'} onClick={() => setSelectedCategory('Mindfulness')} />
              <CategoryItem label="Creative" shape="racket" color="#a855f7" active={selectedCategory === 'Creative Arts'} onClick={() => setSelectedCategory('Creative Arts')} />
              <CategoryItem label="Adventure" shape="mountain" color="#3b82f6" active={selectedCategory === 'Adventure'} onClick={() => setSelectedCategory('Adventure')} />
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {filteredEvents.map(event => (
              <div key={event.id} className={aiRec?.suggestedEventIds.includes(event.id) ? 'ring-4 ring-brand-red/20 rounded-[2.5rem] p-1' : ''}>
                <EventCard 
                  event={event} 
                  onClick={handleBooking} 
                />
              </div>
            ))}
          </section>

          {filteredEvents.length === 0 && (
             <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3" strokeLinecap="round"/></svg>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No vibrations match your current search.</p>
             </div>
          )}
        </main>
      )}

      {selectedEvent && (
        <BookingModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onConfirm={confirmBooking} 
        />
      )}
    </div>
  );
};

// Fix: Added missing default export
export default App;
