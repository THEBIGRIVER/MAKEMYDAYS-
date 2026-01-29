import React, { useState } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

const TABLA_NA = "https://cdn.freesound.org/previews/178/178660_2515431-lq.mp3";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";

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

  // Play 'Na' bol for card interactions
  const sound = new Audio(TABLA_NA);
  sound.volume = 0.35;
  sound.play().catch(() => {});
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [imgSrc, setImgSrc] = useState(event.image);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(FALLBACK_IMAGE);
      setHasError(true);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      onClick={(e) => {
        triggerRipple(e);
        onClick(event);
      }}
      className="group cursor-pointer flex flex-col gap-2 animate-in fade-in duration-700 ripple-container rounded-[2rem] select-none"
    >
      <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-sm transition-all duration-700 hover:shadow-2xl active:scale-[0.98] bg-slate-900 transform-gpu">
        {/* Main Event Image */}
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={handleError}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] cubic-bezier(0.23, 1, 0.32, 1) group-hover:scale-110 group-hover:brightness-[0.8] transform-gpu" 
        />
        
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700"></div>

        {/* TOP AREA: Category on Left, Like on Right */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex justify-between items-center z-20">
           <div className="flex items-center">
              <span className="bg-white/20 text-white text-[7px] sm:text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-lg transition-all duration-500 group-hover:bg-brand-red group-hover:border-transparent group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(248,68,100,0.4)]">
                {event.category}
              </span>
           </div>
           
           <button 
             onClick={handleLike}
             className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all duration-500 transform hover:scale-110 active:scale-90 ${
               isLiked 
                ? 'bg-brand-red border-transparent text-white shadow-lg shadow-brand-red/30' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
             }`}
           >
             <svg 
               className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isLiked ? 'scale-110 fill-current' : 'fill-none stroke-current'}`} 
               strokeWidth="2.5" 
               viewBox="0 0 24 24"
             >
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
           </button>
        </div>

        {/* BOTTOM AREA: Direct Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-20">
           <div className="transition-all duration-700 group-hover:-translate-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                 {/* Title & Status (Left-Aligned) */}
                 <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-start gap-2 mb-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse"></div>
                       <span className="text-white/80 text-[8px] font-black uppercase tracking-[0.2em]">Live Session</span>
                    </div>
                    <h4 className="text-white text-base sm:text-lg font-black italic leading-tight tracking-tight line-clamp-2 transition-colors duration-500 group-hover:text-brand-lime">
                      {event.title}
                    </h4>
                    
                    <div className="pt-2 flex flex-col items-start">
                       <span className="text-white/50 text-[7px] font-black uppercase tracking-widest leading-none mb-1">Pricing Calibration</span>
                       <span className="text-white font-black text-lg sm:text-xl tracking-tighter transition-all duration-500 transform-gpu origin-left group-hover:scale-110 group-hover:text-brand-lime">
                         ₹{event.price.toLocaleString('en-IN')}
                       </span>
                    </div>
                 </div>

                 {/* Action Button (Arrow Circle) */}
                 <div className="pb-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-lime flex items-center justify-center transition-all duration-700 group-hover:bg-white group-hover:scale-110 group-hover:rotate-[360deg] shadow-lg shadow-brand-lime/20 group-hover:shadow-white/20">
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        className="text-slate-900 transition-colors duration-500"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
