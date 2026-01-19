import React, { useState } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-xl rounded-t-xl md:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <h2 className="text-xl font-black italic mb-4">{event.title}</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {event.slots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSlot(slot)}
                className={`px-4 py-4 rounded-xl border-2 transition-all ${selectedSlot === slot ? 'border-[#F84464] bg-white text-slate-900' : 'border-slate-100 bg-slate-50'}`}
              >
                <span className="font-black text-sm">{slot.time}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedSlot && onConfirm(selectedSlot)}
            disabled={!selectedSlot}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs ${selectedSlot ? 'bg-[#333545] text-white' : 'bg-slate-100 text-slate-300'}`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;