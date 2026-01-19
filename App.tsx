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
    className="flex flex-col items-center gap-2 group transition-all shrink-0 snap-center pb-1"
  >
    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${active ? 'border-[#F84464] scale-105 shadow-lg' : 'border-transparent'}`}>
      <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-tight text-center transition-colors ${active ? 'text-[#F84464]' : 'text-slate-500 group-hover:text-slate-800'}`}>{label}</span>
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
    setAiRecommendation(null);
    try {
      const result = await getAIRecommendations(searchQuery, events);
      setAiRecommendation(result);
    } catch (err) {
      console.error("AI recommendation failed", err);
    } finally {
      setIsAiLoading(false);
      setIsMobileSearchOpen(false);
    }
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
                onClick={askAI}
                className="absolute right-2 top-2 bg-[#F84464] text-white text-[10px] font-black uppercase px-3 py-1.5 rounded shadow-sm"
              >
                Match
              </button>
            </div>
          </div>
        )}
      </nav>

      {lastNotification && (
        <div className="fixed top-24 right-4 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl border-l-4 border-[#F84464] animate-in slide-in-from-right duration-500 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#F84464] rounded-full p-1.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <span className="text-[11px] font-bold leading-tight">{lastNotification}</span>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 py-6 px-4 overflow-x-auto scrollbar-hide shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-6 md:gap-14">
          {categories.map((cat) => (
            <CategoryItem 
              key={cat.label} 
              label={cat.label} 
              image={cat.image} 
              active={selectedCategory === cat.label}
              onClick={() => {
                setSelectedCategory(cat.label as Category | 'All');
                setAiRecommendation(null);
                setSearchQuery('');
              }}
            />
          ))}
        </div>
      </div>

      {!searchQuery && !aiRecommendation && (
        <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
          <div className="w-full h-48 md:h-96 bg-slate-800 rounded-3xl overflow-hidden relative group shadow-2xl">
            <img src="https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=1500" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s] ease-out" alt="Banner" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-center p-8 md:p-20">
              <span className="bg-[#F84464] self-start px-3 py-1 rounded-full text-[10px] font-black text-white uppercase mb-4 tracking-widest shadow-lg">Featured Experience</span>
              <h2 className="text-white text-3xl md:text-6xl font-black mb-4 leading-none italic uppercase tracking-tighter">Elite Paintball & <br/> Soul Wellness</h2>
              <p className="text-white/80 text-xs md:text-xl max-w-xs md:max-w-xl font-medium leading-relaxed">Escape the routine. Choose between heart-pounding tactical combat or deep-tissue restoration. Exclusively on MAKEMYDAYS.</p>
              <button 
                onClick={() => setSelectedCategory('Adventure')}
                className="mt-8 self-start bg-white text-slate-900 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#F84464] hover:text-white transition-all shadow-xl active:scale-95"
              >
                Explore Adventures
              </button>
            </div>
          </div>
        </div>
      )}

      {aiRecommendation && (
        <section className="px-4 py-10 max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F84464]/5 rounded-full -mr-16 -mt-16"></div>
            <button 
              onClick={() => setAiRecommendation(null)}
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
            <p className="text-xl md:text-2xl font-black mb-10 text-slate-900 leading-tight italic max-w-3xl">"{aiRecommendation.reasoning}"</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {events.filter(e => aiRecommendation.suggestedEventIds.includes(e.id)).map(e => (
                <EventCard key={e.id} event={e} onClick={setSelectedEvent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isAiLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#F84464]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#F84464] rounded-full animate-ping"></div>
            </div>
          </div>
          <span className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Personalizing Results</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-10 border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-1">
             <span className="text-[#F84464] text-[10px] font-black uppercase tracking-[0.2em]">{selectedCategory !== 'All' ? 'Browsing Category' : 'Featured Feed'}</span>
             <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === 'All' ? 'Must-Try Experiences' : `${selectedCategory}`}
            </h2>
          </div>
          {searchQuery && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
              {filteredEvents.length} items found
            </span>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-24 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em] mb-6">No matching experiences found</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="bg-[#333545] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F84464] transition-all shadow-xl active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredEvents.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)}
          </div>
        )}
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
              {userBookings.length === 0 ? (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-10 h-10 text-slate-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Your schedule is empty</p>
                  <button 
                    onClick={() => setIsBookingHistoryOpen(false)}
                    className="mt-8 text-[#F84464] text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-[#F84464] pb-1"
                  >
                    Browse Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userBookings.map((b) => (
                    <div key={b.id} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex gap-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <img src={events.find(e => e.id === b.eventId)?.image} alt="" className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0" />
                      <div className="min-w-0 flex flex-col py-1">
                        <span className="text-[9px] font-black text-[#F84464] uppercase tracking-widest mb-1">{b.category}</span>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight truncate italic">{b.eventTitle}</h3>
                        <div className="mt-auto">
                           <p className="text-[12px] text-slate-600 font-black flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {b.time}
                           </p>
                           <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 block tracking-tighter">ID: {b.id.toUpperCase()} • {new Date(b.bookedAt).toLocaleDateString()}</span>
                        </div>
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

      <footer className="bg-[#333545] text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10 mb-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <ConnectionLogo />
                <span className="text-2xl font-black italic tracking-tighter">MAKEMYDAYS</span>
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">start your experience journey</p>
            </div>
            <div className="flex gap-8">
               <a href="#" className="text-white/40 hover:text-[#F84464] transition-colors text-[10px] font-black uppercase tracking-widest">Support</a>
               <a href="#" className="text-white/40 hover:text-[#F84464] transition-colors text-[10px] font-black uppercase tracking-widest">Privacy</a>
               <a href="#" className="text-white/40 hover:text-[#F84464] transition-colors text-[10px] font-black uppercase tracking-widest">Terms</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">© 2025 MAKEMYDAYS connect pvt. ltd.</p>
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black uppercase tracking-widest">System Operational — Vercel Edge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;