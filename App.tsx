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

const PRESET_MOODS = [
  { label: 'Burnout', icon: '🕯️', color: '#8B5CF6' },
  { label: 'Nature', icon: '🌲', color: '#10B981' },
  { label: 'Adrenaline', icon: '🔥', color: '#F84464' },
  { label: 'Creative', icon: '🎨', color: '#EC4899' },
  { label: 'Hyper', icon: '⚡', color: '#DFFF00' },
  { label: 'Escape', icon: '🏙️', color: '#3B82F6' }
];

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
  <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current text-brand-red">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const ZenIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center gap-0.5 h-4">
    {[1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className={`w-0.5 rounded-full bg-current transition-all duration-500 ${
          active ? 'animate-bounce' : 'h-1'
        }`}
        style={{ 
          animationDelay: `${i * 0.1}s`,
          height: active ? `${Math.random() * 80 + 40}%` : '3px'
        }}
      />
    ))}
  </div>
);

const ShapeIcon: React.FC<{ type: string; color: string; active: boolean }> = ({ type, color, active }) => {
  const icons: Record<string, React.ReactNode> = {
    all: (
      <g>
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="4" fill="none" />
      </g>
    ),
    adventure: <path d="M10 85 L40 25 L60 65 L90 85" stroke="currentColor" strokeWidth="6" fill="none" strokeLinejoin="round" />,
    activity: <path d="M15 50 L30 50 L40 20 L55 80 L65 40 L75 50 L85 50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinejoin="round" />,
    wellness: <path d="M50 20 C65 20 80 35 80 55 C80 80 50 90 50 90 C50 90 20 80 20 55 C20 35 35 20 50 20" stroke="currentColor" strokeWidth="6" fill="none" />,
    mindfulness: <g><circle cx="50" cy="50" r="8" fill="currentColor" /><circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="4" fill="none" /></g>,
    creativearts: <path d="M50 15 L85 50 L50 85 L15 50 Z" stroke="currentColor" strokeWidth="5" fill="none" strokeLinejoin="round" />,
    teambuilding: <g><circle cx="35" cy="40" r="8" stroke="currentColor" strokeWidth="4" fill="none" /><circle cx="65" cy="40" r="8" stroke="currentColor" strokeWidth="4" fill="none" /><circle cx="50" cy="70" r="8" stroke="currentColor" strokeWidth="4" fill="none" /></g>
  };

  const key = type.toLowerCase().replace(/\s/g, '');
  const icon = icons[key] || icons.all;

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-700 ${active ? 'scale-110' : 'scale-90 opacity-40 group-hover:opacity-100'}`} style={{ color }}>
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
    className="flex flex-col items-center gap-2 group transition-all shrink-0 snap-center focus:outline-none ripple-container"
  >
    <div className={`relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-500 ${
      active ? 'scale-110' : 'hover:-translate-y-1'
    }`}>
      {active && (
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20" style={{ backgroundColor: color }}></div>
      )}
      <div className={`absolute inset-0 rounded-[1.5rem] border transition-all duration-500 ${
        active ? 'bg-white shadow-lg border-white' : 'bg-white/40 border-slate-100 group-hover:bg-white'
      }`} style={{ borderColor: active ? color : '' }}></div>
      <div className="relative w-8 h-8 md:w-10 md:h-10 z-10">
        <ShapeIcon type={shape} color={color} active={active} />
      </div>
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${
      active ? 'text-slate-900 scale-105' : 'text-slate-400'
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
    const handleGlobalTap = () => {
      if (tapSoundRef.current) {
        tapSoundRef.current.currentTime = 0;
        tapSoundRef.current.volume = 0.2;
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
      const [evs, bks] = await Promise.all([api.getEvents(), api.getBookings()]);
      setEvents(evs || []);
      setGlobalBookings(bks || []);
    };
    fetchData();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) return;
    setIsAiLoading(true);
    setAiRec(null);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
      setTimeout(() => {
        document.getElementById('ai-recommendation-target')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      return matchCat && matchSearch && matchAi;
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

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
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-brand-red selection:text-white pb-20">
      <audio ref={atmosphereRef} src={ATMOSPHERE_URL} loop />
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 mesh-bg animate-mesh-flow"></div>

      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setShowDashboard(false); setShowAdmin(false); setAiRec(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <ConnectionLogo />
            <span className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-brand-red transition-all">
              MakeMyDays.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleAtmosphere}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all border ${
                isAtmosphereActive ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <ZenIcon active={isAtmosphereActive} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Zen</span>
            </button>
            
            {currentUser ? (
              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black italic text-lg shadow-lg active:scale-90"
              >
                {currentUser.name[0]}
              </button>
            ) : (
              <button 
                onClick={() => { const name = prompt("Name?") || "User"; setCurrentUser({ name, phone: "000", bookings: [], role: 'user' }); }}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-brand-red transition-all"
              >
                Join
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAdmin && currentUser?.role === 'admin' ? (
        <AdminPanel events={events} bookings={globalBookings} onClose={() => setShowAdmin(false)} onRefresh={async () => setEvents(await api.getEvents())} />
      ) : showDashboard && currentUser ? (
        <div className="pt-20">
          <Dashboard user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); }} onOpenAdmin={() => setShowAdmin(true)} />
        </div>
      ) : (
        <main className="relative z-10 pt-24 px-6 max-w-6xl mx-auto">
          
          <section className="mb-12 relative">
             <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative inline-block animate-float">
                  <div className="absolute inset-0 bg-brand-lime/20 blur-xl"></div>
                  <div className="relative glass-card px-4 py-1 rounded-full border border-brand-lime/20">
                    <span className="text-slate-900 text-[9px] font-black uppercase tracking-[0.3em] italic">Frequency: ULTRA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-7xl font-display font-black italic tracking-tighter leading-none text-slate-900 uppercase">
                    Mood-Based <br/>
                    <span className="text-brand-red">Reality.</span>
                  </h1>
                </div>

                <div className="w-full max-w-2xl relative space-y-6">
                   <div className="flex flex-wrap justify-center gap-2">
                     {PRESET_MOODS.map((m) => (
                       <button
                         key={m.label}
                         onClick={(e) => { triggerRipple(e, m.color + '44'); setUserMood(m.label); handleMoodSearch(m.label); }}
                         className={`mood-chip flex items-center gap-2 px-4 py-2 rounded-full border font-black uppercase text-[8px] tracking-widest transition-all ${
                           userMood === m.label 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-0.5' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                         }`}
                       >
                         <span>{m.icon}</span>
                         {m.label}
                       </button>
                     ))}
                   </div>

                   <div className="relative dark-glass-card rounded-[2rem] p-3 flex flex-col md:flex-row items-center gap-2 ai-glow overflow-hidden">
                      {isAiLoading && (
                        <div className="absolute inset-x-8 top-0 h-0.5 bg-brand-red/50 shadow-[0_0_10px_#F84464] animate-scanner z-20"></div>
                      )}
                      <div className="flex-1 w-full px-4 py-2 flex items-center gap-3 z-10">
                         <div className={`w-2 h-2 rounded-full ${isAiLoading ? 'bg-brand-lime animate-ping' : 'bg-slate-700'}`}></div>
                         <input 
                           type="text" 
                           placeholder="Type your state..."
                           className="w-full bg-transparent border-none text-white text-base font-medium placeholder:text-slate-600 focus:outline-none"
                           value={userMood}
                           onChange={(e) => setUserMood(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                         />
                      </div>
                      <button 
                        onClick={(e) => { triggerRipple(e, '#F84464'); handleMoodSearch(userMood); }}
                        disabled={isAiLoading}
                        className="w-full md:w-auto px-8 py-3 bg-brand-red text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50 z-10"
                      >
                        {isAiLoading ? 'Scanning...' : 'Calibrate'}
                      </button>
                   </div>
                   
                   {aiRec && (
                     <div id="ai-recommendation-target" className="relative">
                       <div className="relative bg-white rounded-3xl p-6 animate-in zoom-in-95 duration-500 text-left border border-slate-100 shadow-xl flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                             <span className="text-xl animate-bounce">✨</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="bg-brand-lime text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Optimal Match</span>
                              <button onClick={() => setAiRec(null)} className="text-slate-300 hover:text-slate-600 text-[8px] font-black uppercase tracking-widest">Clear</button>
                            </div>
                            <p className="text-sm font-bold italic text-slate-500 leading-tight">"{aiRec.reasoning}"</p>
                          </div>
                       </div>
                     </div>
                   )}
                </div>
             </div>
          </section>

          <section className="mb-10">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x px-1">
              <CategoryItem label="All" shape="all" color="#64748b" active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
              <CategoryItem label="Adventure" shape="adventure" color="#3B82F6" active={selectedCategory === 'Adventure'} onClick={() => setSelectedCategory('Adventure')} />
              <CategoryItem label="Activity" shape="activity" color="#F59E0B" active={selectedCategory === 'Activity'} onClick={() => setSelectedCategory('Activity')} />
              <CategoryItem label="Wellness" shape="wellness" color="#10B981" active={selectedCategory === 'Wellness'} onClick={() => setSelectedCategory('Wellness')} />
              <CategoryItem label="Mindfulness" shape="mindfulness" color="#8B5CF6" active={selectedCategory === 'Mindfulness'} onClick={() => setSelectedCategory('Mindfulness')} />
              <CategoryItem label="Arts" shape="creativearts" color="#EC4899" active={selectedCategory === 'Creative Arts'} onClick={() => setSelectedCategory('Creative Arts')} />
              <CategoryItem label="Teams" shape="teambuilding" color="#14B8A6" active={selectedCategory === 'Team Building'} onClick={() => setSelectedCategory('Team Building')} />
            </div>
          </section>

          {/* 2 Events per row grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onClick={(e) => setSelectedEvent(e)} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
             <div className="py-20 text-center space-y-4">
                <div className="text-4xl text-slate-200 uppercase font-black italic">No Matches</div>
                <button onClick={() => setAiRec(null)} className="px-8 py-2 border-2 border-slate-900 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Reset Filters</button>
             </div>
          )}
        </main>
      )}

      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot) => {
          if (!selectedEvent) return;
          let user = currentUser;
          if (!user) {
            const name = prompt("Name?") || "Explorer";
            user = { name, phone: "000", bookings: [], role: 'user' };
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
        }} />
      )}
    </div>
  );
};

export default App;