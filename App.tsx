import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ChatBot from './components/ChatBot.tsx';
import { api } from './services/api.ts';

// Atmospheric Sound Assets
// Using high-quality Tabla samples for BOLs
const TABLA_DHA = "https://cdn.freesound.org/previews/178/178657_2515431-lq.mp3"; // Deep bass
const TABLA_NA = "https://cdn.freesound.org/previews/178/178660_2515431-lq.mp3"; // Sharp rim
const TABLA_TI = "https://cdn.freesound.org/previews/178/178661_2515431-lq.mp3"; // Light middle tap

const AMBIENT_STORM_URL = "https://assets.mixkit.co/sfx/preview/mixkit-thunder-and-rain-loop-2410.mp3";
const AMBIENT_SEA_URL = "https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3";
const AMBIENT_TABLA_URL = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_f5f6479632.mp3";

const USER_STORAGE_KEY = 'makemydays_user_v1';

const PRESET_MOODS = [
  { label: 'Burnout', icon: '🕯️', color: '#8B5CF6' },
  { label: 'Nature', icon: '🌲', color: '#10B981' },
  { label: 'Adrenaline', icon: '🔥', color: '#F84464' },
  { label: 'Creative', icon: '🎨', color: '#EC4899' },
  { label: 'Hyper', icon: '⚡', color: '#DFFF00' },
  { label: 'Escape', icon: '🏙️', color: '#3B82F6' }
];

const AURA_STATES = ["TRUE", "SYNCED", "ZEN", "OPTIMAL", "PURE", "RESONATING", "FLUID", "DEEP"];

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

// Global sound helper to trigger Tabla Bols
const playTablaBol = (bol: 'dha' | 'na' | 'ti') => {
  const urls = { dha: TABLA_DHA, na: TABLA_NA, ti: TABLA_TI };
  const audio = new Audio(urls[bol]);
  audio.volume = bol === 'dha' ? 0.5 : 0.3;
  audio.play().catch(() => {});
};

const ConnectionLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} fill-current text-brand-red cursor-pointer active:scale-95 transition-transform`}
    onClick={() => playTablaBol('dha')}
  >
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const StormIcon = ({ active }: { active: boolean }) => (
  <div className={`relative transition-all duration-500 ${active ? 'scale-110' : ''}`}>
    {active && (
      <div className="absolute inset-0 bg-slate-400/30 blur-lg animate-pulse rounded-full"></div>
    )}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${active ? 'text-slate-200' : 'text-slate-400'}`}>
      <path d="M17.5 19c.703 0 1.352-.367 1.732-1a2 2 0 0 0 .268-1.5 2.5 2.5 0 1 0-4.5-1.5" />
      <path d="M4.5 19c-.703 0-1.352-.367-1.732-1a2 2 0 0 1-.268-1.5 2.5 2.5 0 1 1 4.5-1.5" />
      <path d="M12 19c-.703 0-1.352-.367-1.732-1a2 2 0 0 1-.268-1.5 2.5 2.5 0 1 1 4.5-1.5" />
      <path d="M8 13V9a4 4 0 1 1 8 0v4" />
      <path d="m13 15-3 5h4l-3 5" className={active ? 'animate-pulse' : ''} />
    </svg>
  </div>
);

