import React, { useState } from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const rating = (Math.random() * (9.8 - 9.1) + 9.1).toFixed(1);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="cursor-pointer group flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 relative"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-xl mb-3 bg-slate-200 transition-all duration-300">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Modern Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

        {/* Description Panel */}
        <div className={`absolute inset-0 bg-slate-900/95 p-5 flex flex-col justify-center transition-all duration-300 z-10 ${showFullDescription ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="mb-4">
             <span className="text-[#F84464] text-[10px] font-black uppercase tracking-widest">Description</span>
             <h4 className="text-white text-base font-bold italic mb-2">{event.title}</h4>
             <p className="text-white/70 text-[11px] leading-relaxed line-clamp-6">
               {event.description}
             </p>
          </div>
          <div className="mt-auto space-y-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(event); }}
              className="w-full bg-[#F84464] text-white py-2.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#d63b56] transition-all"
            >
              Book Now
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFullDescription(false); }}
              className="w-full text-white/40 py-1 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {!showFullDescription && (
          <div className="absolute top-3 left-3">
             <span className="bg-[#F84464] text-white text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded">
               {event.category}
             </span>
          </div>
        )}

        {!showFullDescription && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-md">
            <div className="flex items-center gap-1 bg-[#F84464] px-1.5 py-0.5 rounded text-[10px] font-bold">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {rating}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Details</span>
          </div>
        )}
      </div>
      
      <div className="px-1">
        <h3 className="text-sm md:text-base font-bold text-slate-800 group-hover:text-[#F84464] transition-colors leading-tight mb-1 truncate italic">
          {event.title}
        </h3>
        <span className="text-slate-500 text-[11px] font-bold">₹{event.price.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default EventCard;