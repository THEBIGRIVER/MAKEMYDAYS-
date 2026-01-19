import React, { useState, useMemo } from 'react';
import { INITIAL_EVENTS } from './constants';
import { Event, Category, Booking, Slot, AIRecommendation } from './types';
import EventCard from './components/EventCard';
import BookingModal from './components/BookingModal';
import { getAIRecommendations } from './services/geminiService';

const ConnectionLogo = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 md:w-10 md:h-10 fill-current text-meadow-500">
    <circle cx="30" cy="50" r="10" />
    <circle cx="70" cy="50" r="10" />
    <circle cx="50" cy="30" r="10" />
    <path d="M30 50 Q 50 10 70 50 Q 50 90 30 50" fill="none" stroke="currentColor" strokeWidth="4" />
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
    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-4 transition-all ${active ? 'border-meadow-500 scale-105 md:scale-110 shadow-lg' : 'border-white'}`}>
      <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
    </div>
    <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest text-center ${active ? 'text-meadow-700' : 'text-forest/40'}`}>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [mood, setMood] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingHistoryOpen, setIsBookingHistoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const filteredEvents = useMemo(() => 
    events.filter(e => selectedCategory === 'All' || e.category === selectedCategory),
  [events, selectedCategory]);

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
  };

  const askAI = async (customMood?: string) => {
    const searchMood = customMood || mood;
    if (!searchMood.trim()) return;
    setIsAiLoading(true);
    setIsMobileSearchOpen(false);
    const result = await getAIRecommendations(searchMood, events);
    setAiRecommendation(result);
    setIsAiLoading(false);
    setTimeout(() => {
      document.getElementById('ai-recommendations')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const categories = [
    { label: 'All', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=200' },
    { label: 'Adventure', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Mindfulness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Creative Arts', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=200' },
    { label: 'Team Building', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=200' },
    { label: 'Activity', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=200' },
    { label: 'Therapy', image: 'https://images.unsplash.com/photo-1519834125788-29b4ad151dfd?auto=format&fit=crop&q=80&w=200' }
  ];

  const moodChips = [
    { label: 'Stressed', emoji: '🌿', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Energetic', emoji: '☀️', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Adventurous', emoji: '⛰️', color: 'bg-stone-100 text-stone-700 border-stone-200' },
    { label: 'Creative', emoji: '🌸', color: 'bg-pink-50 text-pink-700 border-pink-100' }
  ];

  return (
    <div className="min-h-screen bg-linen text-forest pb-safe">
      <nav className="bg-forest px-4 md:px-6 py-2 md:py-4 sticky top-0 z-[60] shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ConnectionLogo />
              <div className="flex flex-col">
                <span className="text-xl md:text-3xl font-black italic tracking-tighter leading-none text-white">MAKEMYDAYS</span>
                <span className="hidden sm:inline text-[8px] md:text-[10px] font-black text-meadow-400 uppercase tracking-[0.3em]">Earth & Experience</span>
              </div>
            </div>
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="How can we help you connect today?"
                  className="w-full bg-white/10 text-white placeholder:text-white/40 px-10 py-3 rounded-full text-sm outline-none border border-white/10 backdrop-blur-md focus:bg-white/20 transition-all"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAI()}
                />
                <svg className="absolute left-4 top-3.5 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-8">
            <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="md:hidden p-2 text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={() => setIsBookingHistoryOpen(true)} className="flex items-center gap-2 text-sm font-black text-white/90 hover:text-meadow-400 transition-colors">
              <div className="relative">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                {userBookings.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-meadow-500 text-[10px] flex items-center justify-center rounded-full text-white font-black border-2 border-forest">{userBookings.length}</span>}
              </div>
            </button>
            <button className="hidden sm:block bg-meadow-500 hover:bg-meadow-400 px-6 py-2.5 rounded-full text-sm font-black text-white shadow-xl transition-all">SIGN IN</button>
          </div>
        </div>

        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-forest p-4 border-t border-white/5 shadow-2xl animate-in slide-in-from-top duration-300">
            <input 
              type="text" 
              placeholder="What's your current energy like?"
              className="w-full bg-white/10 text-white px-4 py-4 rounded-2xl text-sm outline-none border border-white/10 mb-4"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAI()}
              autoFocus
            />
            <button onClick={() => askAI()} className="w-full bg-meadow-500 text-white py-3 rounded-xl font-black text-sm tracking-widest">FIND EXPERIENCES</button>
          </div>
        )}
      </nav>

      <div className="bg-white/50 backdrop-blur-sm border-b border-forest/5 py-6 px-4 md:px-6 overflow-x-auto scrollbar-hide snap-x">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-8 md:gap-20">
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-12">
        <div className="w-full h-72 md:h-[500px] bg-forest rounded-[2rem] md:rounded-[3rem] overflow-hidden relative group shadow-2xl">
          <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1500" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] opacity-80" alt="Field" />
          <div className="absolute inset-0 hero-gradient flex flex-col justify-end p-8 md:p-20">
            <span className="bg-meadow-500 self-start px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-white uppercase mb-4 tracking-[0.2em] shadow-lg">NATURAL SELECTION</span>
            <h2 className="text-white text-4xl md:text-7xl font-black mb-4 leading-[0.9] tracking-tighter italic font-serif">Deep Meadows & <br/> Higher Energy.</h2>
            <p className="text-white/80 text-sm md:text-2xl max-w-2xl font-medium mb-8 md:mb-12 leading-relaxed">Book a soul-stirring therapy session or high-intensity wilderness activity. Rooted in nature, fueled by passion.</p>
            <div className="flex flex-wrap gap-3">
               {moodChips.map(chip => (
                 <button 
                  key={chip.label}
                  onClick={() => askAI(chip.label)}
                  className={`${chip.color} border backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black transition-all hover:scale-105 flex items-center gap-3 shadow-sm`}
                 >
                   <span className="text-lg">{chip.emoji}</span>
                   <span>I'm {chip.label}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div id="ai-recommendations">
      {aiRecommendation && (
        <section className="px-4 md:px-6 py-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
          <div className="bg-white p-8 md:p-16 rounded-[2.5rem] border-t-8 border-meadow-500 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-meadow-100 rounded-full blur-3xl opacity-50"></div>
            <div className="flex items-center gap-4 text-meadow-700 mb-8">
              <div className="bg-meadow-100 p-3 rounded-2xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/></svg>
              </div>
              <span className="font-black text-sm uppercase tracking-[0.3em]">AI NATURE GUIDE</span>
            </div>
            <p className="text-2xl md:text-4xl font-black mb-12 text-forest leading-[1.1] tracking-tight font-serif italic">"{aiRecommendation.reasoning}"</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
              {events.filter(e => aiRecommendation.suggestedEventIds.includes(e.id)).map(e => (
                <EventCard key={e.id} event={e} onClick={setSelectedEvent} />
              ))}
            </div>
          </div>
        </section>
      )}
      </div>

      {isAiLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 border-8 border-meadow-100 border-t-meadow-500 rounded-full animate-spin"></div>
          <span className="mt-8 text-xs font-black text-forest/30 uppercase tracking-[0.4em]">Tuning into your frequency...</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="flex items-end justify-between mb-12 border-b-2 border-forest/5 pb-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-forest tracking-tighter font-serif italic">
              {selectedCategory === 'All' ? 'Our Seasonal Picks' : `${selectedCategory}`}
            </h2>
            <p className="text-forest/40 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Discover curated connections</p>
          </div>
          <button className="bg-forest text-white px-6 py-2 rounded-full text-xs font-black tracking-widest hover:bg-meadow-900 transition-all">SEE ALL</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-12">
          {filteredEvents.map(event => <EventCard key={event.id} event={event} onClick={setSelectedEvent} />)}
        </div>
      </main>

      {isBookingHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-forest/40 backdrop-blur-md" onClick={() => setIsBookingHistoryOpen(false)}></div>
          <div className="relative w-full md:max-w-md bg-linen h-full shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="bg-forest p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic font-serif">MAKEMYDAYS</h2>
                <p className="text-[10px] uppercase opacity-40 font-black tracking-[0.3em] mt-1">Transaction Journal</p>
              </div>
              <button onClick={() => setIsBookingHistoryOpen(false)} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 md:p-10 overflow-y-auto h-[calc(100%-120px)]">
              {userBookings.length === 0 ? (
                <div className="py-32 text-center opacity-20">
                  <svg className="w-24 h-24 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <p className="font-black text-xs uppercase tracking-widest">No entries in your journal</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {userBookings.map((b) => (
                    <div key={b.id} className="group relative bg-white p-6 rounded-[2rem] border border-forest/5 shadow-sm hover:shadow-xl transition-all">
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                          <img src={events.find(e => e.id === b.eventId)?.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-meadow-600 uppercase tracking-widest">{b.category}</span>
                          <h3 className="font-black text-forest leading-tight mt-1 truncate font-serif italic">{b.eventTitle}</h3>
                          <div className="flex items-center gap-2 text-forest/40 font-bold text-[12px] mt-2">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                             {b.time}
                          </div>
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

      <footer className="bg-forest text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-md">
              <div className="flex items-center gap-4 mb-8">
                <ConnectionLogo />
                <div>
                  <span className="text-4xl font-black italic font-serif leading-none">MAKEMYDAYS</span>
                  <p className="text-meadow-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Grounded & Growing</p>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                Our philosophy is simple: return to the roots. We connect urban energy with natural stillness through high-impact, unconventional experiences.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-widest text-white/20 mb-8">Navigation</h4>
                <div className="flex flex-col gap-4 text-sm font-bold text-white/60">
                  <a href="#" className="hover:text-meadow-400 transition-all">The Wilds</a>
                  <a href="#" className="hover:text-meadow-400 transition-all">Stillness</a>
                  <a href="#" className="hover:text-meadow-400 transition-all">Workshops</a>
                </div>
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-widest text-white/20 mb-8">Legal</h4>
                <div className="flex flex-col gap-4 text-sm font-bold text-white/60">
                  <a href="#" className="hover:text-meadow-400 transition-all">Ethos</a>
                  <a href="#" className="hover:text-meadow-400 transition-all">Privacy</a>
                  <a href="#" className="hover:text-meadow-400 transition-all">Terms</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">© 2025 MAKEMYDAYS NATURE LABS</span>
            <div className="flex gap-6">
              {['ig', 'tw', 'fb'].map(s => <div key={s} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-meadow-500 hover:scale-110 transition-all cursor-pointer text-xs font-black uppercase">{s}</div>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;