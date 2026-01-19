import React from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const TAP_SOUND_URL = "https://static.whatsapp.net/rsrc.php/yv/r/ze2kHBOq8T0.mp3";

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
  sound.play().catch((err) => console.log("Sound blocked:", err));
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <div 
      onClick={(e) => {
        triggerRipple(e);
        onClick(event);
      }}
      className="group cursor-pointer flex flex-col gap-3 animate-in fade-in duration-700 ripple-container rounded-[2rem]"
    >
      <div className="relative aspect-[2/3] md:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 active:scale-95">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
           <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-white/10">
             {event.category}
           </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
           <h4 className="text-white text-base font-black italic leading-tight truncate mb-1">{event.title}</h4>
           <div className="flex items-center justify-between">
              <span className="text-white font-black text-sm tracking-tight">₹{event.price.toLocaleString('en-IN')}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;