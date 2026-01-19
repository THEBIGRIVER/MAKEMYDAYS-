import React, { useState } from 'react';
import { Event, Slot } from '../types';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm(selectedSlot);
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-forest/80 backdrop-blur-xl" onClick={onClose}></div>
        <div className="relative bg-linen w-full max-w-sm rounded-[3rem] p-12 text-center animate-in zoom-in-95 duration-500 shadow-2xl">
           <div className="w-24 h-24 bg-meadow-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
           </div>
           <h2 className="text-4xl font-black text-forest mb-6 tracking-tighter italic font-serif leading-none">ROOTED!</h2>
           <p className="text-forest/60 font-bold mb-12 leading-relaxed text-sm">Your spot for <span className="text-meadow-600 underline underline-offset-4">{event.title}</span> is secured in our ecosystem.</p>
           <button 
            onClick={onClose}
            className="w-full py-5 bg-forest text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-meadow-700 transition-all shadow-xl active:scale-95 text-xs"
           >
             RETURN TO MEADOW
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-forest/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-linen w-full md:max-w-2xl rounded-t-[3rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-500 max-h-[95vh] flex flex-col">
        
        <div className="relative h-48 md:h-64 bg-forest shrink-0">
          <img src={event.image} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent"></div>
          <div className="absolute inset-0 p-8 md:p-12 flex items-end gap-8">
            <div className="w-28 h-36 md:w-36 md:h-52 rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white translate-y-12 md:translate-y-20">
              <img src={event.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="pb-2 md:pb-6 min-w-0">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-meadow-400 block mb-3">EXPERIENCE / {event.category}</span>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tight font-serif italic truncate">{event.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-meadow-500 transition-all border border-white/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 md:p-14 pt-20 md:pt-32 overflow-y-auto">
          <div className="flex items-center gap-6 mb-12">
             <div className="bg-meadow-50 border-2 border-meadow-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-xl md:text-3xl font-black text-forest font-serif italic">₹{event.price.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-black text-forest/30 uppercase tracking-[0.2em]">ENERGY EXCHANGE</span>
             </div>
          </div>

          <p className="text-forest/60 text-sm md:text-lg leading-relaxed mb-12 font-medium">
            {event.description}
          </p>

          <div className="mb-12">
            <h4 className="text-[10px] md:text-xs font-black text-forest/40 uppercase mb-6 flex items-center gap-3 tracking-[0.4em]">
              <div className="w-2 h-2 bg-meadow-500 rounded-full"></div>
              RESERVE YOUR MOMENT
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {event.slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={slot.availableSeats === 0}
                  className={`px-4 py-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-1.5 ${
                    selectedSlot === slot 
                      ? 'border-meadow-500 bg-meadow-500 text-white shadow-2xl scale-105' 
                      : 'border-white bg-white text-forest/60 hover:border-meadow-100'
                  } ${slot.availableSeats === 0 ? 'opacity-20 cursor-not-allowed bg-stone-50 grayscale' : ''}`}
                >
                  <span className="font-black text-sm md:text-lg tracking-tight font-serif italic">{slot.time}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${selectedSlot === slot ? 'text-white/70' : 'text-forest/20'}`}>
                    {slot.availableSeats} LEFT
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedSlot}
            className={`w-full py-6 rounded-3xl font-black text-sm md:text-lg uppercase tracking-[0.3em] transition-all ${
              selectedSlot 
                ? 'bg-meadow-500 text-white shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] hover:bg-meadow-600 active:scale-95' 
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            CONFIRM CONNECTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;