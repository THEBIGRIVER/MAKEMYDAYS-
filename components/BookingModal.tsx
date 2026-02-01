import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

const MERCHANT_NAME = "MAKEMYDAYS";
const MERCHANT_UPI_ID = "7686924919@okbizaxis";

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalState, setModalState] = useState<ModalState>('selecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  const availableDates = useMemo(() => {
    if (event.dates && event.dates.length > 0) {
      return event.dates.map(dateStr => {
        const parts = dateStr.split(' ');
        const dayNum = parseInt(parts[0]);
        return {
          full: dateStr,
          day: (parts[1] || '').toUpperCase(),
          date: dayNum || 0
        };
      });
    }

    // Fallback if no dates set
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date: d.getDate()
      });
    }
    return dates;
  }, [event.dates]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].full);
    }
    if (event.slots.length === 1 && !selectedSlot) {
      setSelectedSlot(event.slots[0]);
    }
  }, [availableDates, event.slots, selectedDate, selectedSlot]);

  const generateBookingId = () => {
    return `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  const handleGPay = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    
    const bookingId = generateBookingId();
    const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(`Resonance ID ${bookingId} for ${event.title}`)}&am=${event.price}&cu=INR`;
    
    window.location.href = upiUrl;
    setModalState('processing');
    
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setErrorMessage('Transaction frequency disrupted. Please retry.');
          setModalState('error');
        }
    }, 3000); 
  }, [event, selectedSlot, selectedDate, onConfirm]);

  const handleWhatsAppBooking = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    
    const bookingId = generateBookingId();
    const hostNumber = event.hostPhone || "917686924919"; 
    
    const message = `Namaste, I found your experience "${event.title}" on ${MERCHANT_NAME}.
I would like to confirm my resonance for:
Date: ${selectedDate}
Time: ${selectedSlot.time}
Price: ₹${event.price}
Ref ID: ${bookingId}`;

    const waUrl = `https://wa.me/${hostNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setModalState('processing');
    
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setErrorMessage('WhatsApp frequency lost. Please try again.');
          setModalState('error');
        }
    }, 3000); 
  }, [event, selectedSlot, selectedDate, onConfirm]);

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-0">
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl transition-opacity animate-in fade-in duration-700"></div>
        <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 transform-gpu">
          <div className="h-2 bg-emerald-500 w-full"></div>
          <div className="p-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-slate-900 leading-tight">Confirmed.</h2>
            <p className="text-slate-400 font-medium italic mb-8 px-4 text-sm">
              Your resonance for <span className="text-slate-900 font-black">{event.title}</span> is now active.
            </p>
            <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100 text-left relative">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Calibration</span>
                    <span className="text-xs font-black italic text-slate-900 uppercase line-clamp-1">{event.title}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Sync</span>
                    <span className="text-xs font-black text-slate-900">{selectedDate}, {selectedSlot?.time}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200/50 border-dashed flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Reference</span>
                    <span className="text-[11px] font-mono font-black text-brand-red tracking-tight">{generatedBookingId}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-xl"
            >
              Enter Sanctuary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full md:max-w-2xl rounded-t-[3rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto scrollbar-hide">
        {modalState === 'selecting' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
               <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
               <div className="absolute bottom-0 left-0 p-8 md:p-10 flex flex-col items-start">
                  <span className="bg-brand-red text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-lg mb-3">
                    {event.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none text-slate-900">
                    {event.title}
                  </h2>
               </div>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Select Target Date</h4>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
                  {availableDates.map((dateObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateObj.full)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all snap-center ${
                        selectedDate === dateObj.full
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase mb-1">{dateObj.day}</span>
                      <span className="text-lg font-black">{dateObj.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Session Time</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                        selectedSlot === slot 
                          ? 'border-brand-red bg-brand-red/5 text-slate-900' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-black text-sm">{slot.time}</span>
                      <span className="text-[8px] uppercase font-bold opacity-60">{slot.availableSeats} slots free</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGPay}
                  disabled={!selectedSlot || !selectedDate}
                  className={`w-full h-16 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 border shadow-xl ${
                    !selectedSlot || !selectedDate 
                      ? 'opacity-40 grayscale pointer-events-none bg-slate-100 text-slate-300' 
                      : 'bg-black text-white hover:bg-slate-900 active:bg-slate-950'
                  }`}
                >
                  <span className="font-black uppercase tracking-[0.2em] text-[11px]">Pay with GPay</span>
                </button>

                <button
                  onClick={handleWhatsAppBooking}
                  disabled={!selectedSlot || !selectedDate}
                  className={`w-full h-14 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2 border-2 ${
                    !selectedSlot || !selectedDate 
                      ? 'opacity-40 grayscale pointer-events-none bg-slate-50 border-slate-100 text-slate-300' 
                      : 'border-[#25D366] bg-[#25D366] text-white hover:bg-[#1ebd5b] shadow-lg shadow-[#25D366]/20'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12.031 2c-5.511 0-9.997 4.486-9.997 9.998 0 1.764.459 3.42 1.261 4.867l-1.295 4.729 4.839-1.269c1.401.761 2.993 1.192 4.686 1.192 5.511 0 9.997-4.487 9.997-9.999 0-5.511-4.486-9.998-9.991-9.998zm4.647 14.129c-.19.539-1.107 1.033-1.532 1.096-.379.056-.874.093-2.314-.492-1.841-.75-3.033-2.615-3.125-2.738-.093-.123-.756-.997-.756-1.99 0-1.011.528-1.508.718-1.714.19-.205.412-.256.549-.256.136 0 .273.003.391.008.123.006.289-.046.452.348.169.412.576 1.402.625 1.502.051.099.083.216.017.348-.067.132-.099.213-.199.329-.099.117-.21.261-.299.35-.099.099-.202.207-.087.402.116.196.516.852 1.107 1.38.761.68 1.4 1.127 1.6 1.226.2.099.317.084.434-.051.117-.135.501-.581.635-.779.135-.199.27-.166.455-.099.184.067 1.171.554 1.373.655.202.102.336.152.386.236.05.084.05.485-.14.1.1.1.1.1.1z"/>
                  </svg>
                  <span className="font-black uppercase tracking-[0.15em] text-[10px]">Connect to Host</span>
                </button>
              </div>
              
              <p className="mt-4 px-2 text-[9px] text-slate-400 font-medium italic leading-relaxed text-center">
                Your frequency is our priority. Since every user can host their own experiences, we recommend connecting with the host directly for final confirmation. <span className="text-slate-500 font-bold uppercase">*MAKEMYDAYS is a peer-to-peer sanctuary</span>
              </p>
            </div>
          </div>
        )}

        {modalState === 'processing' && (
          <div className="p-10 py-28 flex flex-col items-center justify-center">
             <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-brand-red rounded-full border-t-transparent animate-spin"></div>
             </div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">Establishing Resonance</h3>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse text-center">
               Routing through the secure access stream...
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;