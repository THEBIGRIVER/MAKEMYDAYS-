
import React, { useState, useEffect } from 'react';
import type { Event } from '../types.ts';
import { formatForWhatsApp } from '../utils/phone';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  id?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800";
const FAVORITES_KEY = 'makemydays_favorites_v1';

const EventCard: React.FC<EventCardProps> = ({ event, onClick, id }) => {
  const [imgSrc, setImgSrc] = useState(event.image);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    setIsFavorited(favorites.includes(event.id));
  }, [event.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    let newFavorites: string[];
    if (isFavorited) {
      newFavorites = favorites.filter((favId: string) => favId !== event.id);
    } else {
      newFavorites = [...favorites, event.id];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi! I found your experience "${event.title}" on MAKEMYDAYS. I'd love to chat and find out more!`;
    const waNumber = formatForWhatsApp(event.hostPhone);
    if (!waNumber) { alert('Host phone number not available'); return; }
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };



  return (
    <div 
      id={id}
      onClick={() => onClick(event)}
      className="group cursor-pointer flex flex-col h-full glass-card p-2 md:p-4 rounded-[2.5rem] md:rounded-[3.2rem] relative overflow-hidden transition-all duration-500 hover:translate-y-[-10px] hover:shadow-[0_30px_70px_rgba(6,78,59,0.12)] border-white/60"
    >
      {/* Visual Aura Section */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] md:rounded-[2.6rem] bg-emerald-50 shrink-0 shadow-inner">
        <img 
          src={imgSrc} 
          alt={event.title} 
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover transition-transform duration-[12s] ease-out group-hover:scale-110 saturate-[1.1]" 
        />
        
        {/* Layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-30" />
        
        <div className="absolute inset-0 p-4 md:p-7 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div className="bg-white/95 backdrop-blur-3xl text-brand-forest text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 md:px-7 md:py-3.5 rounded-full border border-white/50 shadow-2xl">
                {event.category}
              </div>
              
              <button 
                onClick={handleToggleFavorite}
                className={`w-11 h-11 md:w-14 md:h-14 rounded-full backdrop-blur-3xl border transition-all duration-500 flex items-center justify-center active:scale-75 shadow-2xl ${
                  isFavorited ? `bg-brand-moss border-brand-moss text-white` : 'bg-white/10 border-white/20 text-white hover:bg-white/30'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6.5 md:h-6.5 fill-current">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
           </div>
           
           <div className="flex items-end justify-between translate-y-3 group-hover:translate-y-0 transition-all duration-700 ease-out">
              <div className="bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/20 shadow-xl">
                <p className="text-white text-lg md:text-2xl font-black tracking-tighter leading-none">₹{event.price.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Narrative & Action Section */}
      <div className="flex flex-col flex-1 mt-6 md:mt-8 px-3">
        <h4 className="text-[17px] md:text-[26px] font-display uppercase tracking-tight leading-[1.0] text-brand-forest line-clamp-2 transition-colors duration-300 group-hover:text-brand-moss mb-4">
          {event.title}
        </h4>
        
        <div className="mt-auto pt-6 md:pt-8 flex gap-3 md:gap-5 pb-3">
          {/* Replaced 'Anchor' Trigger with primary WhatsApp connection button */}
          <button 
            onClick={handleConnect}
            className="flex-1 bg-emerald-500 text-white rounded-[1.6rem] md:rounded-[2rem] flex items-center justify-center hover:bg-emerald-600 transition-all duration-500 active:scale-[0.97] py-4.5 md:py-6 relative overflow-hidden shadow-2xl shadow-emerald-500/30 group/whatsapp"
            title="Chat with Host"
          >
            <svg className="w-5 h-5 md:w-7 md:h-7 mr-2 md:mr-3 group-hover/whatsapp:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.197 1.608 6.044L0 24l6.102-1.601a11.81 11.81 0 005.94 1.595h.005c6.635 0 12.045-5.41 12.05-12.048a11.82 11.82 0 00-3.582-8.52"/>
            </svg>
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] z-10">Chat with Host</span>
          </button>

          {/* Icon-based Anchor Button for secondary booking trigger */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-forest text-white rounded-[1.6rem] md:rounded-[2rem] flex items-center justify-center group-hover:bg-brand-moss transition-all duration-500 shadow-2xl active:scale-95">
             <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
