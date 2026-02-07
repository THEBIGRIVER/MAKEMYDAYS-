
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
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  // Persist name/phone for convenience across sessions
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

  const generateBookingId = () => {
    return `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  const validateInputs = () => {
    if (!guestName.trim()) { alert("Please provide your name to sync identity."); return false; }
    if (guestPhone.length < 10) { alert("Please provide a valid 10-digit WhatsApp number."); return false; }
    localStorage.setItem('mmd_guest_name', guestName);
    localStorage.setItem('mmd_guest_phone', guestPhone);
    return true;
  };

  const handleGPay = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    if (!validateInputs()) return;
    
    const bookingId = generateBookingId();
    const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(`Resonance ID ${bookingId} for ${event.title}`)}&am=${event.price}&cu=INR`;
    
    window.location.href = upiUrl;
    setModalState('processing');
    
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setErrorMessage('Transaction frequency disrupted.');
          setModalState('error');
        }
    }, 3000); 
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  const handleWhatsAppBooking = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    if (!validateInputs()) return;
    
    const bookingId = generateBookingId();
    const hostNumber = event.hostPhone || "917686924919"; 
    
    const message = `Namaste, I found your experience "${event.title}" on ${MERCHANT_NAME}.
I would like to confirm my resonance for:
Explorer: ${guestName} (${guestPhone})
Date: ${selectedDate}
Time: ${selectedSlot.time}
Ref ID: ${bookingId}`;

    const waUrl = `https://wa.me/${hostNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setModalState('processing');
    
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate, guestName, guestPhone);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setErrorMessage('WhatsApp frequency lost.');
          setModalState('error');
        }
    }, 3000); 
  }, [event, selectedSlot, selectedDate, guestName, guestPhone, onConfirm]);

  if (modalState === 'success') {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedBookingId)}&color=0f172a&bgcolor=ffffff`;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <style>{`
          @keyframes scan { 0%, 100% { top: 0%; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
          .scan-line { height: 2px; width: 100%; background: #10b981; position: absolute; z-index: 20; box-shadow: 0 0 10px #10b981; animation: scan 3s linear infinite; }
          .ticket-edge { background-image: radial-gradient(circle at 10px 10px, transparent 10px, white 10px); background-size: 20px 20px; background-position: -10px -10px; height: 10px; width: 100%; }
        `}</style>
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"></div>
        <div className="relative bg-white w-full max-w-sm rounded-t-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 transform-gpu flex flex-col">
          <div className="bg-slate-950 p-8 text-center relative">
             <div className="relative z-10">
               <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-music-pulse">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
               </div>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 leading-none">Frequency Locked</h2>
               <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] mt-2">Access Key: {generatedBookingId}</p>
             </div>
          </div>
          <div className="flex-1 p-8 text-center flex flex-col gap-6 bg-white">
            <div className="relative mx-auto p-4 bg-white border-4 border-slate-50 rounded-[2rem] shadow-xl overflow-hidden">
              <div className="scan-line"></div>
              <img src={qrUrl} alt="Booking QR Code" className="w-40 h-40" />
            </div>
            <div className="bg-slate-50 rounded-[2rem] p-5 text-left border border-slate-100">
               <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[7px] font-black uppercase text-slate-400">Explorer</span><span className="text-[9px] font-black text-slate-900">{guestName}</span></div>
                  <div className="flex justify-between"><span className="text-[7px] font-black uppercase text-slate-400">Session</span><span className="text-[9px] font-black text-slate-900">{event.title}</span></div>
                  <div className="flex justify-between"><span className="text-[7px] font-black uppercase text-slate-400">Anchor</span><span className="text-[9px] font-black text-slate-900">{selectedDate} @ {selectedSlot?.time}</span></div>
               </div>
            </div>
            <button onClick={onClose} className="w-full py-5 bg-slate-950 text-slate-100 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl">Enter Sanctuary</button>
          </div>
          <div className="ticket-edge"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-2xl rounded-t-[3rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
           <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
           <div className="absolute bottom-0 left-0 p-8 flex flex-col items-start">
              <span className="bg-brand-red text-slate-200 text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 mb-2">{event.category}</span>
              <h2 className="text-2xl font-black italic tracking-tighter leading-none text-slate-900">{event.title}</h2>
           </div>
        </div>

        <div className="p-8 space-y-8">
          <section className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Sync</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input 
                 type="text" placeholder="Your Name" 
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
                 value={guestName} onChange={(e) => setGuestName(e.target.value)}
               />
               <input 
                 type="tel" placeholder="WhatsApp Number" 
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
                 value={guestPhone} onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ''))}
               />
             </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Date & Time</h4>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
              {availableDates.map((dateObj, idx) => (
                <button
                  key={idx} onClick={() => setSelectedDate(dateObj.full)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all ${
                    selectedDate === dateObj.full ? 'border-slate-900 bg-slate-900 text-slate-200 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="text-[8px] font-black uppercase mb-1">{dateObj.day}</span>
                  <span className="text-lg font-black">{dateObj.date}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {event.slots.map((slot, idx) => (
                <button
                  key={idx} onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-4 rounded-2xl border-2 transition-all ${
                    selectedSlot?.time === slot.time ? 'border-brand-red bg-brand-red/5 text-slate-900' : 'border-slate-50 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span className="font-black text-sm">{slot.time}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-4">
            <button onClick={handleGPay} className="w-full h-16 bg-black text-slate-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-xl">
              Pay with GPay — ₹{event.price}
            </button>
            <button onClick={handleWhatsAppBooking} className="w-full h-14 bg-[#25D366] text-slate-200 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 shadow-lg">
               Connect to Host
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
