
import React, { useState, useEffect } from 'react';
import { Event, Category } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";
const FAVORITES_KEY = 'makemydays_favorites_v1';

const CATEGORY_THEMES: Record<Category, { color: string, glow: string }> = {
  "Shows": { color: "#064E3B", glow: "rgba(6,78,59,0.15)" },
  "Activity": { color: "#10B981", glow: "rgba(16,185,129,0.15)" },
  "Mindfulness": { color: "#D1FAE5", glow: "rgba(209,250,229,0.2)" },
  "Workshop": { color: "#B45309", glow: "rgba(180,83,9,0.15)" },
  "MMD Originals": { color: "#059669", glow: "rgba(5,150,105,0.15)" },
  "Therapy": { color: "#451A03", glow: "rgba(69,26,3,0.15)" }
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

  const theme = CATEGORY_THEMES[event.category] || CATEGORY_THEMES["Activity"];

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      style={{ '--glow-color': theme.glow } as any}
      className="group cursor-pointer flex flex-col h-full glass-card p-1.5 md:p-3 rounded-[1.8rem] md:rounded-[2.5rem] relative overflow-hidden"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-emerald-50 shrink-0">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110 saturate-[1.05]" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
        
        <div className="absolute inset-0 p-3 md:p-5 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div className={`bg-white/90 backdrop-blur-xl text-brand-forest text-[7px] md:text-[8px] font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/50 shadow-sm`}>
                {event.category}
              </div>
              
              <button 
                onClick={handleToggleFavorite}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center active:scale-90 ${
                  isFavorited ? `bg-brand-moss border-brand-moss text-white` : 'bg-white/30 border-white/20 text-white hover:bg-white/50'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-3 md:mt-5 px-1.5 pb-2">
        <h4 className="text-[13px] md:text-lg font-display uppercase tracking-tight leading-[1.2] text-brand-forest line-clamp-2 group-hover:text-brand-moss transition-colors duration-300">
          {event.title}
        </h4>
        
        <div className="mt-auto pt-3 md:pt-5 flex justify-between items-end">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[6px] md:text-[8px] font-black uppercase tracking-widest block">EXCHANGE</span>
            <p className="text-brand-forest text-sm md:text-xl font-black tracking-tight leading-none">₹{event.price.toLocaleString()}</p>
          </div>
          
          <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-forest rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 group-hover:bg-brand-moss transition-all duration-500">
            <svg className="w-3.5 h-3.5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
