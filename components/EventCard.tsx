import React, { useState, useEffect } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  index: number;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";
const FAVORITES_KEY = 'makemydays_favorites_v1';

/**
 * High-Energy Electric Palette
 */
const COLOR_SEQUENCE = [
  { 
    bg: '#0EA5E9', 
    border: '#38BDF8', 
    text: 'text-white', 
    subtext: 'text-blue-50', 
    accent: 'bg-white/30'
  }, 
  { 
    bg: '#FF0000', 
    border: '#FF4D4D', 
    text: 'text-white', 
    subtext: 'text-red-50', 
    accent: 'bg-white/30'
  },   
  { 
    bg: '#22C55E', 
    border: '#4ADE80', 
    text: 'text-white', 
    subtext: 'text-emerald-50', 
    accent: 'bg-white/30'
  }, 
  { 
    bg: '#FFFF00', 
    border: '#EAB308', 
    text: 'text-slate-900', 
    subtext: 'text-slate-800', 
    accent: 'bg-black/10'
  }    
];

const EventCard: React.FC<EventCardProps> = ({ event, index, onClick, id }) => {
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

  const theme = COLOR_SEQUENCE[index % 4];

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      style={{ 
        backgroundColor: theme.bg,
        borderColor: theme.border
      }}
      className={`group cursor-pointer flex flex-col h-full p-1.5 md:p-2.5 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden transition-all duration-700 hover:translate-y-[-8px] border-2 shadow-xl`}
    >
      <div className="relative aspect-[4/5] md:aspect-[3.5/5] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-black/10 shrink-0">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105 saturate-[1.2] brightness-[0.9]" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-30" />
        
        <div className="absolute top-3 right-3 md:top-5 md:right-5 flex flex-col gap-2 items-end">
          <button 
            onClick={handleToggleFavorite}
            className={`w-8 h-8 md:w-11 md:h-11 rounded-full backdrop-blur-3xl border transition-all duration-500 flex items-center justify-center active:scale-75 ${
              isFavorited 
                ? 'bg-white border-white text-slate-900' 
                : 'bg-white/10 border-white/30 text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-current">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          
          {event.averageRating && (
            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 border border-white/5 shadow-sm scale-75 md:scale-90 origin-right">
              <svg className="w-2.5 h-2.5 text-brand-gold fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-white text-[8px] md:text-[9px] font-black">
                {event.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-2.5 md:mt-4 px-2 pb-4 md:px-3 md:pb-6 relative">
        <div className="mb-1 md:mb-1.5">
          <span className={`inline-flex items-center text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border border-black/5 ${theme.accent} backdrop-blur-md ${theme.text}`}>
            {event.category}
          </span>
        </div>

        <h4 className={`text-[13px] sm:text-[14px] md:text-[16px] font-display uppercase tracking-tight leading-[1.15] ${theme.text} line-clamp-2 transition-all duration-500 flex-1`}>
          {event.title}
        </h4>
        
        <div className={`mt-3 md:mt-4 flex items-center justify-between gap-2 opacity-90 ${theme.text}`}>
          <div className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-lg border border-black/5 ${theme.accent} backdrop-blur-sm flex items-center`}>
            <span className="text-[11px] md:text-[14px] font-black tracking-tighter">
              ₹{event.price.toLocaleString()}
            </span>
          </div>
          
          <div className={`flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full border border-black/5 ${theme.accent} transition-all`}>
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;