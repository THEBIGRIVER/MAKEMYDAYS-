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
      className="group cursor-pointer relative aspect-video w-full overflow-hidden rounded-md transition-all duration-300 shadow-lg bg-slate-900"
    >
      <img 
        src={imgSrc} 
        alt={event.title} 
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />
      
      {/* Overlay - visible on hover or mobile */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <div className="space-y-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-2">
             <span className="text-brand-moss text-[9px] font-black uppercase tracking-widest bg-brand-moss/10 px-2 py-0.5 rounded border border-brand-moss/20">
               {event.category}
             </span>
             {event.averageRating && (
               <span className="text-brand-gold text-[10px] font-bold">
                 {event.averageRating.toFixed(1)} ★
               </span>
             )}
          </div>
          <h4 className="text-white text-sm font-bold uppercase tracking-tight leading-tight line-clamp-1">
            {event.title}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-200 text-[10px] font-medium italic">
              ₹{event.price.toLocaleString()}
            </span>
            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Static Info for Mobile/Accessibility */}
      <div className="absolute bottom-2 left-2 group-hover:opacity-0 transition-opacity">
        <h5 className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow-md bg-black/40 px-2 py-0.5 rounded">
          {event.title}
        </h5>
      </div>
    </div>
  );
};

export default EventCard;
