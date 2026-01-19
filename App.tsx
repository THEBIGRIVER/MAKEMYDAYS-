import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { api } from './services/api.ts';

// Sound Assets
const ATMOSPHERE_URL = "https://assets.mixkit.co/sfx/preview/mixkit-forest-ambiance-with-birds-and-wind-1220.mp3"; 
const TAP_SOUND_URL = "https://static.whatsapp.net/rsrc.php/yv/r/ze2kHBOq8T0.mp3";

const USER_STORAGE_KEY = 'makemydays_user_v1';
const ADMIN_PASSKEY = '2576';

const triggerRipple = (e: React.MouseEvent | React.TouchEvent, color?: string) => {
  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  
  let x, y;
  if ('touches' in e) {
    x = (e as React.TouchEvent).touches[0].clientX - rect.left;
    y = (e as React.TouchEvent).touches[0].clientY - rect.top;
  } else {
    x = (e as React.MouseEvent).clientX - rect.left;
    y = (e as React.MouseEvent).clientY - rect.top;
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
};

const ConnectionLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 fill-current text-brand-red">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const ZenIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center gap-0.5 h-5">
    {[1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className={`w-1 rounded-full bg-current transition-all duration-500 ${
          active ? 'animate-bounce' : 'h-1'
        }`}
        style={{ 
          animationDelay: `${i * 0.1}s`,
          height: active ? `${Math.random() * 80 + 40}%` : '4px'
        }}
      />
    ))}
  </div>
);

