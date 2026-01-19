import React, { useState, useEffect } from 'react';
import { Event, Slot } from '../types';
import confetti from 'https://esm.sh/canvas-confetti@1.9.2';

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
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F84464', '#333545', '#ffffff']
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-sm rounded-xl p-8 text-center animate-in zoom-in-95 duration-300 shadow-2xl">
           <div className="w-16 h-16 bg-[#F84464] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2 italic">BOOKED!</h2>
           <p className="text-slate-500 text-sm mb-4">You're confirmed for <span className="text-[#F84464] font-bold">{event.title}</span>.</p>
           <div className="bg-slate-50 p-4 rounded-lg mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmation Email Sent</p>
              <p className="text-[11px] text-slate-600 font-medium">Ticket & details sent to user@makemydays.com</p>
           </div>
           <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
           >
             Got it!
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-xl rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        
        <div className="relative h-40 md:h-52 bg-slate-800">
          <img src={event.image} alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute inset-0 p-6 flex items-end gap-6">
            <img src={event.image} alt="" className="w-20 h-28 object-cover rounded shadow-lg border-2 border-white translate-y-4" />
            <div className="mb-2">
              <span className="text-[10px] font-bold text-[#F84464] uppercase block mb-1">{event.category}</span>
              <h2 className="text-xl md:text-2xl font-black text-white italic truncate">{event.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 pt-10 overflow-y-auto">
          <div className="bg-slate-50 px-4 py-2 rounded-lg mb-6 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ticket Price</span>
            <span className="text-xl font-black text-slate-900">₹{event.price.toLocaleString('en-IN')}</span>
          </div>

          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-8">
            {event.description}
          </p>

          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Select Time Slot</h4>
            <div className="grid grid-cols-2 gap-3">
              {event.slots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={slot.availableSeats === 0}
                  className={`px-4 py-3 rounded border-2 transition-all flex flex-col items-center gap-0.5 ${
                    selectedSlot === slot 
                      ? 'border-[#F84464] bg-[#F84464] text-white' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 shadow-sm'
                  } ${slot.availableSeats === 0 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                >
                  <span className="font-bold text-sm italic">{slot.time}</span>
                  <span className={`text-[8px] font-bold uppercase ${selectedSlot === slot ? 'text-white/60' : 'text-slate-400'}`}>
                    {slot.availableSeats} Seats
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedSlot}
            className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all ${
              selectedSlot 
                ? 'bg-[#F84464] text-white shadow-lg hover:bg-[#d63b56] active:scale-95' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;