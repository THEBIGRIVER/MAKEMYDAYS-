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

const HeroBillboard = ({ trendingEvents, onBook }: { trendingEvents: Event[], onBook: (e: Event) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingEvents.length);
      setIsTransitioning(false);
    }, 500);
  }, [trendingEvents.length]);

  useEffect(() => {
    const timer = setInterval(handleNext, 10000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const activeEvent = trendingEvents[currentIndex];
  if (!activeEvent) return null;

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-brand-navy">
      {/* Cinematic Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img 
          src={activeEvent.image} 
          className="w-full h-full object-cover object-center" 
          alt={activeEvent.title}
        />
      </div>
      
      {/* Prime Gradients */}
      <div className="absolute inset-0 prime-hero-gradient hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 md:via-transparent to-transparent" />
      
      {/* Billboard Content */}
      <div className={`absolute bottom-[15%] md:top-[20%] left-[5%] md:left-[6%] max-w-[90%] md:max-w-[40%] space-y-4 md:space-y-6 transition-all duration-700 z-10 ${isTransitioning ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-3">
          <span className="bg-brand-prime text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm">Included with MMD</span>
          <span className="text-slate-400 text-xs font-bold">{activeEvent.category}</span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-bold leading-tight text-white drop-shadow-xl">
          {activeEvent.title}
        </h1>
        
        <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed line-clamp-3">
          {activeEvent.description}
        </p>
        
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => onBook(activeEvent)}
            className="px-8 md:px-12 h-12 md:h-14 bg-brand-prime text-white rounded-md font-bold text-base md:text-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
            Book Now
          </button>
          <button className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md text-white rounded-md font-bold flex items-center justify-center hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 right-[6%] flex items-center gap-1.5 z-20">
        {trendingEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 transition-all rounded-full ${currentIndex === idx ? 'w-8 bg-brand-prime' : 'w-4 bg-white/20'}`}
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

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchData]);

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
      return matchCat && (aiRec ? matchAi : matchSearch);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-navy pb-[72px] md:pb-0">
      {/* Top Nav (Prime Video Style) */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 h-14 md:h-20 flex items-center justify-between ${isScrolled ? 'bg-brand-navy shadow-xl' : 'bg-gradient-to-b from-brand-navy/90 to-transparent'}`}>
        <div className="flex items-center gap-4 md:gap-10">
          <span className="text-xl md:text-3xl font-display font-black text-white tracking-tighter cursor-pointer" onClick={() => { setShowDashboard(false); window.scrollTo({top:0, behavior:'smooth'}); }}>
            MAKE<span className="text-brand-prime">MYDAYS</span>
          </span>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-300">
            <button className={`${!showDashboard ? 'text-white border-b-2 border-brand-prime' : 'hover:text-white'} h-20 flex items-center transition-all`} onClick={() => setShowDashboard(false)}>Home</button>
            <button className="hover:text-white h-20 flex items-center">Store</button>
            <button className="hover:text-white h-20 flex items-center">Live TV</button>
            <button className="hover:text-white h-20 flex items-center">Categories</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-md focus-within:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-48 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           {currentUser ? (
              <button onClick={() => openDashboardTab('settings')} className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs hover:border-brand-prime transition-all">
                {currentUser.name.charAt(0)}
              </button>
           ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-6 h-10 bg-brand-prime text-white rounded-md text-sm font-bold active:scale-95 transition-all">Join</button>
           )}
        </div>
      </nav>

      {showDashboard ? (
        <main className="pt-24 px-6 md:px-12 animate-fade-in">
          <Dashboard initialTab={dashboardTab} events={events} bookings={globalBookings} currentUser={currentUser} onRefreshEvents={() => fetchData(currentUser?.uid)} onOpenPolicy={setActivePolicy} />
        </main>
      ) : (
        <main className="flex-1 animate-fade-in">
          <HeroBillboard trendingEvents={events.slice(0,5)} onBook={setSelectedEvent} />

          <div className="relative z-10 px-6 md:px-12 space-y-12 md:space-y-14 -mt-10 md:mt-0 pb-20">
            {CATEGORIES.map(category => {
              const rowEvents = getRowEvents(category);
              if (rowEvents.length === 0) return null;
              
              return (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-4">
                    {category}
                    <span className="text-brand-prime text-sm font-black uppercase tracking-widest ml-auto cursor-pointer hover:underline">See more</span>
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide snap-x">
                    {rowEvents.map((e) => (
                      <div key={e.id} className="min-w-[280px] md:min-w-[400px] snap-center">
                        <EventCard event={e} onClick={setSelectedEvent} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* AI Mood Footer */}
            <div className="py-16 md:py-24 flex flex-col items-center justify-center bg-brand-slate/40 rounded-xl border border-white/5 px-6">
               <div className="text-center max-w-2xl space-y-6">
                 <h3 className="text-2xl md:text-5xl font-bold tracking-tight text-white">Not sure what to watch?</h3>
                 <p className="text-slate-400 text-sm md:text-lg">Tell us your current mood and we'll curate the perfect experience.</p>
                 <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <input 
                      type="text" placeholder="I feel adventurous..." 
                      className="bg-brand-navy border border-white/10 px-8 h-14 rounded-md text-lg w-full md:w-[400px] outline-none focus:border-brand-prime transition-all"
                      value={userMood}
                      onChange={(e) => setUserMood(e.target.value)}
                    />
                    <button onClick={() => handleMoodSearch(userMood)} className="h-14 bg-brand-prime text-white px-10 rounded-md font-bold text-lg active:scale-95 shadow-xl transition-all">SYNC</button>
                 </div>
               </div>
            </div>
          </div>
        </main>
      )}

      {/* Mobile Sticky Footer */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-brand-navy/95 backdrop-blur-xl border-t border-white/10 h-16 flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]">
        <button onClick={() => setShowDashboard(false)} className={`flex flex-col items-center gap-1 ${!showDashboard ? 'text-brand-prime' : 'text-slate-500'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
          <span className="text-[10px] font-bold uppercase">Search</span>
        </button>
        <button onClick={() => openDashboardTab('hosting')} className={`flex flex-col items-center gap-1 ${showDashboard && dashboardTab === 'hosting' ? 'text-brand-prime' : 'text-slate-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5"/></svg>
          <span className="text-[10px] font-bold uppercase">Host</span>
        </button>
        <button onClick={() => openDashboardTab('bookings')} className={`flex flex-col items-center gap-1 ${showDashboard && dashboardTab === 'bookings' ? 'text-brand-prime' : 'text-slate-500'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span className="text-[10px] font-bold uppercase">My Stuff</span>
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