const WaveIcon = ({ active }: { active: boolean }) => (
  <div className={`relative transition-all duration-500 ${active ? 'scale-110' : ''}`}>
    {active && (
      <div className="absolute inset-0 bg-teal-400/40 blur-lg animate-pulse rounded-full"></div>
    )}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-colors ${active ? 'text-teal-500' : 'text-slate-400'}`}>
      <path className={active ? 'animate-[mist-drift_3s_infinite_linear]' : ''} d="M2 6c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1 3.1-1.5" />
      <path className={active ? 'animate-[mist-drift_4s_infinite_linear]' : ''} d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1 3.1-1.5" />
      <path className={active ? 'animate-[mist-drift_2s_infinite_linear]' : ''} d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 2.5-1 3.1-1.5" />
    </svg>
  </div>
);

const TablaIcon = ({ active }: { active: boolean }) => (
  <div className={`relative transition-all duration-500 ${active ? 'animate-rhythm-bounce' : ''}`}>
    {active && (
      <div className="absolute inset-0 bg-amber-600/30 blur-lg rounded-full"></div>
    )}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${active ? 'text-amber-600' : 'text-slate-400'}`}>
      <path d="M12 2v20" />
      <path d="M7 6c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6z" />
      <path d="M7 8h10" />
      <path d="M7 16h10" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  </div>
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
        <rect x="20" y="20" width="25" height="25" rx="6" />
        <rect x="55" y="20" width="25" height="25" rx="6" opacity="0.4" />
        <rect x="20" y="55" width="25" height="25" rx="6" opacity="0.4" />
        <rect x="55" y="55" width="25" height="25" rx="6" />
      </g>
    ),
    adventure: (
      <g fill="currentColor">
        <path d="M10 85 L40 15 L60 55 L80 25 L90 85 Z" />
        <circle cx="75" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
      </g>
    ),
    activity: (
      <g fill="currentColor">
        <path d="M45 5 L85 45 L50 45 L65 95 L25 55 L55 55 Z" />
      </g>
    ),
    wellness: (
      <g fill="currentColor">
        <path d="M50 95 C20 75 10 50 10 30 C10 15 25 5 50 25 C75 5 90 15 90 30 C90 50 80 75 50 95 Z" />
        <circle cx="50" cy="40" r="10" fill="white" opacity="0.3" />
      </g>
    ),
    mindfulness: (
      <g fill="currentColor">
        <circle cx="50" cy="50" r="12" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.6" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" opacity="0.3" />
      </g>
    ),
    creativearts: (
      <g fill="currentColor">
        <path d="M50 5 L95 50 L50 95 L5 50 Z" />
        <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="white" opacity="0.3" />
        <rect x="42" y="42" width="16" height="16" fill="white" opacity="0.4" />
      </g>
    ),
    teambuilding: (
      <g fill="currentColor">
        <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="12" />
        <path d="M50 10 V30 M15 30 L35 40 M85 30 L65 40" stroke="currentColor" strokeWidth="4" />
      </g>
    ),
    sports: (
      <g fill="currentColor">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M20 50 Q50 10 80 50" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.4" />
        <path d="M20 50 Q50 90 80 50" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.4" />
        <circle cx="50" cy="50" r="10" />
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
      playTablaBol('ti'); // Light tap for category selection
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
  const [auraIndex, setAuraIndex] = useState(0);
  
  const [isStormActive, setIsStormActive] = useState(false);
  const [isSeaActive, setIsSeaActive] = useState(false);
  const [isTablaActive, setIsTablaActive] = useState(false);
  
  const stormAmbientRef = useRef<HTMLAudioElement | null>(null);
  const seaAmbientRef = useRef<HTMLAudioElement | null>(null);
  const tablaAmbientRef = useRef<HTMLAudioElement | null>(null);

  // Cycle Aura State
  useEffect(() => {
    const interval = setInterval(() => {
      setAuraIndex((prev) => (prev + 1) % AURA_STATES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Derived vibe class for the background - prioritized by atmospheric toggles
  const vibeClass = useMemo(() => {
    if (isTablaActive) return 'vibe-tabla';
    if (isStormActive) return 'vibe-storm';
    if (isSeaActive) return 'vibe-sea';
    
    const s = weatherData.status.toLowerCase();
    if (s.includes('clear') || s.includes('sun')) return 'vibe-sunny';
    if (s.includes('cloud')) return 'vibe-cloudy';
    if (s.includes('rain')) return 'vibe-storm'; 
    return 'vibe-sunny';
  }, [isStormActive, isSeaActive, isTablaActive, weatherData.status]);

  useEffect(() => {
    stormAmbientRef.current = new Audio(AMBIENT_STORM_URL);
    stormAmbientRef.current.loop = true;
    stormAmbientRef.current.volume = 0.5;
    stormAmbientRef.current.load();

    seaAmbientRef.current = new Audio(AMBIENT_SEA_URL);
    seaAmbientRef.current.loop = true;
    seaAmbientRef.current.volume = 0.7; 
    seaAmbientRef.current.load();

    tablaAmbientRef.current = new Audio(AMBIENT_TABLA_URL);
    tablaAmbientRef.current.loop = true;
    tablaAmbientRef.current.volume = 0.6;
    tablaAmbientRef.current.load();

    const handleGlobalTap = (e: MouseEvent | TouchEvent) => {
      // Don't play default sound if clicking interactive elements (handled separately)
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"]')) return;
      
      playTablaBol('na'); // Default light rhythmic bol for background taps
    };
    
    window.addEventListener('mousedown', handleGlobalTap);
    window.addEventListener('touchstart', handleGlobalTap);
    return () => {
      window.removeEventListener('mousedown', handleGlobalTap);
      window.removeEventListener('touchstart', handleGlobalTap);
      if (stormAmbientRef.current) stormAmbientRef.current.pause();
      if (seaAmbientRef.current) seaAmbientRef.current.pause();
      if (tablaAmbientRef.current) tablaAmbientRef.current.pause();
    };
  }, []);

  // Audio Toggle Handlers
  const toggleStorm = () => {
    const audio = stormAmbientRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.error("Storm playback error:", e));
      setIsStormActive(true);
      playTablaBol('dha');
    } else {
      audio.pause();
      setIsStormActive(false);
    }
  };

  const toggleSea = () => {
    const audio = seaAmbientRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setIsSeaActive(true);
        playTablaBol('ti');
      }).catch(e => {
        console.error("Sea frequency sync error:", e);
        audio.load();
        audio.play().then(() => setIsSeaActive(true));
      });
    } else {
      audio.pause();
      setIsSeaActive(false);
    }
  };

  const toggleTabla = () => {
    const audio = tablaAmbientRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setIsTablaActive(true);
        playTablaBol('dha');
      }).catch(e => {
        console.error("Tabla frequency sync error:", e);
        audio.load();
        audio.play().then(() => setIsTablaActive(true));
      });
    } else {
      audio.pause();
      setIsTablaActive(false);
    }
  };

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
    playTablaBol('dha'); // Deep bass for AI calibration start
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
      playTablaBol('na'); // Crisp hit for success
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
    <div className={`min-h-screen bg-[#F8F9FA] selection:bg-brand-red selection:text-white pb-10 mesh-bg ${vibeClass}`}>
      {/* Environmental Overlays */}
      <div className="rain-overlay"></div>
      <div className="lightning-overlay"></div>
      <div className="sea-mist"></div>
      <div className="sun-shimmer"></div>
      
      {/* Animated Flow Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 animate-mesh-flow"></div>

      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 glass-card border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { 
              playTablaBol('dha');
              setShowDashboard(false); 
              setShowAdmin(false); 
              setAiRec(null); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }}
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
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center bg-slate-900/5 p-1 rounded-2xl gap-1">
                <button 
                  onClick={toggleStorm}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isStormActive ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                  title="Storm Frequency"
                >
                  <StormIcon active={isStormActive} />
                </button>
                <button 
                  onClick={toggleSea}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSeaActive ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                  title="Sea Frequency"
                >
                  <WaveIcon active={isSeaActive} />
                </button>
                <button 
                  onClick={toggleTabla}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isTablaActive ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                  title="Tabla Rhythm"
                >
                  <TablaIcon active={isTablaActive} />
                </button>
              </div>
              
              {currentUser ? (
                <button 
                  onClick={() => { playTablaBol('ti'); setShowDashboard(!showDashboard); }}
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
        </div>
      </nav>

      {showAdmin && currentUser?.role === 'admin' ? (
        <AdminPanel events={events} bookings={globalBookings} onClose={() => setShowAdmin(false)} onRefresh={async () => setEvents(await api.getEvents())} />
      ) : showDashboard && currentUser ? (
        <div className="pt-20">
          <Dashboard user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); }} onOpenAdmin={() => setShowAdmin(true)} />
        </div>
      ) : (
        <main className="relative z-10 pt-24 px-6 max-w-6xl mx-auto min-h-[calc(100vh-16rem)]">
          
          <section className="mb-12 relative">
             <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative inline-block animate-float">
                  <div className="absolute inset-0 bg-brand-lime/20 blur-xl"></div>
                  <div className="relative glass-card px-4 py-1 rounded-full border border-brand-lime/20">
                    <span className="text-slate-900 text-[9px] font-black uppercase tracking-[0.3em] italic transition-all duration-1000">Aura: {AURA_STATES[auraIndex]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-7xl font-display font-black italic tracking-tighter leading-none text-slate-900 uppercase">
                    Mood-Based <br/>
                    <span className="text-brand-red">Experience</span>
                  </h1>
                </div>

                <div className="w-full max-w-2xl relative space-y-6">
                   <div className="flex flex-wrap justify-center gap-2">
                     {PRESET_MOODS.map((m) => (
                       <button
                         key={m.label}
                         onClick={(e) => { 
                           triggerRipple(e, m.color + '44'); 
                           playTablaBol('ti');
                           setUserMood(m.label); 
                           handleMoodSearch(m.label); 
                         }}
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

      {/* Minimalist Dock Footer */}
      <footer className="mt-20 h-10 glass-card border-t border-white/20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConnectionLogo className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-900 italic">MakeMyDays</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <p className="text-slate-500 text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
              Created by <span className="text-slate-900 border-b border-slate-900/10">Beneme</span> 
              <span className="text-brand-red animate-pulse inline-block">❤️</span> 
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-200 pr-4">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">AURA</span>
            </div>
            <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">
              &copy; 2026
            </p>
          </div>
        </div>
      </footer>

      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date) => {
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
            eventDate: date,
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