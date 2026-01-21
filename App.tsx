
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ChatBot from './components/ChatBot.tsx';
import { api } from './services/api.ts';

// Sound Assets
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

const SensorIcon: React.FC<{ active: boolean; aqi: number }> = ({ active, aqi }) => {
  const colorClass = aqi <= 50 ? 'text-emerald-500' : aqi <= 100 ? 'text-brand-lime' : 'text-brand-red';
  return (
    <div className={`flex items-center gap-1 h-4 ${colorClass}`}>
      <div className={`w-2 h-2 rounded-full bg-current ${active ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-black">{aqi}</span>
    </div>
  );
};

const WeatherIcon: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  if (s.includes('clear') || s.includes('sun')) {
    return (
      <svg className="w-5 h-5 text-amber-400 animate-sun-spin" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41 0l-1.06 1.06a.996.996 0 101.41 1.41l1.06-1.06a.996.996 0 000-1.41zM5.99 18.36l1.06-1.06a.996.996 0 10-1.41-1.41l-1.06 1.06a.996.996 0 000 1.41c.39.4 1.03.4 1.41 0z" />
      </svg>
    );
  }
  if (s.includes('cloud')) {
    return (
      <svg className="w-5 h-5 text-slate-400 animate-cloud-drift" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    );
  }
  if (s.includes('rain')) {
    return (
      <svg className="w-5 h-5 text-brand-accent animate-rain-pulse" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 15c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4z" />
        <path d="M12 21a1 1 0 011-1h.01a1 1 0 010 2H13a1 1 0 01-1-1zm-4-1a1 1 0 011-1h.01a1 1 0 010 2H9a1 1 0 01-1-1zm8 0a1 1 0 011-1h.01a1 1 0 010 2H17a1 1 0 01-1-1z" opacity="0.6"/>
      </svg>
    );
  }
  return <span className="text-xl">🌡️</span>;
};

const ShapeIcon: React.FC<{ type: string; color: string; active: boolean }> = ({ type, color, active }) => {
  const icons: Record<string, React.ReactNode> = {
    all: (
      <g fill="currentColor">
        <rect x="25" y="25" width="22" height="22" rx="4" />
        <rect x="53" y="25" width="22" height="22" rx="4" opacity="0.6" />
        <rect x="25" y="53" width="22" height="22" rx="4" opacity="0.6" />
        <rect x="53" y="53" width="22" height="22" rx="4" />
      </g>
    ),
    adventure: (
      <g fill="currentColor">
        <path d="M10 80 L40 20 L60 55 L85 20 L85 80 Z" />
        <circle cx="85" cy="15" r="5" opacity="0.4" />
      </g>
    ),
    activity: (
      <g fill="currentColor">
        <path d="M30 10 L65 10 L45 45 L75 45 L40 90 L50 45 L25 45 Z" />
      </g>
    ),
    wellness: (
      <g fill="currentColor">
        <path d="M50 90 C50 90 15 65 15 40 C15 22 30 10 50 10 C70 10 85 22 85 40 C85 65 50 90 50 90 Z" />
        <path d="M50 20 L50 80" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
      </g>
    ),
    mindfulness: (
      <g fill="currentColor">
        <circle cx="50" cy="50" r="14" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" opacity="0.5" />
      </g>
    ),
    creativearts: (
      <g fill="currentColor">
        <path d="M50 5 L95 50 L50 95 L5 50 Z" />
        <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="white" opacity="0.2" />
      </g>
    ),
    teambuilding: (
      <g fill="currentColor">
        <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" />
        <circle cx="50" cy="50" r="12" fill="white" opacity="0.3" />
      </g>
    ),
    sports: (
      <g fill="currentColor">
        <circle cx="50" cy="50" r="45" />
        <path d="M20 50 Q50 20 80 50" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.2" />
        <path d="M20 50 Q50 80 80 50" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.2" />
      </g>
    )
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
      <div className={`absolute inset-0 rounded-[1.5rem] transition-all duration-500 ${
        active ? 'bg-white shadow-xl shadow-black/5' : 'bg-white/40 group-hover:bg-white/80'
      }`}></div>
      <div className="relative w-7 h-7 md:w-9 md:h-9 z-10">
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
  const [aqiData, setAqiData] = useState<{ value: number; status: string; city: string }>({ value: 42, status: 'Good', city: 'Detecting...' });
  const [weatherData, setWeatherData] = useState<{ temp: number; status: string }>({ temp: 24, status: 'Clear Sky' });
  const [isAqiLoading, setIsAqiLoading] = useState(true);
  
  const tapSoundRef = useRef<HTMLAudioElement | null>(null);

  // Derived vibe class for the background
  const weatherVibeClass = useMemo(() => {
    const s = weatherData.status.toLowerCase();
    if (s.includes('clear') || s.includes('sun')) return 'vibe-sunny';
    if (s.includes('cloud')) return 'vibe-cloudy';
    if (s.includes('rain')) return 'vibe-rainy';
    return 'vibe-sunny';
  }, [weatherData.status]);

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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const cityNames = ['Mumbai', 'Delhi', 'Bangalore', 'London', 'New York', 'Tokyo'];
          const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
          
          const mockAqi = Math.floor(Math.random() * 150) + 15;
          const statusAqi = mockAqi <= 50 ? 'Good' : mockAqi <= 100 ? 'Moderate' : 'Poor';
          setAqiData({ value: mockAqi, status: statusAqi, city: randomCity.toUpperCase() });

          const weatherStatuses = ['Clear Sky', 'Partly Cloudy', 'Light Rain', 'Sunny'];
          const mockTemp = Math.floor(Math.random() * 15) + 18;
          const mockWeatherStatus = weatherStatuses[Math.floor(Math.random() * weatherStatuses.length)];
          setWeatherData({ temp: mockTemp, status: mockWeatherStatus });

        } catch (err) {
          console.error("Environmental Sync Failed", err);
        } finally {
          setIsAqiLoading(false);
        }
      }, () => {
        setAqiData(prev => ({ ...prev, city: 'GLOBAL' }));
        setIsAqiLoading(false);
      });
    } else {
      setIsAqiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (aiRec) setAiRec(null);
  }, [selectedCategory]);

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) return;
    setIsAiLoading(true);
    setAiRec(null);
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
      setTimeout(() => {
        document.getElementById('ai-recommendation-target')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } catch (err) {
      console.error("Calibration Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAi = aiRec && aiRec.suggestedEventIds.length > 0 
        ? aiRec.suggestedEventIds.includes(e.id) 
        : true;
        
      return matchCat && matchSearch && matchAi;
    });
  }, [events, selectedCategory, searchQuery, aiRec]);

  return (
    <div className={`min-h-screen bg-[#F8F9FA] selection:bg-brand-red selection:text-white pb-20 mesh-bg ${weatherVibeClass}`}>
      {/* Environmental Overlays */}
      <div className="rain-overlay"></div>
      <div className="sun-shimmer"></div>
      
      {/* Animated Flow Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 animate-mesh-flow"></div>

      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setShowDashboard(false); setShowAdmin(false); setAiRec(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <ConnectionLogo />
            <span className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-brand-red transition-all">
              MakeMyDays
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200 group">
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
                        <WeatherIcon status={weatherData.status} />
                        <span className="text-xs font-black italic text-slate-900">{weatherData.temp}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">AQI</span>
                        <SensorIcon active={!isAqiLoading} aqi={aqiData.value} />
                    </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{aqiData.city}</span>
                  <span className="text-[6px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{weatherData.status}</span>
                </div>
            </div>

            <div className="sm:hidden flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full">
               <WeatherIcon status={weatherData.status} />
               <span className="text-[10px] font-black">{weatherData.temp}°</span>
            </div>
            
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
                    <span className="text-slate-900 text-[9px] font-black uppercase tracking-[0.3em] italic">AI Calibrated: TRUE</span>
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
                        <>
                          <div className="absolute inset-x-8 top-0 h-0.5 bg-brand-red/50 shadow-[0_0_10px_#F84464] animate-scanner z-20"></div>
                          <div className="absolute inset-0 bg-brand-red/10 animate-pulse z-0"></div>
                        </>
                      )}
                      <div className="flex-1 w-full px-4 py-2 flex items-center gap-3 z-10">
                         <div className={`w-2 h-2 rounded-full ${isAiLoading ? 'bg-brand-lime animate-ping' : 'bg-slate-700'}`}></div>
                         <input 
                           type="text" 
                           placeholder="Type your current frequency..."
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
                        {isAiLoading ? 'Calibrating...' : 'Sync AI'}
                      </button>
                   </div>
                   
                   {aiRec && (
                     <div id="ai-recommendation-target" className="relative group animate-in slide-in-from-top-4 duration-500">
                       <div className="relative bg-white rounded-3xl p-5 text-left border border-slate-100 shadow-xl flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                             <span className="text-lg animate-bounce">✨</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="bg-brand-lime text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Optimal Match Detected</span>
                              <button onClick={() => { setAiRec(null); setUserMood(''); }} className="text-slate-300 hover:text-slate-600 text-[8px] font-black uppercase tracking-widest transition-colors ml-auto">Reset</button>
                            </div>
                            <p className="text-xs font-bold italic text-slate-600 leading-tight">"{aiRec.reasoning}"</p>
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
              <CategoryItem label="Sports" shape="sports" color="#6366F1" active={selectedCategory === 'Sports'} onClick={() => setSelectedCategory('Sports')} />
              <CategoryItem label="Activity" shape="activity" color="#F59E0B" active={selectedCategory === 'Activity'} onClick={() => setSelectedCategory('Activity')} />
              <CategoryItem label="Wellness" shape="wellness" color="#10B981" active={selectedCategory === 'Wellness'} onClick={() => setSelectedCategory('Wellness')} />
              <CategoryItem label="Mindfulness" shape="mindfulness" color="#8B5CF6" active={selectedCategory === 'Mindfulness'} onClick={() => setSelectedCategory('Mindfulness')} />
              <CategoryItem label="Arts" shape="creativearts" color="#EC4899" active={selectedCategory === 'Creative Arts'} onClick={() => setSelectedCategory('Creative Arts')} />
              <CategoryItem label="Teams" shape="teambuilding" color="#14B8A6" active={selectedCategory === 'Team Building'} onClick={() => setSelectedCategory('Team Building')} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 md:gap-8 min-h-[400px]">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onClick={(e) => setSelectedEvent(e)} />
            ))}
            
            {filteredEvents.length === 0 && (
               <div className="col-span-2 py-20 text-center space-y-4">
                  <div className="text-4xl text-slate-200 uppercase font-black italic">Frequency Error</div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No experiences found for this calibration.</p>
                  <button onClick={() => { setAiRec(null); setUserMood(''); setSelectedCategory('All'); }} className="px-8 py-2 border-2 border-slate-900 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Reset All Filters</button>
               </div>
            )}
          </div>
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

      <ChatBot />
    </div>
  );
};

export default App;
