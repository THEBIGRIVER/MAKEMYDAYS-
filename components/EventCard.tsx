
import React, { useState, useMemo } from 'react';
import { Event } from '../types.ts';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";
const DEFAULT_HOST_PHONE = '917686924919';

const EventCard: React.FC<EventCardProps> = ({ event, onClick, id }) => {
  const [imgSrc, setImgSrc] = useState(event.image);

  // Mask phone for privacy but show it's a real person
  const displayPhone = event.hostPhone 
    ? `+91 ${event.hostPhone.slice(0, 2)}***${event.hostPhone.slice(-4)}`
    : 'System Host';

  const isCommunityHost = event.hostPhone !== DEFAULT_HOST_PHONE;

  // Logic for "NEW" badge
  const isRecentlyAdded = useMemo(() => {
    if (!event.createdAt) return event.id.startsWith('user-event-'); // Fallback if no timestamp
    const createdTime = new Date(event.createdAt).getTime();
    const now = new Date().getTime();
    return (now - createdTime) < (24 * 60 * 60 * 1000); // Within 24 hours
  }, [event.createdAt, event.id]);

  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      className="group cursor-pointer animate-slide-up flex flex-col gap-4 select-none glass-card p-4 rounded-[2.5rem] hover:shadow-[0_30px_60px_rgba(248,68,100,0.15)] hover:border-white/20 transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-[1/1] overflow-hidden rounded-[2rem] bg-slate-900/50 transition-all duration-500">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-100" 
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <span className="bg-black/80 backdrop-blur-md text-slate-200 text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-lg w-fit">
            {event.category}
           </span>
           {isRecentlyAdded && (
             <span className="bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg w-fit animate-pulse border border-emerald-400/50">
               Recently Calibrated
             </span>
           )}
           {isCommunityHost && !isRecentlyAdded && (
             <span className="bg-brand-red text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg w-fit">
               Community Choice
             </span>
           )}
        </div>
      </div>

      <div className="px-2 pb-2 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-base font-black italic uppercase tracking-tighter leading-tight text-slate-200 group-hover:text-brand-red transition-colors line-clamp-2">
            {event.title}
          </h4>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-200 transition-colors">
              ₹{event.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
              Host: {displayPhone}
            </span>
          </div>
          <div className="w-8 h-[2px] bg-white/10 group-hover:bg-brand-red transition-all group-hover:w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
