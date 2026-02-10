
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Event, Slot } from '../types.ts';

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

  const handleWhatsAppHost = () => {
    const message = `Hi, I just booked your experience "${event.title}" on ${selectedDate} via MAKEMYDAYS! My booking ID is ${generatedBookingId}. Looking forward to it.`;
    const url = `https://wa.me/${event.hostPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleChatWithHostBeforeBooking = () => {
    const message = `Hi! I'm looking at your experience "${event.title}" on MAKEMYDAYS and had a few questions before I book.`;
    const url = `https://wa.me/${event.hostPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

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
          
          <div className="space-y-3">
            <button 
              onClick={handleWhatsAppHost}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.197 1.608 6.044L0 24l6.102-1.601a11.81 11.81 0 005.94 1.595h.005c6.635 0 12.045-5.41 12.05-12.048a11.82 11.82 0 00-3.582-8.52"/>
              </svg>
              Chat with Host
            </button>
            <button onClick={onClose} className="w-full h-14 bg-brand-forest text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">DISMISS</button>
          </div>
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
          <button 
            onClick={handleChatWithHostBeforeBooking} 
            className="w-full h-12 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/50 rounded-2xl font-black uppercase text-[8px] tracking-[0.2em] hover:bg-emerald-100 transition-all active:scale-95"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.197 1.608 6.044L0 24l6.102-1.601a11.81 11.81 0 005.94 1.595h.005c6.635 0 12.045-5.41 12.05-12.048a11.82 11.82 0 00-3.582-8.52"/>
            </svg>
            Chat with Host
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
