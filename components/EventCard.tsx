
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
 * Deep & Electric Grounded Palette
 * Colors tuned for "Extra Deep Resonance"
 */
const COLOR_SEQUENCE = [
  { 
    bg: '#001A4D', // Extra Deep Midnight Blue
    border: '#003B8E', 
    text: 'text-white', 
    subtext: 'text-blue-50', 
    accent: 'bg-white/20'
  }, 
  { 
    bg: '#5C0000', // Extra Deep Blood Red
    border: '#940E0E', 
    text: 'text-white', 
    subtext: 'text-red-50', 
    accent: 'bg-white/20'
  },   
  { 
    bg: '#052B14', // Extra Deep Forest Pine
    border: '#0C4B25', 
    text: 'text-white', 
    subtext: 'text-emerald-50', 
    accent: 'bg-white/20'
  }, 
  { 
    bg: '#D97706', // Deep Ochre Yellow - PRESERVED AS REQUESTED
    border: '#F9AB00', 
    text: 'text-white', 
    subtext: 'text-amber-50', 
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
      className={`group cursor-pointer flex flex-col h-full p-2 md:p-3 rounded-[2.8rem] md:rounded-[3.5rem] relative overflow-hidden transition-all duration-700 hover:translate-y-[-12px] border-2 shadow-2xl`}
    >
      {/* Visual Section: Top */}
      <div className="relative aspect-[4/5] md:aspect-[3.4/5] w-full overflow-hidden rounded-[2.2rem] md:rounded-[2.8rem] bg-black/20 shrink-0 shadow-inner">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[15s] ease-out group-hover:scale-110 saturate-[1.4] contrast-[1.1] brightness-[0.95]" 
        />
        
        {/* Subtle overlay gradient for better image blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
        
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col gap-2 items-end">
          <button 
            onClick={handleToggleFavorite}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            className={`w-10 h-10 md:w-14 md:h-14 rounded-full backdrop-blur-3xl border transition-all duration-500 flex items-center justify-center active:scale-75 shadow-2xl ${
              isFavorited 
                ? 'bg-white border-white text-brand-forest' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/30'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 fill-current">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          
          {event.averageRating && (
            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg scale-90 md:scale-100 origin-right">
              <svg className="w-3.5 h-3.5 text-brand-gold fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-white text-[10px] md:text-[11px] font-black tracking-tighter">
                {event.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Narrative Section: Bottom */}
      <div className="flex flex-col flex-1 mt-4 md:mt-6 px-4 pb-6 md:px-5 md:pb-8 relative">
        <div className="mb-2 md:mb-3">
          <span className={`inline-flex items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-white/20 ${theme.accent} backdrop-blur-md shadow-sm text-white`}>
            {event.category}
          </span>
        </div>

        <h4 className={`text-[18px] sm:text-[20px] md:text-[26px] font-display uppercase tracking-tight leading-[1.15] ${theme.text} line-clamp-2 transition-all duration-500 group-hover:tracking-normal flex-1`}>
          {event.title}
        </h4>
        
        <div className={`mt-6 md:mt-8 flex items-center justify-between gap-3 opacity-90 ${theme.text} transition-all duration-300 group-hover:opacity-100`}>
          <div className={`px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-white/20 ${theme.accent} backdrop-blur-md shadow-lg flex items-center`}>
            <span className="text-base md:text-2xl font-black tracking-tighter drop-shadow-md">
              ₹{event.price.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/10 group-hover:bg-white/20 transition-all">
            <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
