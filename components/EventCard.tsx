
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

  // Load initial favorite state
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
      className="group cursor-pointer animate-slide-up flex flex-col gap-4 select-none glass-card p-4 rounded-[2.5rem] hover:shadow-[0_40px_80px_rgba(248,68,100,0.2)] hover:border-white/30 transition-all hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Glossy inner reflection effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
      
      <div className="relative aspect-[1/1] overflow-hidden rounded-[2rem] bg-slate-900/30 transition-all duration-500 shadow-inner">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-100" 
        />
        
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
           <div className="flex flex-col gap-2">
              <div className={`relative overflow-hidden bg-black/80 backdrop-blur-xl ${catStyle.text} text-[8px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border ${catStyle.border} shadow-lg w-fit group-hover:scale-105 transition-transform duration-500`}>
                {/* Shining sweep effect on the badge */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                <span className="relative z-10">{event.category}</span>
              </div>
              
              {isRecentlyAdded && (
                <span className="bg-brand-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg w-fit animate-pulse border border-brand-red/50">
                  Live Stream
                </span>
              )}
              {isCommunityHost && (
                <span className="bg-brand-accent text-slate-900 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg w-fit border border-white/10">
                  Explorer Stream
                </span>
              )}
           </div>

           <div className="flex items-center gap-2">
             <button 
               onClick={handleToggleFavorite}
               className={`w-8 h-8 rounded-full backdrop-blur-md border transition-all flex items-center justify-center ${
                 isFavorited 
                   ? 'bg-brand-red/30 border-brand-red/50 text-brand-red shadow-[0_0_15px_rgba(248,68,100,0.4)]' 
                   : 'bg-black/40 border-white/10 text-slate-300 hover:text-brand-red hover:bg-black/60'
               }`}
               title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
             >
               <svg 
                 viewBox="0 0 24 24" 
                 className={`w-4 h-4 transition-transform duration-300 ${isFavorited ? 'scale-110 fill-current' : 'fill-none stroke-current'}`} 
                 strokeWidth="2.5"
               >
                 <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </button>

             <button 
               onClick={handleShare}
               className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-brand-red hover:bg-black/60 transition-all group/share"
               title="Share Frequency"
             >
               <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5">
                 <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </button>
           </div>
        </div>
      </div>

      <div className="px-2 pb-2 space-y-2 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-base font-black italic uppercase tracking-tighter leading-tight text-slate-200 group-hover:text-brand-red transition-colors line-clamp-2">
            {event.title}
          </h4>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-slate-200 text-[10px] font-black uppercase tracking-widest transition-colors drop-shadow-sm">
              ₹{event.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
              Host: {displayPhone}
            </span>
          </div>
          <div className={`w-8 h-[2px] transition-all group-hover:w-12 rounded-full ${isFavorited ? 'bg-brand-red' : 'bg-white/20 group-hover:bg-brand-red'}`} />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
