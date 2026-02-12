import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string, guestName: string, guestPhone: string) => Promise<void>;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [modalState, setModalState] = useState<'selecting' | 'processing' | 'success'>('selecting');

  useEffect(() => {
    const savedName = localStorage.getItem('mmd_guest_name');
    const savedPhone = localStorage.getItem('mmd_guest_phone');
    if (savedName) setGuestName(savedName);
    if (savedPhone) setGuestPhone(savedPhone);
  }, []);

  const availableDates = useMemo(() => {
    return event.dates.map(dateStr => {
      const d = new Date(dateStr);
      return {
        full: dateStr,
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        date: d.getDate()
      };
    });
  }, [event.dates]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) setSelectedDate(availableDates[0].full);
    if (event.slots.length > 0 && !selectedSlot) setSelectedSlot(event.slots[0]);
  }, [availableDates, event.slots, selectedDate, selectedSlot]);

  const handleBooking = useCallback(async () => {
    if (!selectedSlot || !selectedDate || !guestName || !guestPhone) return;
    setModalState('processing');
    try {
      await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
      setModalState('success');
    } catch { setModalState('selecting'); }
  }, [selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-brand-navy/90 backdrop-blur-xl">
        <div className="bg-brand-slate border border-white/10 w-full max-w-sm rounded-lg p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-brand-prime rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold uppercase text-white">Booking Confirmed</h2>
          <button onClick={onClose} className="mt-8 w-full h-12 bg-white text-brand-navy rounded-md font-bold uppercase tracking-widest text-sm">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6 bg-brand-navy/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-brand-navy w-full max-w-2xl md:rounded-lg shadow-3xl animate-in slide-up overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
        {/* Header Visual */}
        <div className="relative h-48 shrink-0">
          <img src={event.image} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy to-transparent" />
          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
            <div>
              <span className="text-brand-prime text-[9px] font-black uppercase tracking-[0.2em]">{event.category}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{event.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Select Experience Date</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map(d => (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex-shrink-0 w-16 h-20 rounded-md flex flex-col items-center justify-center border-2 transition-all ${
                    selectedDate === d.full ? 'bg-brand-prime border-brand-prime text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
                  }`}
                >
                  <span className="text-[9px] font-bold mb-1">{d.day}</span>
                  <span className="text-xl font-bold">{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Select Time Slot</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {event.slots.map(s => (
                <button
                  key={s.time}
                  onClick={() => setSelectedSlot(s)}
                  className={`py-4 rounded-md font-bold text-xs uppercase border-2 transition-all ${
                    selectedSlot?.time === s.time ? 'bg-white text-brand-navy border-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Your Name</p>
              <input placeholder="Ex: John Doe" className="w-full bg-white/5 border border-white/10 rounded-md p-4 text-white text-base focus:border-brand-prime outline-none transition-all" value={guestName} onChange={e => setGuestName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">WhatsApp Signal</p>
              <input placeholder="Ex: 9876543210" type="tel" className="w-full bg-white/5 border border-white/10 rounded-md p-4 text-white text-base focus:border-brand-prime outline-none transition-all" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between gap-6 border-t border-white/5">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Price</p>
              <p className="text-2xl font-bold text-white">₹{event.price}</p>
            </div>
            <button 
              onClick={handleBooking}
              disabled={modalState === 'processing'}
              className="flex-1 h-14 bg-brand-prime text-white rounded-md font-bold uppercase text-base tracking-widest active:scale-95 transition-all shadow-xl"
            >
              {modalState === 'processing' ? 'Broadcasting...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;