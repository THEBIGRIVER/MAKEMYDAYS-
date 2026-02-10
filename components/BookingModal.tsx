
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string, guestName: string, guestPhone: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

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

  // Filter and format only the dates provided by the host
  const availableDates = useMemo(() => {
    if (!event.dates || event.dates.length === 0) {
      // Fallback to next 7 days if no dates provided (legacy support)
      const fallback = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        fallback.push({
          full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          day: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
          date: d.getDate(),
          raw: d
        });
      }
      return fallback;
    }

    return event.dates.map(dateStr => {
      const d = new Date(dateStr);
      const dayNum = isNaN(d.getTime()) ? dateStr.split(' ')[0] : d.getDate();
      const dayName = isNaN(d.getTime()) ? 'DAY' : d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
      
      return {
        full: dateStr,
        day: dayName,
        date: dayNum,
        raw: d
      };
    });
  }, [event.dates]);

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

  const getWhatsAppNumber = (rawPhone: string) => {
    let cleaned = (rawPhone || '').toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  };

  const handleWhatsAppBooking = useCallback(async () => {
    if (!selectedSlot || !selectedDate || !validateInputs()) return;
    
    setModalState('processing');
    const bookingId = `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
      setGeneratedBookingId(bookingId);
      
      const phone = getWhatsAppNumber(event.hostPhone);
      const message = `Hi, I would like to book "${event.title}" for ${selectedDate} at ${selectedSlot.time} via MAKEMYDAYS. My name is ${guestName}. Booking ID: ${bookingId}.`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
      setModalState('success');
    } catch (err) { 
      console.error("Booking error:", err);
      setModalState('selecting'); 
    }
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  const handleWhatsAppHost = () => {
    const phone = getWhatsAppNumber(event.hostPhone);
    const message = `Hi, I just booked your experience "${event.title}" on ${selectedDate} via MAKEMYDAYS! My booking ID is ${generatedBookingId}. Looking forward to it.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
        <div className="absolute inset-0" onClick={onClose}></div>
        <div className="relative bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-brand-moss rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-black uppercase text-white">ROOTS ANCHORED</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 mb-8">NODE ID: {generatedBookingId}</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleWhatsAppHost}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-600"
            >
              Connect with Host
            </button>
            <button 
              onClick={onClose}
              className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modalState === 'processing') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-brand-moss rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white font-black uppercase tracking-widest text-[10px]">Processing Request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-white/10 w-full max-w-lg md:rounded-[3.5rem] rounded-t-[2.5rem] p-8 md:p-12 shadow-3xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <div>
            <span className="text-brand-moss text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Secure Anchor</span>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Narrative Description Section - Visible for All */}
        <div className="mb-10 p-5 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-moss mb-3">The Narrative</p>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium italic">
            {event.description}
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {availableDates.length > 1 ? "Select Dates (Multi-day)" : "Available Date"}
              </p>
              {availableDates.length > 1 && (
                <span className="bg-brand-moss/10 text-brand-moss text-[8px] font-black uppercase px-2 py-1 rounded-md border border-brand-moss/20">Host Curated Schedule</span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {availableDates.map(d => (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex-shrink-0 w-20 h-24 rounded-3xl flex flex-col items-center justify-center transition-all border-2 ${
                    selectedDate === d.full ? 'bg-white border-white text-slate-900 shadow-xl scale-105' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase mb-1 tracking-widest">{d.day}</span>
                  <span className="text-2xl font-black">{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Slots (Remaining Capacity)</p>
            <div className="grid grid-cols-2 gap-3">
              {event.slots.map(s => {
                const isLow = s.availableSeats <= 3;
                return (
                  <button
                    key={s.time}
                    onClick={() => setSelectedSlot(s)}
                    className={`relative py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${
                      selectedSlot?.time === s.time ? 'bg-white border-white text-slate-900 shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/30'
                    }`}
                  >
                    {s.time}
                    <div className={`text-[8px] mt-1 font-black ${selectedSlot?.time === s.time ? 'text-slate-900 opacity-60' : isLow ? 'text-amber-500' : 'text-slate-500 opacity-60'}`}>
                      {isLow ? `ONLY ${s.availableSeats} LEFT` : `${s.availableSeats} Spots Available`}
                    </div>
                    {isLow && selectedSlot?.time !== s.time && <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Identity</p>
              <input 
                type="text" 
                placeholder="Name" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm focus:border-white outline-none transition-all"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal (Phone)</p>
              <input 
                type="tel" 
                placeholder="Phone" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm focus:border-white outline-none transition-all"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Settlement</p>
              <p className="text-2xl font-black text-white italic">₹{event.price.toLocaleString()}</p>
            </div>
            <button 
              onClick={handleWhatsAppBooking}
              className="flex-1 h-16 bg-white text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-[#25D366] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.197 1.608 6.044L0 24l6.102-1.601a11.81 11.81 0 005.94 1.595h.005c6.635 0 12.045-5.41 12.05-12.048a11.82 11.82 0 00-3.582-8.52"/>
              </svg>
              Book on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
