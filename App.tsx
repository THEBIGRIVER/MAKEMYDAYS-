import React, { useState, useMemo } from 'react';
import { INITIAL_EVENTS } from './constants';
import { Event, Category, Booking, Slot, AIRecommendation } from './types';
import EventCard from './components/EventCard';
import BookingModal from './components/BookingModal';
import { getAIRecommendations } from './services/geminiService';

const ConnectionLogo = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 md:w-10 md:h-10 fill-current text-[#F84464]">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="70" r="10" fillOpacity="0.4" />
  </svg>
);

const CategoryItem: React.FC<{
  label: string;
  image: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, image, active, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group transition-all shrink-0 snap-center"
  >
    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all ${active ? 'border-[#F84464] scale-105 shadow-lg' : 'border-transparent'}`}>
      <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
    </div>
    <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-tight text-center ${active ? 'text-[#F84464]' : 'text-slate-600'}`}>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
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

  const askAI = async () => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    // Use the search query as the "mood" for AI recommendations
    const result = await getAIRecommendations(searchQuery, events);
    setAiRecommendation(result);
    setIsAiLoading(false);
    setIsMobileSearchOpen(false);
  };

  const categories = [
    { label: 'All', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=200' },
    { label: 'Adventure', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Mindfulness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Creative Arts', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Team Building', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=200' },
    { label: 'Activity', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=200' },
    { label: 'Wellness', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=200' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 pb-safe">
      <nav className="bg-[#333545] px-4 md:px-6 py-3 sticky top-0 z-[60] shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setSearchQuery('');
              setSelectedCategory('All');
              setAiRecommendation(null);
            }}>
              <ConnectionLogo />
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black italic tracking-tighter leading-none text-white">MAKEMYDAYS</span>
                <span className="hidden sm:inline text-[9px] font-bold text-[#F84464] uppercase tracking-widest">Connect & Wellness</span>
              </div>
            </div>
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input 
                type="text" 
                placeholder="Search events or ask AI for mood recommendations..."
                className="w-full bg-white text-slate-800 pl-10 pr-12 py-2 rounded text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#F84464]/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-300 hover:text-slate-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="md:hidden text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={() => setIsBookingHistoryOpen(true)} className="relative text-white/90 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              {userBookings.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F84464] text-[10px] flex items-center justify-center rounded-full text-white font-bold animate-in zoom-in">{userBookings.length}</span>}
            </button>
            <button className="hidden sm:block bg-[#F84464] hover:bg-[#d63b56] px-5 py-2 rounded text-sm font-bold text-white transition-all shadow-lg active:scale-95">Sign In</button>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#333545] p-4 border-t border-white/10 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <input 
                type="text" 
                placeholder="How are you feeling?"
                className="w-full bg-white text-slate-800 px-4 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-[#F84464]/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                autoFocus
              />
              <button 
                onClick={askAI}
                className="absolute right-2 top-1.5 bg-[#F84464] text-white text-[10px] font-bold px-2 py-1 rounded"
              >
                Ask AI
              </button>
            </div>
          </div>
        )}
      </nav>

      {lastNotification && (
        <div className="fixed top-20 right-4 z-[100] bg-slate-800 text-white px-6 py-3 rounded-lg shadow-2xl border-l-4 border-[#F84464] animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#F84464]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span className="text-xs font-bold">{lastNotification}</span>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 py-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-8 md:gap-16">
          {categories.map((cat) => (
            <CategoryItem 
              key={cat.label} 
              label={cat.label} 
              image={cat.image} 
              active={selectedCategory === cat.label}
              onClick={() => setSelectedCategory(cat.label as Category | 'All')}
            />
          ))}
        </div>
      </div>

      {!searchQuery && !aiRecommendation && (
        <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-8">
          <div className="w-full h-44 md:h-80 bg-slate-800 rounded-xl overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=1500" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Banner" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6 md:p-16">
              <span className="bg-[#F84464] self-start px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase mb-2 tracking-tighter">Recommended</span>
              <h2 className="text-white text-2xl md:text-5xl font-black mb-2 leading-tight">Elite Paintball & <br/> Soul Wellness</h2>
              <p className="text-white/80 text-[10px] md:text-lg max-w-xs md:max-w-md font-medium">Explore high-energy combat or restorative wellness. Your choice.</p>
            </div>
          </div>
        </div>
      )}

      {aiRecommendation && (
        <section className="px-4 py-8 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl border-l-4 border-[#F84464] shadow-sm relative">
            <button 
              onClick={() => setAiRecommendation(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-2 text-[#F84464] mb-4">
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
              <span className="font-bold text-xs uppercase tracking-wider">AI Personality Match</span>
            </div>
            <p className="text-lg font-bold mb-6 text-slate-800 leading-snug italic">"{aiRecommendation.reasoning}"</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {events.filter(e => aiRecommendation.suggestedEventIds.includes(e.id)).map(e => (
                <EventCard key={e.id} event={e} onClick={setSelectedEvent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isAiLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F84464]"></div>
          <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating Match...</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
            {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory === 'All' ? 'Discover Experiences' : `${selectedCategory}`}
          </h2>
          {searchQuery && (
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {filteredEvents.length} items found
            </span>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching experiences found</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-[#F84464] text-[10px] font-bold uppercase tracking-widest border-b border-[#F84464]"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8 animate-in fade-in duration-500">
            {filteredEvents.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)}
          </div>
        )}
      </main>

      {isBookingHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsBookingHistoryOpen(false)}></div>
          <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-[#333545] p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ConnectionLogo />
                <h2 className="text-xl font-bold italic tracking-tighter">MY BOOKINGS</h2>
              </div>
              <button onClick={() => setIsBookingHistoryOpen(false)} className="hover:rotate-90 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
              {userBookings.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No experiences booked yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-lg border border-slate-100 flex gap-4 hover:shadow-md transition-shadow">
                      <img src={events.find(e => e.id === b.eventId)?.image} alt="" className="w-14 h-20 object-cover rounded shadow-sm shrink-0" />
                      <div className="min-w-0 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-tighter">{b.category}</span>
                        <h3 className="font-bold text-slate-900 leading-tight truncate italic">{b.eventTitle}</h3>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">{b.time}</p>
                        <span className="text-[9px] text-slate-300 uppercase mt-auto">Booked on {new Date(b.bookedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      <footer className="bg-[#333545] text-white py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <ConnectionLogo />
            <span className="text-base font-black italic tracking-tighter">MAKEMYDAYS</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
            © 2025 MAKEMYDAYS connect
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;