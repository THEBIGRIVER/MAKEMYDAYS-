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
      className="group cursor-pointer relative aspect-video w-full overflow-hidden rounded-md transition-all duration-300 bg-brand-slate hover:z-30 md:hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-brand-prime/40"
    >
      <img 
        src={imgSrc} 
        alt={event.title} 
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="w-full h-full object-cover transition-transform duration-500" 
      />
      
      {/* Permanent Price Box Badge (Top Left) */}
      <div className="absolute top-2 left-2 z-40 transition-all duration-300 group-hover:scale-110 origin-top-left">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-sm shadow-xl flex items-center gap-1 group-hover:bg-brand-prime group-hover:border-brand-prime transition-colors duration-300">
          <span className="text-[11px] font-black text-white tracking-tight">₹{event.price}</span>
        </div>
      </div>

      {/* Prime-style Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <div className="translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="bg-brand-prime text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm">Prime</span>
               {event.averageRating && (
                 <span className="text-white text-[11px] font-bold">{event.averageRating.toFixed(1)} ★</span>
               )}
            </div>
            
            {/* Wish List Heart Icon */}
            <button 
              onClick={handleToggle}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
              title="Add to Wish List"
            >
              <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <h4 className="text-white text-sm font-bold truncate">
            {event.title}
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-brand-prime text-[10px] font-black uppercase tracking-wider">
              {event.category}
            </span>
            <span className="text-slate-400 text-[10px] font-bold">Limited Slots</span>
          </div>
        </div>
      </div>

      {/* Mobile persistent Watchlist button */}
      <button 
        onClick={handleToggle}
        className={`md:hidden absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 z-40 ${isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-black/40 text-white backdrop-blur-md'}`}
      >
        <svg className={`w-4 h-4 ${isFavorite ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Mobile Label Only (Price is now top-left) */}
      <div className="md:hidden absolute bottom-2 left-2 right-2">
         <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm line-clamp-1 border border-white/5 w-fit">
           {event.title}
         </span>
      </div>
    </div>
  );
};

export default EventCard;