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
      className="group cursor-pointer relative aspect-video w-full overflow-hidden rounded-md transition-all duration-300 bg-brand-slate hover:z-30 md:hover:scale-110 hover:shadow-2xl hover:ring-4 hover:ring-brand-prime/40"
    >
      <img 
        src={imgSrc} 
        alt={event.title} 
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="w-full h-full object-cover transition-transform duration-500" 
      />
      
      {/* Prime-style Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <div className="translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 space-y-2">
          <div className="flex items-center gap-2">
             <span className="bg-brand-prime text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm">Included</span>
             {event.averageRating && (
               <span className="text-brand-prime text-[11px] font-black">{event.averageRating.toFixed(1)} ★</span>
             )}
          </div>
          <h4 className="text-white text-sm font-bold truncate">
            {event.title}
          </h4>
          <p className="text-slate-300 text-[10px] line-clamp-2 leading-tight">
            {event.description}
          </p>
        </div>
      </div>

      {/* Mobile Visual Label */}
      <div className="md:hidden absolute bottom-2 left-2 right-2">
         <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm line-clamp-1 border border-white/5">
           {event.title}
         </span>
      </div>
    </div>
  );
};

export default EventCard;