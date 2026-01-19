import React, { useState } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const rating = (Math.random() * (9.8 - 9.1) + 9.1).toFixed(1);

  return (
    <div 
      onClick={() => setShowFullDescription(!showFullDescription)}
      className="cursor-pointer group flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 relative"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-xl mb-3 bg-slate-200 transition-all duration-300">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        <div className={`absolute inset-0 bg-slate-900/95 p-5 flex flex-col justify-center transition-all duration-300 z-10 ${showFullDescription ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <h4 className="text-white text-base font-bold italic mb-2">{event.title}</h4>
          <p className="text-white/70 text-[11px] leading-relaxed line-clamp-6 mb-4">{event.description}</p>
          <button onClick={(e) => { e.stopPropagation(); onClick(event); }} className="w-full bg-[#F84464] text-white py-2.5 rounded text-[10px] font-bold uppercase tracking-widest">Book Now</button>
        </div>
        {!showFullDescription && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
             <span className="bg-[#F84464] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">{event.category}</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#F84464] transition-colors truncate italic">{event.title}</h3>
        <span className="text-slate-900 text-xs font-black">₹{event.price.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default EventCard;