
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
    if (event.dates && event.dates.length > 0) {
      return event.dates.map(dateStr => {
        const parts = dateStr.split(' ');
        const dayNum = parseInt(parts[0]);
        return {
          full: dateStr,
          day: (parts[1] || 'DATE').toUpperCase(),
          date: isNaN(dayNum) ? parts[0] : dayNum
        };
      });
    }
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
  }, [event.dates]);

  useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.find(d => d.full === selectedDate))) {
      setSelectedDate(availableDates[0].full);
    }
    if (event.slots.length > 0 && (!selectedSlot || !event.slots.find(s => s.time === selectedSlot.time))) {
      setSelectedSlot(event.slots[0]);
    }
  }, [availableDates, event.slots]);

  /**
   * Enhanced Phone Normalization for WhatsApp Links:
   * Handles domestic 0-prefix and adds 91 for standard Indian numbers.
   */
  const normalizePhoneNumber = (phone: string | number): string => {
    let cleaned = String(phone).replace(/\D/g, ''); 
    
    // domestic Indian format (0-10 digits) -> strip 0
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Already prefixed correctly
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    
    // 10 digits -> assume Indian and prefix 91
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  };

  const validateInputs = () => {
    if (!guestName.trim()) { alert("Please provide your name."); return false; }
    if (guestPhone.replace(/\D/g, '').length < 10) { alert("Please provide a valid 10-digit phone number."); return false; }
    localStorage.setItem('mmd_guest_name', guestName);
    localStorage.setItem('mmd_guest_phone', guestPhone);
    return true;
  };

  const handleWhatsAppBooking = useCallback(() => {
    if (!selectedSlot || !selectedDate || !validateInputs()) return;
    
    const bookingId = `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const hostNumber = normalizePhoneNumber(event.hostPhone || "917686924919");
    
    const message = `Namaste! I'm interested in "${event.title}"
Explorer: ${guestName}
Phone: ${guestPhone}
Date: ${selectedDate}
Time: ${selectedSlot.time}
Ref: ${bookingId}`;

    const waUrl = `https://wa.me/${hostNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setModalState('processing');
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setModalState('selecting');
        }
    }, 2000); 
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

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
      } catch (err) {
        setModalState('selecting');
      }
    }, 2000);
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"></div>
        <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black italic uppercase text-slate-900">Anchor Locked</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 mb-8">Ref: {generatedBookingId}</p>
          <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-xl rounded-t-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-black italic uppercase text-slate-900">{event.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Details</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Name" value={guestName} onChange={e => setGuestName(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red" />
            <input type="tel" placeholder="Phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value.replace(/\D/g, ''))} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency Schedule</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {availableDates.map((d, i) => (
              <button key={i} onClick={() => setSelectedDate(d.full)} className={`flex flex-col items-center min-w-[60px] p-4 rounded-2xl border-2 transition-all ${selectedDate === d.full ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'}`}>
                <span className="text-[8px] font-black uppercase">{d.day}</span>
                <span className="text-lg font-black">{d.date}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {event.slots.map((s, i) => (
              <button key={i} onClick={() => setSelectedSlot(s)} className={`p-4 rounded-2xl border-2 font-black text-xs ${selectedSlot?.time === s.time ? 'border-brand-red bg-brand-red/5 text-slate-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                {s.time}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <button onClick={handleGPay} className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Pay with UPI — ₹{event.price}</button>
          <button onClick={handleWhatsAppBooking} className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Connect to Host</button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
