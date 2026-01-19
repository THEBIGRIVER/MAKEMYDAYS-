
import React, { useState } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot) => Promise<void>;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    await onConfirm(selectedSlot);
    setIsBooking(false);
    setShowSuccess(true);
    // Auto close after 3 seconds
    setTimeout(onClose, 3500);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
        <div className="relative bg-white w-full md:max-w-md rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in duration-500 overflow-hidden">
          {/* Confetti Particles (CSS Only) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping opacity-0"
                style={{
                  backgroundColor: ['#F84464', '#DFFF00', '#00F5FF', '#8B5CF6'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              ></div>
            ))}
          </div>
          
          <div className="w-24 h-24 bg-brand-lime rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-xl">
            <svg className="w-12 h-12 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">You're In!</h2>
          <p className="text-slate-500 font-medium italic mb-8">
            Your frequency is locked. A confirmation email has been dispatched to your profile.
          </p>
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest"
          >
            Great!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full md:max-w-2xl rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>

        <div className="p-10">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-brand-red text-[11px] font-black uppercase tracking-[0.3em]">{event.category}</span>
            <h2 className="text-3xl font-black italic tracking-tighter leading-none">{event.title}</h2>
          </div>

          <div className="mb-10">
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4">
              {event.description}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Session Time</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-5 rounded-[1.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                    selectedSlot === slot 
                      ? 'border-brand-red bg-brand-red/5 text-slate-900 shadow-inner' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="font-black text-sm">{slot.time}</span>
                  <span className="text-[9px] uppercase font-bold opacity-60">{slot.availableSeats} seats left</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-slate-400">Total Price</span>
               <span className="text-3xl font-black italic">₹{event.price.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedSlot || isBooking}
              className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all transform active:scale-95 ${
                selectedSlot 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              {isBooking ? 'Processing...' : 'Confirm Session'}
            </button>
          </div>
        </div>
        
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default BookingModal;
