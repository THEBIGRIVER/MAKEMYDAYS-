import React, { useState } from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";

const EventCard: React.FC<EventCardProps> = ({ event, onClick, id }) => {
  const [imgSrc, setImgSrc] = useState(event.image);

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      className="group cursor-pointer relative aspect-video w-full overflow-hidden rounded-lg transition-all duration-300 shadow-lg bg-slate-900 border border-white/5 active:scale-95 touch-manipulation"
    >
      <img 
        src={imgSrc} 
        alt={event.title} 
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110" 
      />
      
      {/* Overlay - Desktop hover, but also slightly visible context for mobile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-3 md:p-4 flex flex-col justify-end">
        <div className="space-y-1 md:space-y-1.5 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-2">
             <span className="text-brand-moss text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-brand-moss/10 px-2 py-0.5 rounded border border-brand-moss/20">
               {event.category}
             </span>
             {event.averageRating && (
               <span className="text-brand-gold text-[9px] md:text-[10px] font-bold">
                 {event.averageRating.toFixed(1)} ★
               </span>
             )}
          </div>
          <h4 className="text-white text-xs md:text-sm font-bold uppercase tracking-tight leading-tight line-clamp-1">
            {event.title}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-200 text-[10px] md:text-[10px] font-medium italic">
              ₹{event.price.toLocaleString()}
            </span>
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/30 flex items-center justify-center text-white">
              <svg className="w-2 h-2 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Title - visible when overlay is hidden on desktop */}
      <div className="md:hidden absolute top-2 left-2">
         <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
           {event.title}
         </span>
      </div>
    </div>
  );
};

export default EventCard;