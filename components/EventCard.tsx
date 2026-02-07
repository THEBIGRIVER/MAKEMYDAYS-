
import React, { useState, useMemo, useEffect } from 'react';
import { Event, Category } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";
const DEFAULT_HOST_PHONE = '917686924919';
const FAVORITES_KEY = 'makemydays_favorites_v1';

const CATEGORY_STYLES: Record<Category, { border: string, text: string, glow: string }> = {
  "Shows": { border: "border-brand-red/40", text: "text-brand-red", glow: "shadow-brand-red/20" },
  "Activity": { border: "border-brand-lime/40", text: "text-brand-lime", glow: "shadow-brand-lime/20" },
  "Mindfulness": { border: "border-brand-purple/40", text: "text-brand-purple", glow: "shadow-brand-purple/20" },
  "Workshop": { border: "border-brand-royal/40", text: "text-brand-royal", glow: "shadow-brand-royal/20" },
  "MMD Originals": { border: "border-brand-accent/40", text: "text-brand-accent", glow: "shadow-brand-accent/20" }
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick, id }) => {
  const [imgSrc, setImgSrc] = useState(event.image);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    setIsFavorited(favorites.includes(event.id));
  }, [event.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    let newFavorites: string[];
    
    if (isFavorited) {
      newFavorites = favorites.filter((favId: string) => favId !== event.id);
    } else {
      newFavorites = [...favorites, event.id];
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  const displayPhone = event.hostPhone 
    ? `+91 ${event.hostPhone.slice(0, 2)}***${event.hostPhone.slice(-4)}`
    : 'System Host';

  const isCommunityHost = event.hostPhone !== DEFAULT_HOST_PHONE;

  const isRecentlyAdded = useMemo(() => {
    if (!event.createdAt) return event.id.startsWith('user-event-'); 
    const createdTime = new Date(event.createdAt).getTime();
    const now = new Date().getTime();
    return (now - createdTime) < (24 * 60 * 60 * 1000); 
  }, [event.createdAt, event.id]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: event.title,
      text: `Check out this experience: ${event.title} - ${event.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Resonance link copied to clipboard!');
      }
    } catch (err) {
      console.debug('Sharing disrupted:', err);
    }
  };

  const catStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES["Activity"];

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      className="group cursor-pointer animate-slide-up flex flex-col h-full glass-card p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] hover:shadow-[0_40px_80px_rgba(248,68,100,0.15)] hover:border-brand-red/30 transition-all hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Glossy inner reflection effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
      
      {/* Top Media Section */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-slate-900/30 shadow-inner shrink-0">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-100" 
        />
        
        {/* Dynamic Overlays */}
        <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-between">
           <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5 max-w-[70%]">
                <div className={`relative overflow-hidden bg-black/80 backdrop-blur-xl ${catStyle.text} text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full border ${catStyle.border} shadow-lg w-fit transition-transform duration-500`}>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                  <span className="relative z-10">{event.category}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {isRecentlyAdded && (
                    <span className="bg-brand-red text-white text-[6px] md:text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-lg border border-brand-red/50 animate-pulse">
                      Live
                    </span>
                  )}
                  {isCommunityHost && (
                    <span className="bg-brand-accent text-slate-900 text-[6px] md:text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-lg border border-white/10">
                      Explorer
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleToggleFavorite}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full backdrop-blur-md border transition-all flex items-center justify-center ${
                    isFavorited 
                      ? 'bg-brand-red/30 border-brand-red/50 text-brand-red shadow-[0_0_15px_rgba(248,68,100,0.4)]' 
                      : 'bg-black/40 border-white/10 text-slate-300 hover:text-brand-red'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${isFavorited ? 'scale-110 fill-current' : 'fill-none stroke-current'}`} strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button 
                  onClick={handleShare}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-brand-red transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 fill-none stroke-current" strokeWidth="2.5">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 mt-3 md:mt-4 px-1 pb-1">
        <h4 className="text-sm md:text-base font-black italic uppercase tracking-tighter leading-tight text-slate-200 light:text-slate-900 group-hover:text-brand-red transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] theme-text">
          {event.title}
        </h4>
        
        <div className="mt-auto pt-2 md:pt-3">
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <div className="space-y-0.5">
              <div className="text-slate-100 light:text-slate-900 text-[11px] md:text-[13px] font-black uppercase tracking-widest flex items-baseline gap-1 theme-text">
                <span className="text-[8px] md:text-[9px] text-slate-500">₹</span>
                {event.price.toLocaleString('en-IN')}
              </div>
              <div className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[120px]">
                {displayPhone}
              </div>
            </div>
            
            <div className="relative flex items-center justify-end h-4 w-10 md:w-14">
              <div className={`absolute right-0 h-[2px] transition-all duration-500 group-hover:w-full rounded-full ${isFavorited ? 'w-full bg-brand-red' : 'w-6 bg-white/20 light:bg-slate-200 group-hover:bg-brand-red'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
