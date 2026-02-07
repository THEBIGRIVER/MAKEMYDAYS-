
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string, guestName: string, guestPhone: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

const MERCHANT_NAME = "MAKEMYDAYS";
const MERCHANT_UPI_ID = "7686924919@okbizaxis";

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [modalState, setModalState] = useState<ModalState>('selecting');
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('mmd_guest_name');
    const savedPhone = localStorage.getItem('mmd_guest_phone');
    if (savedName) setGuestName(savedName);
    if (savedPhone) setGuestPhone(savedPhone);
  }, []);

  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        date: d.getDate()
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) setSelectedDate(availableDates[0].full);
    if (event.slots.length > 0 && !selectedSlot) setSelectedSlot(event.slots[0]);
  }, [availableDates, event.slots]);

  const validateInputs = () => {
    if (!guestName.trim()) { alert("Identity required."); return false; }
    if (guestPhone.replace(/\D/g, '').length < 10) { alert("Invalid signal frequency (Phone number)."); return false; }
    localStorage.setItem('mmd_guest_name', guestName);
    localStorage.setItem('mmd_guest_phone', guestPhone);
    return true;
  };

  const handleGPay = useCallback(() => {
    if (!selectedSlot || !selectedDate || !validateInputs()) return;
    const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(`Booking for ${event.title}`)}&am=${event.price}&cu=INR`;
    window.location.href = upiUrl;
    setModalState('processing');
    setTimeout(async () => {
      try {
        await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
        setGeneratedBookingId(`MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
        setModalState('success');
      } catch (err) { setModalState('selecting'); }
    }, 2000);
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
        <div className="absolute inset-0" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-brand-moss rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-black uppercase text-brand-forest">ROOTS ANCHORED</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 mb-8">NODE ID: {generatedBookingId}</p>
          <button onClick={onClose} className="w-full h-14 bg-brand-forest text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">DISMISS</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-xl rounded-t-[2.5rem] p-5 pb-[calc(1.5rem + var(--sab))] md:p-10 space-y-6 animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_80px_rgba(6,78,59,0.15)] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto md:hidden" />
        
        <div className="flex justify-between items-start pt-2">
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-brand-forest leading-tight pr-8">{event.title}</h2>
          <button onClick={onClose} className="text-slate-300 p-2 hover:text-brand-forest transition-colors"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-moss/60">Bearer Identity</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name" value={guestName} onChange={e => setGuestName(e.target.value)} className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-sm font-bold text-brand-forest outline-none h-14 focus:border-brand-moss focus:bg-white transition-all" />
            <input type="tel" placeholder="WhatsApp Number" value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g, ''))} className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-sm font-bold text-brand-forest outline-none h-14 focus:border-brand-moss focus:bg-white transition-all" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-moss/60">Temporal Node (Scheduling)</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
            {availableDates.map((d, i) => (
              <button key={i} onClick={() => setSelectedDate(d.full)} className={`flex flex-col items-center min-w-[65px] py-4 rounded-2xl border transition-all active:scale-95 ${selectedDate === d.full ? 'bg-brand-forest border-brand-forest text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <span className="text-[7px] font-black uppercase mb-1">{d.day}</span>
                <span className="text-base font-black">{d.date}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {event.slots.map((s, i) => (
              <button key={i} onClick={() => setSelectedSlot(s)} className={`h-14 rounded-2xl border font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 ${selectedSlot?.time === s.time ? 'border-brand-moss bg-brand-moss/5 text-brand-forest' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                {s.time}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button onClick={handleGPay} className="w-full h-14 md:h-16 bg-brand-forest text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             ANCHOR — ₹{event.price}
          </button>
          <button onClick={onClose} className="w-full h-12 text-slate-400 font-black uppercase text-[8px] tracking-[0.3em] hover:text-brand-forest transition-colors">ABANDON SESSION</button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