const ShapeIcon: React.FC<{ type: string; color: string; active: boolean }> = ({ type, color, active }) => {
  const icons: Record<string, React.ReactNode> = {
    all: (
      <g>
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    adventure: (
      <g>
        <path d="M10 85 L40 25 L60 65 L90 85" stroke="currentColor" strokeWidth="6" fill="none" strokeLinejoin="round" />
        <path d="M30 85 L50 45 L75 85" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.5" />
        <circle cx="75" cy="30" r="4" fill="currentColor" />
      </g>
    ),
    activity: (
      <g>
        <path d="M15 50 L30 50 L40 20 L55 80 L65 40 L75 50 L85 50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinejoin="round" />
        <circle cx="40" cy="20" r="3" fill="currentColor" />
        <circle cx="55" cy="80" r="3" fill="currentColor" />
      </g>
    ),
    wellness: (
      <g>
        <path d="M50 20 C65 20 80 35 80 55 C80 80 50 90 50 90 C50 90 20 80 20 55 C20 35 35 20 50 20" stroke="currentColor" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M50 35 L50 42 M35 50 L42 50 M65 50 L58 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    mindfulness: (
      <g>
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M20 50 A30 30 0 0 1 80 50" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
        <path d="M20 50 A30 30 0 0 0 80 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>
    ),
    creativearts: (
      <g>
        <path d="M50 15 L85 50 L50 85 L15 50 Z" stroke="currentColor" strokeWidth="5" fill="none" strokeLinejoin="round" />
        <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
        <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>
    ),
    teambuilding: (
      <g>
        <circle cx="35" cy="40" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="65" cy="40" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="50" cy="70" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M35 40 L65 40 L50 70 Z" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 2" />
      </g>
    )
  };

  const key = type.toLowerCase().replace(/\s/g, '');
  const icon = icons[key] || icons.all;

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-700 ${active ? 'scale-110 rotate-0' : 'scale-90 opacity-40 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-6'}`} style={{ color }}>
      {icon}
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
      triggerRipple(e, `${color}44`);
      onClick(e);
    }}
    className="flex flex-col items-center gap-4 group transition-all shrink-0 snap-center pb-6 focus:outline-none ripple-container"
  >
    <div className={`relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transition-all duration-700 ${
      active ? 'scale-110 -rotate-3' : 'hover:-translate-y-2 active:scale-95'
    }`}>
      {active && (
        <div className="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-30 animate-pulse" style={{ backgroundColor: color }}></div>
      )}
      <div className={`absolute inset-0 rounded-[2.5rem] border-2 transition-all duration-700 ${
        active ? 'bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border-white' : 'bg-white/50 border-slate-100 group-hover:bg-white group-hover:shadow-xl'
      }`} style={{ borderColor: active ? color : 'rgba(241,245,249,1)' }}></div>
      <div className={`relative w-12 h-12 md:w-14 md:h-14 z-10 transition-transform duration-1000 group-hover:rotate-12 ${active ? 'animate-subtle-pulse' : ''}`}>
        <ShapeIcon type={shape} color={color} active={active} />
      </div>
    </div>
    <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${
      active ? 'text-slate-900 translate-y-1 scale-110' : 'text-slate-300 group-hover:text-slate-500'
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
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userMood, setUserMood] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAtmosphereActive, setIsAtmosphereActive] = useState(false);
  
  const atmosphereRef = useRef<HTMLAudioElement | null>(null);
  const tapSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tapSoundRef.current = new Audio(TAP_SOUND_URL);
    tapSoundRef.current.load();

    const handleGlobalTap = (e: any) => {
      if (tapSoundRef.current) {
        tapSoundRef.current.currentTime = 0;
        tapSoundRef.current.volume = 0.4;
        tapSoundRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('mousedown', handleGlobalTap);
    window.addEventListener('touchstart', handleGlobalTap);

    return () => {
      window.removeEventListener('mousedown', handleGlobalTap);
      window.removeEventListener('touchstart', handleGlobalTap);
    };
  }, []);

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

  const handleBooking = (event: Event) => setSelectedEvent(event);

  const confirmBooking = async (slot: Slot) => {
    if (!selectedEvent) return;
    
    let user = currentUser;
    if (!user) {
      const name = prompt("Enter your name:") || "Explorer";
      const phone = prompt("Enter phone:") || "000";
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
    setShowAdmin(false);
  };

  const toggleAtmosphere = (e: React.MouseEvent) => {
    triggerRipple(e, '#F8446444');
    if (atmosphereRef.current) {
      if (atmosphereRef.current.paused) {
        atmosphereRef.current.play().catch(() => {});
        setIsAtmosphereActive(true);
      } else {
        atmosphereRef.current.pause();
        setIsAtmosphereActive(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-brand-red selection:text-white pb-32">
      <audio ref={atmosphereRef} src={ATMOSPHERE_URL} loop />
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 mesh-bg animate-mesh-flow"></div>

      <nav className="fixed top-0 left-0 right-0 z-[100] h-24 glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={(e) => {
              triggerRipple(e, '#F8446444');
              setShowDashboard(false);
              setShowAdmin(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ConnectionLogo />
            <span className="text-2xl font-black italic tracking-tighter text-slate-900 group-hover:text-brand-red transition-all duration-500">
              MakeMyDays.
            </span>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={toggleAtmosphere}
              className={`hidden md:flex items-center gap-3 px-6 py-2.5 rounded-full transition-all border-2 ${
                isAtmosphereActive ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200'
              }`}
            >
              <ZenIcon active={isAtmosphereActive} />
              <span className="text-[10px] font-black uppercase tracking-widest">Atmosphere</span>
            </button>
            
            {currentUser ? (
              <button 
                onClick={(e) => {
                   triggerRipple(e, '#0f172a44');
                   setShowDashboard(!showDashboard);
                }}
                className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black italic text-xl shadow-2xl shadow-slate-900/30 active:scale-90 transition-all hover:rotate-3"
              >
                {currentUser.name[0]}
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  triggerRipple(e, '#F8446444');
                  const name = prompt("Name?") || "User";
                  setCurrentUser({ name, phone: "000", bookings: [], role: 'user' });
                }}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-brand-red transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAdmin && currentUser?.role === 'admin' ? (
        <AdminPanel 
          events={events} 
          bookings={globalBookings} 
          onClose={() => setShowAdmin(false)} 
          onRefresh={async () => setEvents(await api.getEvents())} 
        />
      ) : showDashboard && currentUser ? (
        <div className="pt-32">
          <Dashboard user={currentUser} onLogout={handleLogout} onOpenAdmin={() => setShowAdmin(true)} />
        </div>
      ) : (
        <main className="relative z-10 pt-44 px-8 max-w-7xl mx-auto">
          
          <section className="mb-32 relative">
             <div className="flex flex-col items-center text-center space-y-12">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-brand-red/20 blur-2xl -rotate-6 scale-110"></div>
                  <div className="relative glass-card px-6 py-2 rounded-full border-brand-red/10 animate-subtle-pulse">
                    <span className="text-brand-red text-[11px] font-black uppercase tracking-[0.5em] italic">Beyond The Ordinary</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-6xl md:text-[10rem] font-display font-black italic tracking-[-0.08em] leading-[0.8] text-slate-900 uppercase">
                    Experience <br/>
                    <span className="text-outline">Curation.</span>
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
                    Unconventional wellness for the modern high-energy soul. 
                    Grounded in nature, powered by intelligence.
                  </p>
                </div>

                <div className="w-full max-w-3xl relative mt-8">
                   <div className={`absolute -inset-4 bg-brand-red/10 blur-3xl transition-opacity duration-1000 ${isAiLoading ? 'opacity-100' : 'opacity-0'}`}></div>
                   <div className="relative dark-glass-card rounded-[3rem] p-4 flex flex-col md:flex-row items-center gap-4 ai-glow group">
                      {isAiLoading && (
                        <div className="absolute inset-x-8 top-0 h-0.5 bg-brand-red/50 shadow-[0_0_15px_#F84464] animate-scanner z-20"></div>
                      )}
                      
                      <div className="flex-1 w-full px-6 py-4 flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${isAiLoading ? 'bg-brand-red animate-ping' : 'bg-slate-700'} transition-colors`}></div>
                         <input 
                           type="text" 
                           placeholder="Describe your current frequency... (e.g. 'Highly stressed but seeking thrill')"
                           className="w-full bg-transparent border-none text-white text-lg font-medium placeholder:text-slate-600 focus:outline-none"
                           value={userMood}
                           onChange={(e) => setUserMood(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                         />
                      </div>
                      <button 
                        onClick={(e) => { triggerRipple(e, '#F84464'); handleMoodSearch(userMood); }}
                        disabled={isAiLoading}
                        className="w-full md:w-auto px-10 py-5 bg-brand-red text-white rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isAiLoading ? 'Analyzing...' : 'Scan Mood'}
                      </button>
                   </div>
                   
                   {aiRec && (
                     <div className="mt-8 glass-card rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4 duration-700 text-left border-brand-red/20 shadow-2xl">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-brand-red/10 rounded-2xl">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F84464" strokeWidth="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>
                          </div>
                          <div>
                            <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">AI Analysis Result</span>
                            <p className="text-xl font-black italic text-slate-800 leading-tight">"{aiRec.reasoning}"</p>
                          </div>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </section>

          <section className="mb-20">
            <div className="flex items-end justify-between mb-12">
               <div>
                 <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Explore Domains</h2>
                 <div className="h-1 w-12 bg-brand-red"></div>
               </div>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide snap-x px-2">
              <CategoryItem label="All" shape="all" color="#64748b" active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
              <CategoryItem label="Adventure" shape="adventure" color="#3B82F6" active={selectedCategory === 'Adventure'} onClick={() => setSelectedCategory('Adventure')} />
              <CategoryItem label="Activity" shape="activity" color="#F59E0B" active={selectedCategory === 'Activity'} onClick={() => setSelectedCategory('Activity')} />
              <CategoryItem label="Wellness" shape="wellness" color="#10B981" active={selectedCategory === 'Wellness'} onClick={() => setSelectedCategory('Wellness')} />
              <CategoryItem label="Mindfulness" shape="mindfulness" color="#8B5CF6" active={selectedCategory === 'Mindfulness'} onClick={() => setSelectedCategory('Mindfulness')} />
              <CategoryItem label="Creative Arts" shape="creativearts" color="#EC4899" active={selectedCategory === 'Creative Arts'} onClick={() => setSelectedCategory('Creative Arts')} />
              <CategoryItem label="Team Building" shape="teambuilding" color="#14B8A6" active={selectedCategory === 'Team Building'} onClick={() => setSelectedCategory('Team Building')} />
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={handleBooking}
              />
            ))}
          </div>

          {filteredEvents.length === 0 && (
             <div className="py-40 text-center space-y-4">
                <div className="text-6xl text-slate-200 uppercase font-black italic">No Match Found</div>
                <p className="text-slate-400 font-medium italic">Adjust your frequency to reveal hidden experiences.</p>
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

export default App;