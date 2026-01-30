
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Event, Category, Booking, Slot, AIRecommendation, User } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ChatBot from './components/ChatBot.tsx';
import LegalModal, { PolicyType } from './components/LegalModal.tsx';
import { api } from './services/api.ts';

// Interaction Sound Assets
const TABLA_DHA = "https://cdn.freesound.org/previews/178/178657_2515431-lq.mp3"; // Deep bass
const TABLA_NA = "https://cdn.freesound.org/previews/178/178660_2515431-lq.mp3"; // Sharp rim
const TABLA_TI = "https://cdn.freesound.org/previews/178/178661_2515431-lq.mp3"; // Light middle tap

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
  return <span className="text-xl">🌡️</span>;
};

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
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuraIndex((prev) => (prev + 1) % AURA_STATES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const vibeClass = useMemo(() => {
    const s = weatherData.status.toLowerCase();
    if (s.includes('clear') || s.includes('sun')) return 'vibe-sunny';
    if (s.includes('cloud')) return 'vibe-cloudy';
    if (s.includes('rain')) return 'vibe-storm'; 
    return 'vibe-sunny';
  }, [weatherData.status]);

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
    playTablaBol('dha');
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
      playTablaBol('na');
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
    <div className={`flex flex-col min-h-screen bg-[#F8F9FA] selection:bg-brand-red selection:text-white mesh-bg ${vibeClass}`}>
      <div className="rain-overlay"></div>
      <div className="lightning-overlay"></div>
      <div className="sea-mist"></div>
      <div className="sun-shimmer"></div>
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
            <span className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-brand-red transition-all text-nowrap">
              MakeMyDays
            </span>
          </div>
          <div className="flex items-center gap-4">
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
      </nav>

      <main className="flex-1 relative z-10 pt-24 px-6 max-w-6xl mx-auto w-full">
        {showAdmin && currentUser?.role === 'admin' ? (
          <AdminPanel events={events} bookings={globalBookings} onClose={() => setShowAdmin(false)} onRefresh={async () => setEvents(await api.getEvents())} />
        ) : showDashboard && currentUser ? (
          <Dashboard 
            user={currentUser} 
            onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); }} 
            onOpenAdmin={() => setShowAdmin(true)} 
            onOpenPolicy={setActivePolicy}
          />
        ) : (
          <div className="space-y-12">
            <section className="text-center space-y-6">
              <div className="relative inline-block animate-float">
                <div className="absolute inset-0 bg-brand-lime/20 blur-xl"></div>
                <div className="relative glass-card px-4 py-1 rounded-full border border-brand-lime/20">
                  <span className="text-slate-900 text-[9px] font-black uppercase tracking-[0.3em] italic">Aura: {AURA_STATES[auraIndex]}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black italic tracking-tighter leading-none text-slate-900 uppercase">
                Mood-Based <br/>
                <span className="text-brand-red">Experience</span>
              </h1>
              <div className="w-full max-w-2xl mx-auto relative space-y-6">
                 <div className="relative dark-glass-card rounded-[2rem] p-3 flex flex-col md:flex-row items-center gap-2 ai-glow overflow-hidden">
                    <div className="flex-1 w-full px-4 py-2 flex items-center gap-3 z-10">
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
                      onClick={() => handleMoodSearch(userMood)}
                      className="w-full md:w-auto px-8 py-3 bg-brand-red text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
                    >
                      {isAiLoading ? 'Calibrating...' : 'Sync'}
                    </button>
                 </div>
                 {aiRec && (
                   <div id="ai-recommendation-target" className="relative group animate-in slide-in-from-top-4 duration-500">
                     <div className="relative bg-white rounded-3xl p-5 text-left border border-slate-100 shadow-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                           <span className="text-lg animate-bounce">✨</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold italic text-slate-600">"{aiRec.reasoning}"</p>
                        </div>
                     </div>
                   </div>
                 )}
              </div>
            </section>
            
            <section className="grid grid-cols-2 gap-4 md:gap-8 pb-10">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={(e) => setSelectedEvent(e)} />
              ))}
            </section>
          </div>
        )}
      </main>

      {/* ULTRA-MINIMALISTIC FOOTER */}
      <footer className="relative z-[100] mt-10 py-10 w-full border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ConnectionLogo className="w-5 h-5" />
            <span className="text-sm font-black italic tracking-tighter text-slate-900 uppercase">MAKEMYDAYS</span>
          </div>
          
          <div className="flex items-center gap-6">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              &copy; 2024 • Created by <span className="text-slate-900">Beneme</span>
            </p>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-red animate-pulse">Frequency v2.5</span>
          </div>
        </div>
      </footer>

      {activePolicy && (
        <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />
      )}

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
