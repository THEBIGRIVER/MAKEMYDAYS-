
import React, { useState } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const TAP_SOUND_URL = "https://static.whatsapp.net/rsrc.php/yv/r/ze2kHBOq8T0.mp3";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800"; // Beautiful abstract gradient

const triggerRipple = (e: React.MouseEvent) => {
  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-wave';
  
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;

  container.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);

  const sound = new Audio(TAP_SOUND_URL);
  sound.volume = 0.2;
  sound.play().catch(() => {});
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [imgSrc, setImgSrc] = useState(event.image);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(FALLBACK_IMAGE);
      setHasError(true);
    }
  };

  return (
    <div 
      onClick={(e) => {
        triggerRipple(e);
        onClick(event);
      }}
      className="group cursor-pointer flex flex-col gap-2 animate-in fade-in duration-700 ripple-container rounded-3xl"
    >
      <div className="relative aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl active:scale-95 bg-slate-100">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={handleError}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
           <span className="bg-white/20 backdrop-blur-md text-white text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-white/10">
             {event.category}
           </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
           <h4 className="text-white text-xs md:text-sm font-black italic leading-tight truncate mb-0.5">{event.title}</h4>
           <div className="flex items-center justify-between">
              <span className="text-white font-black text-[10px] md:text-xs tracking-tight">₹{event.price.toLocaleString('en-IN')}</span>
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
