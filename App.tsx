import React, { useState, useMemo } from 'react';
import { INITIAL_EVENTS } from './constants.ts';
import { Event, Category, Booking, Slot, AIRecommendation } from './types.ts';
import EventCard from './components/EventCard.tsx';
import BookingModal from './components/BookingModal.tsx';
import { getAIRecommendations } from './services/geminiService.ts';

const ConnectionLogo = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 md:w-10 md:h-10 fill-current text-[#F84464]">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="70" r="10" fillOpacity="0.4" />
  </svg>
);

const ShapeIcon: React.FC<{ type: string; color: string; active: boolean }> = ({ type, color, active }) => {
  const icons: Record<string, React.ReactNode> = {
    all: (
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4" />
    ),
    mountain: (
      <path d="M20 80 L50 20 L80 80 M40 80 L60 40 L85 80" stroke="currentColor" strokeWidth="4" fill="none" strokeLinejoin="round" />
    ),
    ball: (
      <g>
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M30 35 Q50 50 30 65 M70 35 Q50 50 70 65" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>
    ),
    boat: (
      <path d="M15 60 Q50 85 85 60 L75 50 L25 50 Z M50 15 L50 50 M30 30 L50 30" stroke="currentColor" strokeWidth="4" fill="none" />
    ),
    horse: (
      <path d="M30 70 Q30 30 50 20 Q70 20 70 40 Q70 60 50 80 M50 20 L40 10" stroke="currentColor" strokeWidth="4" fill="none" />
    ),
    racket: (
      <g>
        <ellipse cx="50" cy="40" rx="20" ry="25" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M50 65 L50 90 M40 90 L60 90" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M40 30 L60 50 M40 50 L60 30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      </g>
    ),
    bat: (
      <path d="M45 20 L55 20 L60 70 L40 70 Z M50 70 L50 90" stroke="currentColor" strokeWidth="4" fill="none" />
    )
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-500 ${active ? 'scale-110' : 'scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-100'}`} style={{ color }}>
      {icons[type] || icons.all}
    </svg>
  );
};

const CategoryItem: React.FC<{
  label: string;
  shape: string;
  color: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, shape, color, active, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 group transition-all shrink-0 snap-center pb-2 px-3"
  >
    <div className={`relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-500 ${
      active 
        ? 'scale-110' 
        : 'hover:-translate-y-2'
    }`}>
      {/* Glow Effect */}
      {active && (
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse" 
          style={{ backgroundColor: color }}
        ></div>
      )}
      
      {/* Glass Container */}
      <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500 ${
        active 
          ? 'bg-white shadow-xl rotate-3' 
          : 'bg-slate-50 border-slate-100 group-hover:border-slate-300 group-hover:bg-white'
      }`} style={{ borderColor: active ? color : undefined }}></div>
      
      {/* Icon Shape */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 z-10">
        <ShapeIcon type={shape} color={color} active={active} />
      </div>
    </div>

    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors ${
      active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
    }`}>
      {label}
    </span>
    {active && <div className="h-1 w-6 rounded-full" style={{ backgroundColor: color }}></div>}
  </button>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(() => 
    INITIAL_EVENTS.map(e => ({
      ...e,
      originalPrice: e.price,
      price: Math.round(e.price * 0.2)
    }))
  );

  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingHistoryOpen, setIsBookingHistoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleBookingConfirm = (slot: Slot) => {
    if (!selectedEvent) return;
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      category: selectedEvent.category,
      time: slot.time,
      bookedAt: new Date().toISOString()
    };
    setUserBookings([newBooking, ...userBookings]);
    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? {
      ...e, slots: e.slots.map(s => s.time === slot.time ? { ...s, availableSeats: s.availableSeats - 1 } : s)
    } : e));

    setLastNotification(`Confirmation email sent to user@makemydays.com for ${selectedEvent.title}`);
    setTimeout(() => setLastNotification(null), 5000);
  };

  const askAI = async (mood?: string) => {
    const query = mood || searchQuery;
    if (!query.trim()) return;
    
    if (mood) setSearchQuery(mood);
    setIsAiLoading(true);
    setAiRecommendation(null);
    try {
      const result = await getAIRecommendations(query, events);
      setAiRecommendation(result);
    } catch (err) {
      console.error("AI recommendation failed", err);
    } finally {
      setIsAiLoading(false);
      setIsMobileSearchOpen(false);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const categories = [
    { label: 'All', shape: 'all', color: '#F84464' },
    { label: 'Adventure', shape: 'mountain', color: '#3B82F6' },
    { label: 'Mindfulness', shape: 'bat', color: '#10B981' },
    { label: 'Creative Arts', shape: 'racket', color: '#EF4444' },
    { label: 'Team Building', shape: 'boat', color: '#06B6D4' },
    { label: 'Activity', shape: 'ball', color: '#F59E0B' },
    { label: 'Wellness', shape: 'horse', color: '#8B5CF6' }
  ];

  const quickMoods = ["Stressed", "Bored", "Energetic", "Creative", "Tired", "Adventurous"];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 pb-safe transition-colors duration-500">
      <nav className="bg-[#333545] px-4 md:px-6 py-3 sticky top-0 z-[60] shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 cursor-pointer shrink-0 group" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setSearchQuery('');
              setSelectedCategory('All');
              setAiRecommendation(null);
            }}>
              <ConnectionLogo />
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black italic tracking-tighter leading-none text-white group-hover:text-[#F84464] transition-colors">MAKEMYDAYS</span>
                <span className="hidden sm:inline text-[9px] font-bold text-[#F84464] uppercase tracking-widest opacity-80 group-hover:opacity-100 italic">start your experience journey</span>
              </div>
            </div>
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input 
                type="text" 
                placeholder="Mood search... e.g. 'I want something high energy'"
                className="w-full bg-white text-slate-800 pl-10 pr-12 py-2.5 rounded shadow-inner text-sm outline-none focus:ring-2 focus:ring-[#F84464] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="md:hidden text-white/80 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={() => setIsBookingHistoryOpen(true)} className="relative text-white/90 hover:text-[#F84464] transition-all p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              {userBookings.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#F84464] text-[9px] flex items-center justify-center rounded-full text-white font-bold ring-2 ring-[#333545] animate-pulse">{userBookings.length}</span>}
            </button>
            <button className="hidden sm:block bg-[#F84464] hover:bg-[#d63b56] px-6 py-2.5 rounded text-xs font-bold text-white transition-all shadow-md active:scale-95 transform">Sign In</button>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#333545] p-4 border-t border-white/5 animate-in slide-in-from-top duration-300 shadow-2xl">
            <div className="relative">
              <input 
                type="text" 
                placeholder="How are you feeling today?"
                className="w-full bg-white text-slate-800 px-4 py-3 rounded text-sm outline-none focus:ring-2 focus:ring-[#F84464]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                autoFocus
              />
              <button 
                onClick={() => askAI()}
                className="absolute right-2 top-2 bg-[#F84464] text-white text-[10px] font-black uppercase px-3 py-1.5 rounded shadow-sm"
              >
                Match
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="bg-white border-b border-slate-200 py-8 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-start md:justify-center gap-4 md:gap-12 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <CategoryItem 
                key={cat.label} 
                label={cat.label} 
                shape={cat.shape}
                color={cat.color}
                active={selectedCategory === cat.label}
                onClick={() => {
                  setSelectedCategory(cat.label as Category | 'All');
                  setAiRecommendation(null);
                  setSearchQuery('');
                }}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-4 mt-4 border-t border-slate-50">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0 mr-2">Quick Moods</span>
            {quickMoods.map((mood) => (
              <button 
                key={mood}
                onClick={() => askAI(mood)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border border-slate-100 ${
                  searchQuery === mood 
                    ? 'bg-[#F84464] text-white border-[#F84464] shadow-md' 
                    : 'bg-white text-slate-500 hover:border-[#F84464] hover:text-[#F84464]'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(aiRecommendation || isAiLoading) && (
        <section className="px-4 py-10 max-w-7xl mx-auto" id="ai-results">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F84464]/5 rounded-full -mr-16 -mt-16"></div>
            <button 
              onClick={() => { setAiRecommendation(null); setSearchQuery(''); }}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 text-[#F84464] mb-6">
              <div className="bg-[#F84464]/10 p-2 rounded-xl">
                <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em]">AI Mood Matcher</span>
            </div>
            
            {isAiLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                 <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#F84464]"></div>
                </div>
                <span className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Analyzing Mood Context</span>
              </div>
            ) : aiRecommendation && (
              <>
                <p className="text-xl md:text-2xl font-black mb-10 text-slate-900 leading-tight italic max-w-3xl">"{aiRecommendation.reasoning}"</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {events.filter(e => aiRecommendation.suggestedEventIds.includes(e.id)).map(e => (
                    <EventCard key={e.id} event={e} onClick={setSelectedEvent} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-10 border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-1">
             <span className="text-[#F84464] text-[10px] font-black uppercase tracking-[0.2em]">{selectedCategory !== 'All' ? 'Browsing Category' : 'Featured Feed'}</span>
             <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {searchQuery && !aiRecommendation ? `Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Must-Try Experiences' : `${selectedCategory}`}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredEvents.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)}
        </div>
      </main>

      {isBookingHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsBookingHistoryOpen(false)}></div>
          <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="bg-[#333545] p-6 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <ConnectionLogo />
                <h2 className="text-xl font-black italic tracking-tighter">ACCOUNT ACTIVITY</h2>
              </div>
              <button onClick={() => setIsBookingHistoryOpen(false)} className="hover:rotate-90 transition-all p-2 bg-white/5 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {userBookings.map((b) => (
                <div key={b.id} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex gap-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mb-4">
                  <img src={events.find(e => e.id === b.eventId)?.image} alt="" className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0" />
                  <div className="min-w-0 flex flex-col py-1">
                    <span className="text-[9px] font-black text-[#F84464] uppercase tracking-widest mb-1">{b.category}</span>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate italic">{b.eventTitle}</h3>
                    <div className="mt-auto">
                       <p className="text-[12px] text-slate-600 font-black flex items-center gap-1.5">{b.time}</p>
                       <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 block">ID: {b.id.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <BookingModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onConfirm={handleBookingConfirm} 
        />
      )}
    </div>
  );
};

export default App;