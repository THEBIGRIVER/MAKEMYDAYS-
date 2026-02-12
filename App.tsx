import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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

const FOREST_SOUNDS_URL = "https://assets.mixkit.co/music/preview/mixkit-forest-ambience-with-birds-chirping-1216.mp3";

const CATEGORIES: Category[] = ['Activity', 'Shows', 'MMD Originals', 'Mindfulness', 'Workshop', 'Therapy'];

const HeroSection = ({ trendingEvents, onBook }: { trendingEvents: Event[], onBook: (e: Event) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingEvents.length);
      setIsTransitioning(false);
    }, 500);
  };

  const activeEvent = trendingEvents[currentIndex];

  if (!activeEvent) return null;

  return (
    <div className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden bg-brand-netflix">
      {/* Slideshow background with crossfade */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img 
          src={activeEvent.image} 
          className="w-full h-full object-cover" 
          alt={activeEvent.title}
        />
      </div>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-netflix via-brand-netflix/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-netflix via-transparent to-transparent" />
      
      {/* Content Container */}
      <div className={`absolute bottom-[15%] left-[5%] md:left-[8%] max-w-[90%] md:max-w-[45%] space-y-4 md:space-y-6 transition-all duration-700 ${isTransitioning ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-brand-red rounded-full animate-pulse"></div>
          <span className="text-brand-red font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Trending Now</span>
        </div>
        
        <h1 className="text-4xl md:text-8xl font-display font-black leading-tight uppercase text-white drop-shadow-2xl">
          {activeEvent.title}
        </h1>
        
        <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed line-clamp-3 md:line-clamp-none max-w-xl">
          {activeEvent.description}
        </p>
        
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => onBook(activeEvent)}
            className="px-8 md:px-12 h-12 md:h-14 bg-white text-black rounded-md font-bold text-sm md:text-lg hover:bg-white/80 transition-all flex items-center gap-3 active:scale-95 group"
          >
            <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
            Book Experience
          </button>
          <button className="px-8 md:px-12 h-12 md:h-14 bg-white/20 backdrop-blur-md text-white rounded-md font-bold text-sm md:text-lg hover:bg-white/30 transition-all flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Learn More
          </button>
        </div>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-10 right-10 flex items-center gap-3 z-20">
        {trendingEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 h-1.5 rounded-full ${currentIndex === idx ? 'w-10 bg-brand-red' : 'w-4 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>

      {/* Slide Progress bar (bottom thin line) */}
      <div className="absolute bottom-0 left-0 h-1 bg-brand-red/30 w-full z-10">
        <div 
          key={currentIndex}
          className="h-full bg-brand-red animate-[progress_8s_linear_forwards]" 
          style={{ transformOrigin: 'left' }}
        />
      </div>
      
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
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
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchData = useCallback(async (userUid?: string) => {
    try {
      const evs = await api.getEvents();
      setEvents(evs);
      if (userUid) {
        const bks = await api.getBookings(userUid);
        setGlobalBookings(bks);
      }
    } catch (e: any) { 
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Explorer',
          email: firebaseUser.email || '',
          bookings: [], 
          role: firebaseUser.email === 'admin@makemydays.com' ? 'admin' : 'user'
        };
        setCurrentUser(user);
        await api.syncUserProfile(user);
        fetchData(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        fetchData();
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchData]);

  // Handle Back Button
  useEffect(() => {
    const handlePopState = () => {
      setSelectedEvent(null);
      setShowDashboard(false);
      setActivePolicy(null);
      setShowAuthModal(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (selectedEvent || showDashboard || activePolicy || showAuthModal) {
      if (!window.history.state || window.history.state.overlay !== true) {
        window.history.pushState({ overlay: true }, '');
      }
    }
  }, [selectedEvent, showDashboard, activePolicy, showAuthModal]);

  const handleMoodSearch = async (mood: string) => {
    if (!mood.trim()) { setAiRec(null); return; }
    try {
      const rec = await api.getRecommendations(mood, events);
      setAiRec(rec);
    } catch (err) { 
      setAiRec(null);
    }
  };

  const trendingEvents = useMemo(() => {
    // Take the first 5 events for the slideshow
    return events.slice(0, 5);
  }, [events]);

  const getRowEvents = (category: Category) => {
    return events.filter(e => {
      const matchCat = e.category === category;
      const matchSearch = searchQuery.toLowerCase() === '' || 
                         e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAi = aiRec ? aiRec.suggestedEventIds.includes(e.id) : true;
      return matchCat && (aiRec ? matchAi : matchSearch);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-netflix text-white selection:bg-brand-red selection:text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 h-16 md:h-20 flex items-center justify-between ${isScrolled ? 'bg-brand-netflix shadow-2xl translate-y-0' : 'bg-gradient-to-b from-brand-netflix/80 to-transparent translate-y-0'}`}>
        <div className="flex items-center gap-8 md:gap-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <span className="text-xl md:text-3xl font-display font-black text-brand-red tracking-tighter">MAKEMYDAYS</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-[13px] font-bold text-slate-300">
            <button className="hover:text-white transition-colors" onClick={() => setShowDashboard(false)}>Home</button>
            <button className="hover:text-white transition-colors">TV Shows</button>
            <button className="hover:text-white transition-colors">Experiences</button>
            <button className="hover:text-white transition-colors">New & Popular</button>
            <button className="hover:text-white transition-colors">My List</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className={`flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2 rounded-full transition-all group ${isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              <svg className="w-4 h-4 text-slate-400 group-focus-within:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="Search experiences..." 
                className="bg-transparent border-none outline-none text-xs w-24 md:w-48 placeholder:text-slate-600 focus:placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           {currentUser ? (
              <button onClick={() => setShowDashboard(true)} className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center font-black text-xs hover:ring-2 ring-white transition-all">
                {currentUser.name.charAt(0)}
              </button>
           ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-5 h-8 bg-brand-red text-white rounded text-[11px] font-bold uppercase tracking-wider hover:bg-brand-red/80 transition-all">Join</button>
           )}
        </div>
      </nav>

      {showDashboard ? (
        <main className="pt-24 px-6 md:px-12">
          <Dashboard events={events} bookings={globalBookings} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        </main>
      ) : (
        <main className="flex-1 pb-32">
          {/* Hero Section - Slideshow */}
          <HeroSection trendingEvents={trendingEvents} onBook={setSelectedEvent} />

          {/* Content Rows */}
          <div className="relative z-10 -mt-16 md:-mt-32 px-6 md:px-12 space-y-12">
            
            {/* Rows by Category */}
            {CATEGORIES.map(category => {
              const rowEvents = getRowEvents(category);
              if (rowEvents.length === 0) return null;
              
              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                    {category}
                    <div className="h-0.5 flex-1 bg-white/5"></div>
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide scroll-smooth">
                    {rowEvents.map((e, i) => (
                      <div key={e.id} className="min-w-[280px] md:min-w-[340px] transform transition-all duration-300 hover:scale-110 hover:z-20">
                        <EventCard event={e} index={i} onClick={setSelectedEvent} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* AI Recommendation Section */}
            <div className="py-20 flex flex-col items-center justify-center gap-10 bg-gradient-to-t from-brand-red/5 to-transparent rounded-[3rem] border border-white/5">
               <div className="text-center max-w-2xl space-y-6 px-6">
                 <h3 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase">Vibe-Check Your Journey</h3>
                 <p className="text-slate-400 text-sm md:text-base leading-relaxed">Not feeling the frequency? Tell us your current mood and let the MMD Oracle curate a unique path for your soul.</p>
                 <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Ex: 'I need a primal release' or 'Feeling zen'..." 
                        className="bg-white/5 border border-white/20 px-8 h-14 rounded-full text-sm w-full outline-none focus:border-brand-red focus:ring-4 ring-brand-red/10 transition-all"
                        value={userMood}
                        onChange={(e) => setUserMood(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch(userMood)}
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-red">
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMoodSearch(userMood)} 
                      className="px-10 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full h-14 transition-all hover:bg-brand-red hover:text-white active:scale-95 shadow-xl"
                    >
                      SYNC AURA
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </main>
      )}

      {selectedEvent && (
        <BookingModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onConfirm={async (slot, date, guestName, guestPhone) => {
            if (!currentUser) {
              setShowAuthModal(true);
              return;
            }
            const booking: Booking = { 
              id: Math.random().toString(36).slice(2, 11), 
              eventId: selectedEvent.id, 
              eventTitle: selectedEvent.title, 
              category: selectedEvent.category, 
              time: slot.time, 
              eventDate: date, 
              price: selectedEvent.price, 
              bookedAt: new Date().toISOString(), 
              userName: guestName, 
              userPhone: guestPhone, 
              hostPhone: selectedEvent.hostPhone, 
              userUid: currentUser.uid 
            };
            await api.saveBooking(booking, currentUser.uid);
            fetchData(currentUser.uid);
          }} 
        />
      )}
      
      {showAuthModal && <AuthModal onSuccess={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)} />}
      {activePolicy && <LegalModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
      
      {/* Cinematic Footer */}
      <footer className="bg-brand-netflix py-20 border-t border-white/5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-slate-500 text-xs">
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest">Connect</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:underline">Instagram</a>
              <a href="#" className="hover:underline">WhatsApp</a>
              <a href="#" className="hover:underline">Email Support</a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest">Governance</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => setActivePolicy('terms')} className="text-left hover:underline">Terms of Resonance</button>
              <button onClick={() => setActivePolicy('privacy')} className="text-left hover:underline">Privacy Calibration</button>
              <button onClick={() => setActivePolicy('refund')} className="text-left hover:underline">Refund Protocol</button>
            </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-white font-bold uppercase tracking-widest">Global</h4>
             <div className="flex flex-col gap-2">
                <span>Vibe Centers</span>
                <span>Experience Nodes</span>
                <span>Host Portal</span>
             </div>
          </div>
          <div className="space-y-6">
            <span className="text-xl md:text-2xl font-display font-black text-brand-red tracking-tighter block">MAKEMYDAYS</span>
            <p className="italic">Crafting memories beyond the digital veil.</p>
          </div>
        </div>
        <div className="mt-20 text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} Beneme Frequency Lab • All Rights Reserved
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;