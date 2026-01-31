
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

const TABLA_DHA = "https://cdn.freesound.org/previews/178/178657_2515431-lq.mp3";
const TABLA_NA = "https://cdn.freesound.org/previews/178/178660_2515431-lq.mp3";
const TABLA_TI = "https://cdn.freesound.org/previews/178/178661_2515431-lq.mp3";

const USER_STORAGE_KEY = 'makemydays_user_v1';
const ONBOARDING_KEY = 'mmd_onboarding_v1';

const MOODS = [
  { label: "Chill", emoji: "🧘", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Energetic", emoji: "⚡", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { label: "Stressed", emoji: "🤯", color: "bg-red-50 text-red-600 border-red-100" },
  { label: "Inspired", emoji: "✨", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { label: "Bored", emoji: "🙄", color: "bg-slate-50 text-slate-600 border-slate-100" }
];

const CATEGORIES: (Category | 'All')[] = ['All', 'Movie', 'Activity', 'Therapy', 'Workshop', 'Wellness'];

const AURA_STATES = ["TRUE", "SYNCED", "ZEN", "OPTIMAL", "PURE", "RESONATING", "FLUID", "DEEP"];

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [weatherData, setWeatherData] = useState<{ temp: number; status: string }>({ temp: 24, status: 'Clear Sky' });
  const [auraIndex, setAuraIndex] = useState(0);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const fetchData = useCallback(async () => {
    const [evs, bks] = await Promise.all([api.getEvents(), api.getBookings()]);
    setEvents(evs || []);
    setGlobalBookings(bks || []);
  }, []);

  useEffect(() => {
    fetchData();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingDone) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, [fetchData]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setShowAuthModal(false);
    playTablaBol('ti');
  };

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

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    playTablaBol('ti');
  };

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
              setSelectedCategory('All');
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
                id="user-sanctuary-trigger"
                onClick={() => { playTablaBol('ti'); setShowDashboard(!showDashboard); }}
                className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black italic text-lg shadow-lg active:scale-90"
              >
                {currentUser.name[0]}
              </button>
            ) : (
              <button 
                id="user-sanctuary-trigger"
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-brand-red transition-all"
              >
                Join with Mobile
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 pt-24 px-6 max-w-6xl mx-auto w-full">
        {showAdmin && currentUser?.role === 'admin' ? (
          <AdminPanel events={events} bookings={globalBookings} onClose={() => setShowAdmin(false)} onRefresh={fetchData} />
        ) : showDashboard && currentUser ? (
          <Dashboard 
            user={currentUser} 
            events={events}
            bookings={globalBookings}
            onLogout={() => { setCurrentUser(null); localStorage.removeItem(USER_STORAGE_KEY); }} 
            onOpenAdmin={() => setShowAdmin(true)} 
            onOpenPolicy={setActivePolicy}
            onRefreshEvents={fetchData}
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
                Find Your <br/>
                <span className="text-brand-red">Frequency</span>
              </h1>
              
              <div id="mood-search-container" className="w-full max-w-2xl mx-auto relative space-y-8">
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

                 {/* Mood Chips */}
                 <div className="flex flex-wrap justify-center gap-3">
                    {MOODS.map(mood => (
                      <button
                        key={mood.label}
                        onClick={() => {
                          setUserMood(mood.label);
                          handleMoodSearch(mood.label);
                        }}
                        className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${mood.color}`}
                      >
                        <span>{mood.emoji}</span>
                        {mood.label}
                      </button>
                    ))}
                 </div>

                 {aiRec && (
                   <div id="ai-recommendation-target" className="relative group animate-in slide-in-from-top-4 duration-500 pt-4">
                     <div className="relative bg-white rounded-3xl p-6 text-left border border-slate-100 shadow-xl flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                           <span className="text-xl animate-bounce">✨</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">AI Recommendation</p>
                          <p className="text-sm font-bold italic text-slate-800 leading-relaxed">"{aiRec.reasoning}"</p>
                        </div>
                        <button 
                          onClick={() => setAiRec(null)}
                          className="text-slate-300 hover:text-slate-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                     </div>
                   </div>
                 )}
              </div>
            </section>

            {/* Category Filter Bar */}
            <section className="sticky top-20 z-[90] pb-2">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      playTablaBol('ti');
                    }}
                    className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]'
                        : 'bg-white/50 border-white/20 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>
            
            <section id="event-grid-container" className="grid grid-cols-2 gap-4 md:gap-8 pb-10">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={(e) => setSelectedEvent(e)} 
                    id={index === 0 ? "first-event-card" : undefined}
                  />
                ))
              ) : (
                <div className="col-span-2 py-32 text-center space-y-6">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-400">No Frequencies Found</h3>
                   <button 
                    onClick={() => { setSelectedCategory('All'); setAiRec(null); }}
                    className="text-brand-red text-[10px] font-black uppercase tracking-widest underline"
                   >
                     Reset Discovery
                   </button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="relative z-[100] mt-20 py-8 w-full border-t border-slate-100/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <ConnectionLogo className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-900 uppercase italic">MAKEMYDAYS</span>
          </div>
          
          <div className="flex items-center gap-5 text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span>&copy; 2025</span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <div className="flex items-center gap-1.5 group cursor-default">
              <span>MADE WITH</span>
              <svg 
                className="w-3 h-3 text-brand-red fill-current transition-transform group-hover:scale-125 group-hover:animate-pulse" 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>BY BENEME</span>
            </div>
          </div>
        </div>
      </footer>

      {activePolicy && (
        <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />
      )}

      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onConfirm={async (slot, date) => {
          if (!selectedEvent) return;
          if (!currentUser) {
            setShowAuthModal(true);
            return;
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
            userName: currentUser.name,
            userPhone: currentUser.phone
          };
          await api.saveBooking(booking);
          const updatedUser = { ...currentUser, bookings: [booking, ...currentUser.bookings] };
          setCurrentUser(updatedUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          setGlobalBookings(prev => [booking, ...prev]);
          setSelectedEvent(null);
        }} />
      )}

      {showAuthModal && (
        <AuthModal 
          onSuccess={handleAuthSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}

      <ChatBot />
    </div>
  );
};

export default App;
