
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
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedBookingId)}&color=0f172a&bgcolor=ffffff`;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <style>{`
          @keyframes scan {
            0%, 100% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .scan-line {
            height: 2px;
            width: 100%;
            background: #10b981;
            position: absolute;
            z-index: 20;
            box-shadow: 0 0 10px #10b981;
            animation: scan 3s linear infinite;
          }
          .ticket-edge {
            background-image: radial-gradient(circle at 10px 10px, transparent 10px, white 10px);
            background-size: 20px 20px;
            background-position: -10px -10px;
            height: 10px;
            width: 100%;
          }
        `}</style>
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-700"></div>
        <div className="relative bg-white w-full max-w-sm rounded-t-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 transform-gpu flex flex-col">
          <div className="bg-slate-950 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-music-pulse">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 leading-none">Frequency Locked</h2>
               <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] mt-2">Digital Access Key Generated</p>
             </div>
          </div>

          <div className="flex-1 p-8 text-center flex flex-col gap-6 bg-white">
            <div className="relative mx-auto p-4 bg-white border-4 border-slate-50 rounded-[2rem] shadow-xl animate-in fade-in zoom-in duration-700 delay-300 group overflow-hidden">
              <div className="scan-line"></div>
              <img src={qrUrl} alt="Booking QR Code" className="w-40 h-40 opacity-100 block" />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Identity Reference</span>
              <div className="text-xl font-mono font-black text-slate-900 tracking-tighter select-all border-y border-dashed border-slate-200 py-3">
                {generatedBookingId}
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-5 text-left border border-slate-100 relative">
               <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Session</span>
                      <span className="text-[10px] font-black italic text-slate-900 uppercase line-clamp-1">{event.title}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date Anchor</span>
                      <span className="text-[10px] font-black text-slate-900">{selectedDate}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-slate-200/50 border-dashed">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Temporal Sync</span>
                      <span className="text-[10px] font-black text-slate-900">{selectedSlot?.time}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[12px] font-black text-slate-900">₹{event.price}</span>
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-950 text-slate-100 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-2xl hover:bg-brand-red"
            >
              Enter Sanctuary
            </button>
          </div>
          <div className="ticket-edge"></div>
          <div className="bg-black py-4 flex justify-center gap-1.5 px-8">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
            ))}
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
                  <span className="bg-brand-red text-slate-200 text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-lg mb-3">
                    {event.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none text-slate-900">
                    {event.title}
                  </h2>
               </div>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                  {availableDates.length === 1 ? 'Event Anchor' : 'Select Target Date'}
                </h4>
                {availableDates.length === 1 ? (
                  <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 flex flex-col items-start gap-1 shadow-xl border border-white/5 animate-in slide-in-from-left duration-500">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-red">Single Frequency Fixed</span>
                    <span className="text-xl font-black italic">{availableDates[0].full}</span>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
                    {availableDates.map((dateObj, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateObj.full)}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all snap-center ${
                          selectedDate === dateObj.full
                            ? 'border-slate-900 bg-slate-900 text-slate-200 shadow-lg'
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-[8px] font-black uppercase mb-1">{dateObj.day}</span>
                        <span className="text-lg font-black">{dateObj.date}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {event.slots.length === 1 ? 'Temporal Sync' : 'Select Session Time'}
                </h4>
                {event.slots.length === 1 ? (
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-right duration-500">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Standard Time</span>
                      <span className="text-xl font-black italic text-slate-900">{event.slots[0].time}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase text-emerald-500">Status</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Confirmed</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {event.slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                          selectedSlot?.time === slot.time 
                            ? 'border-brand-red bg-brand-red/5 text-slate-900' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <span className="font-black text-sm">{slot.time}</span>
                        <span className="text-[8px] uppercase font-bold opacity-60">{slot.availableSeats} slots free</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGPay}
                  disabled={!selectedSlot || !selectedDate}
                  className={`w-full h-16 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 border shadow-xl ${
                    !selectedSlot || !selectedDate 
                      ? 'opacity-40 grayscale pointer-events-none bg-slate-100 text-slate-300' 
                      : 'bg-black text-slate-200 hover:bg-slate-900 active:bg-slate-950'
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
                      : 'border-[#25D366] bg-[#25D366] text-slate-200 hover:bg-[#1ebd5b] shadow-lg shadow-[#25D366]/20'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current text-slate-200" viewBox="0 0 24 24">
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
