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
    // If clicking a button inside, let it handle its own click
    if ((e.target as HTMLElement).closest('button')) return;
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="cursor-pointer group flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 relative"
    >
      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl mb-4 bg-stone-200 transition-all duration-500">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Natural Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Description Overlay - "The Expanded View" */}
        <div className={`absolute inset-0 bg-forest/95 backdrop-blur-md p-6 flex flex-col justify-center transition-all duration-500 z-10 ${showFullDescription ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="mb-4">
             <span className="text-meadow-400 text-[10px] font-black uppercase tracking-[0.2em]">The Experience</span>
             <h4 className="text-white text-lg font-black font-serif italic mb-2">{event.title}</h4>
             <p className="text-white/70 text-xs leading-relaxed font-medium line-clamp-6">
               {event.description}
             </p>
          </div>
          <div className="mt-auto space-y-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(event); }}
              className="w-full bg-meadow-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-meadow-400 transition-all shadow-lg active:scale-95"
            >
              Book Experience
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFullDescription(false); }}
              className="w-full text-white/40 py-2 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Category Label (hidden when expanded) */}
        {!showFullDescription && (
          <div className="absolute top-4 left-4 transition-opacity">
             <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
               {event.category}
             </span>
          </div>
        )}

        {/* Info Overlay (hidden when expanded) */}
        {!showFullDescription && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-lg transition-opacity">
            <div className="flex items-center gap-1.5 bg-meadow-500 px-3 py-1 rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-[11px] font-black tracking-tighter">{rating}</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Tap for Details</span>
          </div>
        )}
      </div>
      
      <div className="px-2">
        <h3 className="text-xl font-black text-forest group-hover:text-meadow-600 transition-colors leading-none mb-2 tracking-tight font-serif italic">
          {event.title}
        </h3>
        <div className="flex items-center justify-between">
           <span className="text-forest/40 text-[11px] font-black uppercase tracking-widest">₹{event.price.toLocaleString('en-IN')}</span>
           <div className="flex -space-x-1.5">
              {[1,2,3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-linen bg-stone-200 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?u=${event.id}${i}`} alt="" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;