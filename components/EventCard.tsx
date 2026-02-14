import React, { useState } from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";

const EventCard: React.FC<EventCardProps> = ({ event, onClick, isFavorite, onToggleFavorite, id }) => {
  const [imgSrc, setImgSrc] = useState(event.image);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(event.id);
  };

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      className="group cursor-pointer relative aspect-video w-full overflow-hidden rounded-xl transition-all duration-500 bg-white/5 backdrop-blur-2xl border border-white/10 hover:z-30 md:hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:ring-2 hover:ring-brand-prime/50 hover:bg-white/10"
    >
      <img 
        src={imgSrc} 
        alt={event.title} 
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
      />
      
      {/* Price Badge - Top Left */}
      <div className="absolute top-3 left-3 z-40 transition-all duration-500 group-hover:scale-105 origin-top-left flex items-center gap-2">
        <div className="bg-[#0F171E]/60 backdrop-blur-2xl border border-white/10 px-3 py-1 rounded-lg shadow-2xl flex items-center group-hover:bg-brand-prime group-hover:border-brand-prime transition-all duration-300">
          <span className="text-xs font-bold text-brand-beige tracking-tight">₹{event.price}</span>
        </div>
      </div>

      {/* Control Actions - Top Right */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2 transition-all duration-500">
        <div className="bg-brand-navy/70 backdrop-blur-xl border border-brand-prime/30 px-3 py-1 rounded-full shadow-2xl flex items-center gap-2 group-hover:border-brand-prime group-hover:bg-brand-prime/10 transition-all duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-prime animate-pulse shadow-[0_0_8px_rgba(255,153,51,0.8)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-prime whitespace-nowrap">
            {event.category}
          </span>
        </div>
      </div>

      {/* Desktop Hover Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-500 p-5 flex flex-col justify-end">
        <div className="translate-y-6 md:group-hover:translate-y-0 transition-transform duration-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="bg-brand-prime text-brand-beige text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider">Prime</span>
               {event.averageRating && (
                 <span className="text-brand-beige text-[11px] font-bold flex items-center gap-1">
                   <svg className="w-3 h-3 text-brand-prime fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                   {event.averageRating.toFixed(1)}
                   <span className="text-slate-500 font-medium ml-0.5">({event.totalRatings || 0})</span>
                 </span>
               )}
            </div>
            
            <button 
              onClick={handleToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-red-500 text-brand-beige shadow-lg' : 'bg-white/10 text-brand-beige hover:bg-white/20 backdrop-blur-2xl'}`}
            >
              <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <h4 className="text-brand-beige text-base font-bold leading-tight group-hover:text-brand-prime transition-colors">
            {event.title}
          </h4>
          
          <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-300">
             <span className="uppercase tracking-[0.2em]">{event.category}</span>
             <span className="w-1 h-1 rounded-full bg-slate-500"></span>
             <span>Experience</span>
          </div>
        </div>
      </div>

      {/* Mobile persistent UI */}
      <div className="md:hidden absolute bottom-3 left-3 right-3 flex justify-between items-end z-40">
         <div className="space-y-1.5">
           <div className="flex items-center gap-2">
              <span className="bg-black/60 backdrop-blur-2xl text-brand-beige text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10 block w-fit">
                {event.title}
              </span>
              {event.averageRating && (
                <span className="bg-black/60 backdrop-blur-2xl text-brand-prime text-[10px] font-bold px-2 py-1.5 rounded-lg border border-brand-prime/20 flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  {event.averageRating.toFixed(1)}
                </span>
              )}
           </div>
         </div>
         <button 
          onClick={handleToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${isFavorite ? 'bg-red-500 text-brand-beige shadow-lg' : 'bg-black/40 text-brand-beige backdrop-blur-2xl'}`}
        >
          <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EventCard;