
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

const MERCHANT_NAME = "MAKEMYDAYS";

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalState, setModalState] = useState<ModalState>('selecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  const availableDates = useMemo(() => {
    if (event.date) {
      const [day, month, year] = event.date.split(' ');
      return [{
        full: event.date,
        day: 'ONE-TIME',
        date: parseInt(day)
      }];
    }

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
  }, [event.date]);

  useEffect(() => {
    if (availableDates.length === 1) {
      setSelectedDate(availableDates[0].full);
    } else if (!selectedDate) {
      setSelectedDate(availableDates[0].full);
    }

    if (event.slots.length === 1) {
      setSelectedSlot(event.slots[0]);
    }
  }, [availableDates, selectedDate, event.slots]);

  const generateBookingId = () => {
    return `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  const handleWhatsAppBooking = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    
    const bookingId = generateBookingId();
    const hostNumber = event.hostPhone || "917686924919"; // Fallback to platform admin
    
    const message = `Namaste, I found your experience "${event.title}" on ${MERCHANT_NAME}.
I would like to confirm my resonance for:
Date: ${selectedDate}
Time: ${selectedSlot.time}
Price: ₹${event.price}
Ref: ${bookingId}`;

    const waUrl = `https://wa.me/${hostNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setModalState('processing');
    
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate);
          setGeneratedBookingId(bookingId);
          setModalState('success');
        } catch (err) {
          setErrorMessage('WhatsApp verification timed out. Please retry.');
          setModalState('error');
        }
    }, 5000); 
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
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-slate-100"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-100"></div>
              
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
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Hosted by +{event.hostPhone}</p>
               </div>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Calibration Data</span>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic pr-4 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Energy Value</span>
                  <span className="text-2xl md:text-3xl font-black italic">₹{event.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Select Target Date</h4>
                <div className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x ${event.date ? 'pointer-events-none' : ''}`}>
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
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${event.slots.length === 1 ? 'pointer-events-none' : ''}`}>
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

              <div className="flex flex-col">
                <button
                  onClick={handleWhatsAppBooking}
                  disabled={!selectedSlot || !selectedDate}
                  className={`relative w-full h-20 rounded-3xl transition-all transform active:scale-95 flex items-center justify-center gap-4 border-4 shadow-xl ${
                    !selectedSlot || !selectedDate 
                      ? 'opacity-40 grayscale pointer-events-none bg-slate-50 border-slate-100 text-slate-300' 
                      : 'border-[#25D366] bg-white text-[#25D366] hover:bg-[#25D366]/5 active:bg-[#25D366]/10'
                  }`}
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="font-black uppercase tracking-[0.25em] text-xs">Direct Host Connect</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {(modalState === 'error' || modalState === 'processing') && (
           <div className="p-10 pt-20">
              {modalState === 'error' && (
                <div className="py-10 text-center">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Sync Failure</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                     {errorMessage}
                   </p>
                   <button onClick={() => setModalState('selecting')} className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 underline">Try Alternative Protocol</button>
                </div>
              )}

              {modalState === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center">
                   <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-brand-red rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">Routing to Host</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse text-center">
                     Calibrating with Host Sanctuary...
                   </p>
                </div>
              )}
           </div>
        )}
        
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default BookingModal;
